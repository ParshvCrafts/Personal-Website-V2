"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AdaptiveCanvas } from "../adaptive-canvas";
import { useScrollBridge } from "../use-scroll-bridge";
import { useThemePalette } from "../use-hero-variant";
import { latticeTargets, particleCountForTier } from "@/lib/hero/inkfield";
import type { GpuTier } from "@/lib/webgl/capabilities";

const VERT = /* glsl */ `
  attribute vec3 aSeed;
  attribute vec3 aTarget;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;
  uniform float uDpr;
  varying float vMix;

  // Cheap organic flow field: layered sines stand in for curl noise.
  vec3 flowField(vec3 p, float t) {
    return vec3(
      sin(p.y * 1.7 + t * 0.6) + sin(p.z * 1.3 + t * 0.4),
      sin(p.z * 1.5 + t * 0.5) + sin(p.x * 1.1 + t * 0.7),
      sin(p.x * 1.9 + t * 0.3) + sin(p.y * 1.2 + t * 0.5)
    ) * 0.35;
  }

  void main() {
    vec3 pos = aSeed + flowField(aSeed * 1.6, uTime);

    // Cursor vortex: tangential swirl + slight pull inside the influence radius.
    vec2 d = pos.xy - uPointer;
    float r = length(d);
    float infl = smoothstep(1.6, 0.0, r);
    pos.xy += vec2(-d.y, d.x) * infl * 0.55;
    pos.xy -= d * infl * 0.18;

    // Scroll resolves chaos into the lattice, staggered per particle.
    float m = smoothstep(0.0, 1.0, clamp((uScroll - fract(aSeed.x * 7.31) * 0.25) / 0.75, 0.0, 1.0));
    pos = mix(pos, aTarget, m);
    vMix = m;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.2 + 1.4 * fract(aSeed.y * 5.17)) * uDpr * (5.0 / max(0.5, -mv.z));
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying float vMix;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float alpha = smoothstep(0.5, 0.08, d) * uOpacity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(mix(uColorA, uColorB, vMix), alpha);
  }
`;

/** Build the initial uniform map. Called once per material mount. */
function buildUniforms(dpr: number, dark: boolean, palette: { accent: string; accent2: string; heading: string }) {
  return {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uPointer: { value: new THREE.Vector2(99, 99) }, // far away until first move
    uDpr: { value: dpr },
    uColorA: { value: new THREE.Color(dark ? palette.accent : palette.heading) },
    uColorB: { value: new THREE.Color(dark ? palette.accent2 : palette.accent) },
    uOpacity: { value: dark ? 0.85 : 0.55 },
  };
}

function Field({ tier, progressRef }: { tier: GpuTier; progressRef: { get(): number } }) {
  const palette = useThemePalette();
  const dark = palette.colorScheme === "dark";
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { gl } = useThree();
  const count = particleCountForTier(tier);
  const dpr = Math.min(gl.getPixelRatio(), 2);

  const { seeds, targets } = useMemo(() => {
    const s = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // deterministic spread across the field bounds
      const h1 = Math.sin(i * 12.9898) * 43758.5453;
      const h2 = Math.sin(i * 78.233) * 12543.853;
      const h3 = Math.sin(i * 39.425) * 26781.213;
      s[i * 3] = ((h1 - Math.floor(h1)) - 0.5) * 6.4;
      s[i * 3 + 1] = ((h2 - Math.floor(h2)) - 0.5) * 3.6;
      s[i * 3 + 2] = ((h3 - Math.floor(h3)) - 0.5) * 1.2;
    }
    return { seeds: s, targets: latticeTargets(count) };
  }, [count]);

  // Initial uniforms — rebuilt on each key change (theme/dark) via the key prop below.
  const uniforms = useMemo(
    () => buildUniforms(dpr, dark, palette),
    // dpr stable per canvas; dark+palette keys cause full remount via key prop
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    const u = mat.uniforms;
    (u.uTime as { value: number }).value += delta;
    (u.uScroll as { value: number }).value = progressRef.get();
    // pointer in scene space from r3f's normalized pointer (-1..1)
    (u.uPointer as { value: THREE.Vector2 }).value.set(state.pointer.x * 3.2, state.pointer.y * 1.8);
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[seeds, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 3]} />
        <bufferAttribute attach="attributes-aTarget" args={[targets, 3]} />
      </bufferGeometry>
      {/* key forces a clean material rebuild on theme change — swapping a live
          uniforms object identity mid-flight is an R3F pitfall */}
      <shaderMaterial
        ref={matRef}
        key={`${palette.accent}-${dark}`}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

/**
 * "Inkfield" hero — luminous ink particles in an organic flow field; the cursor
 * stirs them (vortex), scroll resolves chaos into an ordered lattice. Dark themes:
 * additive luminous ink. Light themes: normal-blended dark ink on paper (the
 * Signal film's two grades, live). Decorative only — parent mount is aria-hidden.
 */
export function InkfieldScene({ tier }: { tier: GpuTier }) {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useScrollBridge({ trigger: wrap, start: "top top", end: "bottom top" });

  return (
    <div ref={wrap} className="h-full w-full">
      <AdaptiveCanvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Field tier={tier} progressRef={progress} />
      </AdaptiveCanvas>
    </div>
  );
}
