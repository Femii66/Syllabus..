import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Logo, Phone, Stage } from "@/components/phone";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Account settings — $yllabus" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!active) return;
        if (authError || !user) { setLoading(false); return; }
        setUserId(user.id);
        setEmail(user.email ?? "");
        const { data: profile, error: profileError } = await supabase.from("profiles")
          .select("full_name,university").eq("id", user.id).maybeSingle();
        if (!active) return;
        if (profileError) throw profileError;
        setName(profile?.full_name ?? "");
        setUniversity(profile?.university ?? "");
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load settings.");
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || saving) return;
    setSaving(true); setError(""); setMessage("");
    try {
      const { data, error: updateError } = await supabase.from("profiles")
        .update({ full_name: name.trim(), university: university.trim() || null })
        .eq("id", userId).select("id").single();
      if (updateError) throw updateError;
      if (!data) throw new Error("Profile was not updated.");
      setMessage("Your profile has been saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile.");
    } finally { setSaving(false); }
  }

  async function signOut() {
    setError("");
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) { setError(signOutError.message); return; }
    await navigate({ to: "/" });
  }

  return <Stage><Phone className="flex flex-col overflow-y-auto p-6">
    <div className="flex items-center justify-between"><Logo /><Link to="/dashboard" aria-label="Back to dashboard" className="rounded-full p-2 text-ink/60"><ArrowLeft className="size-5" /></Link></div>
    <h1 className="mt-8 font-display text-2xl font-bold">Account settings</h1>
    <p className="mt-2 text-sm text-ink/60">Manage your $yllabus beta profile.</p>
    {loading ? <p role="status" className="mt-8 text-sm">Loading your account…</p> : !userId ?
      <div className="glass mt-6 rounded-2xl p-4"><p className="text-sm">Sign in to manage your profile.</p><Link to="/auth" className="mt-3 inline-block font-semibold text-accent">Sign in</Link></div> :
      <>
        <form onSubmit={save} className="mt-6 space-y-4">
          <label className="block text-xs font-semibold">Email address
            <input disabled value={email} className="mt-2 w-full rounded-2xl bg-white/40 p-3 text-sm text-ink/60 ring-1 ring-ink/10" />
          </label>
          <label className="block text-xs font-semibold">Full name
            <input required maxLength={100} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-2xl bg-white/65 p-3 text-sm ring-1 ring-ink/10" />
          </label>
          <label className="block text-xs font-semibold">University
            <input maxLength={150} value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="Your university" className="mt-2 w-full rounded-2xl bg-white/65 p-3 text-sm ring-1 ring-ink/10" />
          </label>
          {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
          {message && <p role="status" className="text-xs text-accent">{message}</p>}
          <button disabled={saving} className="w-full rounded-2xl bg-ink px-5 py-4 text-sm font-semibold text-paper disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button>
        </form>
        <button type="button" onClick={() => void signOut()} className="mt-6 rounded-2xl bg-white/60 px-5 py-3 text-sm font-semibold ring-1 ring-ink/10">Sign out</button>
      </>
    }
    <p className="mt-auto pt-8 text-center text-[11px] text-ink/45">Beta experience · Simulated accounts only</p>
  </Phone></Stage>;
}
