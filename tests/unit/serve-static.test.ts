// tests/unit/serve-static.test.ts
import { describe, it, expect } from "vitest";
import { resolveCandidates } from "../../scripts/serve-static";

describe("resolveCandidates (static-export path resolution)", () => {
  it("maps root to index.html", () => {
    expect(resolveCandidates("/")).toEqual(["/index.html"]);
  });

  it("maps a trailing-slash route to its index.html (then a .html sibling)", () => {
    expect(resolveCandidates("/preview/")).toEqual(["/preview/index.html", "/preview.html"]);
  });

  it("maps an extensionless route to .html then folder index.html", () => {
    expect(resolveCandidates("/preview")).toEqual(["/preview.html", "/preview/index.html"]);
    expect(resolveCandidates("/preview/motion")).toEqual([
      "/preview/motion.html",
      "/preview/motion/index.html",
    ]);
  });

  it("passes through asset paths that already have an extension", () => {
    expect(resolveCandidates("/robots.txt")).toEqual(["/robots.txt"]);
    expect(resolveCandidates("/_next/static/chunk.js")).toEqual(["/_next/static/chunk.js"]);
  });

  it("strips a query string and hash before resolving", () => {
    expect(resolveCandidates("/?show=cinematic")).toEqual(["/index.html"]);
    expect(resolveCandidates("/preview#top")).toEqual(["/preview.html", "/preview/index.html"]);
  });
});
