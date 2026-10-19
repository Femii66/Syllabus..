import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ChevronRight, GraduationCap, ReceiptText, Trophy, Utensils } from "lucide-react";
import { Phone, Stage, TabBar } from "@/components/phone";

export const Route = createFileRoute("/campus")({
  head: () => ({
    meta: [
      { title: "Campus — $yllabus" },
      { name: "description", content: "View Bulldog Bucks, school funding, benefits, and your 2026–2027 account summary." },
      { property: "og:title", content: "Campus — $yllabus" },
      { property: "og:description", content: "Your campus balances and school account in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Campus,
});

const accounts = [
  { label: "Bulldog Bucks", value: "$62.20", icon: GraduationCap },
  { label: "Meal swipes", value: "14 left", icon: Utensils },
  { label: "Book voucher", value: "$150.00", icon: BookOpen },
  { label: "Book stipend", value: "$425.00", icon: BookOpen },
  { label: "NIL", value: "$1,150.00", icon: Trophy },
  { label: "Refund Check", value: "$1,284.65", icon: ReceiptText },
] as const;

function Campus() {
  return (
    <Stage>
      <Phone className="p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-ink text-paper">
            <GraduationCap className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-lg font-bold">Campus</p>
            <p className="text-xs text-ink/50">Fall 2026 · State University</p>
          </div>
        </div>

        <div className="glass mt-5 rounded-2xl p-4 ring-1 ring-white/60">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">Available campus funds</p>
          <p className="tnum mt-1 font-display text-3xl font-bold">$3,071.85</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {accounts.map((account) => {
            const Icon = account.icon;
            return (
              <div key={account.label} className="glass min-h-20 rounded-2xl p-3 ring-1 ring-white/60">
                <div className="flex items-center justify-between">
                  <Icon className="size-4 text-accent" aria-hidden="true" />
                  <ChevronRight className="size-3.5 text-ink/30" aria-hidden="true" />
                </div>
                <p className="mt-2 text-[10px] text-ink/50">{account.label}</p>
                <p className="tnum font-display text-base font-bold">{account.value}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl bg-ink p-4 text-paper">
          <div>
            <p className="text-[10px] text-paper/55">Academic year</p>
            <p className="font-display text-sm font-semibold">2026–2027 Account Summary</p>
          </div>
          <ChevronRight className="size-4" aria-hidden="true" />
        </div>

        <div className="mt-auto">
          <TabBar />
        </div>
      </Phone>
    </Stage>
  );
}