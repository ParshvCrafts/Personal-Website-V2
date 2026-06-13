"use client";

import { useTheme } from "next-themes";
import { ScrollSequence } from "@/components/motion/scroll-sequence";
import { gradeForTheme } from "@/lib/sequence-grade";

/** P15/P16 signature cinematic: 120 baked Signal frames scrubbed by ScrollSequence. */
export function CinematicShowpiece() {
  const { theme } = useTheme();
  const grade = gradeForTheme(theme);
  return (
    <ScrollSequence
      key={grade}
      framePath={`/sequences/intelligence/${grade}/frame_`}
      frameExt="webp"
      frameCount={120}
      pad={4}
      width={1280}
      height={720}
      className="border-y border-border"
      alt="Macro film of ink droplets in fluid: scattered points align into filament currents and crystallize into an ordered neural lattice as you scroll."
      textBeats={[
        { at: 0, heading: "Data, everywhere", body: "Raw, scattered, noisy." },
        { at: 0.5, heading: "Structure emerges", body: "Patterns resolve as the model learns." },
        { at: 0.92, heading: "Intelligence", body: "Systems that turn signal into decisions." },
      ]}
    />
  );
}
