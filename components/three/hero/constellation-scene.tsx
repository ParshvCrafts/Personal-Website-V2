"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { Group } from "three";
import { AdaptiveCanvas } from "../adaptive-canvas";
import { useScrollBridge } from "../use-scroll-bridge";
import { usePointer, type Pointer } from "../use-pointer";
import { useThemePalette } from "../use-hero-variant";
import type { ScrollStore } from "@/lib/webgl/scroll-store";

interface PointerStore {
  readonly value: Pointer;
  step(delta: number): void;
}

const NODE_COUNT = 700;
const RADIUS = 2.2;

/** Evenly distribute N points on a sphere (fibonacci spiral). */
function fibonacciSphere(n: number, r: number): Float32Array {
  const pos = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pos[i * 3] = Math.cos(theta) * radius * r;
    pos[i * 3 + 1] = y * r;
    pos[i * 3 + 2] = Math.sin(theta) * radius * r;
  }
  return pos;
}

/** Build deduped line segments from each node to its `k` nearest neighbors. */
function buildLinks(pos: Float32Array, k: number): Float32Array {
  const n = pos.length / 3;
  const segs: number[] = [];
  const seen = new Set<number>();
  const dists: { j: number; d: number }[] = [];
  for (let i = 0; i < n; i++) {
    dists.length = 0;
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const dx = pos[i * 3] - pos[j * 3];
      const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
      const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
      dists.push({ j, d: dx * dx + dy * dy + dz * dz });
    }
    dists.sort((a, b) => a.d - b.d);
    for (let kk = 0; kk < k && kk < dists.length; kk++) {
      const j = dists[kk].j;
      const key = i < j ? i * n + j : j * n + i;
      if (seen.has(key)) continue;
      seen.add(key);
      segs.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]);
    }
  }
  return new Float32Array(segs);
}

function Constellation({
  pointColor,
  lineColor,
  progress,
  pointer,
}: {
  pointColor: string;
  lineColor: string;
  progress: ScrollStore;
  pointer: PointerStore;
}) {
  const group = useRef<Group>(null);
  const t = useRef(0);
  const points = useMemo(() => fibonacciSphere(NODE_COUNT, RADIUS), []);
  const links = useMemo(() => buildLinks(points, 2), [points]);

  useFrame((_, delta) => {
    pointer.step(delta);
    t.current += delta;
    const g = group.current;
    if (!g) return;
    const p = progress.get();
    g.rotation.y = t.current * (0.06 + p * 0.25) + pointer.value.x * 0.4;
    g.rotation.x = pointer.value.y * 0.3 + p * 0.2;
    g.scale.setScalar(1 + p * 0.15);
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={pointColor}
          size={0.035}
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[links, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={lineColor} transparent opacity={0.12} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

/** Bold "Constellation" hero variant — a rotating neural node-field with bloom. */
export function ConstellationScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useScrollBridge({ trigger: wrap, start: "top top", end: "bottom top" });
  const pointer = usePointer();
  const palette = useThemePalette();

  return (
    <div ref={wrap} className="h-full w-full">
      <AdaptiveCanvas camera={{ position: [0, 0, 6], fov: 45 }} maxDpr={1.75}>
        <Constellation
          pointColor={palette.accent}
          lineColor={palette.accent2}
          progress={progress}
          pointer={pointer}
        />
        <EffectComposer>
          <Bloom intensity={0.8} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur radius={0.6} />
        </EffectComposer>
      </AdaptiveCanvas>
    </div>
  );
}
