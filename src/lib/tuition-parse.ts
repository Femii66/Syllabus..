// Pure helpers for finding candidate tuition balances and statement dates in statement text.
// They only suggest candidates; the student must always pick or type the final values.
export type AmountCandidate = { cents: number; context: string };
export type DateCandidate = { iso: string; context: string };

const AMOUNT_LABEL =
  /(balance\s+due|amount\s+due|total\s+due|current\s+balance|account\s+balance|total\s+balance|balance)/i;
const MONEY = /\$?\s?(\d{1,3}(?:,\d{3})+|\d+)(\.\d{2})\b/g;
const DATE_LABEL = /(statement\s+date|as\s+of|bill\s+date|date)/i;
const MONTHS = "jan feb mar apr may jun jul aug sep oct nov dec".split(" ");

function iso(y: number, m: number, d: number): string | null {
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (y < 2000 || y > 2100 || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt.toISOString().slice(0, 10);
}

export function parseDates(line: string): string[] {
  const out: string[] = [];
  for (const m of line.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) {
    const v = iso(+m[1]!, +m[2]!, +m[3]!);
    if (v) out.push(v);
  }
  for (const m of line.matchAll(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g)) {
    const v = iso(+m[3]!, +m[1]!, +m[2]!);
    if (v) out.push(v);
  }
  for (const m of line.matchAll(/\b([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})\b/g)) {
    const mi = MONTHS.indexOf(m[1]!.slice(0, 3).toLowerCase());
    if (mi >= 0) {
      const v = iso(+m[3]!, mi + 1, +m[2]!);
      if (v) out.push(v);
    }
  }
  return out;
}

export function extractCandidates(text: string) {
  const amounts: AmountCandidate[] = [];
  const dates: DateCandidate[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  for (const line of lines) {
    const context = line.slice(0, 120);
    if (AMOUNT_LABEL.test(line)) {
      for (const m of line.matchAll(MONEY)) {
        const cents = Math.round(parseFloat(m[1]!.replace(/,/g, "") + m[2]) * 100);
        if (cents >= 0 && !amounts.some((a) => a.cents === cents)) amounts.push({ cents, context });
      }
    }
    if (DATE_LABEL.test(line)) {
      for (const d of parseDates(line))
        if (!dates.some((x) => x.iso === d)) dates.push({ iso: d, context });
    }
  }
  return { amounts: amounts.slice(0, 8), dates: dates.slice(0, 8) };
}

// Minimal RFC 4180-style CSV parser (quotes, escaped quotes, commas, newlines). No eval, no formulas.
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quoted) {
      if (c === '"' && input[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && input[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((x) => x.trim()));
}

export function csvToText(rows: string[][]): string {
  if (rows.length < 2) return rows.map((r) => r.join(" ")).join("\n");
  const [head, ...body] = rows;
  // Prefix each value with its header so "Balance Due" columns are detected.
  return body.map((r) => r.map((v, i) => `${head?.[i] ?? ""} ${v}`).join(" | ")).join("\n") +
    "\n" + rows.map((r) => r.join(" ")).join("\n");
}

export function parseMoneyInput(v: string): number | null {
  const s = v.replace(/[$,\s]/g, "");
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(s)) return null;
  return Math.round(parseFloat(s) * 100);
}