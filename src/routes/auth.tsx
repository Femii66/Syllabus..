import { createFileRoute, Link, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import { Stage } from "@/components/phone";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { configError, useSession } from "@/components/session";
import { authErrorMessage, isValidEmail } from "@/lib/auth-errors";
export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Student sign in — $yllabus" },
      {
        name: "description",
        content: "Sign in or create your student $yllabus account with email verification.",
      },
      { property: "og:title", content: "Student sign in — $yllabus" },
      { property: "og:description", content: "Secure student email sign in and account creation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthLayout,
});
function AuthLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return path === "/auth" ? <Auth /> : <Outlet />;
}
function Auth() {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();
  const { user } = useSession();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    const cfg = configError();
    if (cfg) {
      setError(cfg);
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const redirect = `${window.location.origin}/auth/callback`;
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: redirect,
        });
        if (error) throw error;
        setNotice("If an account exists, a password-reset link is on its way. Check your inbox.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: redirect, data: { full_name: name.trim() } },
        });
        if (error) throw error;
        if (data.session) {
          setNotice("Account created successfully. Taking you to your dashboard…");
          await navigate({ to: "/dashboard" });
        } else {
          setNotice("Account created successfully. You can sign in now.");
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        await navigate({ to: "/dashboard" });
      }
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stage>
      <div className="mx-auto max-w-md px-6 pb-20 pt-12">
        <div className="mb-8 grid size-12 place-items-center rounded-lg bg-brand-soft text-primary">
          <ShieldCheck />
        </div>
        <h1 className="font-display text-3xl font-bold">
          {mode === "signup"
            ? "Create your account"
            : mode === "reset"
              ? "Reset your password"
              : "Welcome back."}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {mode === "signup"
            ? "Create your account in seconds with name, email and password."
            : "Sign in to your student account."}
        </p>
        {user ? (
          <div className="mt-8 space-y-4">
            <p className="text-sm">You’re already signed in.</p>
            <Button asChild>
              <Link to="/dashboard">
                Go to Home <ArrowRight />
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5">
            {mode === "signup" && (
              <label className="block text-sm font-medium">
                Full name
                <input
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 h-12 w-full rounded-md border bg-card px-4 text-foreground"
                />
              </label>
            )}
            <label className="block text-sm font-medium">
              Email address
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 h-12 w-full rounded-md border bg-card px-4 text-foreground"
              />
            </label>
            {mode !== "reset" && (
              <label className="block text-sm font-medium">
                Password
                <input
                  required
                  type="password"
                  minLength={mode === "signup" ? 8 : 1}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 h-12 w-full rounded-md border bg-card px-4 text-foreground"
                />
              </label>
            )}
            {error && (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-card p-4 text-sm leading-6 text-destructive"
              >
                {error}
              </p>
            )}
            {notice && (
              <p
                role="status"
                className="rounded-md bg-success-soft p-4 text-sm leading-6 text-success"
              >
                <Mail className="mb-2 size-5" />
                {notice}
              </p>
            )}
            <Button disabled={busy} className="h-12 w-full" type="submit">
              {busy ? <LoaderCircle className="animate-spin" /> : null}
              {mode === "signup"
                ? "Create account"
                : mode === "reset"
                  ? "Send reset link"
                  : "Sign in"}
              <ArrowRight />
            </Button>
            <div className="flex flex-wrap justify-between gap-2">
              <Button
                type="button"
                variant="link"
                className="px-0"
                onClick={() => {
                  setMode(mode === "signup" ? "signin" : "signup");
                  setError("");
                }}
              >
                {mode === "signup"
                  ? "Already have an account? Sign in"
                  : "New to $yllabus? Create an account"}
              </Button>
              {mode === "signin" && (
                <Button
                  type="button"
                  variant="link"
                  className="px-0"
                  onClick={() => setMode("reset")}
                >
                  Forgot password?
                </Button>
              )}
            </div>
          </form>
        )}
        <p className="mt-10 border-t pt-5 text-xs leading-6 text-muted-foreground">
          Secure password sign-in · Simulated banking only
        </p>
      </div>
    </Stage>
  );
}