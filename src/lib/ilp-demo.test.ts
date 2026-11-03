import { describe, expect, it } from "vitest";
import {
  confirmQuote,
  createQuote,
  createRequest,
  initialState,
  parseAmount,
  QUOTE_TTL_MS,
  resolvePointer,
  SAMPLE_RECIPIENTS,
} from "./ilp-demo";

const jordan = SAMPLE_RECIPIENTS[0]!;

describe("ilp demo ledger", () => {
  it("starts with $500.00 in USD scale 2", () => {
    expect(initialState("me").balance).toBe(50000);
  });
  it("parses amounts to minor units", () => {
    expect(parseAmount("12.5")).toBe(1250);
    expect(parseAmount("0")).toBeNull();
    expect(parseAmount("1.234")).toBeNull();
  });
  it("rejects external pointers as unsupported", () => {
    expect(resolvePointer("$ilp.rafiki.money/users/bob", "me")).toEqual({ ok: false, reason: "unsupported-external" });
    expect(resolvePointer("https://evil/users/x", "me").ok).toBe(false);
  });
  it("rejects host substring tricks", () => {
    expect(resolvePointer("$demo.syllabus.local.evil.com/users/jordan-okafor", "me").ok).toBe(false);
  });
  it("blocks amounts over balance", () => {
    expect(createQuote(initialState("me"), jordan.pointer, 50001, 0)).toHaveProperty("error");
  });
  it("quote has zero fee and expires after 60s", () => {
    const s = initialState("me");
    const { quote } = createQuote(s, jordan.pointer, 1000, 0);
    expect(quote!.fee).toBe(0);
    expect(confirmQuote(s, quote!, jordan.name, QUOTE_TTL_MS)).toHaveProperty("error");
  });
  it("confirm debits and appends once with unique receipts", () => {
    const s = initialState("me");
    const a = confirmQuote(s, createQuote(s, jordan.pointer, 1000, 0).quote!, jordan.name, 1);
    const b = confirmQuote(s, createQuote(s, jordan.pointer, 1000, 0).quote!, jordan.name, 1);
    if ("error" in a || "error" in b) throw new Error("unexpected");
    expect(a.state.balance).toBe(49000);
    expect(a.state.history).toHaveLength(1);
    expect(a.txn.id).not.toBe(b.txn.id);
  });
  it("requests do not change balance", () => {
    const r = createRequest(initialState("me"), 500, "lunch", 0);
    expect(r.state.balance).toBe(50000);
    expect(r.text).toContain("$demo.syllabus.local/users/me");
  });

  it("credits the fictional recipient and rejects reusing a quote", () => {
    const s = initialState("me");
    const q = createQuote(s, jordan.pointer, 2500, 0).quote!;
    const a = confirmQuote(s, q, jordan.name, 1);
    if ("error" in a) throw new Error(a.error);
    expect(a.state.recipientBalances[jordan.id]).toBe(12500);
    expect(confirmQuote(a.state, q, jordan.name, 2)).toEqual({ error: "This quote was already used." });
  });
  it("rejects tampered quote amounts", () => {
    const s = initialState("me");
    const q = createQuote(s, jordan.pointer, 100, 0).quote!;
    expect(confirmQuote(s, { ...q, debitAmount: -5 }, jordan.name, 1)).toHaveProperty("error");
  });
  it("reset state restores $500 and clears history and recipient credits", () => {
    const s = initialState("me");
    expect(s.history).toEqual([]);
    expect(Object.values(s.recipientBalances).every((b) => b === 10000)).toBe(true);
  });
});

describe("receipt trust and persistence", () => {
  it("only trusts completed outgoing receipts in the stored ledger", async () => {
    const { findReceipt } = await import("./ilp-demo");
    const s = initialState("me");
    const r = confirmQuote(s, createQuote(s, jordan.pointer, 2500, 0).quote!, jordan.name, 1);
    if ("error" in r) throw new Error(r.error);
    expect(findReceipt(r.state, r.txn.id)?.amount).toBe(2500);
    expect(findReceipt(s, r.txn.id)).toBeNull(); // after reset / other identity
    expect(findReceipt(r.state, undefined)).toBeNull(); // legacy ?amount=1000 URL
    expect(findReceipt(r.state, "SYL-0000000000000000")).toBeNull();
    const req = createRequest(r.state, 500, "", 2);
    expect(findReceipt(req.state, req.txn.id)).toBeNull();
  });
  it("persists balance, credit and history through serialize/parse", async () => {
    const { parseState } = await import("./ilp-demo");
    const s = initialState("me");
    const r = confirmQuote(s, createQuote(s, jordan.pointer, 2500, 0).quote!, jordan.name, 1);
    if ("error" in r) throw new Error(r.error);
    const back = parseState(JSON.stringify(r.state))!;
    expect(back.balance).toBe(47500);
    expect(back.recipientBalances[jordan.id]).toBe(12500);
    expect(back.history[0]!.id).toBe(r.txn.id);
    expect(parseState("not json")).toBeNull();
  });
});