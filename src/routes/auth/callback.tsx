import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Stage } from "@/components/phone";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { configError } from "@/components/session";
import { authErrorMessage } from "@/lib/auth-errors";
export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Email confirmation — $yllabus" },
      {
        name: "description",
        content: "Complete email verification or recover your student account.",
      },
      { property: "og:title", content: "Email confirmation — $yllabus" },
      { property: "og:description", content: "Secure confirmation for your student account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Callback,
});
function Callback() {
  const [status, setStatus] = useState("Confirming your email…");
  const [recovery, setRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    const cfg = configError();
    if (cfg) {
      setStatus(cfg);
      return;
    }
    async function run() {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.slice(1));
      const err = url.searchParams.get("error_description") ?? hash.get("error_description");
      if (err) {
        setStatus(err);
        return;
      }
      try {
        const code = url.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (active) {
          setRecovery(
            hash.get("type") === "recovery" || url.searchParams.get("type") === "recovery",
          );
          setStatus(
            data.session
              ? "Your email is verified. Your account is ready."
              : "Open the latest confirmation link in your email, then sign in.",
          );
        }
        window.history.replaceState({}, "", url.pathname);
      } catch (e) {
        if (active) setStatus(authErrorMessage(e));
      }
    }
    void run();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  return (
    <Stage>
      <div className="mx-auto max-w-md px-6 py-20">
        <h1 className="text-3xl font-bold">
          {recovery ? "Set a new password" : "Email confirmation"}
        </h1>
        <p role="status" className="my-6 text-sm leading-6 text-muted-foreground">
          {status}
        </p>
        {recovery && (
          <form
            className="mb-5 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                const { error } = await supabase.auth.updateUser({ password });
                if (error) throw error;
                setStatus("Password updated. You can now sign in.");
                setRecovery(false);
              } catch (e) {
                setStatus(authErrorMessage(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="block text-sm">
              New password
              <input
                required
                minLength={8}
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 h-12 w-full rounded-md border bg-card px-4"
              />
            </label>
            <Button disabled={busy} type="submit">
              Update password
            </Button>
          </form>
        )}
        <Button asChild>
          <Link to="/auth">Continue to sign in</Link>
        </Button>
      </div>
    </Stage>
  );
}