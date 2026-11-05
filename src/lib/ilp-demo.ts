// Interledger/Rafiki-INSPIRED demo ledger. Pure, browser-only, no real money,
// no network calls, no Open Payments, no Rafiki admin API.

export const DEMO_HOST = "$demo.syllabus.local";
export const ASSET = { code: "USD", scale: 2 } as const;
export const QUOTE_TTL_MS = 60_000;
export const STARTING_BALANCE = 50_000; // minor units ($500.00)

export type Txn = {
  id: string; // receipt id
  kind: "outgoing" | "incoming-request";
  counterparty: string;
  pointer: string;
  amount: number; // minor units
  status: "completed" | "pending";
  createdAt: number;
  note?: string;
};
export type DemoState = {
  version: 1;
  demoId: string;
  balance: number;
  history: Txn[];
  /** Fictional sample-recipient balances inside this browser's ledger only. */
  recipientBalances: Record<string, number>;
  usedQuotes: string[];
};
export const SAMPLE_START_BALANCE = 10_000; // $100.00 fictional
export type Quote = {
  id: string;
  receiver: string;
  debitAmount: number;
  receiveAmount: number;
  fee: number;
  asset: typeof ASSET;
  createdAt: number;
  expiresAt: number;
};

export const SAMPLE_RECIPIENTS = [
  { name: "Jordan Okafor", id: "jordan-okafor" },
  { name: "Aaliyah Brooks", id: "aaliyah-brooks" },
  { name: "Marcus Bell", id: "marcus-bell" },
  { name: "Priya Shah", id: "priya-shah" },
].map((r) => ({ ...r, pointer: `${DEMO_HOST}/users/${r.id}` }));

export const pointerFor = (demoId: string) => `${DEMO_HOST}/users/${demoId}`;

export function randomId(prefix: string, bytes = 8) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return prefix + Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function initialState(demoId = randomId("", 6).toLowerCase()): DemoState {
  return {
    version: 1,
    demoId,
    balance: STARTING_BALANCE,
    history: [],
    recipientBalances: Object.fromEntries(SAMPLE_RECIPIENTS.map((r) => [r.id, SAMPLE_START_BALANCE])),
    usedQuotes: [],
  };
}

export const formatUSD = (minor: number) =>
  (minor / 10 ** ASSET.scale).toLocaleString("en-US", { style: "currency", currency: "USD" });

/** Legible local date + time, e.g. "Nov 5, 2026, 2:19 PM". Never invents a time. */
export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Concise relative time for activity rows: "just now", "5m ago", "2h ago", "3d ago",
 * falling back to an absolute date after a week. */
export function formatRelativeTime(ts: number, now: number): string {
  const diff = Math.max(0, now - ts);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Human status for a ledger entry; requests are pending and never credited. */
export function statusLabel(t: Pick<Txn, "kind" | "status">): string {
  return t.kind === "outgoing" ? "Completed · simulated" : "Pending request";
}

/** Parse a user-entered dollar string into minor units; null if invalid. */
export function parseAmount(input: string): number | null {
  const t = input.trim();
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(t)) return null;
  const [w = "0", f = ""] = t.split(".");
  const minor = Number(w) * 100 + Number(f.padEnd(2, "0"));
  return minor > 0 ? minor : null;
}

export type PointerCheck =
  | { ok: true; pointer: string; name: string }
  | { ok: false; reason: "invalid" | "unsupported-external" | "self" };

/** Only exact matches from the sample directory are payable. Parsed by
 * structure (not substring), and nothing is ever converted to an http URL. */
export function resolvePointer(raw: string, selfId: string): PointerCheck {
  const p = raw.trim().toLowerCase();
  const m = /^\$([a-z0-9.-]+)\/users\/([a-z0-9-]{1,40})$/.exec(p);
  if (!m) return { ok: false, reason: "invalid" };
  if (`$${m[1]}` !== DEMO_HOST) return { ok: false, reason: "unsupported-external" };
  if (m[2] === selfId) return { ok: false, reason: "self" };
  const r = SAMPLE_RECIPIENTS.find((x) => x.id === m[2]);
  return r ? { ok: true, pointer: r.pointer, name: r.name } : { ok: false, reason: "invalid" };
}

export function createQuote(state: DemoState, receiver: string, amount: number, now: number) {
  if (!Number.isInteger(amount) || amount <= 0) return { error: "Enter an amount above $0." };
  if (amount > state.balance) return { error: "Amount exceeds your demo balance." };
  const quote: Quote = {
    id: randomId("Q-"),
    receiver,
    debitAmount: amount,
    receiveAmount: amount,
    fee: 0,
    asset: ASSET,
    createdAt: now,
    expiresAt: now + QUOTE_TTL_MS,
  };
  return { quote };
}

export const isExpired = (q: Quote, now: number) => now >= q.expiresAt;

/** Single atomic transition: debit + append ledger entry, or fail with no change. */
export function confirmQuote(
  state: DemoState,
  q: Quote,
  name: string,
  now: number,
): { state: DemoState; txn: Txn } | { error: string } {
  if (state.usedQuotes.includes(q.id)) return { error: "This quote was already used." };
  if (!Number.isInteger(q.debitAmount) || q.debitAmount <= 0 || q.receiveAmount !== q.debitAmount)
    return { error: "Invalid quote amount." };
  const rid = SAMPLE_RECIPIENTS.find((r) => r.pointer === q.receiver)?.id;
  if (!rid) return { error: "Recipient is not in the sample directory." };
  if (isExpired(q, now)) return { error: "Quote expired. Refresh it to continue." };
  if (q.debitAmount > state.balance) return { error: "Insufficient demo balance." };
  const txn: Txn = {
    id: randomId("SYL-"),
    kind: "outgoing",
    counterparty: name,
    pointer: q.receiver,
    amount: q.debitAmount,
    status: "completed",
    createdAt: now,
  };
  return {
    state: {
      ...state,
      balance: state.balance - q.debitAmount,
      recipientBalances: {
        ...state.recipientBalances,
        [rid]: (state.recipientBalances[rid] ?? SAMPLE_START_BALANCE) + q.receiveAmount,
      },
      usedQuotes: [q.id, ...state.usedQuotes].slice(0, 200),
      history: [txn, ...state.history],
    },
    txn,
  };
}

export function createRequest(state: DemoState, amount: number, note: string, now: number) {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error("Invalid amount");
  const txn: Txn = {
    id: randomId("REQ-"),
    kind: "incoming-request",
    counterparty: "Anyone with the link",
    pointer: pointerFor(state.demoId),
    amount,
    status: "pending",
    createdAt: now,
    note: note.slice(0, 80),
  };
  const text = `Payment request ${txn.id}: ${formatUSD(amount)} USD to ${txn.pointer}${
    txn.note ? ` — "${txn.note}"` : ""
  } (simulated $yllabus demo, not a real payment)`;
  return { state: { ...state, history: [txn, ...state.history] }, txn, text };
}

/** A receipt is trusted only if it is a completed outgoing entry in this identity's own stored ledger.
 * URL-supplied amounts, recipients or times are never trusted. */
export function findReceipt(state: DemoState | null, id: unknown): Txn | null {
  if (!state || typeof id !== "string" || !/^SYL-[0-9A-F]{16}$/.test(id)) return null;
  return state.history.find((t) => t.id === id && t.kind === "outgoing" && t.status === "completed") ?? null;
}

export function parseState(raw: string | null): DemoState | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (s?.version === 1 && typeof s.demoId === "string" && Number.isInteger(s.balance) && Array.isArray(s.history))
      return { ...initialState(s.demoId), ...s } as DemoState;
  } catch {
    /* ignore */
  }
  return null;
}