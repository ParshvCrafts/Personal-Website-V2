"use client";

import { ScrollSequence } from "@/components/motion/scroll-sequence";

/**
 * Refined procedural placeholder for the signature scroll-sequence. Draws a
 * field of points that converge into an ordered lattice as you scroll — "data
 * resolving into structure". Real frames replace `draw` with `framePath` later.
 */
const draw = (
  ctx: CanvasRenderingContext2D,
  frame: number,
  total: number,
  { width, height }: { width: number; height: number },
) => {
  const p = total > 1 ? frame / (total - 1) : 0;
  // Read theme tokens so the canvas matches the active palette — otherwise dark-
  // navy paint hides the theme-coloured captions on the light themes.
  const root = getComputedStyle(document.documentElement);
  const bg = root.getPropertyValue("--background").trim() || "#0A0F1E";
  const accent = root.getPropertyValue("--accent").trim() || "#00E5FF";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const cols = 26;
  const rows = 16;
  const gx = width / (cols + 1);
  const gy = height / (rows + 1);
  const spread = 1 - p;
  // Batch all points into a single path + one fill (was 416 fills/frame).
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.25 + 0.6 * p;
  ctx.beginPath();
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      // each point eases from a scattered start toward its lattice position
      const seed = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
      const jitter = seed - Math.floor(seed); // 0..1
      const ox = (jitter - 0.5) * width * 0.5 * spread;
      const oy = (((seed * 0.5) % 1) - 0.5) * height * 0.5 * spread;
      const x = gx * c + ox;
      const y = gy * r + oy;
      ctx.moveTo(x + 1.6, y);
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
    }
  }
  ctx.fill();
  ctx.globalAlpha = 1;
};

export function ScrollShowpiece() {
  return (
    <ScrollSequence
      frameCount={90}
      width={1280}
      height={720}
      draw={draw}
      className="border-y border-border"
      alt="Scattered data points converging into an ordered lattice as you scroll — a placeholder for the signature sequence; real frames are dropped in later."
      textBeats={[
        { at: 0, heading: "Data, everywhere", body: "Raw, scattered, noisy." },
        { at: 0.5, heading: "Structure emerges", body: "Patterns resolve as the model learns." },
        { at: 0.92, heading: "Intelligence", body: "Systems that turn signal into decisions." },
      ]}
    />
  );
}
