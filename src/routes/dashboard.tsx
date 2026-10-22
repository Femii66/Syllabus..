import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  CreditCard,
  ShoppingBag,
  Utensils,
  Trophy,
  Wallet,
  PiggyBank,
  GraduationCap,
  TrendingDown,
  Target,
  BookOpen,
  Laptop,
  Plane,
  Coffee,
  Sparkles,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Phone, Stage, PageHeading } from "@/components/phone";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/components/session";
const campusImage = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=85";
export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Home — $yllabus" },
      { name: "description", content: "Balances, spending insights, savings goals and campus funds." },
      { property: "og:title", content: "Home — $yllabus" },
      { property: "og:description", content: "Your everyday banking and campus life, together." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});
const recent = [
  { name: "Campus Book Store", category: "Shopping", date: "Oct 21", amount: "−$48.00", positive: false, icon: ShoppingBag },
  { name: "NIL · Brand payout", category: "Income", date: "Oct 20", amount: "+$250.00", positive: true, icon: Trophy },
  { name: "Dining Hall swipe", category: "Campus", date: "Oct 20", amount: "−1 swipe", positive: false, icon: Utensils },
  { name: "Bulldog Brew", category: "Food", date: "Oct 19", amount: "−$6.40", positive: false, icon: Coffee },
  { name: "Athlete stipend", category: "Income", date: "Oct 19", amount: "+$375.00", positive: true, icon: GraduationCap },
];
const ranges = {
  "7D": [
    { d: "Mon", v: 18 }, { d: "Tue", v: 42 }, { d: "Wed", v: 12 }, { d: "Thu", v: 64 },
    { d: "Fri", v: 38 }, { d: "Sat", v: 88 }, { d: "Sun", v: 26 },
  ],
  "30D": [
    { d: "Wk 1", v: 210 }, { d: "Wk 2", v: 168 }, { d: "Wk 3", v: 245 }, { d: "Wk 4", v: 182 },
  ],
  "6M": [
    { d: "May", v: 640 }, { d: "Jun", v: 520 }, { d: "Jul", v: 580 }, { d: "Aug", v: 910 },
    { d: "Sep", v: 760 }, { d: "Oct", v: 805 },
  ],
} as const;
type Range = keyof typeof ranges;
const categories = [
  { label: "Food & dining", pct: 38, amount: "$306" },
  { label: "Books & supplies", pct: 24, amount: "$193" },
  { label: "Transport", pct: 16, amount: "$129" },
  { label: "Entertainment", pct: 12, amount: "$97" },
  { label: "Other", pct: 10, amount: "$80" },
];
const goals = [
  { label: "Spring break trip", saved: 640, target: 1200, icon: Plane },
  { label: "New laptop", saved: 980, target: 1500, icon: Laptop },
  { label: "Spring textbooks", saved: 310, target: 400, icon: BookOpen },
];
function Dashboard() {
  const { user } = useSession();
  const [range, setRange] = useState<Range>("7D");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const meta = user?.user_metadata as { full_name?: string } | undefined;
  const first = meta?.full_name?.split(" ")[0];
  return (
    <Stage>
      <Phone>
        <PageHeading
          title={user ? `Welcome back${first ? `, ${first}` : ""}.` : "Good afternoon, Maya."}
          subtitle="A little clarity for your next chapter."
          action={
            <Button asChild className="hidden sm:inline-flex">
              <Link to="/send">
                <ArrowUpRight />
                Send money
              </Link>
            </Button>
          }
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rise bg-lime-gradient lift relative overflow-hidden rounded-2xl p-6 text-primary-foreground shadow-lg transition-transform md:col-span-2 xl:col-span-1">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm opacity-90">Total bank balance</span>
              <Wallet className="size-5" />
            </div>
            <p className="tnum font-display text-4xl font-bold">$10,600.55</p>
            <p className="mt-3 text-xs opacity-90">+4.2% vs last month · Checking + Savings</p>
            <Sparkles className="absolute -bottom-3 -right-3 size-20 opacity-20" />
          </div>
          {[
            { label: "Checking", value: "$2,480.55", detail: "Available ·· 4471", icon: CreditCard },
            { label: "Savings", value: "$8,120.00", detail: "2.1% APY (simulated)", icon: PiggyBank },
            { label: "Campus funds", value: "$1,284.20", detail: "Bulldog Bucks, NIL & more", icon: GraduationCap },
          ].map((m, i) => (
            <div className="glass lift rise p-6" style={{ animationDelay: `${(i + 1) * 70}ms` }} key={m.label}>
              <div className="mb-6 flex justify-between">
                <span className="text-sm text-muted-foreground">{m.label}</span>
                <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-primary">
                  <m.icon className="size-4" />
                </span>
              </div>
              <p className="tnum font-display text-3xl font-semibold">{m.value}</p>
              <p className="mt-3 text-xs text-muted-foreground">{m.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="glass rise min-w-0 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Spending insights</h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-success">
                  <TrendingDown className="size-3.5" /> 12% less than last period
                </p>
              </div>
              <div className="flex rounded-full bg-secondary p-1" role="tablist" aria-label="Time range">
                {(Object.keys(ranges) as Range[]).map((r) => (
                  <button
                    key={r}
                    role="tab"
                    aria-selected={range === r}
                    onClick={() => setRange(r)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 h-64">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[...ranges[range]]} margin={{ left: -16, right: 8, top: 8 }}>
                    <defs>
                      <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--lime-deep)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="var(--lime)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(v) => [`$${v}`, "Spent"]}
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, backdropFilter: "blur(12px)" }}
                    />
                    <Area type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={2.5} fill="url(#spend)" animationDuration={700} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton className="h-full w-full rounded-xl" />
              )}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {categories.map((c) => (
                <div key={c.label} className="rounded-xl bg-secondary/60 p-3 transition-colors hover:bg-secondary">
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="tnum mt-1 font-semibold">{c.amount}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
                    <div className="bg-lime-gradient h-full rounded-full" style={{ width: `${c.pct * 2.5}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass rise min-w-0 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Savings goals</h2>
              <Target className="size-5 text-primary" />
            </div>
            <div className="space-y-5">
              {goals.map((g) => {
                const pct = Math.round((g.saved / g.target) * 100);
                return (
                  <div key={g.label} className="group">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-primary transition-transform group-hover:scale-110">
                        <g.icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">{g.label}</span>
                          <span className="tnum text-muted-foreground">{pct}%</span>
                        </div>
                        <p className="tnum text-xs text-muted-foreground">
                          ${g.saved} of ${g.target}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="bg-lime-gradient h-full rounded-full transition-[width] duration-700" style={{ width: mounted ? `${pct}%` : 0 }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-6 rounded-xl bg-success-soft p-3 text-xs leading-5 text-success">
              Round-ups on Bulldog Bucks purchases added $18.40 to your goals this month.
            </p>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent activity</h2>
              <span className="text-xs text-muted-foreground">Last 7 days</span>
            </div>
            <div className="glass overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th className="hidden lg:table-cell">Date</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.name} className="transition-colors hover:bg-secondary/50">
                      <td>
                        <div className="flex items-center gap-3">
                          <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${r.positive ? "bg-success-soft text-success" : "bg-secondary text-muted-foreground"}`}>
                            <r.icon className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold">{r.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{r.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden whitespace-nowrap text-muted-foreground lg:table-cell">{r.date}</td>
                      <td className={`tnum whitespace-nowrap font-semibold ${r.positive ? "text-success" : ""}`}>{r.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { to: "/send", label: "Send & receive", icon: ArrowUpRight },
                { to: "/wallet", label: "Open wallet", icon: Wallet },
                { to: "/campus", label: "Campus accounts", icon: GraduationCap },
              ].map((a) => (
                <Link key={a.to} to={a.to} className="glass lift flex h-24 flex-col items-center justify-center gap-3 px-2 text-center text-xs font-semibold">
                  <a.icon className="size-5 text-primary" />
                  {a.label}
                </Link>
              ))}
            </div>
          </section>
          <section className="min-w-0 space-y-5">
            <div className="hero-cover h-48">
              <img src={campusImage} alt="Students walking through a university courtyard" width={1600} height={640} />
              <div className="hero-copy">
                <p className="text-xs">FALL 2026</p>
                <h3 className="mt-2 text-xl font-semibold">More than banking.</h3>
              </div>
            </div>
            <div className="glass p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Meal swipes this week</h3>
                <Utensils className="size-4 text-primary" />
              </div>
              <div className="mt-4 flex items-end gap-2">
                {[3, 2, 3, 1, 2, 0, 0].map((n, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="bg-lime-gradient w-full rounded-md transition-all hover:opacity-80" style={{ height: `${8 + n * 18}px` }} />
                    <span className="text-[10px] text-muted-foreground">{"MTWTFSS"[i]}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">11 used · 9 left until Sunday reset</p>
            </div>
            <Button asChild variant="link" className="px-0">
              <Link to="/campus">
                Explore Campus <ArrowRight />
              </Link>
            </Button>
          </section>
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">All balances and transactions are simulated for this beta.</p>
      </Phone>
    </Stage>
  );
}