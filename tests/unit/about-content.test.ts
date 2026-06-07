import { describe, it, expect } from "vitest";
import {
  ABOUT_BIO,
  ABOUT_FACTS,
  ACHIEVEMENT_BADGES,
  AWARDS,
  CODE_SAMPLES,
  ABOUT_DOCUMENTS,
} from "@/content/about";

const uniqueIds = (xs: { id: string }[]) => new Set(xs.map((x) => x.id)).size;

describe("about content", () => {
  it("has at least two non-empty bio paragraphs", () => {
    expect(ABOUT_BIO.length).toBeGreaterThanOrEqual(2);
    for (const p of ABOUT_BIO) expect(p.trim().length).toBeGreaterThan(0);
  });

  it("has four key facts, all labelled", () => {
    expect(ABOUT_FACTS).toHaveLength(4);
    for (const f of ABOUT_FACTS) {
      expect(f.label.trim().length).toBeGreaterThan(0);
      expect(f.value.trim().length).toBeGreaterThan(0);
    }
  });

  it("has 16 achievement badges with id, label, and an icon", () => {
    expect(ACHIEVEMENT_BADGES).toHaveLength(16);
    for (const b of ACHIEVEMENT_BADGES) {
      expect(b.id.trim().length).toBeGreaterThan(0);
      expect(b.label.trim().length).toBeGreaterThan(0);
      expect(b.icon).toBeTruthy(); // lucide forwardRef component (object), not a function
    }
    expect(uniqueIds(ACHIEVEMENT_BADGES)).toBe(ACHIEVEMENT_BADGES.length);
  });

  it("has 15 awards, each with a title, a substantive description, and a mark", () => {
    expect(AWARDS).toHaveLength(15);
    for (const a of AWARDS) {
      expect(a.title.trim().length).toBeGreaterThan(0);
      expect(a.description.trim().length).toBeGreaterThan(20);
      expect(Boolean(a.logo) || Boolean(a.icon)).toBe(true);
    }
    expect(uniqueIds(AWARDS)).toBe(AWARDS.length);
  });

  it("has three code samples in python/js/sql order with code", () => {
    expect(CODE_SAMPLES).toHaveLength(3);
    expect(CODE_SAMPLES.map((s) => s.lang)).toEqual(["python", "javascript", "sql"]);
    for (const s of CODE_SAMPLES) {
      expect(s.filename.trim().length).toBeGreaterThan(0);
      expect(s.code.trim().length).toBeGreaterThan(0);
    }
  });

  it("has three documents with non-empty hrefs", () => {
    expect(ABOUT_DOCUMENTS).toHaveLength(3);
    for (const d of ABOUT_DOCUMENTS) {
      expect(d.id.trim().length).toBeGreaterThan(0);
      expect(d.href.trim().length).toBeGreaterThan(0);
    }
  });
});
