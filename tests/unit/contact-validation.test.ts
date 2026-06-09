import { describe, it, expect } from "vitest";
import { validateContact, hasErrors } from "@/lib/contact-validation";

const valid = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Hello there",
  message: "This is a message that is long enough.",
};

describe("validateContact", () => {
  it("returns no errors for valid input", () => {
    expect(hasErrors(validateContact(valid))).toBe(false);
  });

  it("errors on empty name", () => {
    const e = validateContact({ ...valid, name: "" });
    expect(e.name).toBeTruthy();
  });

  it("errors on single-char name", () => {
    const e = validateContact({ ...valid, name: "J" });
    expect(e.name).toBeTruthy();
  });

  it("errors on missing email", () => {
    const e = validateContact({ ...valid, email: "" });
    expect(e.email).toBeTruthy();
  });

  it("errors on malformed email", () => {
    const e = validateContact({ ...valid, email: "notanemail" });
    expect(e.email).toBeTruthy();
  });

  it("accepts valid email", () => {
    const e = validateContact({ ...valid, email: "user@domain.co.uk" });
    expect(e.email).toBeUndefined();
  });

  it("errors on short subject", () => {
    const e = validateContact({ ...valid, subject: "x" });
    expect(e.subject).toBeTruthy();
  });

  it("errors on short message", () => {
    const e = validateContact({ ...valid, message: "hi" });
    expect(e.message).toBeTruthy();
  });

  it("trims whitespace before validation", () => {
    const e = validateContact({ ...valid, name: "   " });
    expect(e.name).toBeTruthy();
  });
});

describe("hasErrors", () => {
  it("returns false for empty errors", () => {
    expect(hasErrors({})).toBe(false);
  });

  it("returns true when any error present", () => {
    expect(hasErrors({ name: "required" })).toBe(true);
  });
});
