# Portfolio V2 Animation & Motion Guide

## Core Philosophy

All motion in V2 is built around three core principles:
1. **Additive, not prescriptive**: Animations enhance the experience but are never required to understand the content.
2. **Performance first**: We only animate CSS properties that can be GPU-composited (`transform` and `opacity`).
3. **Accessibility by default**: Every single animation is gated by a `prefers-reduced-motion` check.

## Technology Stack

- **GSAP (GreenSock)**: Used for all complex choreography, scroll-driven animations, and staggered reveals.
- **Tailwind CSS**: Used for simple hover states, transitions, and utility-based keyframes (e.g., `animate-pulse`, `animate-bounce`).
- **React View Transitions**: Used for seamless layout morphing (e.g., expanding a project card into a modal).

## Key Components

### 1. `ScrollReveal` (`components/motion/scroll-reveal.tsx`)
The workhorse for scroll-triggered entrance animations. It offers 5 variants:
- `fade-rise`: Classic opacity fade and upward slide.
- `clip-up`: A CSS `clip-path` wipe from bottom to top.
- `clip-left`: A CSS `clip-path` wipe from left to right (used for editorial headers).
- `blur-in`: Opacity fade combined with a CSS `blur(8px)` dropoff.
- `stagger-cascade`: Staggers children with a cascading x/y offset.

### 2. `Parallax` (`components/motion/parallax.tsx`)
Creates subtle depth layering by moving elements at different speeds relative to the scroll position. Used extensively in section headers (the eyebrow moves slightly faster, the description slightly slower, creating a 3D depth effect).

### 3. `ClickSpark` (`components/motion/click-spark.tsx`)
A global micro-interaction that spawns 6 tiny accent-colored particles radiating outward on any interactive click (`button`, `a`, `[role="button"]`). It is purely behavioral and renders zero DOM on mount.

### 4. `MarqueeTicker` (`components/motion/marquee-ticker.tsx`)
An infinite-scrolling marquee used for the "Fun Facts" strip in the About section. It duplicates content to create a seamless loop and pauses on hover.

### 5. `ProgressiveImage` (`components/ui/progressive-image.tsx`)
A wrapper around `next/image` that implements a smooth blur-up/fade-in animation when the image fully loads, avoiding harsh pop-ins.

## Accessibility (A11y)

### Reduced Motion
All GSAP animations are wrapped in a `gsap.matchMedia()` context:
```typescript
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: no-preference)", () => {
  // Animation logic goes here
});
```

### Motion Preference Toggle
Users can manually toggle animations on or off via the `AnimationToggle` button in the navigation bar. This uses the `MotionPreferenceProvider` to set a `data-reduce-motion` attribute on the `<html>` tag, which is picked up by a global CSS rule to instantly disable all CSS transitions and animations.

## Interactive Highlights

- **Journey Timeline**: The spine line draws itself as you scroll (`scaleY` scrub), and milestone dots pop and change color as they enter the viewport.
- **Project Cards**: Featured project images have a subtle cursor-tracking parallax effect (`translate` based on mouse position relative to the card center).
- **Terminal Glow**: The terminal section features a subtle CSS scanline overlay and an accent-colored hover glow (`box-shadow`).
- **Code Showcase**: Changing tabs triggers a typewriter wipe effect (`clip-path: inset(0 X% 0 0)`) on the active code block.
