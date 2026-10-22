import { createFileRoute } from "@tanstack/react-router";
import { Phone, Stage, TabBar } from "@/components/phone";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — $yllabus" },
      {
        name: "description",
        content: "See checking and savings balances with your latest activity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Dashboard — $yllabus" },
      {
        property: "og:description",
        content: "Your bank balances and latest activity at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

const demoMoney = [
  { label: "Savings", value: "$8,120.00" },
  { label: "Checking", value: "$2,480.55" },
];

const recent = [
  { name: "Campus Book Store", amount: "−$48.00", positive: false },
  { name: "NIL · Brand payout", amount: "+$250.00", positive: true },
  { name: "Dining Hall swipe", amount: "−1 swipe", positive: false },
  { name: "Athlete stipend", amount: "+$375.00", positive: true },
];

function Dashboard() {
  const [transfers, setTransfers] = useState<{ id: string; amount_cents: number; sender_id: string; recipient_id: string }[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [balances, setBalances] = useState<{ checking: number; savings: number } | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const formatMoney = (cents: number) => (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
  const money = isSignedIn
    ? [{ label: "Savings", value: balances ? formatMoney(balances.savings) : "—" }, { label: "Checking", value: balances ? formatMoney(balances.checking) : "—" }]
    : demoMoney;
  const [name, setName] = useState("Maya");
  const [initials, setInitials] = useState("MK");

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!active) return;
        if (!user) {
          setIsSignedIn(false);
          setStudentId(null);
          setTransfers([]);
          setBalances(null);
          setName("Maya");
          setInitials("MK");
          return;
        }
        setIsSignedIn(true);
        setStudentId(user.id);
        const { data: transferRows } = await supabase.from("demo_transfers").select("id,amount_cents,sender_id,recipient_id").order("created_at", { ascending: false }).limit(4);
        if (!active) return;
        setTransfers(transferRows ?? []);
        const { data: accounts } = await supabase.from("demo_financial_accounts").select("account_type,balance_cents").eq("student_id", user.id);
        if (!active) return;
        if (accounts) {
          const checking = accounts.find((account) => account.account_type === "checking");
          const savings = accounts.find((account) => account.account_type === "savings");
          if (checking && savings) setBalances({ checking: Number(checking.balance_cents), savings: Number(savings.balance_cents) });
          else setBalances(null);
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();
        if (!active) return;
        const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Student";
        const parts = String(fullName).trim().split(" ").filter(Boolean);
        setName(parts[0] || "Student");
        setInitials((parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] || "ST").slice(0, 2)).toUpperCase());
      } catch {
        // Keep the demo identity if authentication is unavailable.
      }
    }
    void refresh();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { void refresh(); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  return (
    <Stage>
      <Phone className="p-6">
        <div className="pointer-events-none absolute -left-12 top-24 size-40 rounded-full bg-accent/20 blur-2xl" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink/50">Good afternoon</p>
            <p className="font-display text-lg font-bold leading-tight">{name}</p>
          </div>
          <div className="grid size-9 place-items-center rounded-full bg-violet/15 text-sm font-semibold text-violet">
            {initials}
          </div>
        </div>

        <div className="glass mt-4 rounded-3xl p-4 ring-1 ring-white/60">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink/45">Checking · Available</p>
          <p className="tnum mt-1 font-display text-4xl font-bold tracking-tight">
            {isSignedIn ? (balances ? formatMoney(balances.checking) : "—") : <>$2,480<span className="align-top text-2xl">.55</span></>}
          </p>
        </div>

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
          Money
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {money.map((m) => (
            <div key={m.label} className="glass rounded-2xl p-3 ring-1 ring-white/60">
              <p className="text-xs text-ink/50">{m.label}</p>
              <p className="tnum mt-1 font-display text-xl font-bold">{m.value}</p>
            </div>
          ))}
        </div>

        <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
          Recent
        </p>
        <div className="mt-2 space-y-1.5 text-sm">
          {(isSignedIn ? transfers.map((t) => ({ name: t.sender_id === studentId ? "Demo transfer sent" : "Demo transfer received", amount: (t.sender_id === studentId ? "−" : "+") + formatMoney(t.amount_cents), positive: t.recipient_id === studentId })) : recent).map((r) => (
            <div key={r.name} className="flex items-center justify-between rounded-xl px-1 py-1.5">
              <span className="text-ink/80">{r.name}</span>
              <span
                className={`font-mono text-xs font-medium ${r.positive ? "text-accent" : "text-ink"}`}
              >
                {r.amount}
              </span>
            </div>
          ))}
        </div>

        {isSignedIn && transfers.length === 0 && <p className="text-xs text-ink/45">No demo transfers yet.</p>}
        <TabBar />
      </Phone>
    </Stage>
  );
}
