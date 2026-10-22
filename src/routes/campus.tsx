import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, GraduationCap, ReceiptText, Trophy, Utensils } from "lucide-react";
import { Phone, Stage, PageHeading } from "@/components/phone";
export const Route = createFileRoute("/campus")({
  head: () => ({
    meta: [
      { title: "Campus — $yllabus" },
      {
        name: "description",
        content:
          "Bulldog Bucks, meal swipes, vouchers, stipends and your 2026–2027 account summary.",
      },
      { property: "og:title", content: "Campus — $yllabus" },
      { property: "og:description", content: "Your campus balances and benefits in one place." },
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
];
function Campus() {
  return (
    <Stage>
      <Phone>
        <PageHeading title="Campus" subtitle="Fall 2026 · State University" />
        <div className="mb-8 border-y py-7">
          <p className="text-sm text-muted-foreground">Available campus funds</p>
          <p className="tnum mt-3 text-4xl font-semibold">$3,071.85</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((a) => (
            <article key={a.label} className="glass p-6">
              <div className="mb-6 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-brand-soft text-primary">
                  <a.icon className="size-5" />
                </span>
                <h2 className="text-sm font-semibold">{a.label}</h2>
              </div>
              <p className="tnum text-3xl font-semibold">{a.value}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {a.label === "Meal swipes" ? "Remaining this week" : "Available balance"}
              </p>
            </article>
          ))}
        </div>
        <section className="mt-10">
          <h2 className="text-xl font-semibold">2026–2027 Account Summary</h2>
          <p className="mb-5 mt-2 text-sm text-muted-foreground">Academic year · Demo account</p>
          <div className="overflow-hidden rounded-lg border bg-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campus account</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.label}>
                    <td className="font-medium">{a.label}</td>
                    <td className="tnum">{a.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Phone>
    </Stage>
  );
}