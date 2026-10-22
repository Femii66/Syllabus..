import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Stage, TabBar } from "@/components/phone";

export const Route = createFileRoute("/send")({
  head: () => ({
    meta: [
      { title: "Send & receive — $yllabus" },
      {
        name: "description",
        content: "Send or receive money using your Student ID or bank debit card.",
      },
      { property: "og:title", content: "Send & receive — $yllabus" },
      { property: "og:description", content: "Move money across campus in a couple of taps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Send,
});

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

const sources = [
  { id: "student-id", label: "Student ID", detail: "Bulldog Bucks · $62.20" },
  { id: "debit", label: "Debit card", detail: "Checking ·· 4471" },
] as const;

type SourceId = (typeof sources)[number]["id"];

function Send() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"send" | "receive">("send");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<SourceId>("debit");
  const [signedIn, setSignedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipient, setRecipient] = useState<{ id: string; display_name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => { if (active) setSignedIn(!!data.user); }).catch(() => { if (active) setError("Unable to verify your session."); }).finally(() => { if (active) setAuthReady(true); });
    return () => { active = false; };
  }, []);

  async function findRecipient() {
    setBusy(true);
    setError("");
    setNotice("");
    setRecipient(null);
    try {
      const { data, error: lookupError } = await supabase.rpc("find_demo_recipient", { p_email: recipientEmail.trim() });
      if (lookupError) throw lookupError;
      if (!data?.length) { setNotice("No eligible student found for that exact email."); return; }
      setRecipient(data[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to find recipient.");
    } finally { setBusy(false); }
  }

  async function submitTransfer() {
    if (busy || !authReady || numeric <= 0) return;
    if (!signedIn) {
      await navigate({ to: "/confirmation", search: { amount: numeric, mode, source } });
      return;
    }
    if (mode !== "send") { setError("Demo payment requests are not available for registered accounts yet."); return; }
    if (source !== "debit") { setError("Student ID funds are not connected yet. Choose Checking."); return; }
    if (!recipient) { setError("Find and select a recipient first."); return; }
    const cents = Math.round(numeric * 100);
    if (!Number.isSafeInteger(cents) || cents < 1 || cents > 100000000) { setError("Enter a valid amount."); return; }
    setBusy(true);
    setError("");
    try {
      const requestId = crypto.randomUUID();
      const { data, error: transferError } = await supabase.rpc("send_demo_transfer", {
        p_recipient_id: recipient.id, p_source_type: "checking", p_amount_cents: cents, p_request_id: requestId,
      });
      if (transferError) throw transferError;
      if (!data) throw new Error("Transfer could not be confirmed.");
      await navigate({ to: "/confirmation", search: { amount: numeric, mode: "send", source, transferId: data } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed. Your balance was not confirmed.");
    } finally { setBusy(false); }
  }

  function press(key: string) {
    setAmount((current) => {
      if (key === "⌫") return current.slice(0, -1);
      if (key === "." && current.includes(".")) return current;
      if (current.includes(".") && (current.split(".")[1]?.length ?? 0) >= 2) return current;
      if (current.length >= 7) return current;
      return current + key;
    });
  }

  const display = amount === "" ? "0" : amount;
  const numeric = Number(amount || "0");
  const selectedSource = sources.find((item) => item.id === source) ?? sources[1];

  return (
    <Stage>
      <Phone className="p-5">
        <div className="pointer-events-none absolute -right-10 top-10 size-40 rounded-full bg-violet/20 blur-2xl" />
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-bold">
            {mode === "send" ? "Send money" : "Request money"}
          </p>
          <button
            onClick={() => setMode(mode === "send" ? "receive" : "send")}
            className="rounded-full bg-white/60 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/60"
          >
            {mode === "send" ? "Receive" : "Send"}
          </button>
        </div>

        {signedIn && <div className="mt-3 space-y-2">
          <label className="block text-xs font-semibold">Recipient's exact email
            <input type="email" value={recipientEmail} onChange={(e) => { setRecipientEmail(e.target.value); setRecipient(null); }}
              placeholder="student@example.com" className="mt-1 w-full rounded-xl bg-white/70 p-2 text-sm ring-1 ring-ink/10" />
          </label>
          <button type="button" disabled={busy || !recipientEmail.includes("@")} onClick={() => void findRecipient()}
            className="rounded-xl bg-ink px-3 py-2 text-xs font-semibold text-paper disabled:opacity-40">Find student</button>
        </div>}
        <div className="glass mt-3 flex items-center gap-3 rounded-2xl p-3 ring-1 ring-white/60">
          <div className="grid size-9 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
            {signedIn ? (recipient?.display_name.slice(0, 2).toUpperCase() ?? "?") : "JO"}
          </div>
          <div className="text-sm font-semibold">{signedIn ? (recipient?.display_name ?? "Select a recipient") : "Jordan Okafor"}</div>
          <span className="ml-auto text-xs text-ink/40">›</span>
        </div>

        <fieldset className="mt-3">
          <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
            {mode === "send" ? "Send from" : "Receive into"}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {sources.map((item) => {
              const selected = item.id === source;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSource(item.id)}
                  className={`relative min-h-16 rounded-2xl p-2.5 text-left ring-1 transition-colors ${
                    selected ? "bg-ink text-paper ring-ink" : "glass text-ink ring-white/60"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="size-3.5" aria-hidden="true" />
                    <span className="text-xs font-semibold">{item.label}</span>
                    {selected && <Check className="ml-auto size-3.5" aria-hidden="true" />}
                  </div>
                  <p className={`mt-1 text-[9px] ${selected ? "text-paper/60" : "text-ink/45"}`}>
                    {item.detail}
                  </p>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-3 text-center">
          <p className="tnum font-display text-5xl font-bold tracking-tight">
            $<span className={amount === "" ? "text-ink/25" : ""}>{display}</span>
          </p>
          <p className="mt-1 font-mono text-[10px] text-ink/40">{selectedSource.detail}</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              className="glass grid h-12 place-items-center rounded-2xl font-display text-lg font-semibold ring-1 ring-white/60 transition-transform duration-200 active:scale-95"
            >
              {k}
            </button>
          ))}
        </div>

        {signedIn && <p className="mt-2 text-center text-[10px] text-ink/50">Registered beta: checking balance only · simulated money</p>}
        {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
        {notice && <p role="status" className="mt-2 text-xs text-ink/60">{notice}</p>}
        <button
          disabled={busy || !authReady || numeric <= 0 || (signedIn && (mode !== "send" || source !== "debit" || !recipient))}
          onClick={() => void submitTransfer()}
          className="mt-4 w-full rounded-2xl bg-ink py-4 text-sm font-semibold text-paper transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {busy ? "Please wait…" : mode === "send" ? "Send" : "Request"}
        </button>

        <TabBar />
      </Phone>
    </Stage>
  );
}
