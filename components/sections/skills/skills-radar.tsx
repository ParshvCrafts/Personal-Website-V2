"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";

interface RadarData {
  label: string;
  value: number; // 0-100
}

const DATA: RadarData[] = [
  { label: "Languages", value: 88 },
  { label: "Data Science", value: 92 },
  { label: "ML / AI", value: 85 },
  { label: "Tools", value: 80 },
  { label: "Web Dev", value: 75 },
  { label: "Math", value: 90 },
];

const AXES = DATA.length;
const RADIUS = 90;
const CENTER = 100;

function polarToCartesian(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

/**
 * Custom SVG radar chart — premium data-viz moment for the skills section.
 *
 * Animated draw-on via GSAP stroke-dashoffset. Under reduced motion the
 * shape renders fully filled instantly. Theme-aware via CSS currentColor.
 */
export function SkillsRadar() {
  const ref = useRef<SVGSVGElement>(null);
  registerGsap();

  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const shape = svg.querySelector<SVGPathElement>("[data-radar-shape]");
        const dots = svg.querySelectorAll<SVGCircleElement>("[data-radar-dot]");
        const labels = svg.querySelectorAll<SVGTextElement>("[data-radar-label]");
        if (!shape) return;

        const len = shape.getTotalLength();
        gsap.set(shape, { strokeDasharray: len, strokeDashoffset: len });
        gsap.set(dots, { scale: 0, transformOrigin: "center" });
        gsap.set(labels, { opacity: 0, y: 4 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: svg, start: "top 85%", once: true },
        });
        tl.to(shape, { strokeDashoffset: 0, duration: 1.2, ease: "power2.out" });
        tl.to(dots, { scale: 1, duration: 0.4, stagger: 0.06, ease: "back.out(2)" }, "-=0.6");
        tl.to(labels, { opacity: 1, y: 0, duration: 0.4, stagger: 0.04 }, "-=0.8");

        return () => { tl.kill(); };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  // Build polygon points
  const points = DATA.map((d, i) => {
    const angle = (360 / AXES) * i;
    const r = (d.value / 100) * RADIUS;
    const { x, y } = polarToCartesian(angle, r);
    return { x, y, angle, label: d.label, value: d.value };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  // Grid rings
  const rings = [20, 40, 60, 80, 100];

  return (
    <div className="flex flex-col items-center">
      <svg
        ref={ref}
        viewBox="0 0 200 200"
        className="w-full max-w-[320px] text-accent"
        aria-label="Skills radar chart"
      >
        {/* Grid rings */}
        {rings.map((pct) => {
          const r = (pct / 100) * RADIUS;
          return (
            <circle
              key={pct}
              cx={CENTER}
              cy={CENTER}
              r={r}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.12}
              strokeWidth={0.5}
            />
          );
        })}

        {/* Axis lines */}
        {points.map((p) => (
          <line
            key={`axis-${p.label}`}
            x1={CENTER}
            y1={CENTER}
            x2={polarToCartesian(p.angle, RADIUS).x}
            y2={polarToCartesian(p.angle, RADIUS).y}
            stroke="currentColor"
            strokeOpacity={0.12}
            strokeWidth={0.5}
          />
        ))}

        {/* Data shape */}
        <path
          data-radar-shape
          d={pathD}
          fill="currentColor"
          fillOpacity={0.08}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />

        {/* Data dots */}
        {points.map((p) => (
          <circle
            key={`dot-${p.label}`}
            data-radar-dot
            cx={p.x}
            cy={p.y}
            r={3}
            fill="var(--background)"
            stroke="currentColor"
            strokeWidth={1.5}
          />
        ))}

        {/* Labels */}
        {points.map((p) => {
          const labelPos = polarToCartesian(p.angle, RADIUS + 18);
          const anchor =
            p.angle === 0 || p.angle === 180
              ? "middle"
              : p.angle > 180
                ? "end"
                : "start";
          return (
            <text
              key={`label-${p.label}`}
              data-radar-label
              x={labelPos.x}
              y={labelPos.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-muted"
              style={{ fontSize: 7, fontFamily: "var(--font-geist-mono), monospace" }}
            >
              {p.label}
            </text>
          );
        })}
      </svg>

      <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-widest text-muted">
        Proficiency by domain
      </p>
    </div>
  );
}
