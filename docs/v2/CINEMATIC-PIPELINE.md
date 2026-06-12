# P15 — Cinematic Asset Pipeline ("Signal")

Higgsfield CLI → keyframe-controlled clip → deterministic scripts → two graded 120-frame webp
sequences + 10s Remotion preview MP4. Spec: `docs/superpowers/specs/2026-06-11-p15-cinematic-pipeline-design.md`.

## Flow

```
higgsfield CLI (z_image stills A/C → wan2_7 clip, start/end keyframes)
  → assets/cinematic/master.mp4          (gitignored; recipe: assets/cinematic/prompts.md)
  → npm run cinematic:extract            (ffmpeg-static → all ~150 PNGs to work/)
  → npm run cinematic:grade              (sharp → 120 frames × {dark, light} webp; SEQ_QUALITY=28)
  → npm run cinematic:manifest           (validates count + 2.5 MB/grade budget → manifest.json)
  → P16 wires frames into ScrollSequence (pinned showpiece section)
```

Pure logic (sampling, naming, budget) in `scripts/cinematic/lib.ts`, unit-tested in
`tests/unit/cinematic-lib.test.ts`.

## Assets

- `public/sequences/intelligence/{dark,light}/frame_0001.webp … frame_0120.webp` — 1280×720.
  Dark = luminous ink on black (midnight/neon); light = negate-derived ink-on-paper
  (daylight/manuscript). Weights: dark 2481 KB, light 2543 KB (budget 2560 KB, enforced).
- `public/sequences/intelligence/manifest.json` — `{ id, frameCount:120, width, height, ext:"webp", pad:4, grades }`.
- `public/preview.mp4` — 10s 1080p branded preview (Remotion project in `video/`, isolated
  package; render: `cd video && npm install && npm run render`; needs `video/public/master.mp4`
  copied from `assets/cinematic/`).

## What P16 consumes

`ScrollSequence` props: `framePath="/sequences/intelligence/<grade>/frame_"`, `frameExt="webp"`,
`frameCount={120}`, `pad={4}`, existing `textBeats` (Data, everywhere → Structure emerges →
Intelligence). Grade dir picked by resolved theme (dark for midnight/neon, light for
daylight/manuscript). Text beats stay in DOM (a11y + theme tokens) — nothing is baked into frames.

## Notes / gotchas

- Budget deviation (user-approved): free-plan credits (8) + Kling 3.0 plan-gating forced a
  single 5s wan2_7 clip (start/end keyframes) instead of 2 clips — see prompts.md.
- Grain-heavy frames compress poorly; q=58→28 was needed to meet budget. Verified artifact-free
  at 1280×720 by eye.
- This ffmpeg-static (6.1.x) needs `-update 1` when writing a single image.
- Re-grading is deterministic from the master; tune `GRADES` in `scripts/cinematic/lib.ts`.
