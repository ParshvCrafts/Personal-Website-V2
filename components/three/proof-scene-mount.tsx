"use client";

import dynamic from "next/dynamic";
import { SceneSlot } from "./scene-slot";

const ProofScene = dynamic(() => import("./proof-scene").then((m) => m.ProofScene), {
  ssr: false,
});

/** Mounts the proof scene through the real SceneSlot gateway (tier + lazy gating). */
export function ProofSceneMount() {
  return (
    <SceneSlot
      minTier="low"
      className="h-[60vh] w-full overflow-hidden rounded-xl border border-border bg-surface"
      fallback={
        <div className="grid h-full place-items-center px-6 text-center font-mono text-sm text-muted">
          3D disabled (reduced motion, Save-Data, or no WebGL2). Content stays fully accessible.
        </div>
      }
      render={() => <ProofScene />}
    />
  );
}
