import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, FileUp, ShieldCheck, Trash2, Landmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/session";
import { Button } from "@/components/ui/button";
import {
  csvToText,
  extractCandidates,
  parseCsv,
  parseMoneyInput,
  type AmountCandidate,
  type DateCandidate,
} from "@/lib/tuition-parse";

type Snapshot = {
  balance_cents: number;
  statement_date: string;
  source_type: "pdf" | "csv" | "manual";
  source_filename: string | null;
  updated_at: string;
};
type Draft = {
  type: "pdf" | "csv" | "manual";
  filename: string | null;
  preview: string;
  amounts: AmountCandidate[];
  dates: DateCandidate[];
};

// Configure via VITE_UNIVERSITY_PORTAL_URL; no portal URL is assumed.
const PORTAL_URL = import.meta.env["VITE_UNIVERSITY_PORTAL_URL"] as string | undefined;
const MAX_BYTES = 10 * 1024 * 1024;
const money = (c: number) =>
  (c / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

async function pdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const lines: string[] = [];
  for (let p = 1; p <= Math.min(doc.numPages, 20); p++) {
    const content = await (await doc.getPage(p)).getTextContent();
    let line = "";
    let lastY: number | null = null;
    for (const item of content.items as { str?: string; transform?: number[] }[]) {
      const y = item.transform?.[5] ?? 0;
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        lines.push(line);
        line = "";
      }
      line += (line ? " " : "") + (item.str ?? "");
      lastY = y;
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export function TuitionSync() {
  const { user, ready } = useSession();
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      setSnap(null);
      return;
    }
    setLoading(true);
    supabase
      .from("tuition_snapshots")
      .select("balance_cents,statement_date,source_type,source_filename,updated_at")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setMsg({ kind: "error", text: "Could not load your tuition snapshot." });
        setSnap((data as Snapshot | null) ?? null);
        setLoading(false);
      });
  }, [user]);

  function reset(next: Draft | null) {
    setDraft(next);
    setAmount("");
    setDate("");
    setConfirmed(false);
  }

  async function onFile(file: File) {
    setMsg(null);
    if (file.size > MAX_BYTES) return setMsg({ kind: "error", text: "File is larger than 10 MB." });
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    const isCsv = file.type === "text/csv" || /\.csv$/i.test(file.name);
    if (!isPdf && !isCsv)
      return setMsg({ kind: "error", text: "Please choose a PDF or CSV statement." });
    setBusy(true);
    try {
      const text = isPdf ? await pdfText(file) : csvToText(parseCsv(await file.text()));
      if (text.replace(/\s/g, "").length < 20) {
        setMsg({
          kind: "error",
          text: "We couldn't read text from this file — it may be scanned or image-only. You can enter the balance manually below (marked self-reported).",
        });
        reset({ type: "manual", filename: null, preview: "", amounts: [], dates: [] });
        return;
      }
      const c = extractCandidates(text);
      reset({ type: isPdf ? "pdf" : "csv", filename: file.name, preview: text.slice(0, 1200), ...c });
      if (!c.amounts.length)
        setMsg({ kind: "error", text: "No labeled balance was found. Please type the amount from your statement." });
    } catch {
      setMsg({
        kind: "error",
        text: "This file couldn't be read (it may be protected or unsupported). Use manual entry instead.",
      });
      reset({ type: "manual", filename: null, preview: "", amounts: [], dates: [] });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save() {
    if (!user || !draft) return;
    const cents = parseMoneyInput(amount);
    if (cents === null) return setMsg({ kind: "error", text: "Enter a valid amount, e.g. 1234.56." });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setMsg({ kind: "error", text: "Enter the statement date." });
    setBusy(true);
    const row = {
      user_id: user.id,
      balance_cents: cents,
      statement_date: date,
      source_type: draft.type,
      source_filename: draft.filename?.slice(0, 255) ?? null,
      self_reported: true,
    };
    const { data, error } = await supabase
      .from("tuition_snapshots")
      .upsert(row, { onConflict: "user_id" })
      .select("balance_cents,statement_date,source_type,source_filename,updated_at")
      .single();
    setBusy(false);
    if (error) return setMsg({ kind: "error", text: "Could not save the snapshot. Please try again." });
    setSnap(data as Snapshot);
    reset(null);
    setMsg({ kind: "ok", text: "Tuition balance saved." });
  }

  async function remove() {
    if (!user || !confirm("Delete your imported tuition snapshot?")) return;
    setBusy(true);
    const { error } = await supabase.from("tuition_snapshots").delete().eq("user_id", user.id);
    setBusy(false);
    if (error) return setMsg({ kind: "error", text: "Could not delete the snapshot." });
    setSnap(null);
    setMsg({ kind: "ok", text: "Imported snapshot deleted." });
  }

  return (
    <section className="glass mt-10 p-6" aria-labelledby="tuition-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-brand-soft text-primary">
            <Landmark className="size-5" />
          </span>
          <div>
            <h2 id="tuition-title" className="text-xl font-semibold">Sync Tuition Balance</h2>
            <p className="text-sm text-muted-foreground">Import your own statement — you stay in control.</p>
          </div>
        </div>
        {PORTAL_URL ? (
          <Button variant="outline" asChild>
            <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer">
              Open university portal <ExternalLink />
            </a>
          </Button>
        ) : (
          <Button variant="outline" disabled title="Portal URL not configured yet">
            Open university portal (not configured)
          </Button>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Tuition balance</p>
          {loading ? (
            <p className="mt-3 h-9 w-40 animate-pulse rounded bg-muted" />
          ) : snap ? (
            <>
              <p className="tnum mt-2 text-3xl font-semibold">{money(snap.balance_cents)}</p>
              <p className="mt-2 inline-flex rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-primary">
                {snap.source_type === "manual" ? "Self-reported · not verified" : "Imported by you · not verified"}
              </p>
              <dl className="mt-4 space-y-1 text-xs text-muted-foreground">
                <div>Statement date: {snap.statement_date}</div>
                {snap.source_filename && <div className="break-all">Source: {snap.source_filename}</div>}
                <div>Last updated: {new Date(snap.updated_at).toLocaleString()}</div>
              </dl>
              <Button variant="ghost" size="sm" className="mt-4" onClick={remove} disabled={busy}>
                <Trash2 /> Delete imported snapshot
              </Button>
            </>
          ) : (
            <>
              <p className="tnum mt-2 text-3xl font-semibold text-muted-foreground">$8,450.00</p>
              <p className="mt-2 inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">Demo data</p>
            </>
          )}
        </div>

        <div className="rounded-lg border bg-card p-5 text-sm">
          {!ready ? null : !user ? (
            <p className="text-muted-foreground">
              <Link to="/auth" className="font-medium text-primary underline">Sign in</Link> to import your tuition statement.
            </p>
          ) : (
            <>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.csv,application/pdf,text/csv"
                className="sr-only"
                id="tuition-file"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => fileRef.current?.click()} disabled={busy}>
                  <FileUp /> {busy ? "Reading…" : "Upload PDF or CSV"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => reset({ type: "manual", filename: null, preview: "", amounts: [], dates: [] })}
                >
                  Enter manually
                </Button>
              </div>
              <p className="mt-3 flex gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 shrink-0 text-primary" />
                Privacy: your file is read only in this browser and is never uploaded. We save just the amount, statement date, file name and source type you confirm. We never ask for university passwords or make payments.
              </p>
            </>
          )}
        </div>
      </div>

      {msg && (
        <p role={msg.kind === "error" ? "alert" : "status"} className={`mt-4 text-sm ${msg.kind === "error" ? "text-destructive" : "text-primary"}`}>
          {msg.text}
        </p>
      )}

      {draft && user && (
        <div className="mt-6 grid gap-6 rounded-lg border bg-card p-5 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">
              {draft.type === "manual" ? "Manual entry (self-reported)" : `Source: ${draft.filename}`}
            </p>
            {draft.preview && (
              <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs">{draft.preview}</pre>
            )}
            {draft.amounts.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-muted-foreground">Balances found — pick one to fill in:</p>
                <div className="flex flex-wrap gap-2">
                  {draft.amounts.map((a) => (
                    <Button key={a.cents} size="sm" variant="outline" title={a.context} onClick={() => setAmount((a.cents / 100).toFixed(2))}>
                      {money(a.cents)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {draft.dates.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-muted-foreground">Dates found:</p>
                <div className="flex flex-wrap gap-2">
                  {draft.dates.map((d) => (
                    <Button key={d.iso} size="sm" variant="outline" title={d.context} onClick={() => setDate(d.iso)}>
                      {d.iso}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <label className="block text-sm">
              Balance amount (USD)
              <input className="mt-1 w-full rounded-md border bg-background px-3 py-2" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </label>
            <label className="block text-sm">
              Statement date
              <input type="date" className="mt-1 w-full rounded-md border bg-background px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5" />
              I checked these values against my statement. I understand this is not verified by my university.
            </label>
            <div className="flex gap-3">
              <Button onClick={save} disabled={!confirmed || busy || !amount || !date}>
                {snap ? "Replace snapshot" : "Save snapshot"}
              </Button>
              <Button variant="ghost" onClick={() => reset(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}