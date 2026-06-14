---
name: v2-e2e-flake-patterns
description: "v2 Playwright e2e — dev-server contention flake + browser-specific test patterns (hydration, WebKit button focus)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 028ecdee-2a47-4cc9-9dd4-02731b5f19a7
---

**P21 update (2026-06-14):** the e2e webServer no longer uses `npm run dev`. It now serves the static `out/` export via `scripts/serve-static.ts` (`npm run serve:out`, port 4321); `npm run test:e2e` builds then runs, `npm run test:e2e:nobuild` skips the build (reuses a running server). The dev-server Turbopack/globals.css panic is fully sidestepped. Config is at repo-root `playwright.config.ts` (no `v2/` subfolder). WebGL "a canvas mounts" assertions are gated on a real `getContext('webgl2')` probe (headless WebKit has none → rig tier "off"; those specs still pass).

**Contention is still the only flake source, and WebKit is the victim.** With `workers: 4` and all 3 projects parallel, the heavy home page (axe scans 4 themes × 3 pages, 3D canvas, smooth-scroll RAF) makes WebKit time out on `browserContext.newPage` / `frame.evaluate` (60s), and a WebKit worker can hang on teardown → Playwright force-kills after 300s (looks like a 10-min "hang"; inflates wall time). Mitigation shipped: **`workers: 2`** in the config. Every spec is deterministic per-project in isolation — re-run a suspected failure with `--project=webkit --workers=1` before treating it as real; a pre-existing untouched spec (e.g. `accessibility.spec`) failing on WebKit is the infra tell, not your change.

(Historical, dev-server era:) ran `npm run dev` as the webServer with `workers: 4`; under load `page.goto: timeout 30000ms` flakes, mostly firefox/webkit. Same isolation rule applied.

Run e2e via **`npm run test:e2e`**, NOT `npx playwright test` directly — the RTK shell proxy mangles the bare `npx playwright` invocation (exit 127, "playwright parser: All parsing tiers failed", empty output). Also: `line`/`list` reporter output buffers to a redirected file until process exit, so a background run's log looks empty mid-run — wait for the completion notification.

Browser-specific test rules learned writing the P9/P10 specs:
- **WebKit does not focus a `<button>` on mouse click.** A test that clicks a button to open a modal then asserts focus-restore on close will fail on WebKit (modal captured `<body>` as opener). Open via keyboard (`btn.focus()` + `btn.press("Enter")`) — also the truer a11y path.
- **Client islands (e.g. ContactForm) reset controlled-input values if `.fill()` lands before hydration.** Wrap fill+submit+assert in `expect(async () => {...}).toPass()` so a pre-hydration fill retries post-hydration (WebKit hydrates slowest).
- Error text shown in both a per-field `<p>` and an sr-only `aria-live` summary `<div>` makes `getByText` match twice (strict-mode fail). Target the `<p>` (`section.locator("p", { hasText })`).
- Short card titles ("Music", "Anime") collide with description substrings — use `getByText(title, { exact: true })`.
- A second `role="tablist"`/`tabpanel` on the page (Projects filter) breaks unscoped `getByRole("tabpanel")` in other specs — scope to the section.

Related: [[portfolio-v2-project]], [[working-style]].
