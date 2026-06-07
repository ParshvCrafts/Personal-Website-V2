"use client";

import { useEffect, useRef } from "react";
import { ScrollSequence } from "@/components/motion/scroll-sequence";

export function PlaceholderSequence() {
  const paletteRef = useRef({
    background: "#0A0F1E",
    accent: "#00E5FF",
    accent3: "#E5FF00",
  });

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    paletteRef.current = {
      background: styles.getPropertyValue("--background").trim() || "#0A0F1E",
      accent: styles.getPropertyValue("--accent").trim() || "#00E5FF",
      accent3: styles.getPropertyValue("--accent-3").trim() || "#E5FF00",
    };
  }, []);

  const placeholderDraw = (
    ctx: CanvasRenderingContext2D,
    frame: number,
    total: number,
    { width, height }: { width: number; height: number },
  ) => {
    const p = total > 1 ? frame / (total - 1) : 0;
    const { background, accent, accent3 } = paletteRef.current;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = accent;
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
    ctx.fillStyle = accent3;
    ctx.font = "600 28px monospace";
    ctx.fillText(`FRAME ${frame + 1} / ${total}`, 32, 48);
  };

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
