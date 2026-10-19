import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Stage } from "@/components/phone";

type ConfirmationSearch = {
  amount: number;
  mode: "send" | "receive";
  source: "student-id" | "debit";
};

export const Route = createFileRoute("/confirmation")({
  validateSearch: (search: Record<string, unknown>): ConfirmationSearch => ({
    amount: Number(search["amount"] ?? 45),
    mode: search["mode"] === "receive" ? "receive" : "send",
    source: search["source"] === "student-id" ? "student-id" : "debit",
  }),
  head: () => ({
    meta: [
      { title: "Payment confirmed — $yllabus" },
      { name: "description", content: "Your $yllabus transfer receipt and updated balance." },
      { property: "og:title", content: "Payment confirmed — $yllabus" },
      { property: "og:description", content: "Transfer receipt with reference number and time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Confirmation,
});

function Confirmation() {
  const { amount, mode, source } = Route.useSearch();
  const formatted = amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <Stage>
      <Phone className="p-6">
        <div className="pointer-events-none absolute -left-10 top-16 size-44 rounded-full bg-accent/25 blur-2xl" />
        <div className="mt-6 grid size-20 place-items-center self-center rounded-full bg-accent/15">
          <div className="grid size-12 place-items-center rounded-full bg-accent text-xl font-bold text-accent-foreground">
            ✓
          </div>
        </div>
        <p className="mt-4 text-center font-display text-2xl font-bold">
          {mode === "send" ? "Payment sent" : "Request sent"}
        </p>
        <p className="text-center text-sm text-ink/55">
          {mode === "send" ? "Delivered to" : "Requested from"} Jordan Okafor
        </p>

        <div className="glass mt-6 rounded-3xl p-4 ring-1 ring-white/60">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink/50">Amount</span>
            <span className="tnum font-display text-lg font-bold">{formatted}</span>
          </div>
          <div className="my-3 h-px bg-ink/10" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink/50">{mode === "send" ? "From" : "Into"}</span>
            <span className="font-medium">
              {source === "student-id" ? "Student ID · Bulldog Bucks" : "Debit ·· 4471"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-ink/50">Reference</span>
            <span className="font-mono text-xs">#SYL-9204</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-ink/50">Time</span>
            <span className="font-mono text-xs">2:41 PM</span>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="mt-auto w-full rounded-2xl bg-accent py-4 text-center text-sm font-semibold text-accent-foreground transition-transform duration-300 hover:-translate-y-0.5"
        >
          Done
        </Link>
      </Phone>
    </Stage>
  );
}
