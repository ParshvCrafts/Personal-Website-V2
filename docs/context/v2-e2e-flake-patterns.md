---
name: v2-e2e-flake-patterns
description: "v2 Playwright e2e — dev-server contention flake + browser-specific test patterns (hydration, WebKit button focus)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 028ecdee-2a47-4cc9-9dd4-02731b5f19a7
---

v2 e2e (`v2/playwright.config.ts`) runs `npm run dev` as the webServer (on-demand compile) with `workers: 4` locally. Under load this causes `page.goto: timeout 30000ms` flakes, mostly firefox/webkit. **Test logic is deterministic — every test passes in isolation.** When the full suite shows a few failures, re-run them with `--workers=1` (or a single `--project`) before treating them as real. A pre-existing untouched spec failing (e.g. `hero.spec`) is the tell that it's infra, not your change.

Run e2e via **`npm run test:e2e`**, NOT `npx playwright test` directly — the RTK shell proxy mangles the bare `npx playwright` invocation (exit 127, "playwright parser: All parsing tiers failed", empty output). Also: `line`/`list` reporter output buffers to a redirected file until process exit, so a background run's log looks empty mid-run — wait for the completion notification.

Browser-specific test rules learned writing the P9/P10 specs:
- **WebKit does not focus a `<button>` on mouse click.** A test that clicks a button to open a modal then asserts focus-restore on close will fail on WebKit (modal captured `<body>` as opener). Open via keyboard (`btn.focus()` + `btn.press("Enter")`) — also the truer a11y path.
- **Client islands (e.g. ContactForm) reset controlled-input values if `.fill()` lands before hydration.** Wrap fill+submit+assert in `expect(async () => {...}).toPass()` so a pre-hydration fill retries post-hydration (WebKit hydrates slowest).
- Error text shown in both a per-field `<p>` and an sr-only `aria-live` summary `<div>` makes `getByText` match twice (strict-mode fail). Target the `<p>` (`section.locator("p", { hasText })`).
- Short card titles ("Music", "Anime") collide with description substrings — use `getByText(title, { exact: true })`.
- A second `role="tablist"`/`tabpanel` on the page (Projects filter) breaks unscoped `getByRole("tabpanel")` in other specs — scope to the section.

Related: [[portfolio-v2-project]], [[working-style]].
