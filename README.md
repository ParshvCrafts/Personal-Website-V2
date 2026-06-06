# Portfolio v2

Next.js 15 (App Router, static export) rebuild of the personal portfolio.
v1 (Flask) stays untouched at the repo root.

## Commands
- `npm run dev` — local dev (auto-syncs data first)
- `npm run build` — static export to `out/` (auto-syncs data first)
- `npm test` — unit tests (Vitest)
- `npm run test:e2e` — Playwright smoke
- `npm run sync:data` — copy + validate canonical JSON from `../static/data`

## Data
`../static/data/*.json` is canonical (shared with v1). `scripts/sync-data.ts`
copies + validates it into `v2/data/` (gitignored) at predev/prebuild/pretest.

## Deploy (Vercel) — when the user approves
Set the Vercel project **Root Directory = `v2`**. Build command `npm run build`,
output `out`. The build's `prebuild` step reads `../static/data`, which resolves
from the repo root that Vercel checks out. Do not connect production DNS until cutover.
