# P15 Cinematic Asset Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the "Signal" cinematic — Higgsfield-generated ink-macro film → deterministic script pipeline → two graded 120-frame webp sequences in `public/sequences/intelligence/` + a 10s Remotion preview MP4.

**Architecture:** Approach B from the approved spec (`docs/superpowers/specs/2026-06-11-p15-cinematic-pipeline-design.md`): Higgsfield MCP generates 3 keyframe stills then 2 keyframe-controlled clips; ffmpeg (via `ffmpeg-static`) extracts frames; `sharp` produces dark + light grades; a manifest script enforces a 2.5 MB/grade budget; a self-contained Remotion project in `video/` renders only the preview MP4. No app UI changes in P15.

**Tech Stack:** TypeScript + tsx scripts, `ffmpeg-static`, `sharp`, Vitest (TDD for pure logic), Higgsfield MCP (generation — orchestrator only), Remotion 4 (isolated package).

**Conventions:** Conventional commits, one per task, trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Never `git add -A`. Do NOT push.

**Task split:** Tasks 1–3 and 7 are subagent-able (code only). Tasks 4–6 are **ORCHESTRATOR-ONLY** (need Higgsfield MCP tools + visual review of generated media — subagents have neither).

---

### Task 1: Tooling deps + gitignore

**Files:**
- Modify: `package.json` (devDependencies via npm)
- Modify: `.gitignore`

- [ ] **Step 1: Install dev deps**

Run from repo root: `npm i -D sharp ffmpeg-static`
Expected: both appear in `package.json` devDependencies; install succeeds.

- [ ] **Step 2: Add gitignore entries**

Append to `.gitignore`:

```gitignore

# P15 cinematic raw assets (regeneration recipe: assets/cinematic/prompts.md)
assets/cinematic/*.mp4
assets/cinematic/*.png
assets/cinematic/*.jpeg
assets/cinematic/*.webp
assets/cinematic/work/
video/node_modules/
video/public/master.mp4
```

- [ ] **Step 3: Verify app still builds** — Run: `npm run typecheck`. Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore(v2): add sharp + ffmpeg-static for P15 cinematic pipeline"
```

---

### Task 2: Pure pipeline logic (TDD)

**Files:**
- Create: `scripts/cinematic/lib.ts`
- Test: `tests/unit/cinematic-lib.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/cinematic-lib.test.ts
import { describe, expect, it } from "vitest";
import {
  FRAME_COUNT,
  GRADES,
  GRADE_BUDGET_BYTES,
  assertWithinBudget,
  frameFileName,
  sampleIndices,
} from "../../scripts/cinematic/lib";

describe("sampleIndices", () => {
  it("returns exactly count unique, sorted, in-range indices", () => {
    const idx = sampleIndices(336, 120);
    expect(idx).toHaveLength(120);
    expect(new Set(idx).size).toBe(120);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    expect(idx[0]).toBeGreaterThanOrEqual(0);
    expect(idx[idx.length - 1]).toBeLessThan(336);
  });

  it("is identity-like when count equals total", () => {
    expect(sampleIndices(5, 5)).toEqual([0, 1, 2, 3, 4]);
  });

  it("throws when count exceeds total or args non-positive", () => {
    expect(() => sampleIndices(10, 11)).toThrow();
    expect(() => sampleIndices(0, 1)).toThrow();
    expect(() => sampleIndices(10, 0)).toThrow();
  });
});

describe("frameFileName", () => {
  it("pads to 4 and uses webp by default", () => {
    expect(frameFileName(1)).toBe("frame_0001.webp");
    expect(frameFileName(120)).toBe("frame_0120.webp");
  });
});

describe("budget + grades", () => {
  it("accepts under-budget and rejects over-budget totals", () => {
    expect(() => assertWithinBudget("dark", GRADE_BUDGET_BYTES)).not.toThrow();
    expect(() => assertWithinBudget("dark", GRADE_BUDGET_BYTES + 1)).toThrow(/dark/);
  });
  it("defines dark and light grades with sharp-safe params", () => {
    expect(GRADES.map((g) => g.name)).toEqual(["dark", "light"]);
    for (const g of GRADES) {
      expect(g.gamma).toBeGreaterThanOrEqual(1.0); // sharp .gamma() floor
      expect(g.gamma).toBeLessThanOrEqual(3.0);
      expect(g.brightness).toBeGreaterThan(0);
      expect(g.saturation).toBeGreaterThanOrEqual(0);
    }
    expect(FRAME_COUNT).toBe(120);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/cinematic-lib.test.ts`
Expected: FAIL — cannot resolve `scripts/cinematic/lib`.

- [ ] **Step 3: Write the implementation**

```ts
// scripts/cinematic/lib.ts
// Pure logic for the P15 cinematic pipeline. No I/O here — keep it unit-testable.

export interface GradeSpec {
  name: "dark" | "light";
  /** Invert luminance (light grade turns bright ink on black into dark ink on paper). */
  negate: boolean;
  /** sharp .gamma() — valid range 1.0–3.0; 1.0 means "skip". */
  gamma: number;
  /** sharp .modulate() params. */
  brightness: number;
  saturation: number;
}

export const GRADES: GradeSpec[] = [
  { name: "dark", negate: false, gamma: 1.0, brightness: 1.0, saturation: 1.05 },
  { name: "light", negate: true, gamma: 1.05, brightness: 1.04, saturation: 0.9 },
];

export const SEQUENCE_ID = "intelligence";
export const FRAME_COUNT = 120;
export const FRAME_WIDTH = 1280;
export const FRAME_HEIGHT = 720;
export const FRAME_PAD = 4;
/** Hard per-grade weight ceiling from the spec (≈20 KB/frame × 120). */
export const GRADE_BUDGET_BYTES = 2.5 * 1024 * 1024;

/**
 * Evenly sample `count` indices from [0, total). Centered sampling — frame i
 * represents the middle of its time bucket, avoiding first/last-frame bias.
 */
export function sampleIndices(total: number, count: number): number[] {
  if (total <= 0 || count <= 0) throw new Error(`sampleIndices: non-positive args ${total}/${count}`);
  if (count > total) throw new Error(`sampleIndices: count ${count} exceeds total ${total}`);
  return Array.from({ length: count }, (_, i) =>
    Math.min(total - 1, Math.floor(((i + 0.5) * total) / count)),
  );
}

export function frameFileName(oneBasedIndex: number, pad = FRAME_PAD, ext = "webp"): string {
  return `frame_${String(oneBasedIndex).padStart(pad, "0")}.${ext}`;
}

export function assertWithinBudget(
  name: string,
  totalBytes: number,
  budget = GRADE_BUDGET_BYTES,
): void {
  if (totalBytes > budget) {
    throw new Error(
      `${name} grade is ${totalBytes} bytes — exceeds budget ${budget}. Lower SEQ_QUALITY and re-run grade.`,
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/cinematic-lib.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/cinematic/lib.ts tests/unit/cinematic-lib.test.ts
git commit -m "feat(v2): P15 pipeline pure logic — sampling, naming, duration parse, grade budget (TDD)"
```

---

### Task 3: Pipeline I/O scripts + npm scripts

**Files:**
- Create: `scripts/cinematic/extract.ts`
- Create: `scripts/cinematic/grade.ts`
- Create: `scripts/cinematic/manifest.ts`
- Modify: `package.json` (scripts block)

- [ ] **Step 1: Write extract.ts**

```ts
// scripts/cinematic/extract.ts
// Extract EVERY frame of the stitched master to PNGs; grade.ts picks the subset.
// Usage: npm run cinematic:extract
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";

const MASTER = path.resolve("assets/cinematic/master.mp4");
const OUT = path.resolve("assets/cinematic/work/frames-all");

if (!existsSync(MASTER)) {
  console.error(`[extract] missing ${MASTER} — generate + stitch the master first (see prompts.md)`);
  process.exit(1);
}
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
execFileSync(ffmpegPath as unknown as string, ["-y", "-i", MASTER, path.join(OUT, "frame_%05d.png")], {
  stdio: "inherit",
});
const n = readdirSync(OUT).filter((f) => f.endsWith(".png")).length;
console.log(`[extract] ${n} frames → ${OUT}`);
```

- [ ] **Step 2: Write grade.ts**

```ts
// scripts/cinematic/grade.ts
// Sample FRAME_COUNT frames from the full extraction and write both graded
// webp sequences. Usage: npm run cinematic:grade  (env SEQ_QUALITY=58 default)
import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  FRAME_COUNT,
  FRAME_HEIGHT,
  FRAME_WIDTH,
  GRADES,
  SEQUENCE_ID,
  frameFileName,
  sampleIndices,
} from "./lib";

const QUALITY = Number(process.env.SEQ_QUALITY ?? 58);
const SRC = path.resolve("assets/cinematic/work/frames-all");
const DEST = path.resolve("public/sequences", SEQUENCE_ID);

async function main(): Promise<void> {
  const all = readdirSync(SRC)
    .filter((f) => f.endsWith(".png"))
    .sort();
  const picks = sampleIndices(all.length, FRAME_COUNT);
  for (const grade of GRADES) {
    const dir = path.join(DEST, grade.name);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    let bytes = 0;
    for (let i = 0; i < picks.length; i++) {
      let img = sharp(path.join(SRC, all[picks[i]])).resize(FRAME_WIDTH, FRAME_HEIGHT, {
        fit: "cover",
      });
      if (grade.negate) img = img.negate({ alpha: false });
      img = img.modulate({ brightness: grade.brightness, saturation: grade.saturation });
      if (grade.gamma > 1.0) img = img.gamma(grade.gamma);
      const out = path.join(dir, frameFileName(i + 1));
      await img.webp({ quality: QUALITY }).toFile(out);
      bytes += statSync(out).size;
    }
    console.log(`[grade] ${grade.name}: ${picks.length} frames, ${(bytes / 1024).toFixed(0)} KB (q=${QUALITY})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 3: Write manifest.ts**

```ts
// scripts/cinematic/manifest.ts
// Validate frame counts + per-grade budget; write manifest.json.
// Usage: npm run cinematic:manifest
import { readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  FRAME_COUNT,
  FRAME_HEIGHT,
  FRAME_PAD,
  FRAME_WIDTH,
  GRADES,
  SEQUENCE_ID,
  assertWithinBudget,
} from "./lib";

const DEST = path.resolve("public/sequences", SEQUENCE_ID);
const grades: Record<string, { bytes: number }> = {};

for (const g of GRADES) {
  const dir = path.join(DEST, g.name);
  const files = readdirSync(dir).filter((f) => f.endsWith(".webp"));
  if (files.length !== FRAME_COUNT) {
    throw new Error(`[manifest] ${g.name}: expected ${FRAME_COUNT} frames, found ${files.length}`);
  }
  const bytes = files.reduce((s, f) => s + statSync(path.join(dir, f)).size, 0);
  assertWithinBudget(g.name, bytes);
  grades[g.name] = { bytes };
}

writeFileSync(
  path.join(DEST, "manifest.json"),
  JSON.stringify(
    {
      id: SEQUENCE_ID,
      frameCount: FRAME_COUNT,
      width: FRAME_WIDTH,
      height: FRAME_HEIGHT,
      ext: "webp",
      pad: FRAME_PAD,
      grades,
    },
    null,
    2,
  ) + "\n",
);
console.log("[manifest] ok", grades);
```

- [ ] **Step 4: Add npm scripts** — in root `package.json` `"scripts"`, add:

```json
"cinematic:extract": "tsx scripts/cinematic/extract.ts",
"cinematic:grade": "tsx scripts/cinematic/grade.ts",
"cinematic:manifest": "tsx scripts/cinematic/manifest.ts"
```

- [ ] **Step 5: Verify** — Run: `npm run lint && npm run typecheck && npm run cinematic:extract`
Expected: lint/typecheck clean; extract exits 1 with the "missing master" message (master not generated yet — that is the correct guard behavior).

- [ ] **Step 6: Commit**

```bash
git add scripts/cinematic/extract.ts scripts/cinematic/grade.ts scripts/cinematic/manifest.ts package.json
git commit -m "feat(v2): P15 pipeline scripts — extract, two-grade webp export, budgeted manifest"
```

---

### Task 4 (ORCHESTRATOR-ONLY): Generate keyframe stills A/B/C

Uses Higgsfield MCP (`generate_image`, `job_status`); review every output by downloading and Reading the image. Max 2 iteration rounds per still (moderate budget).

- [ ] **Step 1: Generate still A (chaos)** — 16:9, prompt:

> Macro cinematography, extreme close-up: thousands of tiny luminous pale-silver ink droplets suspended and dispersing chaotically in pitch-black water, volumetric glow, shallow depth of field, near-monochrome cool grayscale, deep black background, photorealistic fluid dynamics, subtle 35mm film grain, no text, no logo

- [ ] **Step 2: Generate still B (alignment)** — same style descriptors, prompt core:

> the same luminous pale-silver ink in pitch-black water now drawn into aligned filament currents, threads of light connecting droplet clusters, a partial geometric lattice half-formed on the right, motion implied, near-monochrome cool grayscale, deep black background, no text

- [ ] **Step 3: Generate still C (intelligence)** — prompt core:

> fully resolved luminous crystalline lattice of pale-silver light in pitch-black water, ordered symmetrical geometric neural structure, calm and still, faint volumetric glow, near-monochrome cool grayscale, deep black background, no text

- [ ] **Step 4: Review each still visually** (download → Read). Iterate (≤2 rounds each) until the three read as one continuous world: same ink color, same black field, increasing order A→B→C.
- [ ] **Step 5: Record in `assets/cinematic/prompts.md`** — exact prompts, model id, params, job ids, chosen generation ids. (Committed in Task 5.)

---

### Task 5 (ORCHESTRATOR-ONLY): Generate clips, stitch master

- [ ] **Step 1: Generate clip 1** — `generate_video`, model `kling3_0` (fallback `seedance_2_0`), `sound: "off"`, mode `std`, 16:9, ~7s, medias: still A as `start_image`, still B as `end_image`. Motion prompt:

> slow macro drift: chaotic luminous ink droplets gradually drawn into aligned filament currents, smooth continuous fluid motion, no cuts, steady slow camera push-in

- [ ] **Step 2: Generate clip 2** — same model/params, still B as `start_image`, still C as `end_image`. Motion prompt:

> aligned luminous filaments coalesce and crystallize into an ordered geometric lattice, motion settles to calm stillness, no cuts, steady slow camera

- [ ] **Step 3: Review both clips** (download → sample a few frames with ffmpeg → Read). One regeneration allowed per clip if continuity/artifacts fail.
- [ ] **Step 4: Stitch** — download to `assets/cinematic/clip1.mp4` + `clip2.mp4`, then:

```bash
printf "file 'clip1.mp4'\nfile 'clip2.mp4'\n" > assets/cinematic/concat.txt
node -e "const f=require('ffmpeg-static');const{execFileSync}=require('child_process');execFileSync(f,['-y','-f','concat','-safe','0','-i','assets/cinematic/concat.txt','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-an','assets/cinematic/master.mp4'],{stdio:'inherit'})"
```

- [ ] **Step 5: Commit the recipe** (masters stay gitignored):

```bash
git add assets/cinematic/prompts.md
git commit -m "docs(v2): P15 generation recipe — prompts, models, job ids for the Signal master"
```

---

### Task 6 (ORCHESTRATOR-ONLY): Run pipeline, review frames, commit sequences

- [ ] **Step 1:** `npm run cinematic:extract` — expect ~300–400 PNGs reported.
- [ ] **Step 2:** `npm run cinematic:grade` — expect 120 frames per grade; check reported KB against 2560 KB budget; if over, re-run with `SEQ_QUALITY=50` (then 44).
- [ ] **Step 3:** `npm run cinematic:manifest` — expect `[manifest] ok` + byte totals.
- [ ] **Step 4: Visual review** — Read `public/sequences/intelligence/dark/frame_0001.webp`, `frame_0060.webp`, `frame_0120.webp` and the same three from `light/`. Dark: luminous ink on black. Light: dark ink on paper-bright field, no clipping/banding. Fix grade params in `lib.ts` + re-run if the light grade reads badly (this is the riskiest aesthetic step).
- [ ] **Step 5:** Run full gates: `npm run lint && npm run typecheck && npm test -- --run && npm run build`. Expected: all green (frames are static assets; build copies `public/`).
- [ ] **Step 6: Commit**

```bash
git add public/sequences/intelligence
git commit -m "feat(v2): Signal cinematic frame sequences — 120 frames x dark/light grades + manifest"
```

---

### Task 7: Remotion preview MP4 project

**Files:**
- Create: `video/package.json`
- Create: `video/tsconfig.json`
- Create: `video/remotion.config.ts`
- Create: `video/src/index.ts`
- Create: `video/src/Root.tsx`
- Create: `video/src/Preview.tsx`

Consult `remotion-best-practices` skill before implementing. The project is fully isolated: own package.json, never imported by the app.

- [ ] **Step 1: Scaffold package**

```json
// video/package.json
{
  "name": "v2-preview-video",
  "private": true,
  "scripts": {
    "studio": "remotion studio",
    "render": "remotion render Preview ../public/preview.mp4 --codec h264 --crf 26"
  },
  "dependencies": {
    "@remotion/cli": "^4.0.0",
    "@remotion/google-fonts": "^4.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "remotion": "^4.0.0"
  }
}
```

```json
// video/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src", "remotion.config.ts"]
}
```

```ts
// video/remotion.config.ts
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
```

```ts
// video/src/index.ts
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
```

- [ ] **Step 2: Composition**

```tsx
// video/src/Root.tsx
import { Composition } from "remotion";
import { Preview } from "./Preview";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Preview"
    component={Preview}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);
```

```tsx
// video/src/Preview.tsx
// 10s preview: Signal master backdrop + the three story beats + sign-off.
// Midnight-palette hex is intentional here: this renders an exported MP4
// artifact, not a themed app surface.
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadMono } from "@remotion/google-fonts/GeistMono";

const fraunces = loadFraunces();
const mono = loadMono();

const BG = "#0A0F1E";
const INK = "#E6EAF2";
const ACCENT = "#2DD4BF";
const MUTED = "#8A93A6";

const BEATS = [
  { heading: "Data, everywhere", body: "Raw, scattered, noisy." },
  { heading: "Structure emerges", body: "Patterns resolve as the model learns." },
  { heading: "Intelligence", body: "Systems that turn signal into decisions." },
];
const BEAT_LEN = 80; // frames per beat; last 60 frames = sign-off

const Beat: React.FC<{ heading: string; body: string }> = ({ heading, body }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15, BEAT_LEN - 15, BEAT_LEN], [0, 1, 1, 0]);
  const y = interpolate(frame, [0, 15], [24, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", padding: 120, opacity }}>
      <div style={{ transform: `translateY(${y}px)`, maxWidth: 900 }}>
        <div style={{ width: 64, height: 4, background: ACCENT, marginBottom: 28 }} />
        <div style={{ fontFamily: fraunces.fontFamily, fontSize: 88, color: INK, lineHeight: 1.05 }}>
          {heading}
        </div>
        <div style={{ fontFamily: mono.fontFamily, fontSize: 28, color: MUTED, marginTop: 20 }}>
          {body}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SignOff: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: fraunces.fontFamily, fontSize: 96, color: INK }}>Parshv Patel</div>
        <div
          style={{
            fontFamily: mono.fontFamily,
            fontSize: 26,
            color: ACCENT,
            marginTop: 16,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Data Science &amp; AI · UC Berkeley
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Preview: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <OffthreadVideo
      src={staticFile("master.mp4")}
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
    />
    {BEATS.map((b, i) => (
      <Sequence key={b.heading} from={i * BEAT_LEN} durationInFrames={BEAT_LEN}>
        <Beat heading={b.heading} body={b.body} />
      </Sequence>
    ))}
    <Sequence from={240} durationInFrames={60}>
      <SignOff />
    </Sequence>
  </AbsoluteFill>
);
```

- [ ] **Step 3: Install + copy master** — Run from `video/`: `npm install`, then copy `../assets/cinematic/master.mp4` → `video/public/master.mp4` (gitignored).
- [ ] **Step 4: Render** — Run from `video/`: `npm run render`. Expected: `public/preview.mp4` written, ≤5 MB (raise `--crf` to 28 if over).
- [ ] **Step 5 (ORCHESTRATOR): Review the MP4** — extract 3 frames with ffmpeg, Read them; check typography/legibility.
- [ ] **Step 6: Commit**

```bash
git add video/package.json video/package-lock.json video/tsconfig.json video/remotion.config.ts video/src public/preview.mp4
git commit -m "feat(v2): Remotion preview video — 10s Signal cinematic with beat typography"
```

---

### Task 8: Docs + roadmap status

**Files:**
- Create: `docs/v2/CINEMATIC-PIPELINE.md`
- Modify: `docs/v2/ROADMAP-V2.5-SIGNATURE.md` (P15 row status → done)

- [ ] **Step 1: Write the doc** — concise: pipeline diagram (Higgsfield → stitch → extract → grade → manifest → P16), commands, budget, regeneration recipe pointer, grade-tuning notes, what P16 consumes (`framePath`/`frameCount: 120`/`pad: 4`/`ext: webp`, per-theme grade dirs, manifest.json contract).
- [ ] **Step 2: Update roadmap** — P15 row: `pending` → `done`.
- [ ] **Step 3: Commit**

```bash
git add docs/v2/CINEMATIC-PIPELINE.md docs/v2/ROADMAP-V2.5-SIGNATURE.md
git commit -m "docs(v2): P15 cinematic pipeline doc + roadmap status"
```

---

## Final verification (orchestrator, after all tasks)

1. Full gates from repo root: `npm run lint`, `npm run typecheck`, `npm test -- --run`, `npm run build`, full `npm run test:e2e` (3 browsers; rerun lone failures in isolation).
2. Two-stage read-only `reviewer` pass over the git range (spec/a11y/design, then code-quality/bugs).
3. Confirm: nothing pushed, no v1 files touched, masters not committed, sequence weight within budget per `manifest.json`.
