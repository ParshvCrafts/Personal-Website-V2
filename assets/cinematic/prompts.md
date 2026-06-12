# "Signal" cinematic — generation recipe (P15)

Regenerates `assets/cinematic/master.mp4` (gitignored). Generated 2026-06-12 via the
Higgsfield CLI (`higgsfield` 0.1.40, `higgsfield auth login` first).

## Budget deviation from spec (user-approved)

The spec planned 3 stills + 2 Kling 3.0 keyframe clips. The account was on the free plan
(8 credits) and Kling 3.0 is plan-gated (`job_minimum_basic_plan_required`), so the user
approved a squeeze: **2 stills (z_image, 0.15 cr each) + ONE Wan 2.7 clip (7.5 cr) with
start+end keyframes** — a single continuous 5 s chaos→lattice shot instead of two acts.
Total spend ≈ 7.8 of 8 credits. 5 s @ 30 fps = 150 frames → ample for the 120-frame sample.

## Still A — chaos (start keyframe)

- Model: `z_image`, aspect 16:9 (output 2048×1152), job `ec0fd791-a025-4709-aebb-02a92230e5e1`

```
higgsfield generate create z_image --aspect_ratio 16:9 --wait --prompt "Macro cinematography, extreme close-up: thousands of tiny luminous pale-silver ink droplets suspended and dispersing chaotically in pitch-black water, volumetric glow, shallow depth of field, near-monochrome cool grayscale, deep black background, photorealistic fluid dynamics, subtle 35mm film grain, no text, no logo"
```

## Still C — intelligence (end keyframe)

- Model: `z_image`, aspect 16:9, job `508d6b38-2b9b-48a9-b50d-5afc3239786d`

```
higgsfield generate create z_image --aspect_ratio 16:9 --wait --prompt "Macro cinematography, extreme close-up: the same pale-silver luminous droplets in pitch-black water now fully resolved into an ordered crystalline lattice, symmetrical geometric neural structure of connected light filaments, calm and still, faint volumetric glow, near-monochrome cool grayscale, deep black background, photorealistic, subtle 35mm film grain, no text, no logo"
```

## Clip — chaos → lattice (the master)

- Model: `wan2_7`, 5 s, 16:9, 720p output (1280×720 @ 30 fps), start/end keyframes = stills A/C,
  job `24701f92-0b5f-4415-9414-96e186ee7bae`

```
higgsfield generate create wan2_7 --start-image assets/cinematic/still-A.png --end-image assets/cinematic/still-C.png --aspect_ratio 16:9 --duration 5 --wait --prompt "Seamless continuous macro shot, no cuts: chaotic luminous pale-silver ink droplets drifting in pitch-black water are slowly drawn together, aligning into filament currents, then crystallizing into an ordered symmetrical geometric neural lattice that settles to calm stillness; smooth slow camera push-in, photorealistic fluid dynamics, near-monochrome cool grayscale, volumetric glow"
```

## Master

Single clip → clean silent master (no stitch needed in the squeeze plan):

```
node -e "const f=require('ffmpeg-static');const{execFileSync}=require('child_process');execFileSync(f,['-y','-i','assets/cinematic/clip1.mp4','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-an','assets/cinematic/master.mp4'],{stdio:'inherit'})"
```

Then: `npm run cinematic:extract && npm run cinematic:grade && npm run cinematic:manifest`.

Note: this ffmpeg-static build (6.1.x) needs `-update 1` when writing a single image (not a
`%d` sequence pattern).
