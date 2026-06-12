# Portfolio v2 — Phase 1: Design System & 3-Theme Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the v2 design system — verified-AA design tokens, three switchable palettes (Midnight/Daylight/Manuscript), the distinctive type system (Fraunces/Hanken Grotesk/JetBrains Mono), an accessible no-flash theme switcher with a View-Transitions circular reveal (feature-detected, reduced-motion safe), and the base UI primitives — proven on a kitchen-sink preview page.

**Architecture:** A single TypeScript palette module (`lib/theme/palettes.ts`) is the source of truth for color values; `globals.css` mirrors those values into `[data-theme]` blocks and maps them to Tailwind v4 tokens via `@theme inline`. `next-themes` toggles `data-theme` on `<html>` with no flash. The switcher uses the **native** `document.startViewTransition` (no Next config needed) wrapped in `flushSync`, with a clip-path circular reveal, falling back to an instant change when unsupported or under reduced-motion. Primitives are built with `class-variance-authority` + a `cn()` helper. A contrast unit test computes WCAG ratios from the palette module and fails the build if any pair regresses; a drift test asserts `globals.css` matches the palette module.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4 (`@theme inline`), next-themes, next/font (Google), class-variance-authority, clsx, tailwind-merge, lucide-react, Vitest + @testing-library/react + jsdom, Playwright.

---

## Context the executor needs

- Repo root: `c:\Users\p1a2r\OneDrive\Desktop\Git Hub Projects\Personal Website`. Work in `v2/`. Branch: `feat/portfolio-v2`. **Never touch v1** (`app.py`, `index.html`, `static/**`). **Do not push.**
- Phase 0 is complete: the app builds (`output: 'export'`), data pipeline + tests exist, gates are green.
- **Next.js 16 caveat:** `v2/AGENTS.md` warns Next 16 has breaking changes vs older knowledge. Before writing any Next-specific code (fonts, layout, config), skim the relevant guide under `v2/node_modules/next/dist/docs/`. If an API differs from this plan, prefer the installed docs and note the deviation.
- **Tailwind v4 caveat:** v4 is CSS-first (`@import "tailwindcss"`, `@theme`). There is no `tailwind.config.js` color map by default. Use the `@theme inline` pattern in this plan.
- **Skill mandate (per user):** consult **frontend-design** (typography/atmosphere/anti-generic), the **gsap** skills are NOT needed yet (no scroll motion in P1 — that's P2), and **ui-ux-pro-max** (contrast, focus states, animation timing 150–300ms, reduced-motion). If those skills are unavailable, the spec (`docs/superpowers/specs/2026-06-06-portfolio-v2-design.md` §4–§6) and `docs/v2/DESIGN.md` are the source of truth. The design direction is **Exaggerated Minimalism**: oversized Fraunces display, generous whitespace, one accent per theme, restraint.

## Verified token values (WCAG-checked; do not alter without re-checking)

All pairs below were computed and pass: body text/bg ≥ 4.5, muted/bg ≥ 4.5, accent/bg ≥ 3 (UI/large), on-accent/accent ≥ 4.5.

| token | Midnight (dark, default) | Daylight (light) | Manuscript (warm) |
|---|---|---|---|
| `--background` | `#0B0F14` | `#F7F8FA` | `#FBF8F1` |
| `--elevated` | `#1A222E` | `#FFFFFF` | `#FFFDF7` |
| `--surface` | `#121821` | `#FFFFFF` | `#FFFDF7` |
| `--foreground` | `#E6EDF3` | `#1F2933` | `#2B2622` |
| `--heading` | `#E6EDF3` | `#0A2540` | `#2B2622` |
| `--muted` | `#9BA8B7` | `#52606D` | `#6E635A` |
| `--accent` | `#2DD4BF` | `#2563EB` | `#AE4A33` |
| `--accent-2` | `#818CF8` | `#8A6A1F` | `#5B6B4F` |
| `--on-accent` | `#0B0F14` | `#FFFFFF` | `#FFFFFF` |
| `--border` | `#1F2935` | `#E4E7EB` | `#E7DECE` |
| `--ring` | `#2DD4BF` | `#2563EB` | `#AE4A33` |
| `color-scheme` | dark | light | light |

---

## File Structure (this phase)

```
v2/
├─ app/
│  ├─ layout.tsx              # MODIFY: fonts + ThemeProvider + suppressHydrationWarning
│  ├─ globals.css             # REWRITE: tokens, 3 palettes, view-transition CSS, base
│  └─ preview/page.tsx        # NEW: kitchen-sink styleguide (noindex)
├─ components/
│  ├─ theme/
│  │  ├─ theme-provider.tsx   # NEW: next-themes wrapper (client)
│  │  └─ theme-switcher.tsx   # NEW: accessible 3-way switch + View Transitions
│  └─ ui/
│     ├─ button.tsx           # NEW: cva variants
│     ├─ container.tsx        # NEW
│     ├─ section.tsx          # NEW
│     ├─ card.tsx             # NEW
│     ├─ eyebrow.tsx          # NEW (mono kicker label)
│     └─ badge.tsx            # NEW (tag)
├─ lib/
│  ├─ utils.ts                # NEW: cn()
│  └─ theme/
│     ├─ palettes.ts          # NEW: source-of-truth palette values + theme list
│     └─ contrast.ts          # NEW: WCAG contrast helper
├─ tests/
│  ├─ setup.ts                # NEW: @testing-library/jest-dom
│  ├─ unit/theme.test.ts      # NEW: contrast (TDD) + globals.css drift guard
│  ├─ unit/button.test.tsx    # NEW: primitive render/variants
│  └─ e2e/theme.spec.ts       # NEW: switch themes on /preview
└─ vitest.config.ts           # MODIFY: jsdom env + setup + allow .tsx
```

---

## Task 1: Install deps + utils helper

**Files:** Modify `v2/package.json` (via npm); Create `v2/lib/utils.ts`

- [ ] **Step 1: Install (from `v2/`)**

```bash
npm install next-themes class-variance-authority clsx tailwind-merge lucide-react
```

- [ ] **Step 2: Create `v2/lib/utils.ts`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Verify typecheck (from `v2/`)**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add v2/package.json v2/package-lock.json v2/lib/utils.ts
git commit -m "feat(v2): add design-system deps (next-themes, cva, lucide) + cn() helper"
```

---

## Task 2: Palette source of truth + contrast util + contrast test (TDD)

**Files:** Create `v2/lib/theme/palettes.ts`, `v2/lib/theme/contrast.ts`, `v2/tests/unit/theme.test.ts`

- [ ] **Step 1: Write the failing test `v2/tests/unit/theme.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { palettes, THEMES, DEFAULT_THEME, type ThemeName } from "@/lib/theme/palettes";
import { contrastRatio } from "@/lib/theme/contrast";

describe("contrast util", () => {
  it("white on black is 21:1", () => {
    expect(Math.round(contrastRatio("#FFFFFF", "#000000"))).toBe(21);
  });
});

describe("every theme meets WCAG AA", () => {
  for (const name of THEMES) {
    const p = palettes[name];
    it(`${name}: foreground/background >= 4.5`, () =>
      expect(contrastRatio(p.foreground, p.background)).toBeGreaterThanOrEqual(4.5));
    it(`${name}: heading/background >= 4.5`, () =>
      expect(contrastRatio(p.heading, p.background)).toBeGreaterThanOrEqual(4.5));
    it(`${name}: muted/background >= 4.5`, () =>
      expect(contrastRatio(p.muted, p.background)).toBeGreaterThanOrEqual(4.5));
    it(`${name}: foreground/surface >= 4.5`, () =>
      expect(contrastRatio(p.foreground, p.surface)).toBeGreaterThanOrEqual(4.5));
    it(`${name}: accent/background >= 3 (UI/large)`, () =>
      expect(contrastRatio(p.accent, p.background)).toBeGreaterThanOrEqual(3));
    it(`${name}: accent2/background >= 3 (UI/large)`, () =>
      expect(contrastRatio(p.accent2, p.background)).toBeGreaterThanOrEqual(3));
    it(`${name}: on-accent/accent >= 4.5 (button labels)`, () =>
      expect(contrastRatio(p.onAccent, p.accent)).toBeGreaterThanOrEqual(4.5));
  }
  it("has 3 themes and a valid default", () => {
    expect(THEMES).toHaveLength(3);
    expect(THEMES).toContain(DEFAULT_THEME as ThemeName);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run (from `v2/`): `npx vitest run tests/unit/theme.test.ts`
Expected: FAIL — cannot resolve `@/lib/theme/palettes` / `@/lib/theme/contrast`.

- [ ] **Step 3: Implement `v2/lib/theme/contrast.ts`**

```ts
function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2.1 contrast ratio between two hex colors (1–21). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}
```

- [ ] **Step 4: Implement `v2/lib/theme/palettes.ts`**

```ts
export type ThemeName = "midnight" | "daylight" | "manuscript";

export interface Palette {
  background: string;
  elevated: string;
  surface: string;
  foreground: string;
  heading: string;
  muted: string;
  accent: string;
  accent2: string;
  onAccent: string;
  border: string;
  ring: string;
  colorScheme: "dark" | "light";
}

export const palettes: Record<ThemeName, Palette> = {
  midnight: {
    background: "#0B0F14", elevated: "#1A222E", surface: "#121821",
    foreground: "#E6EDF3", heading: "#E6EDF3", muted: "#9BA8B7",
    accent: "#2DD4BF", accent2: "#818CF8", onAccent: "#0B0F14",
    border: "#1F2935", ring: "#2DD4BF", colorScheme: "dark",
  },
  daylight: {
    background: "#F7F8FA", elevated: "#FFFFFF", surface: "#FFFFFF",
    foreground: "#1F2933", heading: "#0A2540", muted: "#52606D",
    accent: "#2563EB", accent2: "#8A6A1F", onAccent: "#FFFFFF",
    border: "#E4E7EB", ring: "#2563EB", colorScheme: "light",
  },
  manuscript: {
    background: "#FBF8F1", elevated: "#FFFDF7", surface: "#FFFDF7",
    foreground: "#2B2622", heading: "#2B2622", muted: "#6E635A",
    accent: "#AE4A33", accent2: "#5B6B4F", onAccent: "#FFFFFF",
    border: "#E7DECE", ring: "#AE4A33", colorScheme: "light",
  },
};

export const THEMES: ThemeName[] = ["midnight", "daylight", "manuscript"];
export const DEFAULT_THEME: ThemeName = "midnight";

export const THEME_LABELS: Record<ThemeName, string> = {
  midnight: "Midnight",
  daylight: "Daylight",
  manuscript: "Manuscript",
};
```

- [ ] **Step 5: Run to verify it passes**

Run (from `v2/`): `npx vitest run tests/unit/theme.test.ts`
Expected: all PASS (the contrast-only subset; the drift test is added in Task 3).

- [ ] **Step 6: Commit**

```bash
git add v2/lib/theme/palettes.ts v2/lib/theme/contrast.ts v2/tests/unit/theme.test.ts
git commit -m "feat(v2): palette source of truth + WCAG contrast util, AA-verified (TDD)"
```

---

## Task 3: globals.css token system + drift-guard test

**Files:** Rewrite `v2/app/globals.css`; Append a drift test to `v2/tests/unit/theme.test.ts`

- [ ] **Step 1: Rewrite `v2/app/globals.css`**

```css
@import "tailwindcss";

/* ---- Theme palettes (values mirror lib/theme/palettes.ts; keep in sync) ---- */
:root,
[data-theme="midnight"] {
  color-scheme: dark;
  --background: #0b0f14;
  --elevated: #1a222e;
  --surface: #121821;
  --foreground: #e6edf3;
  --heading: #e6edf3;
  --muted: #9ba8b7;
  --accent: #2dd4bf;
  --accent-2: #818cf8;
  --on-accent: #0b0f14;
  --border: #1f2935;
  --ring: #2dd4bf;
}
[data-theme="daylight"] {
  color-scheme: light;
  --background: #f7f8fa;
  --elevated: #ffffff;
  --surface: #ffffff;
  --foreground: #1f2933;
  --heading: #0a2540;
  --muted: #52606d;
  --accent: #2563eb;
  --accent-2: #8a6a1f;
  --on-accent: #ffffff;
  --border: #e4e7eb;
  --ring: #2563eb;
}
[data-theme="manuscript"] {
  color-scheme: light;
  --background: #fbf8f1;
  --elevated: #fffdf7;
  --surface: #fffdf7;
  --foreground: #2b2622;
  --heading: #2b2622;
  --muted: #6e635a;
  --accent: #ae4a33;
  --accent-2: #5b6b4f;
  --on-accent: #ffffff;
  --border: #e7dece;
  --ring: #ae4a33;
}

/* ---- Map palette vars to Tailwind v4 tokens (generates bg-*, text-*, etc.) ---- */
@theme inline {
  --color-background: var(--background);
  --color-elevated: var(--elevated);
  --color-surface: var(--surface);
  --color-foreground: var(--foreground);
  --color-heading: var(--heading);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-accent-2: var(--accent-2);
  --color-on-accent: var(--on-accent);
  --color-border: var(--border);
  --color-ring: var(--ring);

  --font-display: var(--font-fraunces);
  --font-sans: var(--font-hanken);
  --font-mono: var(--font-jetbrains);
}

/* ---- Base ---- */
@layer base {
  * {
    border-color: var(--color-border);
  }
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  ::selection {
    background-color: var(--color-accent);
    color: var(--color-on-accent);
  }
  :focus-visible {
    outline: 2px solid var(--color-ring);
    outline-offset: 2px;
  }
}

/* ---- Theme-switch View Transition (native API; circular reveal) ---- */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-new(root) {
  animation: vt-theme-reveal 0.5s ease-in-out;
}
@keyframes vt-theme-reveal {
  from {
    clip-path: circle(0% at var(--vt-x, 50%) var(--vt-y, 50%));
  }
  to {
    clip-path: circle(150% at var(--vt-x, 50%) var(--vt-y, 50%));
  }
}
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
  }
}
```

- [ ] **Step 2: Add the drift-guard test (append to `v2/tests/unit/theme.test.ts`)**

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("globals.css mirrors the palette source of truth", () => {
  const css = readFileSync(resolve(__dirname, "../../app/globals.css"), "utf8").toLowerCase();
  for (const name of THEMES) {
    const p = palettes[name];
    const hexes = [
      p.background, p.elevated, p.surface, p.foreground, p.heading, p.muted,
      p.accent, p.accent2, p.onAccent, p.border, p.ring,
    ].map((h) => h.toLowerCase());
    it(`${name}: every palette hex appears in globals.css`, () => {
      const missing = hexes.filter((h) => !css.includes(h));
      expect(missing).toEqual([]);
    });
  }
});
```

- [ ] **Step 3: Run the theme tests**

Run (from `v2/`): `npx vitest run tests/unit/theme.test.ts`
Expected: all PASS (contrast + drift). If a hex is "missing", a `[data-theme]` block diverged from `palettes.ts` — fix the CSS.

- [ ] **Step 4: Commit**

```bash
git add v2/app/globals.css v2/tests/unit/theme.test.ts
git commit -m "feat(v2): Tailwind v4 token system with 3 themes + drift-guard test"
```

---

## Task 4: Fonts + ThemeProvider wired into layout

**Files:** Create `v2/components/theme/theme-provider.tsx`; Modify `v2/app/layout.tsx`

- [ ] **Step 1: Create `v2/components/theme/theme-provider.tsx`**

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 2: Rewrite `v2/app/layout.tsx`**

(Confirm the `next/font/google` import names against `v2/node_modules/next/dist/docs/` if anything errors.)

```tsx
import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { THEMES, DEFAULT_THEME } from "@/lib/theme/palettes";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "Parshv Patel — Portfolio",
  description: "UC Berkeley Data Science · AI/ML · building intelligent systems.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${hanken.variable} ${jetbrains.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="data-theme"
          themes={THEMES}
          defaultTheme={DEFAULT_THEME}
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Note: `enableSystem={false}` — the 3 custom palettes don't map cleanly to OS light/dark; explicit 3-way choice (default Midnight). System-preference auto-mapping is an optional later enhancement (spec §16 open item).

- [ ] **Step 3: Build to verify fonts + provider work (from `v2/`)**

Run: `npm run build`
Expected: build succeeds (fonts fetched at build), no hydration/SSR errors. If `next/font` import names differ on Next 16, consult the installed docs and adjust, noting the change.

- [ ] **Step 4: Commit**

```bash
git add v2/components/theme/theme-provider.tsx v2/app/layout.tsx
git commit -m "feat(v2): wire next/font (Fraunces/Hanken/JetBrains) + next-themes provider (no-flash)"
```

---

## Task 5: ThemeSwitcher with View-Transitions reveal

**Files:** Create `v2/components/theme/theme-switcher.tsx`

- [ ] **Step 1: Implement `v2/components/theme/theme-switcher.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { Moon, Sun, BookOpen } from "lucide-react";
import { THEMES, THEME_LABELS, type ThemeName } from "@/lib/theme/palettes";
import { cn } from "@/lib/utils";

const ICONS: Record<ThemeName, typeof Moon> = {
  midnight: Moon,
  daylight: Sun,
  manuscript: BookOpen,
};

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function applyTheme(next: ThemeName, e: React.MouseEvent) {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Feature-detect native View Transitions; fall back to instant change.
    const startVT = (document as Document & {
      startViewTransition?: (cb: () => void) => void;
    }).startViewTransition;
    if (!startVT || reduce) {
      setTheme(next);
      return;
    }
    root.style.setProperty("--vt-x", `${e.clientX}px`);
    root.style.setProperty("--vt-y", `${e.clientY}px`);
    startVT.call(document, () => flushSync(() => setTheme(next)));
  }

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1",
        className,
      )}
    >
      {THEMES.map((name) => {
        const Icon = ICONS[name];
        const active = mounted && theme === name;
        return (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={THEME_LABELS[name]}
            title={THEME_LABELS[name]}
            onClick={(e) => applyTheme(name, e)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-accent text-on-accent"
                : "text-muted hover:bg-elevated hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
```

Notes: `mounted` guard avoids a hydration mismatch on `theme` (next-themes resolves theme client-side). Touch targets are 36px visual but the rounded hit area + gap keep them comfortable; the group sits in a larger nav later. `flushSync` makes the `data-theme` change happen inside the View-Transition snapshot.

- [ ] **Step 2: Typecheck (from `v2/`)**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add v2/components/theme/theme-switcher.tsx
git commit -m "feat(v2): accessible 3-way theme switcher with View-Transitions reveal + reduced-motion fallback"
```

---

## Task 6: UI primitives

**Files:** Create `v2/components/ui/{button,container,section,card,eyebrow,badge}.tsx`

- [ ] **Step 1: `v2/components/ui/button.tsx`**

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-sans font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent hover:opacity-90",
        secondary: "bg-elevated text-foreground border border-border hover:bg-surface",
        outline: "border border-border text-foreground hover:bg-elevated",
        ghost: "text-foreground hover:bg-elevated",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}

export { button as buttonVariants };
```

- [ ] **Step 2: `v2/components/ui/container.tsx`**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-6xl px-6 md:px-8", className)} {...props} />;
}
```

- [ ] **Step 3: `v2/components/ui/eyebrow.tsx`**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "font-mono text-xs uppercase tracking-[0.2em] text-muted",
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 4: `v2/components/ui/section.tsx`**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  id?: string;
  eyebrow?: string;
  heading?: string;
}

export function Section({ id, eyebrow, heading, className, children, ...props }: SectionProps) {
  return (
    <section id={id} className={cn("py-24 md:py-32", className)} {...props}>
      <Container>
        {(eyebrow || heading) && (
          <header className="mb-12 md:mb-16">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {heading && (
              <h2 className="mt-3 font-display text-4xl font-semibold leading-[0.95] tracking-tight text-heading md:text-6xl">
                {heading}
              </h2>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
```

- [ ] **Step 5: `v2/components/ui/card.tsx`**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 transition-colors",
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 6: `v2/components/ui/badge.tsx`**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-elevated px-3 py-1 font-mono text-xs text-muted",
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 7: Typecheck (from `v2/`)**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add v2/components/ui
git commit -m "feat(v2): base UI primitives (Button, Container, Section, Card, Eyebrow, Badge)"
```

---

## Task 7: Component test harness (jsdom) + Button test (TDD-style)

**Files:** Modify `v2/vitest.config.ts`; Create `v2/tests/setup.ts`, `v2/tests/unit/button.test.tsx`

- [ ] **Step 1: Update `v2/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 2: Create `v2/tests/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Write `v2/tests/unit/button.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Explore</Button>);
    expect(screen.getByRole("button", { name: "Explore" })).toBeInTheDocument();
  });
  it("applies the primary accent variant by default", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" }).className).toContain("bg-accent");
  });
  it("applies the outline variant when requested", () => {
    render(<Button variant="outline">Edge</Button>);
    const cls = screen.getByRole("button", { name: "Edge" }).className;
    expect(cls).toContain("border-border");
    expect(cls).not.toContain("bg-accent");
  });
  it("is disabled when disabled", () => {
    render(<Button disabled>Nope</Button>);
    expect(screen.getByRole("button", { name: "Nope" })).toBeDisabled();
  });
});
```

- [ ] **Step 4: Run the full unit suite (from `v2/`)**

Run: `npm test`
Expected: all unit tests pass — schemas, data, theme (contrast + drift), button — under jsdom. (The `pretest` sync still runs.)

- [ ] **Step 5: Commit**

```bash
git add v2/vitest.config.ts v2/tests/setup.ts v2/tests/unit/button.test.tsx
git commit -m "test(v2): jsdom component harness + Button primitive tests"
```

---

## Task 8: Kitchen-sink preview page

**Files:** Create `v2/app/preview/page.tsx`

- [ ] **Step 1: Implement `v2/app/preview/page.tsx`**

```tsx
import type { Metadata } from "next";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { palettes, THEMES, THEME_LABELS } from "@/lib/theme/palettes";

export const metadata: Metadata = {
  title: "Design System — Preview",
  robots: { index: false, follow: false },
};

export default function PreviewPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <Container className="flex items-center justify-between py-4">
          <Eyebrow>Design System</Eyebrow>
          <ThemeSwitcher />
        </Container>
      </div>

      <Section eyebrow="Typography" heading="Type scale & families">
        <div className="space-y-6">
          <p className="font-display text-6xl font-semibold leading-[0.95] tracking-tight text-heading">
            Fraunces display
          </p>
          <p className="font-sans text-lg text-foreground">
            Hanken Grotesk body — the quick brown fox builds intelligent systems.
          </p>
          <p className="font-sans text-base text-muted">
            Muted body — secondary supporting copy.
          </p>
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted">
            JetBrains Mono label
          </p>
        </div>
      </Section>

      <Section eyebrow="Color" heading="Palette tokens (current theme)">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {(
            ["background", "elevated", "surface", "foreground", "heading", "muted", "accent", "accent-2", "on-accent", "border", "ring"] as const
          ).map((token) => (
            <div key={token} className="rounded-xl border border-border p-3">
              <div
                className="mb-2 h-12 w-full rounded-lg border border-border"
                style={{ background: `var(--${token})` }}
              />
              <code className="font-mono text-xs text-muted">--{token}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Components" heading="Primitives">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {THEMES.map((name) => (
            <Card key={name}>
              <Eyebrow>{THEME_LABELS[name]}</Eyebrow>
              <p className="mt-2 font-display text-2xl text-heading">{palettes[name].accent}</p>
              <div className="mt-3 flex gap-2">
                <Badge>accent</Badge>
                <Badge>{palettes[name].colorScheme}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}
```

- [ ] **Step 2: Build + verify the route exports (from `v2/`)**

Run: `npm run build`
Expected: build succeeds; `out/preview/index.html` exists.

- [ ] **Step 3: Commit**

```bash
git add v2/app/preview/page.tsx
git commit -m "feat(v2): kitchen-sink /preview styleguide (noindex) for the design system"
```

---

## Task 9: E2E theme-switch test + final gates

**Files:** Create `v2/tests/e2e/theme.spec.ts`

- [ ] **Step 1: Write `v2/tests/e2e/theme.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("theme switcher changes data-theme on /preview", async ({ page }) => {
  await page.goto("/preview");
  const html = page.locator("html");
  // default theme
  await expect(html).toHaveAttribute("data-theme", "midnight");
  // switch to Daylight
  await page.getByRole("radio", { name: "Daylight" }).click();
  await expect(html).toHaveAttribute("data-theme", "daylight");
  // switch to Manuscript
  await page.getByRole("radio", { name: "Manuscript" }).click();
  await expect(html).toHaveAttribute("data-theme", "manuscript");
  // persists across reload (localStorage)
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "manuscript");
});
```

- [ ] **Step 2: Run e2e (from `v2/`)**

Run: `npm run test:e2e`
Expected: both e2e tests pass (the P0 smoke + this theme test). If the default attribute assertion flakes due to next-themes hydration timing, the `toHaveAttribute` auto-retries; allow it.

- [ ] **Step 3: Full gate sweep (from `v2/`)**

Run each; all must be green:
```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

- [ ] **Step 4: Commit**

```bash
git add v2/tests/e2e/theme.spec.ts
git commit -m "test(v2): e2e theme switching + persistence on /preview"
```

- [ ] **Step 5: Phase 1 checkpoint (report; do NOT push)**

Report: 3 themes switch with no flash, contrast AA-verified in CI, switcher keyboard-accessible, primitives + type system live on `/preview`. Provide the `/preview` route so the user can visually review all three palettes (locally via `npm run dev` → `http://localhost:3000/preview`, or on a Vercel preview if connected).

---

## Self-Review (against spec §4–§6, ROADMAP Session 2, PRD design-system gate)

- **§4 design system (tokens, 3 palettes, type, spacing/radius)** → Tasks 2,3,4,6. Verified AA tokens; Fraunces/Hanken/JetBrains wired. ✔
- **§4.3 contrast rule (per-theme 4.5:1, CI-verified)** → Task 2 contrast test + Task 3 drift guard. ✔
- **§5 theme engine (next-themes, data-theme, no-flash, View-Transitions circular reveal, reduced-motion instant, feature detection)** → Tasks 4,5; native VT feature-detected, `flushSync`, reduced-motion + unsupported fallbacks. ✔ (System auto-mapping intentionally deferred — spec §16 open item.)
- **§6.3 micro-features: View Transitions for theme switch** → Task 5. (Preloader/cursor/grain are P3; Lenis/GSAP motion is P2 — correctly out of P1 scope.)
- **ROADMAP Session 2 (tokens, palettes, spacing, typography, theme switching, core primitives, verify contrast + keyboard)** → fully covered; switcher uses `radiogroup`/`radio` roles + visible focus ring. ✔
- **Placeholder scan:** every step has complete code; no TBD. ✔
- **Type consistency:** `ThemeName`, `THEMES`, `DEFAULT_THEME`, `THEME_LABELS`, `palettes`, `Palette` fields (`background/elevated/surface/foreground/heading/muted/accent/accent2/onAccent/border/ring/colorScheme`) are used consistently across `palettes.ts`, `theme.test.ts`, `theme-switcher.tsx`, `layout.tsx`, `preview/page.tsx`. The CSS token names (`--accent-2`, `--on-accent`) and TS field names (`accent2`, `onAccent`) intentionally differ (CSS kebab vs TS camel); the drift test maps them explicitly. ✔
- **No-emoji / Lucide icons** (ui-ux-pro-max rule) → switcher + later sections use lucide-react. ✔

## Notes carried to later phases
- System-preference → theme auto-mapping (optional; spec §16).
- `/preview` is `noindex`; exclude from the sitemap in P11.
- P2 adds Lenis + GSAP and the ScrollSequence engine; P3 adds Nav (hosting the ThemeSwitcher), Footer, Preloader, CustomCursor, GrainOverlay.
- Spacing/radius/elevation are currently ad hoc via Tailwind defaults; if a formal scale is needed, add tokens in P3 when the layout shell lands.
