# P21 Wave A — e2e Infrastructure Runnable + Green (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Playwright e2e suite boot and run cross-browser by serving the static `out/` export instead of `next dev` (which Turbopack-panics on the spaces-in-path), without changing any product behavior.

**Architecture:** Add a tiny dependency-free Node static server (`scripts/serve-static.ts`, run via `tsx`) that resolves `out/` files honoring `trailingSlash:true` (`/preview` → `out/preview/index.html`) and serves `out/404.html` (status 404) for unknown paths. Point Playwright's `webServer` at it (`npm run serve:out`) and make `test:e2e` build first. WebGL canvas assertions are already gated on a real `getContext('webgl2')` probe in the specs that need it.

**Tech Stack:** Node `http`, `tsx`, Playwright, Vitest (for the pure resolver).

---

### Task 1: Static-server module (pure resolver TDD'd)

**Files:**
- Create: `scripts/serve-static.ts`
- Test: `tests/unit/serve-static.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/serve-static.test.ts --reporter=dot`
Expected: FAIL — cannot resolve `../../scripts/serve-static` / `resolveCandidates` is not a function.

- [ ] **Step 3: Write the implementation**

```ts
// scripts/serve-static.ts
// Minimal, dependency-free static file server for the Next static-export `out/`
// directory. Replaces `next dev` as the Playwright webServer: Turbopack panics
// reading globals.css under this repo's spaces-in-path. Honors trailingSlash:true
// (folder index.html) and serves out/404.html (status 404) for unknown paths.
import { createServer, type Server } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

/** Ordered candidate relative file paths to try for a request pathname. Pure. */
export function resolveCandidates(pathname: string): string[] {
  let p = pathname.split("?")[0].split("#")[0];
  try {
    p = decodeURIComponent(p);
  } catch {
    // malformed percent-encoding: fall through with the raw value
  }
  if (!p.startsWith("/")) p = "/" + p;
  if (p === "/") return ["/index.html"];
  if (p.endsWith("/")) return [p + "index.html", p.slice(0, -1) + ".html"];
  const last = p.split("/").pop() ?? "";
  if (/\.[a-zA-Z0-9]+$/.test(last)) return [p];
  return [p + ".html", p + "/index.html"];
}

/** Build (but do not start) a static server rooted at `outDir`. */
export function createStaticServer(outDir: string): Server {
  const root = resolve(outDir);

  async function readableFile(relPath: string): Promise<string | null> {
    const abs = resolve(root, "." + relPath);
    // Path-traversal guard: must stay inside root.
    if (abs !== root && !abs.startsWith(root + sep)) return null;
    try {
      const s = await stat(abs);
      return s.isFile() ? abs : null;
    } catch {
      return null;
    }
  }

  return createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
      for (const candidate of resolveCandidates(pathname)) {
        const abs = await readableFile(candidate);
        if (abs) {
          const body = await readFile(abs);
          res.writeHead(200, {
            "content-type": CONTENT_TYPES[extname(abs).toLowerCase()] ?? "application/octet-stream",
            "cache-control": "no-cache",
          });
          res.end(body);
          return;
        }
      }
      const notFound = await readableFile("/404.html");
      const body = notFound ? await readFile(notFound) : Buffer.from("Not found");
      res.writeHead(404, {
        "content-type": notFound ? "text/html; charset=utf-8" : "text/plain; charset=utf-8",
      });
      res.end(body);
    } catch {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end("Internal server error");
    }
  });
}

// Only bind a port when run directly (`tsx scripts/serve-static.ts`), never on import.
const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const port = Number(process.env.PORT ?? 4321);
  const outDir = resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "out");
  createStaticServer(outDir).listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[serve-static] ${outDir} -> http://localhost:${port}`);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/serve-static.test.ts --reporter=dot`
Expected: PASS (5 tests).

- [ ] **Step 5: Whole-project typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: `No errors found`.

- [ ] **Step 6: Commit**

```bash
git add scripts/serve-static.ts tests/unit/serve-static.test.ts
git commit -m "test(v2): static-export server for e2e (TDD resolver)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Wire scripts + Playwright webServer to the static server

**Files:**
- Modify: `package.json` (scripts block)
- Modify: `playwright.config.ts`

- [ ] **Step 1: Add npm scripts**

In `package.json` `scripts`, add `serve:out` and change `test:e2e` to build first; add a no-build variant for fast iteration. Result block:

```json
    "test": "vitest run",
    "test:watch": "vitest",
    "serve:out": "tsx scripts/serve-static.ts",
    "test:e2e": "npm run build && playwright test",
    "test:e2e:nobuild": "playwright test",
```

(Keep every other script unchanged. `test:e2e` was previously `"playwright test"`.)

- [ ] **Step 2: Point Playwright at the static server**

Replace `playwright.config.ts` entirely with:

```ts
import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  // The static server (serving the prebuilt out/) has no per-route compile cost,
  // so it tolerates parallel browsers far better than `next dev` did. Retries
  // recover any residual infra flake; test logic is deterministic in isolation.
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 2 : 1,
  reporter: "list",
  use: { baseURL, trace: "on-first-retry" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    // Serve the static export; `npm run test:e2e` builds out/ first. Dev server is
    // unusable here (Turbopack panics on globals.css under the spaces-in-path).
    command: "npm run serve:out",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 3: Typecheck + lint the touched files**

Run: `npx tsc --noEmit -p tsconfig.json` → `No errors found`
Run: `npx eslint playwright.config.ts scripts/serve-static.ts` → no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json playwright.config.ts
git commit -m "test(v2): e2e webServer serves static out/ build, not next dev

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Boot + triage the full suite cross-browser (orchestrator)

> Orchestrator-run (needs iterative browser execution), not a subagent task. Build once, run the suite, triage real failures vs infra flake (re-run failures with `--workers=1`), fix or document-quarantine, never weaken an assertion to force green.

- [ ] **Step 1: Build + boot smoke**

Run: `npm run build` (expect exit 0), then in one terminal `npm run serve:out` (background) and confirm `http://localhost:4321/` and `http://localhost:4321/preview/` return 200 and `/nope` returns 404. Kill the background server after.

- [ ] **Step 2: Full suite**

Run: `npm run test:e2e 2>&1 | tee e2e-run.txt` (the build runs first, then all 16 specs × chromium/firefox/webkit). Read `e2e-run.txt` (the `list` reporter buffers to the file until exit — wait for completion).

- [ ] **Step 3: Triage**

For each failure: re-run that spec/project with `npm run test:e2e:nobuild -- <spec> --project=<browser> --workers=1` (server already built/running) to separate deterministic failures from contention flake (a pre-existing untouched spec failing = infra tell, per `v2-e2e-flake-patterns`). Root-cause deterministic failures (systematic-debugging); fix the spec only if the assertion is wrong for the static-export/headless-WebGL reality (e.g. an ungated canvas assertion on WebKit) — gate on the existing `getContext('webgl2')` probe pattern. Genuinely environment-bound cases get `test.skip` with a one-line reason comment.

- [ ] **Step 4: Document the result**

Record in the Wave A report: per-browser pass/fail counts, any quarantines + reasons, and confirmation that no product code changed. Delete `e2e-run.txt` (do not commit it).

- [ ] **Step 5: Commit any spec fixes**

```bash
git add tests/e2e/<changed specs>
git commit -m "test(v2): gate <x> e2e assertions for static-export/headless reality

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

- **Spec coverage (Wave A exit criteria):** webServer no longer uses `next dev` (Task 2) ✓; serves static `out/` honoring trailingSlash + 404 (Task 1) ✓; WebGL gating via real probe — already present in specs, audited in Task 3 ✓; suite boots + runs ×3 browsers, fixes/quarantines documented (Task 3) ✓; no product behavior changed — only `scripts/`, `tests/`, `package.json`, `playwright.config.ts` touched ✓.
- **Placeholder scan:** none — full server + test code inline.
- **Type consistency:** `resolveCandidates` / `createStaticServer` names match between module, test import, and server body. Return-shape (ordered `string[]`) consistent with the unit-test expectations.
- **Risk:** vitest importing `serve-static.ts` must not bind a port — guarded by the `isMain` check (module only listens when run directly). `e2e-run.txt` is a transient artifact — not committed.
