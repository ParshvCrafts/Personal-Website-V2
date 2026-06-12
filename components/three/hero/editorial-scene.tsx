"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { AdaptiveCanvas } from "../adaptive-canvas";
import { useScrollBridge } from "../use-scroll-bridge";
import { usePointer, type Pointer } from "../use-pointer";
import { useThemePalette } from "../use-hero-variant";
import type { ScrollStore } from "@/lib/webgl/scroll-store";

interface PointerStore {
  readonly value: Pointer;
  step(delta: number): void;
}

/**
 * A slowly-distorting icosahedron in the theme accent. Continuous gentle spin,
 * scroll drifts it up + tilts it, the cursor adds a small damped parallax tilt.
 * Deliberately restrained — it never competes with the headline.
 */
function Blob({
  color,
  progress,
  pointer,
}: {
  color: string;
  progress: ScrollStore;
  pointer: PointerStore;
}) {
  const group = useRef<Group>(null);
  const mesh = useRef<Mesh>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    pointer.step(delta);
    t.current += delta;
    const g = group.current;
    const m = mesh.current;
    if (!g || !m) return;
    const p = progress.get();
    // Continuous spin + absolute cursor/scroll offsets (kept additive-free so they never drift).
    m.rotation.y = t.current * 0.16 + pointer.value.x * 0.35;
    m.rotation.x = Math.sin(t.current * 0.18) * 0.12 + pointer.value.y * 0.28 + p * 0.5;
    g.position.y = -p * 0.7; // drifts up as the hero scrolls away
    g.scale.setScalar(1 + p * 0.06);
  });

  return (
    <group ref={group} position={[1.45, 0.15, 0]}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.35, 12]} />
        <MeshDistortMaterial
          color={color}
          distort={0.32}
          speed={1.4}
          roughness={0.45}
          metalness={0.15}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

/** Restrained "Editorial" hero variant — one distorted accent form, scroll + cursor reactive. */
export function EditorialScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useScrollBridge({ trigger: wrap, start: "top top", end: "bottom top" });
  const pointer = usePointer();
  const palette = useThemePalette();

  return (
    <div ref={wrap} className="h-full w-full">
      <AdaptiveCanvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 3, 4]} intensity={1.1} />
        <Blob color={palette.accent} progress={progress} pointer={pointer} />
      </AdaptiveCanvas>
    </div>
  );
}
