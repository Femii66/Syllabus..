import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Copy, Check, RefreshCw, RotateCcw, Send, Inbox, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyText, useIlpDemo } from "@/hooks/use-ilp-demo";
import {
  confirmQuote,
  createQuote,
  createRequest,
  formatUSD,
  isExpired,
  parseAmount,
  pointerFor,
  resolvePointer,
  SAMPLE_RECIPIENTS,
  type Quote,
} from "@/lib/ilp-demo";

const input =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function DemoBadge() {
  return (
    <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-foreground">
      Interledger demo · simulated
    </span>
  );
}

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={label}
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        }
      }}
    >
      {done ? <Check /> : <Copy />} {done ? "Copied" : "Copy"}
    </Button>
  );
}

export function DemoWalletSummary() {
  const { state, reset, isGuest } = useIlpDemo();
  if (!state) return <div className="glass h-40 animate-pulse" aria-busy="true" />;
  const pointer = pointerFor(state.demoId);
  return (
    <section className="glass space-y-5 p-6" aria-labelledby="ilp-wallet">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="ilp-wallet" className="text-lg font-semibold">Demo payment wallet</h2>
        <DemoBadge />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Demo USD balance {isGuest ? "(guest)" : ""}</p>
        <p className="tnum mt-1 text-3xl font-semibold" data-testid="demo-balance">{formatUSD(state.balance)}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Mock wallet address (not resolvable)</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="min-w-0 break-all rounded-md bg-secondary px-2 py-1 font-mono text-xs">{pointer}</code>
          <CopyButton text={pointer} label="Copy wallet address" />
        </div>
      </div>
      <ActivityList limit={5} />
      <div>
        <h3 className="text-sm font-semibold">Fictional sample ledger</h3>
        <p className="mb-2 text-xs text-muted-foreground">
          Sample people exist only in this browser. Their balances are simulated credits, not real
          accounts, and nothing syncs to other users.
        </p>
        <ul className="divide-y text-sm">
          {SAMPLE_RECIPIENTS.map((r) => (
            <li key={r.id} className="flex justify-between gap-3 py-2">
              <span className="truncate">{r.name} <span className="text-xs text-muted-foreground">(sample)</span></span>
              <span className="tnum font-semibold">{formatUSD(state.recipientBalances[r.id] ?? 0)}</span>
            </li>
          ))}
        </ul>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (confirm("Reset demo wallet to $500.00 and clear activity?")) reset();
        }}
      >
        <RotateCcw /> Reset demo wallet & activity
      </Button>
    </section>
  );
}

export function ActivityList({ limit }: { limit?: number }) {
  const { state } = useIlpDemo();
  const rows = (state?.history ?? []).slice(0, limit);
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">Demo activity</h3>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">No demo payments yet.</p>
      ) : (
        <ul className="divide-y text-sm">
          {rows.map((t) => (
            <li key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {t.kind === "outgoing" ? `To ${t.counterparty}` : `Request${t.note ? ` · ${t.note}` : ""}`}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {new Date(t.createdAt).toLocaleString()} · {t.id}
                </p>
              </div>
              <div className="text-right">
                <p className="tnum font-semibold">
                  {t.kind === "outgoing" ? "−" : "+"}
                  {formatUSD(t.amount)}
                </p>
                <p className="text-xs capitalize text-muted-foreground">{t.status}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const reasons = {
  invalid: "Not found in the sample directory. Use a format like $demo.syllabus.local/users/<id>.",
  "unsupported-external": "External wallet addresses are unsupported in this demo — no cross-network payments are made.",
  self: "You can't pay your own demo wallet.",
};

export function IlpDemoPanel() {
  const navigate = useNavigate();
  const { state, commit } = useIlpDemo();
  const [tab, setTab] = useState<"send" | "request">("send");
  const [to, setTo] = useState(SAMPLE_RECIPIENTS[0]!.pointer);
  const [amt, setAmt] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [reqText, setReqText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!quote) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [quote]);

  if (!state) return <div className="glass h-64 animate-pulse" aria-busy="true" />;
  const s = state;

  function getQuote() {
    setErr("");
    const r = resolvePointer(to, s.demoId);
    if (!r.ok) return setErr(reasons[r.reason]);
    const minor = parseAmount(amt);
    if (minor == null) return setErr("Enter a valid USD amount (up to 2 decimals).");
    const q = createQuote(s, r.pointer, minor, Date.now());
    if ("error" in q) return setErr(q.error!);
    setNow(Date.now());
    setQuote(q.quote);
  }
  function confirmSend() {
    if (!quote || busy) return;
    setBusy(true);
    const r = resolvePointer(quote.receiver, s.demoId);
    const res = confirmQuote(s, quote, r.ok ? r.name : quote.receiver, Date.now());
    if ("error" in res) {
      setBusy(false);
      return setErr(res.error);
    }
    commit(res.state);
    setQuote(null);
    void navigate({ to: "/confirmation", search: { receipt: res.txn.id } });
  }
  function makeRequest() {
    setErr("");
    const minor = parseAmount(amt);
    if (minor == null) return setErr("Enter a valid USD amount (up to 2 decimals).");
    const r = createRequest(s, minor, note, Date.now());
    commit(r.state);
    setReqText(r.text);
  }

  const expired = quote ? isExpired(quote, now) : false;
  const secs = quote ? Math.max(0, Math.ceil((quote.expiresAt - now) / 1000)) : 0;

  return (
    <section className="glass p-6 sm:p-8" aria-labelledby="ilp-panel">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 id="ilp-panel" className="text-lg font-semibold">Send or request money</h2>
        <DemoBadge />
      </div>
      <p className="mb-6 text-xs leading-5 text-muted-foreground">
        Pays from your demo payment wallet using an Interledger-style quote → confirm flow on an
        in-browser ledger. Not Rafiki, no real money. Available:{" "}
        <strong className="tnum" data-testid="panel-balance">{formatUSD(s.balance)}</strong>
      </p>
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-secondary p-1">
        {(["send", "request"] as const).map((m) => (
          <Button
            key={m}
            variant={tab === m ? "default" : "ghost"}
            aria-pressed={tab === m}
            onClick={() => {
              setTab(m);
              setQuote(null);
              setErr("");
              setReqText("");
            }}
          >
            {m === "send" ? <Send /> : <Inbox />} {m === "send" ? "Send" : "Request"}
          </Button>
        ))}
      </div>

      {tab === "send" && !quote && (
        <div className="space-y-4">
          <label className="block text-sm font-medium">
            Recipient wallet address
            <input className={`${input} mt-2 font-mono`} value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Sample directory (fictional people)</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_RECIPIENTS.map((r) => (
                <Button
                  key={r.id}
                  size="sm"
                  variant={to === r.pointer ? "default" : "outline"}
                  aria-pressed={to === r.pointer}
                  onClick={() => setTo(r.pointer)}
                >
                  {r.name}
                </Button>
              ))}
            </div>
          </div>
          <label className="block text-sm font-medium">
            Amount (USD)
            <input className={`${input} mt-2 tnum`} inputMode="decimal" placeholder="0.00" value={amt} onChange={(e) => setAmt(e.target.value)} />
          </label>
          <Button className="h-11 w-full" onClick={getQuote}>Get quote</Button>
        </div>
      )}

      {tab === "send" && quote && (
        <div className="space-y-4">
          <dl className="space-y-3 rounded-lg border p-4 text-sm">
            {[
              ["Recipient", quote.receiver],
              ["You send (debit)", formatUSD(quote.debitAmount)],
              ["They receive", formatUSD(quote.receiveAmount)],
              ["Fee", formatUSD(quote.fee)],
              ["Asset", `${quote.asset.code} · scale ${quote.asset.scale}`],
              ["Quote", quote.id],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="break-all text-right font-mono text-xs font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <p aria-live="polite" className={`text-sm ${expired ? "text-destructive" : "text-muted-foreground"}`}>
            {expired ? "Quote expired." : `Quote valid for ${secs}s`}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setQuote(null)}>Edit</Button>
            {expired ? (
              <Button onClick={getQuote}><RefreshCw /> Refresh quote</Button>
            ) : (
              <Button disabled={busy} onClick={confirmSend}>Confirm payment</Button>
            )}
          </div>
        </div>
      )}

      {tab === "request" && (
        <div className="space-y-4">
          <label className="block text-sm font-medium">
            Amount (USD)
            <input className={`${input} mt-2 tnum`} inputMode="decimal" placeholder="0.00" value={amt} onChange={(e) => setAmt(e.target.value)} />
          </label>
          <label className="block text-sm font-medium">
            Note (optional)
            <input className={`${input} mt-2`} maxLength={80} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <Button className="h-11 w-full" onClick={makeRequest}>Create incoming payment request</Button>
          {reqText && (
            <div className="space-y-2 rounded-lg border p-4">
              <p className="break-words text-xs">{reqText}</p>
              <CopyButton text={reqText} label="Copy request text" />
            </div>
          )}
        </div>
      )}

      {err && (
        <p role="alert" className="mt-4 flex gap-2 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" /> {err}
        </p>
      )}
    </section>
  );
}

/** Live demo-ledger card for the dashboard; separate from the static example banking figures. */
export function DashboardDemoWallet() {
  const { state, isGuest } = useIlpDemo();
  if (!state) return <div className="glass h-40 animate-pulse" aria-busy="true" />;
  const rows = state.history.slice(0, 3);
  return (
    <section className="glass rise mt-6 grid gap-6 p-6 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)]" aria-labelledby="dash-demo-wallet">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="dash-demo-wallet" className="text-lg font-semibold">Demo payment wallet</h2>
          <DemoBadge />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Live in-browser ledger {isGuest ? "(guest)" : ""} · updates when you send</p>
        <p className="tnum mt-4 font-display text-4xl font-bold" data-testid="dashboard-demo-balance">{formatUSD(state.balance)}</p>
        <Button asChild size="sm" className="mt-4">
          <Link to="/send"><Send /> Send or request</Link>
        </Button>
      </div>
      <div className="min-w-0">
        <h3 className="mb-2 text-sm font-semibold">Recent demo activity</h3>
        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">No demo payments yet. Sends and requests you make on Send & receive appear here.</p>
        ) : (
          <ul className="divide-y text-sm">
            {rows.map((t) => (
              <li key={t.id} className="flex justify-between gap-3 py-2">
                <span className="min-w-0 truncate">
                  {t.kind === "outgoing" ? `Sent to ${t.counterparty}` : `Requested${t.note ? ` · ${t.note}` : ""}`}
                  <span className="block truncate text-xs text-muted-foreground">{t.id}</span>
                </span>
                <span className={`tnum shrink-0 font-semibold ${t.kind === "outgoing" ? "" : "text-muted-foreground"}`}>
                  {t.kind === "outgoing" ? "−" : "+"}{formatUSD(t.amount)}
                  {t.kind !== "outgoing" && <span className="block text-right text-xs font-normal">pending</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}