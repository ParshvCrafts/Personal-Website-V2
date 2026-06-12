"use client";

import { useTheme } from "next-themes";
import { ScrollSequence } from "@/components/motion/scroll-sequence";
import { gradeForTheme } from "@/lib/sequence-grade";

/**
 * The signature scroll-scrubbed cinematic: 120 baked webp frames of the
 * "Signal" film (P15) scrubbed by the ScrollSequence engine. Two grades exist;
 * `key={grade}` remounts the engine on theme switch so it decodes the right
 * one (rare event — accepted cost, see P16 spec).
 */
export function ScrollShowpiece() {
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
