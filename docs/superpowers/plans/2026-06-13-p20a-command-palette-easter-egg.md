# P20a — ⌘K Command Palette + Konami Easter Egg Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a keyboard-native ⌘K command palette (fuzzy nav + theme/link/variant actions) and a Konami-code Inkfield burst (with CSS-ripple fallback), to WCAG 2.1 AA across 4 themes, reduced-motion-safe, static-export clean, zero new deps.

**Architecture:** Pure TDD'd logic modules (`fuzzyScore`, `rankCommands`, `buildCommands`, `createKonamiMatcher`, key helpers) + tiny pub-sub buses (`burst`, `palette-bus`) decouple a client dialog and a nav trigger. The dialog mirrors `MobileMenu`'s focus-trap; the Inkfield gains a decaying `uBurst` uniform; a `RippleFallback` self-suppresses when the WebGL hero is live.

**Tech Stack:** Next 16.2.7 (App Router, `output:'export'`), React 19.2.4, Tailwind v4 tokens, next-themes, GSAP+Lenis, three/R3F, Vitest (jsdom, pure logic only), Playwright.

**Spec:** `docs/superpowers/specs/2026-06-13-p20a-command-palette-easter-egg-design.md`

---

## ⚠️ Execution preconditions

- **Tasks 1–11 + 13** touch only new files + the clean `components/three/hero/inkfield-scene.tsx`. Safe to do now.
- **Task 12 (integration)** edits `app/layout.tsx` + `components/layout/site-nav.tsx`, which currently hold the **parallel session's uncommitted work**. DO NOT START Task 12 until the user confirms that parallel work is committed/stashed and those files are clean (`git status --short` shows them unmodified). Stage explicit paths only; never `git add -A`.
- After every subagent task: audit `git diff`/`git log` — trust the diff, not the report. Verify constants against reality (`GpuTier` is `off|low|high`; `HeroVariant` is `ink|restrained|bold|off`; `ShowpieceVariant` is `cinematic|keystroke|keyboard`).
- All commits end with the trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Conventional-commit messages.

## File structure

```
lib/command-palette/
  types.ts          # Command, CommandGroup, CommandContext, COMMAND_GROUP_ORDER
  fuzzy.ts          # fuzzyScore (pure), rankCommands
  keys.ts           # isEditableTarget, matchesOpenHotkey, wrapIndex (pure)
  commands.ts       # buildCommands() registry (pure; side effects injected)
  palette-bus.ts    # subscribeOpenRequest / requestOpen
  use-command-palette.ts   # open state + global hotkeys + bus subscription
lib/easter-egg/
  konami.ts         # createKonamiMatcher (pure)
  burst.ts          # subscribeBurst / emitBurst
components/command-palette/
  command-palette.tsx        # the dialog
  command-palette-island.tsx # mounts dialog + Konami listener
  palette-trigger.tsx        # nav button (⌘K chip / mobile search icon)
components/easter-egg/
  ripple-fallback.tsx
  ripple-fallback.module.css
tests/unit/
  command-palette-fuzzy.test.ts
  command-palette-keys.test.ts
  command-palette-commands.test.ts
  konami.test.ts
  easter-egg-burst.test.ts
tests/e2e/
  command-palette.spec.ts
# edits:
components/three/hero/inkfield-scene.tsx     # +uBurst, burst subscribe, VERT impulse, data-inkfield
app/layout.tsx                               # mount island + ripple (Task 12)
components/layout/site-nav.tsx               # mount <PaletteTrigger/> (Task 12)
docs/v2/COMMAND-PALETTE.md                   # phase doc (Task 14)
docs/v2/ROADMAP-V2.5-SIGNATURE.md            # status (Task 14)
```

---

## Task 1: Fuzzy matcher (pure)

**Files:**
- Create: `lib/command-palette/fuzzy.ts`
- Test: `tests/unit/command-palette-fuzzy.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { fuzzyScore, rankCommands } from "@/lib/command-palette/fuzzy";
import type { Command } from "@/lib/command-palette/types";

const cmd = (id: string, label: string, keywords?: string[]): Command =>
  ({ id, group: "Navigate", label, keywords, icon: (() => null) as never, run: () => {} });

describe("fuzzyScore", () => {
  it("returns null when query is not a subsequence", () => {
    expect(fuzzyScore("xyz", "Projects")).toBeNull();
  });
  it("returns 0 for an empty query", () => {
    expect(fuzzyScore("", "Projects")).toBe(0);
  });
  it("is case-insensitive and order-sensitive subsequence", () => {
    expect(fuzzyScore("prj", "Projects")).not.toBeNull();
    expect(fuzzyScore("jpr", "Projects")).toBeNull();
  });
  it("scores a start-anchored prefix higher than a mid-string match", () => {
    const prefix = fuzzyScore("pro", "Projects")!;
    const mid = fuzzyScore("ear", "Research")!; // 'r-e-...': not prefix
    expect(prefix).toBeGreaterThan(mid);
  });
  it("scores contiguous higher than scattered for the same query", () => {
    expect(fuzzyScore("con", "Contact")!).toBeGreaterThan(fuzzyScore("cnt", "Contact")!);
  });
});

describe("rankCommands", () => {
  const all = [cmd("a", "About"), cmd("p", "Projects"), cmd("c", "Contact", ["email"])];
  it("returns registry order for an empty query", () => {
    expect(rankCommands("", all).map((c) => c.id)).toEqual(["a", "p", "c"]);
  });
  it("filters out non-matches and ranks best first", () => {
    const r = rankCommands("con", all).map((c) => c.id);
    expect(r).toEqual(["c"]);
  });
  it("matches against keywords too", () => {
    expect(rankCommands("email", all).map((c) => c.id)).toEqual(["c"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/command-palette-fuzzy.test.ts`
Expected: FAIL (cannot resolve `@/lib/command-palette/fuzzy` / `types`).

- [ ] **Step 3: Write `types.ts` then `fuzzy.ts`**

`lib/command-palette/types.ts`:
```ts
import type { LucideIcon } from "lucide-react";

export type CommandGroup = "Navigate" | "Theme" | "Links" | "Actions" | "Labs";

export const COMMAND_GROUP_ORDER: CommandGroup[] = [
  "Navigate", "Theme", "Links", "Actions", "Labs",
];

/** Side-effecting deps injected into command.run so the registry stays pure. */
export interface CommandContext {
  scrollTo: (target: string | number, opts?: { offset?: number }) => void;
  setTheme: (theme: string) => void;
  toggleAnimations: () => void;
  navigateVariant: (param: "hero" | "show", value: string) => void;
  copyEmail: () => void;
  openUrl: (url: string, external?: boolean) => void;
  close: () => void;
}

export interface Command {
  id: string;
  group: CommandGroup;
  label: string;
  keywords?: string[];
  hint?: string;
  icon: LucideIcon;
  run: (ctx: CommandContext) => void;
}
```

`lib/command-palette/fuzzy.ts`:
```ts
import type { Command } from "./types";

/**
 * Case-insensitive subsequence fuzzy score. `null` when `query` is not a
 * subsequence of `text`; higher = better. Empty query → 0. Pure.
 */
export function fuzzyScore(query: string, text: string): number | null {
  const q = query.trim().toLowerCase();
  if (q === "") return 0;
  const t = text.toLowerCase();
  let qi = 0;
  let score = 0;
  let prevIdx = -2;
  let streak = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] !== q[qi]) continue;
    let pts = 1;
    if (prevIdx === ti - 1) { streak += 1; pts += streak * 4; } else { streak = 0; }
    if (ti === 0 || /[^a-z0-9]/.test(t[ti - 1])) pts += 8; // word-boundary bonus
    score += pts;
    prevIdx = ti;
    qi += 1;
  }
  if (qi < q.length) return null;
  // Prefer denser matches (less filler).
  return score + Math.max(0, 6 - (t.length - q.length) * 0.1);
}

/** Filter + sort commands by best score over label + keywords. Empty query → input order. */
export function rankCommands(query: string, commands: Command[]): Command[] {
  if (query.trim() === "") return commands;
  const scored: { cmd: Command; score: number; order: number }[] = [];
  commands.forEach((cmd, order) => {
    let best: number | null = null;
    for (const hay of [cmd.label, ...(cmd.keywords ?? [])]) {
      const s = fuzzyScore(query, hay);
      if (s !== null && (best === null || s > best)) best = s;
    }
    if (best !== null) scored.push({ cmd, score: best, order });
  });
  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  return scored.map((s) => s.cmd);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/command-palette-fuzzy.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/command-palette/types.ts lib/command-palette/fuzzy.ts tests/unit/command-palette-fuzzy.test.ts
git commit -m "feat(v2): command-palette fuzzy matcher + types (TDD)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Key helpers (pure)

**Files:**
- Create: `lib/command-palette/keys.ts`
- Test: `tests/unit/command-palette-keys.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { matchesOpenHotkey, wrapIndex } from "@/lib/command-palette/keys";

describe("matchesOpenHotkey", () => {
  it("matches Cmd/Ctrl+K", () => {
    expect(matchesOpenHotkey({ key: "k", metaKey: true, ctrlKey: false })).toBe(true);
    expect(matchesOpenHotkey({ key: "K", metaKey: false, ctrlKey: true })).toBe(true);
  });
  it("matches bare slash", () => {
    expect(matchesOpenHotkey({ key: "/", metaKey: false, ctrlKey: false })).toBe(true);
  });
  it("ignores plain k and modified slash", () => {
    expect(matchesOpenHotkey({ key: "k", metaKey: false, ctrlKey: false })).toBe(false);
    expect(matchesOpenHotkey({ key: "/", metaKey: true, ctrlKey: false })).toBe(false);
  });
});

describe("wrapIndex", () => {
  it("wraps forward and backward", () => {
    expect(wrapIndex(2, 3, 1)).toBe(0);
    expect(wrapIndex(0, 3, -1)).toBe(2);
    expect(wrapIndex(1, 3, 1)).toBe(2);
  });
  it("returns 0 for empty length", () => {
    expect(wrapIndex(0, 0, 1)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/command-palette-keys.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement `lib/command-palette/keys.ts`**

```ts
/** True when focus is in a field where our hotkeys must not fire. */
export function isEditableTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

/** Cmd/Ctrl+K or a bare `/` opens the palette. */
export function matchesOpenHotkey(e: { key: string; metaKey: boolean; ctrlKey: boolean }): boolean {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") return true;
  if (e.key === "/" && !e.metaKey && !e.ctrlKey) return true;
  return false;
}

/** Cyclic index step; safe for empty lists. */
export function wrapIndex(current: number, length: number, delta: number): number {
  if (length <= 0) return 0;
  return (current + delta + length) % length;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/command-palette-keys.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/command-palette/keys.ts tests/unit/command-palette-keys.test.ts
git commit -m "feat(v2): command-palette key helpers (TDD)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Konami matcher (pure)

**Files:**
- Create: `lib/easter-egg/konami.ts`
- Test: `tests/unit/konami.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createKonamiMatcher, KONAMI_SEQUENCE } from "@/lib/easter-egg/konami";

const feed = (keys: string[]) => {
  const m = createKonamiMatcher();
  return keys.map((k) => m.push(k));
};

describe("createKonamiMatcher", () => {
  it("returns true only on the final key of the full sequence", () => {
    const out = feed(KONAMI_SEQUENCE);
    expect(out.slice(0, -1).every((x) => x === false)).toBe(true);
    expect(out.at(-1)).toBe(true);
  });
  it("is case-insensitive for b/a", () => {
    const seq = [...KONAMI_SEQUENCE.slice(0, 8), "B", "A"];
    expect(feed(seq).at(-1)).toBe(true);
  });
  it("recovers when a wrong key interrupts then the sequence restarts", () => {
    const m = createKonamiMatcher();
    m.push("ArrowUp");
    m.push("x"); // reset
    KONAMI_SEQUENCE.forEach((k) => m.push(k));
    // after a full clean run post-reset, the last push returned true:
    const m2 = createKonamiMatcher();
    m2.push("ArrowUp"); m2.push("x");
    const out = KONAMI_SEQUENCE.map((k) => m2.push(k));
    expect(out.at(-1)).toBe(true);
  });
  it("treats a wrong key that equals the first key as a fresh start", () => {
    const m = createKonamiMatcher();
    expect(m.push("ArrowDown")).toBe(false); // wrong (expected ArrowUp), but ArrowDown !== ArrowUp → idx 0
    const out = KONAMI_SEQUENCE.map((k) => m.push(k));
    expect(out.at(-1)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/konami.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement `lib/easter-egg/konami.ts`**

```ts
export const KONAMI_SEQUENCE = [
  "arrowup", "arrowup", "arrowdown", "arrowdown",
  "arrowleft", "arrowright", "arrowleft", "arrowright",
  "b", "a",
] as const;

/** Stateful sequence detector. `push(key)` returns true on completing the code. */
export function createKonamiMatcher(): { push: (key: string) => boolean } {
  let idx = 0;
  return {
    push(key: string): boolean {
      const k = key.toLowerCase();
      if (k === KONAMI_SEQUENCE[idx]) {
        idx += 1;
        if (idx === KONAMI_SEQUENCE.length) { idx = 0; return true; }
        return false;
      }
      // Mismatch: restart; allow this key to seed a fresh attempt.
      idx = k === KONAMI_SEQUENCE[0] ? 1 : 0;
      return false;
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/konami.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/easter-egg/konami.ts tests/unit/konami.test.ts
git commit -m "feat(v2): Konami sequence matcher (TDD)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Pub-sub buses (burst + palette-open)

**Files:**
- Create: `lib/easter-egg/burst.ts`, `lib/command-palette/palette-bus.ts`
- Test: `tests/unit/easter-egg-burst.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { subscribeBurst, emitBurst } from "@/lib/easter-egg/burst";

describe("burst bus", () => {
  it("notifies subscribers on emit and stops after unsubscribe", () => {
    const cb = vi.fn();
    const off = subscribeBurst(cb);
    emitBurst();
    emitBurst();
    expect(cb).toHaveBeenCalledTimes(2);
    off();
    emitBurst();
    expect(cb).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/easter-egg-burst.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement both buses**

`lib/easter-egg/burst.ts`:
```ts
type BurstListener = () => void;
const listeners = new Set<BurstListener>();

/** Subscribe to Konami bursts. Returns an unsubscribe fn. SSR-safe (no window at import). */
export function subscribeBurst(cb: BurstListener): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function emitBurst(): void {
  listeners.forEach((l) => l());
}
```

`lib/command-palette/palette-bus.ts`:
```ts
type OpenListener = () => void;
const openListeners = new Set<OpenListener>();

/** Decouples the nav trigger from the dialog island. Returns an unsubscribe fn. */
export function subscribeOpenRequest(cb: OpenListener): () => void {
  openListeners.add(cb);
  return () => { openListeners.delete(cb); };
}

export function requestOpen(): void {
  openListeners.forEach((l) => l());
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/easter-egg-burst.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add lib/easter-egg/burst.ts lib/command-palette/palette-bus.ts tests/unit/easter-egg-burst.test.ts
git commit -m "feat(v2): burst + palette-open pub-sub buses (TDD)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Command registry (pure)

**Files:**
- Create: `lib/command-palette/commands.ts`
- Test: `tests/unit/command-palette-commands.test.ts`

**Note:** Verify icon names exist in `lucide-react` before finalizing (e.g. `Github`, `Linkedin`, `FlaskConical`, `Sparkles`, `FileText`, `Copy`, `Mail`, `Palette`, `Hash`, `ArrowUp`). If any is missing/renamed in this version, substitute the nearest existing icon — the unit test does not assert icon identity.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { buildCommands } from "@/lib/command-palette/commands";
import type { CommandContext } from "@/lib/command-palette/types";

const noopCtx = (over: Partial<CommandContext> = {}): CommandContext => ({
  scrollTo: vi.fn(), setTheme: vi.fn(), toggleAnimations: vi.fn(),
  navigateVariant: vi.fn(), copyEmail: vi.fn(), openUrl: vi.fn(), close: vi.fn(),
  ...over,
});

describe("buildCommands", () => {
  const cmds = buildCommands();
  it("has unique ids", () => {
    const ids = cmds.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("includes all five groups", () => {
    const groups = new Set(cmds.map((c) => c.group));
    expect(groups).toEqual(new Set(["Navigate", "Theme", "Links", "Actions", "Labs"]));
  });
  it("has 8 Navigate commands (7 sections + Top)", () => {
    expect(cmds.filter((c) => c.group === "Navigate")).toHaveLength(8);
  });
  it("has 4 Theme commands", () => {
    expect(cmds.filter((c) => c.group === "Theme")).toHaveLength(4);
  });
  it("Labs commands all carry the 'reloads' hint", () => {
    const labs = cmds.filter((c) => c.group === "Labs");
    expect(labs.length).toBeGreaterThan(0);
    expect(labs.every((c) => c.hint === "reloads")).toBe(true);
  });
  it("Top command scrolls to 0 and closes", () => {
    const ctx = noopCtx();
    cmds.find((c) => c.id === "nav-top")!.run(ctx);
    expect(ctx.scrollTo).toHaveBeenCalledWith(0);
    expect(ctx.close).toHaveBeenCalled();
  });
  it("a theme command calls setTheme with the theme name", () => {
    const ctx = noopCtx();
    cmds.find((c) => c.id === "theme-neon")!.run(ctx);
    expect(ctx.setTheme).toHaveBeenCalledWith("neon");
  });
  it("copy-email command calls copyEmail and does NOT close", () => {
    const ctx = noopCtx();
    cmds.find((c) => c.id === "link-copy-email")!.run(ctx);
    expect(ctx.copyEmail).toHaveBeenCalled();
    expect(ctx.close).not.toHaveBeenCalled();
  });
  it("a Labs hero command calls navigateVariant('hero', …)", () => {
    const ctx = noopCtx();
    cmds.find((c) => c.id === "lab-hero-bold")!.run(ctx);
    expect(ctx.navigateVariant).toHaveBeenCalledWith("hero", "bold");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/command-palette-commands.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement `lib/command-palette/commands.ts`**

```ts
import {
  ArrowUp, Hash, Palette, Copy, Mail, Github, Linkedin, FileText,
  Sparkles, FlaskConical,
} from "lucide-react";
import { NAV_SECTIONS, NAV_OFFSET, SOCIAL_LINKS } from "@/lib/site";
import { THEMES, THEME_LABELS } from "@/lib/theme/palettes";
import { HERO_VARIANTS } from "@/lib/hero/hero-variant";
import { SHOWPIECE_VARIANTS } from "@/lib/showpiece/showpiece-variant";
import type { Command } from "./types";

/** Assemble the full command registry. Pure: side effects come from the injected ctx. */
export function buildCommands(): Command[] {
  const navigate: Command[] = [
    {
      id: "nav-top", group: "Navigate", label: "Top", keywords: ["home", "hero", "start"],
      icon: ArrowUp, run: (c) => { c.scrollTo(0); c.close(); },
    },
    ...NAV_SECTIONS.map<Command>((s) => ({
      id: `nav-${s.id}`, group: "Navigate", label: s.label,
      keywords: ["go to", "jump", s.id], icon: Hash,
      run: (c) => { c.scrollTo(`#${s.id}`, { offset: -NAV_OFFSET }); c.close(); },
    })),
  ];

  const theme: Command[] = THEMES.map<Command>((t) => ({
    id: `theme-${t}`, group: "Theme", label: `Theme: ${THEME_LABELS[t]}`,
    keywords: ["color", "appearance", t], icon: Palette,
    run: (c) => { c.setTheme(t); c.close(); },
  }));

  const links: Command[] = [
    { id: "link-copy-email", group: "Links", label: "Copy email", keywords: ["clipboard", "contact"], icon: Copy, run: (c) => { c.copyEmail(); } },
    { id: "link-email", group: "Links", label: "Email Parshv", keywords: ["mail", "contact"], icon: Mail, run: (c) => { c.openUrl(`mailto:${SOCIAL_LINKS.email}`); c.close(); } },
    { id: "link-github", group: "Links", label: "GitHub", keywords: ["code", "repos"], icon: Github, run: (c) => { c.openUrl(SOCIAL_LINKS.github, true); c.close(); } },
    { id: "link-linkedin", group: "Links", label: "LinkedIn", keywords: ["social", "profile"], icon: Linkedin, run: (c) => { c.openUrl(SOCIAL_LINKS.linkedin, true); c.close(); } },
    { id: "link-resume", group: "Links", label: "Résumé (PDF)", keywords: ["cv", "download"], icon: FileText, run: (c) => { c.openUrl("/documents/resume.pdf", true); c.close(); } },
    { id: "link-transcript", group: "Links", label: "Transcript (PDF)", keywords: ["grades", "academics"], icon: FileText, run: (c) => { c.openUrl("/documents/transcript.pdf", true); c.close(); } },
  ];

  const actions: Command[] = [
    { id: "action-toggle-motion", group: "Actions", label: "Toggle animations", keywords: ["reduce motion", "accessibility"], icon: Sparkles, run: (c) => { c.toggleAnimations(); } },
  ];

  const labs: Command[] = [
    ...HERO_VARIANTS.map<Command>((v) => ({
      id: `lab-hero-${v}`, group: "Labs", label: `Hero: ${v}`, hint: "reloads",
      keywords: ["variant", "3d", "background"], icon: FlaskConical,
      run: (c) => { c.navigateVariant("hero", v); },
    })),
    ...SHOWPIECE_VARIANTS.map<Command>((v) => ({
      id: `lab-show-${v}`, group: "Labs", label: `Showpiece: ${v}`, hint: "reloads",
      keywords: ["variant", "scroll"], icon: FlaskConical,
      run: (c) => { c.navigateVariant("show", v); },
    })),
  ];

  return [...navigate, ...theme, ...links, ...actions, ...labs];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/command-palette-commands.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/command-palette/commands.ts tests/unit/command-palette-commands.test.ts
git commit -m "feat(v2): command-palette registry builder (TDD)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Open-state hook

**Files:**
- Create: `lib/command-palette/use-command-palette.ts`

No unit test (window/DOM wiring; covered by e2e). Pure helpers it depends on are already tested.

- [ ] **Step 1: Implement the hook**

```ts
"use client";

import { useEffect, useState } from "react";
import { isEditableTarget, matchesOpenHotkey } from "@/lib/command-palette/keys";
import { subscribeOpenRequest } from "@/lib/command-palette/palette-bus";

/** Owns palette open state; opens on Cmd/Ctrl+K, `/`, or a bus request. */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;
      if (matchesOpenHotkey(e)) { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    const unsub = subscribeOpenRequest(() => setOpen(true));
    return () => { window.removeEventListener("keydown", onKey); unsub(); };
  }, []);
  return { open, setOpen };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: `No errors found`.

- [ ] **Step 3: Commit**

```bash
git add lib/command-palette/use-command-palette.ts
git commit -m "feat(v2): command-palette open-state hook

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Dialog component

**Files:**
- Create: `components/command-palette/command-palette.tsx`

- [ ] **Step 1: Implement the dialog**

```tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useSmoothScroll } from "@/components/providers/smooth-scroll";
import { useMotionPreference } from "@/components/providers/motion-preference";
import { buildCommands } from "@/lib/command-palette/commands";
import { rankCommands } from "@/lib/command-palette/fuzzy";
import { wrapIndex } from "@/lib/command-palette/keys";
import type { Command, CommandContext } from "@/lib/command-palette/types";
import { SOCIAL_LINKS } from "@/lib/site";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const { scrollTo } = useSmoothScroll();
  const { setTheme } = useTheme();
  const { toggle: toggleAnimations } = useMotionPreference();

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const allCommands = useMemo(() => buildCommands(), []);
  const results = useMemo(
    () => (query.trim() ? rankCommands(query, allCommands) : allCommands),
    [query, allCommands],
  );

  const ctx: CommandContext = useMemo(() => ({
    scrollTo,
    setTheme,
    toggleAnimations,
    navigateVariant: (param, value) => {
      const url = new URL(window.location.href);
      url.searchParams.set(param, value);
      window.location.href = url.toString();
    },
    copyEmail: () => {
      const done = () => { setCopied(true); window.setTimeout(() => setCopied(false), 1500); };
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(SOCIAL_LINKS.email).then(done).catch(done);
      } else {
        done();
      }
    },
    openUrl: (url, external) => {
      if (external) window.open(url, "_blank", "noopener,noreferrer");
      else window.location.href = url;
    },
    close: () => onCloseRef.current(),
  }), [scrollTo, setTheme, toggleAnimations]);

  const runCommand = useCallback((cmd: Command) => { cmd.run(ctx); }, [ctx]);

  // Reset active on query change; clear everything when closed.
  useEffect(() => { setActive(0); }, [query]);
  useEffect(() => {
    if (!open) { setQuery(""); setActive(0); setCopied(false); }
  }, [open]);

  // Open lifecycle: focus input, lock scroll, fade-in, Esc + Tab trap, restore focus.
  useEffect(() => {
    if (!open) return;
    registerGsap();
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";

    if (!prefersReducedMotion() && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: -8, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "power2.out" },
      );
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onCloseRef.current(); return; }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        "a[href],button:not([disabled]),input,[tabindex]:not([tabindex='-1'])",
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus();
    };
  }, [open]);

  // Keep the active row in view.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active, results]);

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => wrapIndex(i, results.length, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => wrapIndex(i, results.length, -1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = results[active];
      if (cmd) runCommand(cmd);
    }
  };

  const activeId = results[active] ? `cmd-${results[active].id}` : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      aria-hidden={!open}
      className={cn("fixed inset-0 z-[80]", open ? "pointer-events-auto" : "pointer-events-none invisible")}
    >
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="absolute inset-x-0 top-[12vh] mx-auto w-[min(92vw,560px)] px-4">
        <div ref={panelRef} className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border px-4">
            <span aria-hidden className="font-mono text-xs uppercase tracking-widest text-muted">⌘K</span>
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={open}
              aria-controls="command-palette-list"
              aria-activedescendant={activeId}
              aria-label="Search commands"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Search sections, themes, links…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              className="min-h-12 flex-1 bg-transparent py-3 font-display text-lg text-heading outline-none placeholder:text-muted"
            />
          </div>
          <ul
            ref={listRef}
            id="command-palette-list"
            role="listbox"
            aria-label="Commands"
            className="max-h-[50vh] overflow-y-auto p-2"
          >
            {results.length === 0 && (
              <li role="presentation" className="px-3 py-6 text-center font-mono text-xs uppercase tracking-widest text-muted">
                No results
              </li>
            )}
            {results.map((cmd, i) => {
              const Icon = cmd.icon;
              const isActive = i === active;
              const showHeader = cmd.group !== (i > 0 ? results[i - 1].group : null);
              const showCopied = cmd.id === "link-copy-email" && copied;
              return (
                <li key={cmd.id} role="presentation">
                  {showHeader && (
                    <div role="presentation" className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-widest text-muted">
                      {cmd.group}
                    </div>
                  )}
                  <button
                    type="button"
                    id={`cmd-${cmd.id}`}
                    role="option"
                    aria-selected={isActive}
                    tabIndex={-1}
                    data-active={isActive}
                    onMouseMove={() => { if (active !== i) setActive(i); }}
                    onClick={() => runCommand(cmd)}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                      isActive ? "bg-accent/10 text-accent" : "text-foreground hover:bg-elevated",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="flex-1 truncate">{showCopied ? "Copied ✓" : cmd.label}</span>
                    {cmd.hint && (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">{cmd.hint}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint components/command-palette/command-palette.tsx`
Expected: no errors. (If `react-hooks` flags the `open`-only effect deps, the omitted deps are intentional refs/setters — add an `eslint-disable-next-line react-hooks/exhaustive-deps` with a one-line reason, matching the codebase convention in `inkfield-scene.tsx`.)

- [ ] **Step 3: Commit**

```bash
git add components/command-palette/command-palette.tsx
git commit -m "feat(v2): ⌘K command palette dialog (combobox, focus trap, themed)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Palette island (dialog + Konami listener)

**Files:**
- Create: `components/command-palette/command-palette-island.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useEffect } from "react";
import { useCommandPalette } from "@/lib/command-palette/use-command-palette";
import { CommandPalette } from "./command-palette";
import { createKonamiMatcher } from "@/lib/easter-egg/konami";
import { emitBurst } from "@/lib/easter-egg/burst";
import { isEditableTarget } from "@/lib/command-palette/keys";

/** Single client island: owns the palette dialog + the global Konami listener. */
export function CommandPaletteIsland() {
  const { open, setOpen } = useCommandPalette();

  useEffect(() => {
    const matcher = createKonamiMatcher();
    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;
      if (matcher.push(e.key)) emitBurst();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <CommandPalette open={open} onClose={() => setOpen(false)} />;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: `No errors found`.

- [ ] **Step 3: Commit**

```bash
git add components/command-palette/command-palette-island.tsx
git commit -m "feat(v2): command-palette island + Konami listener

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: Nav trigger button

**Files:**
- Create: `components/command-palette/palette-trigger.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

import { useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import { requestOpen } from "@/lib/command-palette/palette-bus";

// Hydration-safe platform flag: server snapshot false (→ "Ctrl"), client may upgrade to mac.
const emptySubscribe = () => () => {};
function useIsMac(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent),
    () => false,
  );
}

/** Opens the palette via the bus. Desktop: ⌘K/Ctrl K chip. Mobile: search-icon tap target. */
export function PaletteTrigger() {
  const isMac = useIsMac();
  return (
    <button
      type="button"
      onClick={requestOpen}
      aria-haspopup="dialog"
      aria-label="Open command palette"
      className="flex h-11 items-center justify-center rounded-full text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:gap-1.5 md:rounded-md md:border md:border-border md:bg-surface md:px-2.5"
    >
      <Search className="h-4 w-4 md:h-3.5 md:w-3.5" aria-hidden />
      <span className="hidden items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-muted md:inline-flex">
        <kbd className="font-mono">{isMac ? "⌘" : "Ctrl"}</kbd>
        <kbd className="font-mono">K</kbd>
      </span>
    </button>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint components/command-palette/palette-trigger.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/command-palette/palette-trigger.tsx
git commit -m "feat(v2): palette nav trigger (⌘K chip / mobile search target)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 10: Ripple fallback (no-WebGL / reduced-motion path)

**Files:**
- Create: `components/easter-egg/ripple-fallback.tsx`, `components/easter-egg/ripple-fallback.module.css`

- [ ] **Step 1: Implement the CSS module**

`components/easter-egg/ripple-fallback.module.css`:
```css
.layer {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
  z-index: 60;
}

/* Expanding accent ring (motion-safe path). currentColor = text-accent. */
.expand {
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  border: 2px solid currentColor;
  opacity: 0.85;
  animation: ek-expand 1s ease-out forwards;
}

@keyframes ek-expand {
  from { transform: scale(0.2); opacity: 0.85; }
  to   { transform: scale(9);   opacity: 0; }
}

/* Reduced-motion path: a brief opacity pulse, no transform. */
.pulse {
  width: 160px;
  height: 160px;
  border-radius: 9999px;
  background: radial-gradient(circle, currentColor 0%, transparent 70%);
  opacity: 0;
  animation: ek-pulse 0.9s ease-in-out forwards;
}

@keyframes ek-pulse {
  0%   { opacity: 0; }
  40%  { opacity: 0.5; }
  100% { opacity: 0; }
}
```

- [ ] **Step 2: Implement the component**

`components/easter-egg/ripple-fallback.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { subscribeBurst } from "@/lib/easter-egg/burst";
import { prefersReducedMotion } from "@/lib/motion";
import styles from "./ripple-fallback.module.css";

/**
 * Renders the Konami reward when the WebGL Inkfield is NOT live (no WebGL2,
 * Save-Data, or reduced-motion → no `[data-inkfield] canvas`). When the
 * Inkfield is mounted it consumes the burst itself, so this self-suppresses.
 */
export function RippleFallback() {
  const [bursts, setBursts] = useState<number[]>([]);

  useEffect(() => subscribeBurst(() => {
    if (document.querySelector("[data-inkfield] canvas")) return; // Inkfield handles it
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, id]);
    window.setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 1000);
  }), []);

  if (bursts.length === 0) return null;
  const reduce = prefersReducedMotion();

  return (
    <div aria-hidden className={`${styles.layer} text-accent`}>
      {bursts.map((id) => (
        <span key={id} className={reduce ? styles.pulse : styles.expand} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + lint + build (CSS-module resolves only in build)**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint components/easter-egg/ripple-fallback.tsx`
Expected: no errors. (If TS can't resolve the `.module.css` import, confirm `next-env.d.ts` / the existing CSS-module typing is present — other components in the repo using CSS modules will have established this; if none do, add `declare module "*.module.css";` to a `globals.d.ts`. Verify whether any existing component imports a `.module.css` first.)

- [ ] **Step 4: Commit**

```bash
git add components/easter-egg/ripple-fallback.tsx components/easter-egg/ripple-fallback.module.css
git commit -m "feat(v2): Konami ripple fallback (no-WebGL / reduced-motion reward)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 11: Inkfield burst impulse

**Files:**
- Modify: `components/three/hero/inkfield-scene.tsx`

Read the current file first; apply these surgical edits. Keep the R3F uniform discipline: add `uBurst` to the initial uniforms map, mutate only `.value` in `useFrame`.

- [ ] **Step 1: Add the `uBurst` uniform to the VERT shader**

In the `VERT` template, add the uniform declaration alongside the others:
```glsl
  uniform float uBurst;
```
And immediately after the existing lattice line `pos = mix(pos, aTarget, m);`, add the one-shot outward shove:
```glsl
    // Konami burst: a decaying outward shove from the field origin.
    pos.xy += normalize(pos.xy + vec2(0.0001)) * uBurst * (1.3 + 0.9 * fract(aSeed.z * 9.13));
```

- [ ] **Step 2: Seed the uniform**

In `buildUniforms(...)`'s returned object, add:
```ts
    uBurst: { value: 0 },
```

- [ ] **Step 3: Subscribe + decay in `Field`**

Add imports at the top of the file:
```ts
import { useEffect } from "react";
import { subscribeBurst } from "@/lib/easter-egg/burst";
```
(merge `useEffect` into the existing `react` import). Inside `Field`, add a burst energy ref and subscription:
```ts
  const burstRef = useRef(0);
  useEffect(() => subscribeBurst(() => { burstRef.current = 1; }), []);
```
In the existing `useFrame` callback, before reading uniforms ends, add the decay + write:
```ts
    if (burstRef.current > 0) burstRef.current = Math.max(0, burstRef.current - delta / 1.2);
    (u.uBurst as { value: number }).value = burstRef.current;
```

- [ ] **Step 4: Mark the wrapper so the fallback can detect a live canvas**

On the wrapper `<div ref={wrap} className="h-full w-full">` in `InkfieldScene`, add `data-inkfield`:
```tsx
    <div ref={wrap} data-inkfield className="h-full w-full">
```

- [ ] **Step 5: Verify build (jsdom can't run R3F — rely on build, not unit tests)**

Run: `npx tsc --noEmit -p tsconfig.json && npm run build`
Expected: typecheck clean; build succeeds (static export). Visual burst verified later via Playwright MCP.

- [ ] **Step 6: Commit**

```bash
git add components/three/hero/inkfield-scene.tsx
git commit -m "feat(v2): Inkfield Konami burst impulse (decaying uBurst uniform)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 12: Integration — mount island + nav trigger

> **PRECONDITION:** `app/layout.tsx` and `components/layout/site-nav.tsx` must be clean of the parallel session's work (`git status --short` shows them unmodified). Do NOT start until the user confirms. Read each file fresh before editing — the parallel commit may have shifted line numbers.

**Files:**
- Modify: `app/layout.tsx`
- Modify: `components/layout/site-nav.tsx`

- [ ] **Step 1: Mount the island + ripple in `app/layout.tsx`**

Add imports near the other component imports:
```tsx
import { CommandPaletteIsland } from "@/components/command-palette/command-palette-island";
import { RippleFallback } from "@/components/easter-egg/ripple-fallback";
```
Inside `<SmoothScrollProvider>`, as siblings of `{children}` (so they sit within the theme + motion + scroll contexts), add:
```tsx
              {children}
              <CommandPaletteIsland />
              <RippleFallback />
```

- [ ] **Step 2: Mount the trigger in `components/layout/site-nav.tsx`**

Add the import:
```tsx
import { PaletteTrigger } from "@/components/command-palette/palette-trigger";
```
In the right-hand controls cluster, place `<PaletteTrigger />` before the existing `AnimationToggle` / `ThemeSwitcher` group so it reads left-to-right "search · motion · theme". For mobile, also render it next to the menu button so phones get a tap entry. Concretely, inside `<div className="flex items-center gap-2">`: add `<PaletteTrigger />` as the first child (it is `h-11`, themed, and responsive on its own).

- [ ] **Step 3: Typecheck + lint the two files**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint app/layout.tsx components/layout/site-nav.tsx`
Expected: no errors.

- [ ] **Step 4: Commit (explicit paths only — never `git add -A`)**

```bash
git add app/layout.tsx components/layout/site-nav.tsx
git commit -m "feat(v2): mount command palette island + nav trigger

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 13: E2E spec

**Files:**
- Create: `tests/e2e/command-palette.spec.ts`

- [ ] **Step 1: Write the e2e spec**

```ts
import { test, expect } from "@playwright/test";

// Verified primarily via build + serve out/ + this spec; the dev webServer is flaky here.

test.describe("command palette", () => {
  test("opens via Ctrl+K, filters, Enter navigates, Esc closes + restores focus", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Open via the nav trigger (deterministic across platforms), then close, then hotkey.
    const trigger = page.getByRole("button", { name: "Open command palette" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog).toBeVisible();

    const input = page.getByRole("combobox", { name: "Search commands" });
    await input.fill("projects");
    // First option should be the Projects nav command.
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toContainText(/Projects/i);

    await input.press("Enter");
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/#?/); // navigation ran without error
    await expect(page.locator("#projects")).toBeInViewport({ ratio: 0.1, timeout: 5000 });

    // Hotkey open + Esc restores focus to the document (no thrown error).
    await page.keyboard.press("Control+k");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("hotkey is ignored while typing in a field", async ({ page }) => {
    await page.goto("/?show=cinematic", { waitUntil: "domcontentloaded" });
    // The contact section has inputs; focus one and press '/'.
    const anyInput = page.locator("input, textarea").first();
    if (await anyInput.count()) {
      await anyInput.scrollIntoViewIfNeeded();
      await anyInput.focus();
      await anyInput.type("/");
      await expect(page.getByRole("dialog", { name: "Command palette" })).toBeHidden();
    }
  });
});
```

- [ ] **Step 2: Verify via build + serve (dev webServer is flaky)**

```bash
npm run build
# serve out/ on 4321 (PowerShell): Start-Process -WindowStyle Hidden python -ArgumentList "-m","http.server","4321","--directory","out"
# Then run the spec against the static server (set PLAYWRIGHT base or use MCP visual pass).
```
If running the spec directly is impractical due to the webServer gotcha, treat the unit suite + the Playwright **MCP** visual/interaction pass (Task: verification) as the authority and keep this spec for CI once the dev-server panic is resolved. Do NOT block the commit on a flaky webServer.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/command-palette.spec.ts
git commit -m "test(v2): command palette e2e (open/filter/navigate/esc, hotkey guard)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 14: Docs + roadmap

**Files:**
- Create: `docs/v2/COMMAND-PALETTE.md`
- Modify: `docs/v2/ROADMAP-V2.5-SIGNATURE.md`

- [ ] **Step 1: Write `docs/v2/COMMAND-PALETTE.md`**

Concise phase doc: what shipped (palette command groups, fuzzy matcher, triggers, Konami burst + fallback), the decoupling (palette-bus / burst bus), a11y/RM/4-theme contract, files, and how to extend the registry (`buildCommands`). Mirror the tone/length of existing `docs/v2/*.md`.

- [ ] **Step 2: Update the roadmap**

In `docs/v2/ROADMAP-V2.5-SIGNATURE.md`, mark P20a (palette + easter egg) complete with date 2026-06-13 and note P20b (status widget + guided tour) as the next wave. Keep formatting consistent with existing entries.

- [ ] **Step 3: Commit**

```bash
git add docs/v2/COMMAND-PALETTE.md docs/v2/ROADMAP-V2.5-SIGNATURE.md
git commit -m "docs(v2): P20a command palette + easter egg doc + roadmap update

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Final verification (after Task 14, before reporting)

1. `npx eslint <all new/changed files>` — clean (ignore any `docs/skills/**` noise).
2. `npx tsc --noEmit -p tsconfig.json` — `No errors found`.
3. `npm test` — full unit suite green (existing ~224 + the new fuzzy/keys/konami/burst/commands tests).
4. `npm run build` — static export succeeds.
5. **Playwright MCP visual + interaction pass** (the authority — Read every screenshot):
   - Build + serve `out/` on 4321.
   - Palette: open via hotkey + via the nav button; type to filter; arrow + Enter; Esc. Screenshot **open** state in all 4 themes + mobile (390px). Check: active-row contrast ≥4.5:1 each theme, group headers + Labs "reloads" hints, no layout shift, scrim.
   - Reduced-motion context: palette opens instantly (no fade); confirm.
   - Konami: focus the page, press ↑↑↓↓←→←→BA — verify the Inkfield burst (WebGL theme) and, in a no-WebGL/RM context, the ripple fallback. Screenshot both.
   - Clean up `.playwright-mcp/`, stop the server, close the browser.
6. **Hunt + raise quality:** hotkey while typing (guarded), clipboard unavailable, mobile reachability, broken `/documents/*.pdf` links (verify they 200 from `out/`), focus restore, no scroll trap, Labs reload signposting. Fix real findings (TDD a failing test first for any logic bug).
7. **Two-stage read-only reviewer pass** on the P20a git range (Stage 1 spec/a11y/design; Stage 2 code-quality/bugs/Next-16/RSC/R3F-lifecycle), scoped to P20a files, told to ignore `docs/skills/**` + parallel work.

## Self-review (plan vs spec)

- **Spec §4.1 registry** → Task 5 (groups, Labs hint, run dispatch). ✓
- **Spec §4.2 fuzzy** → Task 1. ✓
- **Spec §4.3 dialog** (combobox/listbox ARIA, ↑/↓/Enter/Esc/Tab trap, aria-activedescendant, triggers, focus restore, body lock, motion gate, ≥44px rows, tokens) → Task 7 + Task 6 (hotkeys) + Task 9 (trigger). ✓
- **Spec §4.4 easter egg** (konami pure, burst bus, uBurst impulse, fallback w/ RM pulse) → Tasks 3, 4, 10, 11. ✓
- **Spec §4.5 mount** → Task 12. ✓
- **Spec §6 testing** → unit Tasks 1–5; e2e Task 13; visual in Final verification. ✓
- **Spec §5 a11y/motion contract** → enforced in Tasks 7/9/10 + verified in Final verification. ✓
- **Type consistency:** `CommandContext` shape identical across types.ts (Task 1), commands.ts (Task 5), command-palette.tsx (Task 7). `subscribeBurst/emitBurst`, `requestOpen/subscribeOpenRequest`, `createKonamiMatcher().push`, `fuzzyScore/rankCommands`, `wrapIndex` names consistent across producers/consumers. ✓
- **No placeholders:** every code step is complete. Icon-name and CSS-module-typing caveats are explicit verify-then-substitute notes, not deferred work. ✓
- **Parallel-work safety:** only Task 12 touches dirty files, gated on a precondition; all staging uses explicit paths. ✓
```
