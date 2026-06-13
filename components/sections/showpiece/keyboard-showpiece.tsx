"use client";

import { useMemo, useRef, useState } from "react";
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
const GAP = 0.66;

interface KeyboardState {
  wordIndex: number;
  pressed: number;
}

function Keyboard({
  progress,
  pointer,
  cap,
  accent,
  onState,
}: {
  progress: ScrollStore;
  pointer: { value: { x: number; y: number }; step(d: number): void };
  cap: string;
  accent: string;
  onState: (s: KeyboardState) => void;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const capColor = useMemo(() => new THREE.Color(cap), [cap]);
  const accentColor = useMemo(() => new THREE.Color(accent), [accent]);
  const t = useRef(0);
  const last = useRef<KeyboardState>({ wordIndex: -1, pressed: -1 });

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
    let pressed = 0;

    for (let i = 0; i < MAX_KEYS; i++) {
      const inWord = i < word.length;
      const depth = inWord ? keyDepth(i, word.length, local) : 0;
      if (inWord && local >= (i + 0.5) / word.length) pressed += 1;
      dummy.position.set(
        inWord ? offset + i * GAP : (i - MAX_KEYS / 2) * GAP,
        -depth * 0.22,
        0,
      );
      dummy.scale.set(inWord ? 0.56 : 0.0001, inWord ? 0.3 : 0.0001, inWord ? 0.56 : 0.0001);
      dummy.rotation.set(-0.34, 0, 0);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
      // Pressed keys flash to the theme accent; resting keys use the high-contrast
      // cap color (theme foreground), readable on both dark and light themes.
      im.setColorAt(i, depth > 0.45 ? accentColor : capColor);
    }
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;

    // Report word/typed state to the DOM caption only when it actually changes.
    if (last.current.wordIndex !== wordIdx || last.current.pressed !== pressed) {
      last.current = { wordIndex: wordIdx, pressed };
      onState({ wordIndex: wordIdx, pressed });
    }

    // gentle idle float + cursor parallax tilt
    g.rotation.x = -0.5 + Math.sin(t.current * 0.4) * 0.03 + pointer.value.y * 0.12;
    g.rotation.y = pointer.value.x * 0.2;
    g.position.y = Math.sin(t.current * 0.5) * 0.05;
  });

  return (
    <group ref={group} position={[0, 0.2, 0]}>
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 6, 5]} intensity={1.2} />
      <pointLight position={[0, 2, 3]} intensity={18} color={accent} distance={12} />
      <instancedMesh ref={mesh} args={[undefined, undefined, MAX_KEYS]} frustumCulled={false}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial roughness={0.35} metalness={0.2} emissive={accent} emissiveIntensity={0.12} />
      </instancedMesh>
    </group>
  );
}

function KeyboardScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useScrollBridge({ trigger: wrap, start: "top top", end: "bottom top" });
  const pointer = usePointer();
  const palette = useThemePalette();
  const [state, setState] = useState<KeyboardState>({ wordIndex: 0, pressed: 0 });

  const word = WORDS[state.wordIndex];
  const typed = word.slice(0, state.pressed);
  const rest = word.slice(state.pressed);

  return (
    <div ref={wrap} className="relative h-full w-full">
      <AdaptiveCanvas camera={{ position: [0, 0.6, 7], fov: 42 }}>
        <Keyboard
          progress={progress}
          pointer={pointer}
          cap={palette.foreground}
          accent={palette.accent}
          onState={setState}
        />
      </AdaptiveCanvas>
      {/* Synchronized typographic caption — tells the word the keys are typing,
          legible and on-brand. aria-hidden (the section label carries the story). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[14%] flex flex-col items-center gap-2 px-6 text-center"
      >
        <span className="font-mono text-xs uppercase tracking-[0.4em] text-muted">
          {`0${state.wordIndex + 1}`} / 0{WORDS.length}
        </span>
        <span className="font-display text-4xl tracking-tight text-heading md:text-6xl">
          {typed}
          <span className="text-muted/40">{rest}</span>
        </span>
      </div>
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
 * INTELLIGENCE by depressing keycaps in sequence, with a synchronized
 * typographic caption. Pinned for the scroll range. Decorative canvas is
 * aria-hidden; the words live in the sibling DOM (and the fallback) for
 * assistive tech and reduced motion.
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
