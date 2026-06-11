"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { AdaptiveCanvas } from "./adaptive-canvas";
import { useScrollBridge } from "./use-scroll-bridge";
import type { ScrollStore } from "@/lib/webgl/scroll-store";

function Knot({ progress }: { progress: ScrollStore }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    m.rotation.x += delta * 0.2;
    m.rotation.y += delta * 0.25;
    // Scroll nudges the tilt — proves the Lenis→3D bridge works.
    m.rotation.z = progress.get() * Math.PI * 0.5;
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[1, 0.32, 160, 32]} />
      <meshStandardMaterial color="#00E5FF" wireframe metalness={0.2} roughness={0.5} />
    </mesh>
  );
}

/** Throwaway end-to-end proof of the P13 rig. Lives only on /preview. */
export function ProofScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useScrollBridge({ trigger: wrap, start: "top bottom", end: "bottom top" });
  return (
    <div ref={wrap} className="relative h-[60vh] w-full">
      <AdaptiveCanvas>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.4} />
        <Knot progress={progress} />
      </AdaptiveCanvas>
    </div>
  );
}
