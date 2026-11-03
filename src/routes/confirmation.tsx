import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ArrowRight, FileQuestion } from "lucide-react";
import { Phone, Stage } from "@/components/phone";
import { Button } from "@/components/ui/button";
import { useIlpDemo } from "@/hooks/use-ilp-demo";
import { findReceipt, formatUSD } from "@/lib/ilp-demo";

type ConfirmationSearch = { receipt?: string };
export const Route = createFileRoute("/confirmation")({
  // Only the receipt id is read from the URL; every displayed detail comes from the stored ledger.
  validateSearch: (s: Record<string, unknown>): ConfirmationSearch =>
    typeof s["receipt"] === "string" ? { receipt: s["receipt"].slice(0, 40) } : {},
  head: () => ({
    meta: [
      { title: "Transfer receipt — $yllabus" },
      { name: "description", content: "Your simulated demo wallet receipt." },
      { property: "og:title", content: "Transfer receipt — $yllabus" },
      { property: "og:description", content: "Review a simulated payment from your demo wallet ledger." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Confirmation,
});

function Confirmation() {
  const { receipt } = Route.useSearch();
  const { state } = useIlpDemo();
  if (!state)
    return (
      <Stage>
        <Phone>
          <div className="glass mx-auto my-10 h-80 max-w-lg animate-pulse" aria-busy="true" />
        </Phone>
      </Stage>
    );
  const txn = findReceipt(state, receipt);
  return (
    <Stage>
      <Phone>
        <div className="mx-auto max-w-lg py-10">
          {txn ? (
            <>
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft text-success">
                <Check className="size-8" />
              </span>
              <h1 className="mt-6 text-center text-3xl font-semibold">Payment sent</h1>
              <p className="mt-3 text-center text-sm text-muted-foreground">Delivered to {txn.counterparty}</p>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Interledger demo · in-browser ledger · No real money moved
              </p>
              <dl className="my-8 space-y-5 border-y py-7">
                {[
                  { label: "Amount", value: formatUSD(txn.amount) },
                  { label: "From", value: "Demo payment wallet" },
                  { label: "To", value: txn.pointer },
                  { label: "Status", value: "Completed (simulated)" },
                  { label: "Fee", value: "$0.00" },
                  { label: "Reference", value: txn.id },
                  { label: "Time", value: new Date(txn.createdAt).toLocaleString() },
                ].map((x) => (
                  <div key={x.label} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 text-sm">
                    <dt className="text-muted-foreground">{x.label}</dt>
                    <dd className="break-all text-right font-semibold">{x.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <>
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-secondary text-muted-foreground">
                <FileQuestion className="size-8" />
              </span>
              <h1 className="mt-6 text-center text-3xl font-semibold">Receipt unavailable</h1>
              <p className="mx-auto mt-3 max-w-sm text-center text-sm text-muted-foreground">
                We couldn't find this payment in your demo wallet on this browser. It may have been
                reset, made under a different account, or never confirmed.
              </p>
              <Button asChild variant="outline" className="mt-8 h-12 w-full">
                <Link to="/send">Go to Send & receive</Link>
              </Button>
            </>
          )}
          <Button asChild className="mt-3 h-12 w-full">
            <Link to="/dashboard">
              Done <ArrowRight />
            </Link>
          </Button>
        </div>
      </Phone>
    </Stage>
  );
}