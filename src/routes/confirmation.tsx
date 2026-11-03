import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ArrowRight } from "lucide-react";
import { Phone, Stage } from "@/components/phone";
import { Button } from "@/components/ui/button";
import { useIlpDemo } from "@/hooks/use-ilp-demo";
type ConfirmationSearch = {
  amount: number;
  mode: "send" | "receive";
  source: "student-id" | "debit";
  receipt?: string;
};
export const Route = createFileRoute("/confirmation")({
  validateSearch: (s: Record<string, unknown>): ConfirmationSearch => ({
    amount: Number(s["amount"] ?? 45),
    mode: s["mode"] === "receive" ? "receive" : "send",
    source: s["source"] === "student-id" ? "student-id" : "debit",
    ...(typeof s["receipt"] === "string" && /^SYL-[0-9A-F]{16}$/.test(s["receipt"])
      ? { receipt: s["receipt"] }
      : {}),
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
  const { amount, mode, source, receipt } = Route.useSearch();
  const { state } = useIlpDemo();
  const txn = receipt ? state?.history.find((t) => t.id === receipt) : undefined;
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
            {mode === "send" ? "Delivered to" : "Requested from"} {txn?.counterparty ?? "Jordan Okafor"}
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {txn ? "Interledger demo · in-browser ledger · " : "Simulated transaction · "}No real money moved
          </p>
          <dl className="my-8 space-y-5 border-y py-7">
            {[
              {
                label: "Amount",
                value: (txn ? txn.amount / 100 : amount).toLocaleString("en-US", { style: "currency", currency: "USD" }),
              },
              txn
                ? { label: "To", value: txn.pointer }
                : {
                    label: mode === "send" ? "From" : "Into",
                    value: source === "student-id" ? "Student ID · Bulldog Bucks" : "Debit ·· 4471",
                  },
              ...(txn ? [{ label: "Status", value: "Completed (simulated)" }, { label: "Fee", value: "$0.00" }] : []),
              { label: "Reference", value: txn ? txn.id : "#SYL-9204" },
              { label: "Time", value: txn ? new Date(txn.createdAt).toLocaleString() : "2:41 PM" },
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