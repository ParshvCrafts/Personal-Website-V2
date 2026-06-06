"use client";

import { ScrollSequence } from "@/components/motion/scroll-sequence";

// Procedural placeholder: a wireframe grid that "assembles" with progress + frame readout.
// Defined inside the client boundary so the draw function is never serialized across RSC.
const placeholderDraw = (
  ctx: CanvasRenderingContext2D,
  frame: number,
  total: number,
  { width, height }: { width: number; height: number },
) => {
  const p = total > 1 ? frame / (total - 1) : 0;
  ctx.fillStyle = "#0A0F1E";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#00E5FF";
  ctx.globalAlpha = 0.5;
  const cells = 12;
  const spread = 1 - p; // converges as it progresses
  for (let i = 0; i <= cells; i++) {
    const x = (width / cells) * i + Math.sin(i + p * 6) * 30 * spread;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#E5FF00";
  ctx.font = "600 28px monospace";
  ctx.fillText(`FRAME ${frame + 1} / ${total}`, 32, 48);
};

export function PlaceholderSequence() {
  return (
    <ScrollSequence
      frameCount={90}
      width={1280}
      height={720}
      draw={placeholderDraw}
      alt="Placeholder scroll sequence: a wireframe grid assembling as you scroll. Real frames are dropped in later."
      textBeats={[
        { at: 0, heading: "Scroll to scrub", body: "The section pins and the canvas advances frame-by-frame." },
        { at: 0.5, heading: "Synced beats", body: "Text changes at progress thresholds." },
        { at: 0.95, heading: "Then releases", body: "At the last frame, normal scrolling resumes." },
      ]}
    />
  );
}
