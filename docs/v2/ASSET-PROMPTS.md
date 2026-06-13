# Asset Generation Prompts — for Veo + Nano Banana Pro (Google Pro)

You generate; I integrate. Drop everything into `assets/incoming/` with the exact filenames below
(any common format — I compress/convert/grade in the pipeline). Priority order.

## 1. Animated hero portrait — Veo (image-to-video) — HIGHEST IMPACT (P18)

Upload your current hero portrait photo as the start image. Generate 2–3 candidates; pick the one
with zero face warping (inspect eyes/teeth frame-by-frame — regenerate if anything drifts).

**File:** `portrait-living.mp4` · **Settings:** image-to-video from your portrait, 16:9 or match
portrait aspect, 4–6 s, highest quality.

> Subtle living-portrait cinemagraph: the subject holds a natural, confident pose with a slight
> genuine smile; almost imperceptible motion — gentle breathing, a slow blink, micro head turn of
> 1–2 degrees, soft hair movement as if from faint air; studio-quality monochrome black-and-white
> portrait, soft key light, dark clean background; camera completely static, no zoom, no pan;
> photorealistic, no distortion of facial features, no morphing; seamless loop-friendly ending
> returning close to the starting pose.

(If Veo offers "loop" or "first frame = last frame", enable it.)

## 2. Signal film v2 — Veo (two clips, upgrade of the showpiece master) (P16 asset refresh)

The current master is one 5 s Wan 2.7 clip. Veo gives us a richer 3-act film. Use the two
keyframe stills I already generated — I'll give you the files from `assets/cinematic/`
(`still-A.png` chaos, `still-C.png` lattice) — as start images.

**File:** `signal-act1.mp4` · start image: `still-A.png` · 8 s · 16:9 · highest quality:

> Seamless continuous macro shot, no cuts: thousands of luminous pale-silver ink droplets drifting
> chaotically in pitch-black water slowly begin to align, drawn into elegant filament currents,
> first thread-like connections of light forming between droplet clusters; smooth ultra-slow
> camera push-in, photorealistic fluid dynamics, near-monochrome cool grayscale, volumetric glow,
> deep black background, no text, no logos, no color.

**File:** `signal-act2.mp4` · start image: the FINAL frame of signal-act1 (export it, or use
`still-C.png` as a style reference if Veo supports end-frame) · 8 s · 16:9:

> Seamless continuous macro shot, no cuts: glowing filament currents of pale-silver ink in
> pitch-black water weave together and crystallize into an ordered, symmetrical geometric neural
> lattice — connected nodes and struts of light — motion gradually settling to calm, majestic
> stillness; smooth ultra-slow camera push-in, photorealistic fluid dynamics, near-monochrome cool
> grayscale, volumetric glow, deep black background, no text, no logos, no color.

I stitch act1+act2 → new 16 s master → re-run `cinematic:extract/grade/manifest` (same budget) —
the showpiece instantly gets the richer film; nothing else changes.

## 3. Project covers — Nano Banana Pro, 16:9, one per flagship (P18)

Shared style suffix for EVERY cover (keeps the set coherent and theme-agnostic):

> …, abstract editorial illustration, near-monochrome with a single restrained teal accent,
> dark charcoal background, premium print-magazine aesthetic, generous negative space, subtle
> film grain, no text, no letters, no logos, no UI screenshots.

Generate at least the 4 flagships (all 12 welcome — filenames = slug below):

| File | Subject line (prepend to style suffix) |
|---|---|
| `cover-interlace.png` | A flowing lattice of fabric threads morphing into vector-search constellation points, garment silhouettes dissolving into embedding space |
| `cover-atlasmind.png` | A stylized map unfolding into branching agent decision paths, six glowing routes converging on a destination pin |
| `cover-ai-trainer.png` | A human figure mid bicep curl rendered as luminous pose-estimation skeleton lines and joint nodes |
| `cover-summarizer.png` | Dense cascading lines of text compressing into a single clean glowing paragraph block |
| `cover-parking.png` | Aerial parking lot grid where occupied/vacant bays read as a binary pattern of lit and dark cells |
| `cover-virtual-mouse.png` | An open hand with fingertip landmark points emitting a cursor trail of light |
| `cover-painting.png` | A hand drawing glowing brushstrokes in mid-air, paint trails hanging in dark space |
| `cover-finger-counter.png` | Two hands with 21-point landmark skeletons, raised fingers haloed in light |
| `cover-movies.png` | Constellation of film-reel nodes connected by similarity edges, one node glowing as recommendation |
| `cover-students.png` | Three ascending data streams (math, reading, writing) braiding into a single predictive curve |
| `cover-vendors.png` | A river of 15 million transaction points narrowing through an ETL funnel into clean bar-chart bars |
| `cover-spacex.png` | A Falcon-9 first stage descending on a plotted trajectory curve toward a drone-ship target circle |

## 4. OG share image — SKIP generating

I'll compose the 1200×630 OG deterministically in the existing Remotion project from the best
Signal frame + typography (consistent with the site, zero generation risk). Nothing needed from you.

## 5. Textures — SKIP generating

Paper grain / noise overlays are better done procedurally (CSS/SVG, zero bytes). Nothing needed.

---

**Delivery:** put files in `assets/incoming/`, tell me they're there. I review every asset
frame-by-frame, compress hard (P12 standard), wire them in with CLS-safe markup + a11y, and run
the full gate suite. Anything that looks AI-artifacted gets a regeneration note with a tweaked
prompt.
