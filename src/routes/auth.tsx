import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Logo, Phone, Stage } from "@/components/phone";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — $yllabus" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function switchMode(next: typeof mode) {
    setMode(next);
    setError("");
    setNotice("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin + "/auth",
        });
        if (error) throw error;
        setNotice("If this email has an account, password recovery instructions have been sent.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (error) throw error;
        if (data.session) {
          await navigate({ to: "/dashboard" });
        } else {
          setNotice("Check your inbox to confirm your email, then sign in.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        await navigate({ to: "/dashboard" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stage>
      <Phone className="flex flex-col p-6">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/" aria-label="Back to welcome" className="rounded-full p-2 text-ink/60">
            <ArrowLeft className="size-5" />
          </Link>
        </div>
        <div className="my-auto">
          <h1 className="font-display text-3xl font-bold">
            {mode === "login" ? "Welcome back." : mode === "signup" ? "Join $yllabus." : "Reset password."}
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            {mode === "login" ? "Sign in to your student account." : mode === "signup" ? "Create your beta account with any valid email." : "We'll email you a recovery link."}
          </p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === "signup" && (
              <label className="block text-xs font-semibold">Full name
                <input required maxLength={100} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-2xl bg-white/65 p-3 text-sm ring-1 ring-ink/10 outline-none focus:ring-accent" placeholder="Your name" />
              </label>
            )}
            <label className="block text-xs font-semibold">Email address
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-2xl bg-white/65 p-3 text-sm ring-1 ring-ink/10 outline-none focus:ring-accent" placeholder="you@example.com" />
            </label>
            {mode !== "reset" && (
              <label className="block text-xs font-semibold">Password
                <input type="password" required minLength={6} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-2xl bg-white/65 p-3 text-sm ring-1 ring-ink/10 outline-none focus:ring-accent" placeholder="Your password" />
              </label>
            )}
            {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
            {notice && <p role="status" className="text-xs text-accent">{notice}</p>}
            <button type="submit" disabled={busy} className="w-full rounded-2xl bg-ink px-5 py-4 text-sm font-semibold text-paper disabled:opacity-50">
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send recovery email"}
            </button>
          </form>
          <div className="mt-5 flex flex-col items-center gap-3 text-xs">
            {mode === "login" && <button type="button" onClick={() => switchMode("reset")} className="font-semibold text-accent">Forgot password?</button>}
            <button type="button" onClick={() => switchMode(mode === "signup" ? "login" : "signup")} className="font-semibold text-ink/70">
              {mode === "signup" ? "Already have an account? Sign in" : "New to $yllabus? Create an account"}
            </button>
            {mode === "reset" && <button type="button" onClick={() => switchMode("login")} className="font-semibold text-ink/70">Back to sign in</button>}
          </div>
        </div>
        <p className="text-center text-[11px] text-ink/45">Beta experience · No real banking transactions</p>
      </Phone>
    </Stage>
  );
}
