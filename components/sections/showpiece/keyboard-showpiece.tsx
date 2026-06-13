"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AdaptiveCanvas } from "@/components/three/adaptive-canvas";
import { SceneSlot } from "@/components/three/scene-slot";
import { useScrollBridge } from "@/components/three/use-scroll-bridge";
import { usePointer } from "@/components/three/use-pointer";
import { useThemePalette } from "@/components/three/use-hero-variant";
import { WORDS, wordForProgress, keyDepth } from "@/lib/showpiece/keyboard-timeline";
import type { ScrollStore } from "@/lib/webgl/scroll-store";

const MAX_KEYS = Math.max(...WORDS.map((w) => w.length)); // 12 (INTELLIGENCE)
const GAP = 0.62;

function Keyboard({
  progress,
  pointer,
  accent,
  base,
}: {
  progress: ScrollStore;
  pointer: { value: { x: number; y: number }; step(d: number): void };
  accent: string;
  base: string;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const accentColor = useMemo(() => new THREE.Color(accent), [accent]);
  const baseColor = useMemo(() => new THREE.Color(base), [base]);
  const t = useRef(0);

  useFrame((_, delta) => {
    pointer.step(delta);
    t.current += delta;
    const im = mesh.current;
    const g = group.current;
    if (!im || !g) return;

    const p = progress.get();
    const wordIdx = wordForProgress(p);
    const word = WORDS[wordIdx];
    const local = p * WORDS.length - wordIdx; // 0..1 within the active word
    const offset = -((word.length - 1) * GAP) / 2;

    for (let i = 0; i < MAX_KEYS; i++) {
      const inWord = i < word.length;
      const depth = inWord ? keyDepth(i, word.length, local) : 0;
      dummy.position.set(inWord ? offset + i * GAP : (i - MAX_KEYS / 2) * GAP, -depth * 0.18, 0);
      dummy.scale.setScalar(inWord ? 0.52 : 0.0001); // hide unused keys
      dummy.rotation.set(-0.32, 0, 0);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
      im.setColorAt(i, depth > 0.5 ? accentColor : baseColor);
    }
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;

    // gentle idle float + cursor parallax tilt
    g.rotation.x = -0.62 + Math.sin(t.current * 0.4) * 0.03 + pointer.value.y * 0.12;
    g.rotation.y = pointer.value.x * 0.2;
    g.position.y = Math.sin(t.current * 0.5) * 0.05;
  });

  return (
    <group ref={group} position={[0, 0.1, 0]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} />
      <instancedMesh ref={mesh} args={[undefined, undefined, MAX_KEYS]} frustumCulled={false}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial roughness={0.45} metalness={0.15} />
      </instancedMesh>
    </group>
  );
}

function KeyboardScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useScrollBridge({ trigger: wrap, start: "top top", end: "bottom top" });
  const pointer = usePointer();
  const palette = useThemePalette();
  return (
    <div ref={wrap} className="h-full w-full">
      <AdaptiveCanvas camera={{ position: [0, 0.6, 6], fov: 42 }}>
        <Keyboard
          progress={progress}
          pointer={pointer}
          accent={palette.accent}
          base={palette.elevated}
        />
      </AdaptiveCanvas>
    </div>
  );
}

/** Static, content-equivalent fallback (no WebGL): the three words as type. */
function KeyboardFallback() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-24 md:px-16">
      {WORDS.map((w) => (
        <p key={w} className="font-display text-4xl tracking-tight text-heading md:text-6xl">
          {w}
        </p>
      ))}
    </div>
  );
}

/**
 * 3D mechanical-keyboard showpiece: scroll "types" DATA → STRUCTURE →
 * INTELLIGENCE by depressing keycaps in sequence. Pinned for the scroll range.
 * Decorative canvas is aria-hidden; the words live in the sibling DOM (and the
 * fallback) for assistive tech and reduced motion.
 */
export function KeyboardShowpiece() {
  return (
    <section
      aria-label="Data to intelligence: scrolling types the words data, structure, and intelligence on a mechanical keyboard."
      className="relative min-h-dvh border-y border-border"
    >
      <div aria-hidden className="absolute inset-0">
        <SceneSlot
          minTier="low"
          className="h-full w-full"
          fallback={<KeyboardFallback />}
          render={() => <KeyboardScene />}
        />
      </div>
      {/* DOM word parity for AT (visually hidden; canvas carries the show). */}
      <p className="sr-only">{WORDS.join(" · ")}</p>
    </section>
  );
}
