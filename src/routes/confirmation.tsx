import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Stage } from "@/components/phone";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type ConfirmationSearch = {
  amount: number;
  transferId?: string;
  mode: "send" | "receive";
  source: "student-id" | "debit";
};

export const Route = createFileRoute("/confirmation")({
  validateSearch: (search: Record<string, unknown>): ConfirmationSearch => ({
    amount: Number(search["amount"] ?? 45),
    transferId: typeof search["transferId"] === "string" ? search["transferId"] : undefined,
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
  const { amount, mode, source, transferId } = Route.useSearch();
  const [state, setState] = useState<"loading" | "verified" | "demo" | "invalid">("loading");
  const [receipt, setReceipt] = useState<{ amount_cents: number; created_at: string; id: string } | null>(null);
  useEffect(() => {
    let active = true;
    async function verify() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!transferId) { setState(user ? "invalid" : "demo"); return; }
      if (!user) { setState("invalid"); return; }
      const { data, error } = await supabase.from("demo_transfers")
        .select("id,amount_cents,created_at,sender_id")
        .eq("id", transferId).eq("sender_id", user.id).maybeSingle();
      if (!active) return;
      if (error || !data) { setState("invalid"); return; }
      setReceipt(data);
      setState("verified");
    }
    void verify();
    return () => { active = false; };
  }, [transferId]);
  const formatted = (receipt ? receipt.amount_cents / 100 : amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <Stage>
      <Phone className="p-6">
        <div className="pointer-events-none absolute -left-10 top-16 size-44 rounded-full bg-accent/25 blur-2xl" />
        {state === "loading" && <p role="status" className="mt-8 text-center text-sm">Verifying receipt…</p>}
        {state === "invalid" && <p role="alert" className="mt-8 text-center text-sm text-red-700">No verified transfer receipt was found.</p>}
        {(state === "verified" || state === "demo") && <>
        <div className="mt-6 grid size-20 place-items-center self-center rounded-full bg-accent/15">
          <div className="grid size-12 place-items-center rounded-full bg-accent text-xl font-bold text-accent-foreground">
            ✓
          </div>
        </div>
        <p className="mt-4 text-center font-display text-2xl font-bold">
          {state === "demo" ? "Demo preview" : "Demo transfer sent"}
        </p>
        <p className="text-center text-sm text-ink/55">
          {state === "demo" ? "Sample recipient: Jordan Okafor" : "Sent to a registered student"}
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
              {state === "demo" ? (source === "student-id" ? "Student ID · Bulldog Bucks" : "Debit ·· 4471") : "Demo checking"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-ink/50">Reference</span>
            <span className="font-mono text-xs">{receipt ? receipt.id.slice(0, 13) : "SAMPLE ONLY"}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-ink/50">Time</span>
            <span className="font-mono text-xs">{receipt ? new Date(receipt.created_at).toLocaleString() : "Sample"}</span>
          </div>
        </div>

        </>}
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
