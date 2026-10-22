import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Phone, Stage, Logo } from "@/components/phone";
import { supabase } from "@/integrations/supabase/client";

type Student = { id: string; email: string; full_name: string; university: string | null; created_at: string };
type Account = { id: string; student_id: string; account_type: string; balance_cents: number; currency: string };
type Transfer = { id: string; sender_id: string; recipient_id: string; amount_cents: number; created_at: string };
type Overview = { students: Student[]; accounts: Account[]; transfers: Transfer[] };

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin overview — $yllabus" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminPage,
});

const dollars = (cents: number) => (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

function AdminPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [status, setStatus] = useState<"loading" | "denied" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!active) return;
        if (authError || !user) { setStatus("denied"); return; }

        // The database function checks admin membership server-side.
        // Client navigation alone never grants access to other users' data.
        const { data, error } = await supabase.rpc("admin_overview");
        if (!active) return;
        if (error) {
          setStatus(error.code === "42501" || /admin access required/i.test(error.message) ? "denied" : "error");
          setMessage(error.message);
          return;
        }
        const result = data as unknown as Overview;
        if (!result || !Array.isArray(result.students) || !Array.isArray(result.accounts) || !Array.isArray(result.transfers)) {
          setStatus("error");
          setMessage("The admin overview returned an unexpected response.");
          return;
        }
        setOverview(result);
        setStatus("ready");
      } catch {
        if (active) { setStatus("error"); setMessage("Unable to load the admin overview."); }
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const totalCents = overview?.accounts.reduce((sum, a) => sum + a.balance_cents, 0) ?? 0;

  return (
    <Stage>
      <Phone className="flex flex-col overflow-y-auto p-5">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/dashboard" aria-label="Back to dashboard" className="rounded-full p-2 text-ink/60">
            <ArrowLeft className="size-5" />
          </Link>
        </div>
        <div className="mt-6 flex items-center gap-2">
          <ShieldCheck className="size-5 text-accent" />
          <h1 className="font-display text-xl font-bold">Admin overview</h1>
        </div>
        <p className="mt-1 text-xs text-ink/50">Private beta administration · simulated funds only</p>

        {status === "loading" && <p role="status" className="mt-8 text-sm text-ink/60">Checking admin access…</p>}
        {status === "denied" && (
          <div className="glass mt-8 rounded-2xl p-4">
            <p className="font-semibold">Access restricted</p>
            <p className="mt-2 text-sm text-ink/60">Sign in with an authorized admin account to view this page.</p>
            <Link to="/auth" className="mt-4 inline-block text-sm font-semibold text-accent">Go to sign in</Link>
          </div>
        )}
        {status === "error" && <p role="alert" className="mt-8 text-sm text-red-700">Could not load the overview. {message}</p>}
        {status === "ready" && overview && (
          <>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {[
                { label: "Students", value: String(overview.students.length) },
                { label: "Demo accounts", value: String(overview.accounts.length) },
                { label: "Transfers", value: String(overview.transfers.length) },
                { label: "Total demo balance", value: dollars(totalCents) },
              ].map((item) => (
                <div key={item.label} className="glass rounded-2xl p-3 ring-1 ring-white/60">
                  <p className="text-[10px] text-ink/50">{item.label}</p>
                  <p className="mt-1 font-display text-lg font-bold">{item.value}</p>
                </div>
              ))}
            </div>

            <h2 className="mt-6 text-xs font-bold uppercase tracking-wider text-ink/50">Registered students</h2>
            <div className="mt-2 space-y-2">
              {overview.students.length === 0 && <p className="text-xs text-ink/50">No students yet.</p>}
              {overview.students.map((student) => {
                const accounts = overview.accounts.filter((a) => a.student_id === student.id);
                return (
                  <div key={student.id} className="glass rounded-2xl p-3 ring-1 ring-white/60">
                    <p className="text-sm font-semibold">{student.full_name || "Unnamed student"}</p>
                    <p className="break-all text-xs text-ink/60">{student.email}</p>
                    {student.university && <p className="text-xs text-ink/50">{student.university}</p>}
                    <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
                      {accounts.map((a) => <span key={a.id}>{a.account_type}: <strong>{dollars(a.balance_cents)}</strong></span>)}
                    </div>
                  </div>
                );
              })}
            </div>

            <h2 className="mt-6 text-xs font-bold uppercase tracking-wider text-ink/50">Recent demo transfers</h2>
            <div className="mt-2 space-y-2">
              {overview.transfers.length === 0 && <p className="text-xs text-ink/50">No transfers yet.</p>}
              {overview.transfers.slice(0, 15).map((transfer) => {
                const sender = overview.students.find((s) => s.id === transfer.sender_id);
                const recipient = overview.students.find((s) => s.id === transfer.recipient_id);
                return (
                  <div key={transfer.id} className="glass rounded-xl p-3 text-xs">
                    <p className="font-semibold">{dollars(transfer.amount_cents)}</p>
                    <p className="mt-1 text-ink/60">{sender?.full_name || sender?.email || "Student"} → {recipient?.full_name || recipient?.email || "Student"}</p>
                    <p className="mt-1 text-[10px] text-ink/40">{new Date(transfer.created_at).toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Phone>
    </Stage>
  );
}
