# Personal Website V2

Next.js 16 (App Router, React 19, static export) rebuild of the personal portfolio.
This is the **standalone v2 repository** — split out of the original v1 repo (Flask, still
deployed separately at `ParshvCrafts/Personal-Website`). v1 is unaffected by anything here.

## Commands
- `npm run dev` — local dev (auto-syncs data first)
- `npm run build` — static export to `out/` (auto-syncs data first)
- `npm test` — unit tests (Vitest)
- `npm run test:e2e` — Playwright (chromium/firefox/webkit + axe)
- `npm run sync:data` — copy + validate canonical JSON from `static/data/`

## Data
`static/data/*.json` is the canonical content source (a snapshot brought over from v1).
`scripts/sync-data.ts` copies + validates it into `data/` (gitignored) at predev/prebuild/pretest.
Edit content in `static/data/`, never in the generated `data/`.

## Deploy (Vercel) — when the user approves
Import this repo into Vercel with **Root Directory = `/`** (repo root). Build command
`npm run build`, output directory `out`, framework Next.js. The `prebuild` step syncs
`static/data` before the static export. Do not connect production DNS until cutover.

## Project docs
See `docs/v2/` (architecture, design, motion, hero-3d, foundation-3d, roadmap, handoffs) and
`docs/superpowers/` (specs + plans). Full v2/v2.5 commit history is preserved in this repo.
