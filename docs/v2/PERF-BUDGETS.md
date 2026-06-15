# Performance Budgets & Measurements (P21 Wave C)

Measured 2026-06-14 against the static `out/` build served locally (`npm run serve:out`).
Local numbers are optimistic (no network latency); the structural metrics (bundle
composition, CLS) are real. Vercel runs Lighthouse/Speed Insights automatically on
deploy — use that for production-grade scores.

## JavaScript bundle

| Metric | Budget | Measured | Status |
|---|---|---|---|
| three / R3F / drei / postprocessing on the initial `/` bundle | **must be code-split off** | not present (the 875 KB three chunk loads only when `SceneSlot` mounts) | ✅ |
| Initial JS on `/` (uncompressed, sum of `<script>` + modulepreload) | ≤ ~1.0 MB | ~982 KB (≈ ~280 KB brotli) | ✅ |
| Total `_next` JS (all routes/chunks) | informational | ~2.14 MB across 29 files | — |

**Invariant (do not regress):** `three`, `@react-three/*`, and `postprocessing` must
never appear in the initial `/` bundle. They are loaded via `SceneSlot`'s dynamic
`import()` + `IntersectionObserver` (see `docs/v2/FOUNDATION-3D.md`). The largest single
chunk (~875 KB) is three and must stay deferred.

## Core Web Vitals (local served build)

| Metric | Target | Measured (local) |
|---|---|---|
| LCP | < 2.5 s | 464 ms |
| CLS | < 0.1 | **0.0099** |
| FCP | < 1.8 s | 464 ms |
| DOMContentLoaded | — | 185 ms |
| load | — | 403 ms |

CLS ≈ 0.01 confirms the plain CLS-safe `<img>` approach (explicit dimensions, no
`next/image` layout shift) is working. 0 console errors on load.

## 3D / Inkfield cost per tier

Tier resolved by `resolveGpuTier` (`lib/webgl/capabilities.ts`) from injected device
signals; particle counts in `lib/hero/inkfield.ts`:

| Tier | When | Inkfield particles |
|---|---|---|
| `high` | WebGL2 + adequate memory/cores, fine pointer | 12 000 |
| `low` | WebGL2 but low memory/cores or coarse pointer | 5 000 |
| `off` | no WebGL2, **reduced motion**, or **Save-Data** | 0 — DOM fallback, no canvas |

`SceneSlot` is the single gateway: below `minTier` / reduced-motion / no-WebGL2 /
Save-Data it renders a non-3D fallback and never mounts a Canvas. Reduced motion
(OS pref **or** the on-page toggle, post-P21-Wave-B) forces tier `off`.

## Categories Lighthouse would cover (audited equivalently)

- **Performance** — bundle budget + CWV above.
- **Accessibility** — `@axe-core/playwright` clean across 4 themes on the home page,
  preview, motion preview, mobile menu, and (P21 Wave B) the open command palette + tour.
- **Best Practices** — security headers + CSP in `vercel.json` (P21 Wave C added
  `https://api.github.com` to `connect-src` for the status widget); 0 console errors.
- **SEO** — full metadata in `app/layout.tsx` (title template, description, canonical,
  OpenGraph + Twitter cards with a 1200×630 OG image, robots, JSON-LD Person), plus
  `robots.txt` + `sitemap.xml`.

## Links & assets (P21 Wave C sweep)

- Internal links from `out/`: **0 broken** (50 unique refs resolve).
- External links: 32/35 → 200. The two LinkedIn `405`s are anti-bot HEAD rejections
  (fine in a browser). **1 real broken link:** `ai-fitness-trainer-production-5ebb.up.railway.app`
  → 404 (a project demo that is down) — owner decision: redeploy, repoint, or drop the
  live link (content lives in `static/data/`, not changed here).
- Assets present + wired: `og-image.jpg`, `documents/resume.pdf`, `documents/transcript.pdf`,
  `images/profile.jpg`, project covers (`atlasmind`, `interlace`).
