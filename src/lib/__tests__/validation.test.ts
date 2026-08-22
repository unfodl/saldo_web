import { describe, expect, it } from "vitest";
import { validateAmount, validateMxnAmount, validatePin, validateReference } from "@/lib/validation";

describe("validateReference", () => {
  it("rejects empty references", () => {
    expect(validateReference("   ").ok).toBe(false);
  });

  it("rejects references over the Stellar memo limit (28 chars)", () => {
    expect(validateReference("a".repeat(29)).ok).toBe(false);
  });

  it("accepts a reference at the limit", () => {
    expect(validateReference("a".repeat(28)).ok).toBe(true);
  });
});

describe("validateAmount", () => {
  it("rejects non-numeric input", () => {
    expect(validateAmount("abc", 100).ok).toBe(false);
  });

  it("rejects zero and negative amounts", () => {
    expect(validateAmount("0", 100).ok).toBe(false);
    expect(validateAmount("-5", 100).ok).toBe(false);
  });

  it("rejects amounts over the available balance", () => {
    expect(validateAmount("150", 100).ok).toBe(false);
  });

  it("rejects more than 6 decimal places", () => {
    expect(validateAmount("1.1234567", 100).ok).toBe(false);
  });

  it("accepts a valid amount within balance", () => {
    expect(validateAmount("42.50", 100).ok).toBe(true);
  });
});

describe("validateMxnAmount", () => {
  it("rejects non-numeric input", () => {
    expect(validateMxnAmount("abc").ok).toBe(false);
  });

  it("rejects zero and negative amounts", () => {
    expect(validateMxnAmount("0").ok).toBe(false);
    expect(validateMxnAmount("-5").ok).toBe(false);
  });

  it("rejects more than 2 decimal places", () => {
    expect(validateMxnAmount("500.505").ok).toBe(false);
  });

  it("accepts a valid peso amount with no balance check", () => {
    expect(validateMxnAmount("500.50").ok).toBe(true);
  });
});

describe("validatePin", () => {
  it("rejects non-4-digit pins", () => {
    expect(validatePin("123").ok).toBe(false);
    expect(validatePin("12345").ok).toBe(false);
    expect(validatePin("12ab").ok).toBe(false);
  });

  it("accepts a 4-digit pin", () => {
    expect(validatePin("1234").ok).toBe(true);
  });
});
