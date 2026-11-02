import { describe, expect, it } from "vitest";
import { csvToText, extractCandidates, parseCsv, parseMoneyInput } from "./tuition-parse";

describe("tuition parsing", () => {
  it("finds a labeled balance and statement date", () => {
    const r = extractCandidates("Statement Date: 10/15/2026\nBalance Due $4,812.50\nPage 1");
    expect(r.amounts.map((a) => a.cents)).toEqual([481250]);
    expect(r.dates.map((d) => d.iso)).toEqual(["2026-10-15"]);
  });
  it("ignores unlabeled amounts", () => {
    expect(extractCandidates("Room fee 900.00").amounts).toEqual([]);
  });
  it("rejects impossible dates", () => {
    expect(extractCandidates("Statement date 02/31/2026").dates).toEqual([]);
  });
  it("parses quoted CSV and maps headers", () => {
    const rows = parseCsv('Statement Date,Balance Due\n2026-09-01,"1,200.00"\n');
    expect(rows[1]).toEqual(["2026-09-01", "1,200.00"]);
    const r = extractCandidates(csvToText(rows));
    expect(r.amounts[0]?.cents).toBe(120000);
    expect(r.dates[0]?.iso).toBe("2026-09-01");
  });
  it("validates manual money input", () => {
    expect(parseMoneyInput("$1,234.5")).toBe(123450);
    expect(parseMoneyInput("abc")).toBeNull();
    expect(parseMoneyInput("-5")).toBeNull();
  });
});