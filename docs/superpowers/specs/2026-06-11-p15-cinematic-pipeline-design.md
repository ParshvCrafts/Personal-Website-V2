# P15 — Cinematic Asset Pipeline (design)

**Date:** 2026-06-11 · **Status:** approved by user (concept, pipeline, MP4 scope each approved)
**Phase:** v2.5 Signature P15. Produces assets + pipeline only; P16 wires frames into the pinned
`ScrollSequence` showpiece (no UI change ships in P15).

## Decisions taken with the user

| Question | Decision |
|---|---|
| Story | **Data → Intelligence** (keeps placeholder narrative + beats) |
| Visual language | **Ink / fluid macro** — luminous ink in dark fluid coalescing into geometric structure |
| Theme handling | **Two baked grades**: dark (midnight/neon) + light (daylight/manuscript); runtime loads only the active grade |
| Generation budget | **Moderate** — stills before video, ≤2 iterations per still, 2 video generations, light grade derived in post (not regenerated) |
| Video scope | **Preview MP4 only** (~10s, for LinkedIn/README); static OG image stays in P18 |
| Pipeline architecture | **B — slim scripts for frames + Remotion only for the MP4** |

Key insight driving B: text overlays are NOT baked into frames — the `ScrollSequence` engine
already renders text beats as DOM siblings (theme-correct, accessible). The compositor's real jobs
are grading, frame export/compression, and the preview MP4.

## 1. The film — "Signal" (sequence id: `intelligence`)

Macro cinematography of luminous, near-grayscale cool ink in dark fluid. Three acts matching the
existing text beats:

1. **Act I — "Data, everywhere"** — ink particles dispersing chaotically; slow drifting macro camera.
2. **Act II — "Structure emerges"** — currents align; filaments connect into a partial lattice.
3. **Act III — "Intelligence"** — calm crystalline geometric/neural bloom; fully resolved.

### Higgsfield generation plan
1. **3 keyframe stills** (text-to-image, 16:9, ≤2 iteration rounds each, reviewed visually before
   spending video credits). Prompted near-grayscale so both grades derive cleanly in post.
2. **2 clips with keyframe control** (Kling 3.0 or Seedance 2.0; both accept `start_image` +
   `end_image`; sound off; std mode first):
   clip 1 = still A → still B (~7s); clip 2 = still B → still C (~7s).
   Shared boundary still guarantees act-to-act continuity.
3. Stitch (ffmpeg concat, trim duplicate boundary frame) → **~14s master** at 1080p 16:9.
4. **`assets/cinematic/prompts.md`** (committed): exact prompts, model ids, params, job ids —
   the regeneration recipe. Raw masters/clips are **gitignored**.

## 2. Frame pipeline — `scripts/cinematic/`

TypeScript, run via `tsx`. Pure logic developed TDD (Vitest, `tests/unit/`). Tooling installed as
devDependencies: `sharp`, `ffmpeg-static` (no system ffmpeg required; scripts shell out to the
bundled binary).

| Script | Job |
|---|---|
| `extract.ts` | ffmpeg samples master.mp4 → **120 PNGs**, even temporal sampling (sampling math = pure, unit-tested) |
| `grade.ts` | sharp: **dark grade** (tuned master look) + **light grade** derived deterministically via luminance remap → `frame_0001.webp …` at **1280×720** (engine's canvas dims), quality tuned to budget |
| `manifest.ts` | writes `manifest.json` (frameCount, dims, per-grade byte totals); **fails the build of assets if a grade exceeds 2.5 MB** (≈20 KB/frame) |

Output layout (committed):

```
public/sequences/intelligence/
  manifest.json
  dark/frame_0001.webp … frame_0120.webp
  light/frame_0001.webp … frame_0120.webp
```

Runtime cost = one grade only (P16 picks `framePath` by resolved theme). Engine contract
unchanged: `framePath`, `frameExt:"webp"`, `frameCount:120`, `pad:4`, existing `textBeats`.

## 3. Preview MP4 — Remotion (isolated)

Self-contained Remotion project in **`video/`** with its own `package.json` — its dependencies
never touch the app bundle or app `node_modules` resolution. Follows `remotion-best-practices`.

- 10s, 1080p 16:9, midnight palette: master-clip backdrop (`<OffthreadVideo>`), Fraunces beat
  typography, name + role, accent rule.
- Output: `public/preview.mp4` (H.264, target ≤ 5 MB) for LinkedIn/README embedding.

## 4. A11y / reduced motion

P15 ships no DOM. The engine already provides the contract P16 inherits: required `alt`, reduced
motion = static first frame + all beats visible, no pin/scroll trap. Frames are decorative;
text beats live in DOM.

## 5. Testing & verification

- TDD unit tests: temporal sampling math, grade-curve params, manifest validation + budget check.
- Every generated still/frame reviewed visually (Read) before the next credit spend.
- Gates stay green: lint, typecheck, unit, static build, full cross-browser e2e (no UI change → no
  new e2e).
- Verify committed sequence weight against budget in `manifest.json`.

## Out of scope (later phases)

- Wiring frames into `ScrollShowpiece` (P16), including per-theme `framePath` switch.
- Static OG image (P18). Animated portrait (P18). Hero-3D wow redesign (P17).
