import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ArrowRight } from "lucide-react";
import { Phone, Stage } from "@/components/phone";
import { Button } from "@/components/ui/button";
type ConfirmationSearch = {
  amount: number;
  mode: "send" | "receive";
  source: "student-id" | "debit";
};
export const Route = createFileRoute("/confirmation")({
  validateSearch: (s: Record<string, unknown>): ConfirmationSearch => ({
    amount: Number(s["amount"] ?? 45),
    mode: s["mode"] === "receive" ? "receive" : "send",
    source: s["source"] === "student-id" ? "student-id" : "debit",
  }),
  head: () => ({
    meta: [
      { title: "Transfer receipt — $yllabus" },
      { name: "description", content: "Your simulated transfer receipt." },
      { property: "og:title", content: "Transfer receipt — $yllabus" },
      { property: "og:description", content: "Review your simulated payment or request." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Confirmation,
});
function Confirmation() {
  const { amount, mode, source } = Route.useSearch();
  return (
    <Stage>
      <Phone>
        <div className="mx-auto max-w-lg py-10">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft text-success">
            <Check className="size-8" />
          </span>
          <h1 className="mt-6 text-center text-3xl font-semibold">
            {mode === "send" ? "Payment sent" : "Request sent"}
          </h1>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {mode === "send" ? "Delivered to" : "Requested from"} Jordan Okafor
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Simulated transaction · No real money moved
          </p>
          <dl className="my-8 space-y-5 border-y py-7">
            {[
              {
                label: "Amount",
                value: amount.toLocaleString("en-US", { style: "currency", currency: "USD" }),
              },
              {
                label: mode === "send" ? "From" : "Into",
                value: source === "student-id" ? "Student ID · Bulldog Bucks" : "Debit ·· 4471",
              },
              { label: "Reference", value: "#SYL-9204" },
              { label: "Time", value: "2:41 PM" },
            ].map((x) => (
              <div key={x.label} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 text-sm">
                <dt className="text-muted-foreground">{x.label}</dt>
                <dd className="text-right font-semibold">{x.value}</dd>
              </div>
            ))}
          </dl>
          <Button asChild className="h-12 w-full">
            <Link to="/dashboard">
              Done <ArrowRight />
            </Link>
          </Button>
        </div>
      </Phone>
    </Stage>
  );
}