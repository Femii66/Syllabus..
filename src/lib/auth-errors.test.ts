import { describe, expect, it } from "vitest";
import { isValidEmail, browserAuthConfigError, authErrorMessage } from "./auth-errors";
describe("student authentication safety", () => {
  it("accepts any valid email and rejects malformed ones", () => {
    expect(isValidEmail("student@college.edu")).toBe(true);
    expect(isValidEmail("someone@gmail.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
  });
  it("requires browser URL and publishable key", () => {
    expect(browserAuthConfigError(undefined, undefined)).not.toBeNull();
    expect(browserAuthConfigError("https://example.com", "sb_publishable_public")).toBeNull();
  });
  it("rejects a secret key in browser configuration", () => {
    expect(browserAuthConfigError("https://example.com", "sb_secret_private")).not.toBeNull();
  });
  it("preserves email verification requirement", () => {
    expect(authErrorMessage({ code: "email_not_confirmed" })).toContain("verify your email");
  });
  it("turns connection failures into actionable deployment errors", () => {
    expect(authErrorMessage(new TypeError("Failed to fetch"))).toContain("VITE_SUPABASE_URL");
  });
  it("rejects the incorrect deployed .com API hostname", () => {
    expect(
      browserAuthConfigError("https://existing.supabase.com", "sb_publishable_public"),
    ).toContain(".co, not .com");
    expect(
      browserAuthConfigError("https://existing.supabase.co", "sb_publishable_public"),
    ).toBeNull();
  });
});