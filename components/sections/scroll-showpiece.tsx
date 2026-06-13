"use client";

import dynamic from "next/dynamic";
import { useShowpieceVariant } from "./showpiece/use-showpiece-variant";
import { CinematicShowpiece } from "./showpiece/cinematic-showpiece";

const KeystrokeShowpiece = dynamic(
  () => import("./showpiece/keystroke-showpiece").then((m) => m.KeystrokeShowpiece),
  { ssr: false },
);
const KeyboardShowpiece = dynamic(
  () => import("./showpiece/keyboard-showpiece").then((m) => m.KeyboardShowpiece),
  { ssr: false },
);

/** Scroll showpiece: live-switchable via `?show=cinematic|keystroke|keyboard`. */
export function ScrollShowpiece() {
  const variant = useShowpieceVariant();
  if (variant === "keystroke") return <KeystrokeShowpiece />;
  if (variant === "keyboard") return <KeyboardShowpiece />;
  return <CinematicShowpiece />;
}
