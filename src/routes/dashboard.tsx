import { createFileRoute } from "@tanstack/react-router";
import { Phone, Stage, TabBar } from "@/components/phone";

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

const money = [
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
  return (
    <Stage>
      <Phone className="p-6">
        <div className="pointer-events-none absolute -left-12 top-24 size-40 rounded-full bg-accent/20 blur-2xl" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink/50">Good afternoon</p>
            <p className="font-display text-lg font-bold leading-tight">Maya</p>
          </div>
          <div className="grid size-9 place-items-center rounded-full bg-violet/15 text-sm font-semibold text-violet">
            MK
          </div>
        </div>

        <div className="glass mt-4 rounded-3xl p-4 ring-1 ring-white/60">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink/45">Checking · Available</p>
          <p className="tnum mt-1 font-display text-4xl font-bold tracking-tight">
            $2,480<span className="align-top text-2xl">.55</span>
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
          {recent.map((r) => (
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

        <TabBar />
      </Phone>
    </Stage>
  );
}
