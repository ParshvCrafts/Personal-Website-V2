# P20a — ⌘K Command Palette + Konami Easter Egg (Design Spec)

**Date:** 2026-06-13
**Phase:** P20a (first of two P20 "Advanced Features" waves; P20b = live status widget + first-visit guided tour)
**Status:** Approved design → ready for implementation plan
**Stack:** Next 16.2.7 (App Router, React 19.2.4, `output:'export'`), Tailwind v4 (`@theme` tokens), next-themes (4 themes), GSAP + Lenis, three 0.184 / R3F 9.6.1.

---

## 1. Goal

Add two keyboard-native "advanced features" to the portfolio at industrial quality:

1. **⌘K command palette** — fuzzy-searchable navigation + actions (jump to section, switch theme, copy/open links, toggle animations, switch hero/showpiece variants). Fits the site's keyboard motif.
2. **Tasteful easter egg** — Konami code (`↑↑↓↓←→←→BA`) → a one-shot accent-colored burst in the hero Inkfield, with a graceful CSS-ripple fallback when WebGL isn't mounted or reduced-motion is on.

Both ship to a WCAG 2.1 AA bar, honor `prefers-reduced-motion`, work across all 4 themes, and stay static-export clean (no server, no new runtime deps).

## 2. Non-goals (this wave)

- Live status widget, first-visit guided tour (those are **P20b**).
- No new npm dependencies (`cmdk`, `fuse.js`, etc. — hand-rolled, copy+adapt ethos).
- No changes to v1 (repo-root `app.py`/`index.html`/`static/**` except canonical `static/data/`).

## 3. Chosen approach

**Hand-rolled, dependency-free.** Pure logic modules (TDD'd) + a client dialog that mirrors the existing `MobileMenu` focus-trap pattern. Rejected: `cmdk` (runtime dep, weaker token/motion control, overkill for ~20 commands); wholesale Magic-MCP/react-bits generation (heavy retokenize + a11y hardening, still need the registry/fuzzy logic).

`ui-ux-pro-max` (palette/dialog craft + a11y) and `react-bits` (motion polish reference) are applied during planning/implementation, not vendored.

## 4. Architecture & components

### 4.1 Command registry — `lib/command-palette/commands.ts` (pure)
A builder returning typed `Command[]`. Each command:

```ts
type CommandGroup = "Navigate" | "Theme" | "Links" | "Actions" | "Labs";
interface Command {
  id: string;
  group: CommandGroup;
  label: string;
  keywords?: string[];      // extra fuzzy-match terms (e.g. "home" for Top)
  hint?: string;            // right-aligned affordance (e.g. "reloads", "⏎")
  icon: LucideIcon;
  run: (ctx: CommandContext) => void;
}
```

`CommandContext` injects the side-effecting deps so the registry stays pure/testable:
`{ scrollTo, setTheme, toggleAnimations, navigateVariant, copyEmail, openUrl, close }`.

Groups & members:
- **Navigate** — `NAV_SECTIONS` (7) + "Top" → `scrollTo("#id", {offset:-NAV_OFFSET})` / `scrollTo(0)`.
- **Theme** — Midnight/Daylight/Manuscript/Neon → `setTheme(name)` (reuses next-themes; the View-Transition ripple comes from the existing theme path / is skipped under RM).
- **Links** — Copy email (clipboard + transient "Copied" affordance), Email (`mailto:`), GitHub, LinkedIn (`SOCIAL_LINKS`), Résumé (`/documents/resume.pdf`), Transcript (`/documents/transcript.pdf`). External links open in a new tab with `noopener,noreferrer`.
- **Actions** — Toggle animations (drives the same store the existing `AnimationToggle` uses).
- **Labs** — visually separated group, each with `hint:"reloads"`: Hero variant (the values in the actual `HeroVariant` union from `lib/hero/hero-variant.ts`, default `ink`, via `?hero=`), Showpiece variant (keystroke/keyboard/cinematic via `?show=`). `navigateVariant(param, value)` sets the query param and reloads (the variant hooks only read `location.search` on mount). **Planning must read the exact `HeroVariant` union before listing these — do not assume.**

The builder is unit-testable: assert group membership, counts, ids unique, and that `run` calls the injected ctx fn with the right args.

### 4.2 Fuzzy matcher — `lib/command-palette/fuzzy.ts` (pure)
```ts
function fuzzyScore(query: string, text: string): number | null;
```
- Case-insensitive **subsequence** match (every query char appears in order).
- Bonuses for contiguous runs and word-boundary / start-of-string starts; penalty for gaps. Higher = better.
- `null` when not a subsequence (filtered out).
- A `rankCommands(query, commands)` helper scores `label` + `keywords`, drops `null`, sorts by score desc then registry order (stable). **Empty query → registry order, all shown.**
- TDD: exact/prefix/subsequence hits, ranking order, no-match, case-insensitivity, empty query.

### 4.3 Dialog — `components/command-palette/command-palette.tsx` (client)
- `role="dialog" aria-modal="true" aria-label="Command palette"`, scrim + centered panel (top-anchored, `max-w-[min(92vw,560px)]`), tokened (`bg-surface`, `border-border`, `text-heading/foreground/muted`, `ring-ring`). No hardcoded hex.
- **Combobox semantics:** a text `<input role="combobox" aria-expanded aria-controls aria-activedescendant>` above a `role="listbox"`; results are `role="option"` rows grouped under `role="group" aria-label="<group>"` with a visible group header. Active option tracked by `aria-activedescendant` (input keeps DOM focus — no focus-steal); active row also `aria-selected`.
- **Keyboard:** ↑/↓ move active (wrap around), Enter runs active, Esc closes, Tab/Shift+Tab trapped within the dialog (port `MobileMenu`'s trap), type-to-filter. Pointer hover syncs active index; click runs.
- **Open triggers:**
  - Global listener: `⌘K` (mac) / `Ctrl+K`, and `/` — but **ignored** when focus is in an input/textarea/contenteditable so it never hijacks typing. `preventDefault` on the combos we own.
  - **Nav affordance** (`components/command-palette/palette-trigger.tsx`): a button in `SiteNav`. Desktop = a small chip showing a `⌘K` / `Ctrl K` kbd hint (platform-detected, client-only to stay hydration-safe); mobile = a `Search`-icon `≥44×44` tap target (the only way in on phones). `aria-haspopup="dialog"`, `aria-expanded`.
- **Focus management:** on open, save `document.activeElement`, focus the input, lock body scroll; on close, restore focus to the opener (MobileMenu pattern). Empty-state row when no matches ("No results").
- **Motion:** subtle scale(0.98→1) + opacity fade-in via GSAP, gated by `prefersReducedMotion()` → instant. No layout shift.
- **Rows** ≥44px, icon + label + optional right hint; active row uses `bg-accent/10 text-accent` (AA in all 4 themes — verified in the visual pass).

### 4.4 Easter egg — Konami → Inkfield burst
- `lib/easter-egg/konami.ts` (pure): `createKonamiMatcher()` → `push(key): boolean` (true on completing `ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight b a`); tolerant of wrong keys (resets/re-syncs), case-insensitive for b/a. TDD: full sequence, partial, interrupted-then-restarted, trailing-after-complete.
- `lib/easter-egg/burst.ts` (tiny pub-sub): `subscribeBurst(cb)` / `emitBurst()`. Module-level set of listeners; SSR-safe (no window at import).
- **Inkfield impulse:** add a `uBurst` uniform to `inkfield-scene.tsx`. A `burstRef` (set on `emitBurst`, timestamped) is read in `useFrame`: `uBurst` ramps to 1 then decays to 0 over ~1.2s. VERT adds a one-shot outward **radial impulse** scaled by `uBurst` (push particles out from center with slight per-particle variance), settling back as it decays. Accent-colored (already theme-driven). Decorative; the hero mount stays `aria-hidden`.
- **Fallback** `components/easter-egg/ripple-fallback.tsx`: a client overlay that subscribes to `emitBurst`. Renders **only** when the Inkfield canvas is not mounted (no WebGL2 / tier off) **or** reduced-motion is on. Motion-safe path = a single accent radial-gradient ring that expands + fades once (~1s) then unmounts. **Reduced-motion path = a brief opacity pulse, no expansion/translation.** `aria-hidden`, `pointer-events-none`.
- **Global Konami listener** lives with the palette mount (one keydown listener, also input-aware so it doesn't fire mid-typing); on completion calls `emitBurst()`.

### 4.5 Mount point
A single client island mounted once in the app shell (`app/layout.tsx` or its existing client wrapper): renders `<CommandPalette/>` + the global key listeners + `<RippleFallback/>`. The `<PaletteTrigger/>` button is placed inside `SiteNav` (desktop chip + mobile icon). No SSR/server data.

## 5. Accessibility & motion contract

- Single `<h1>` unchanged (palette is a dialog, not a heading).
- Full keyboard operation; visible focus ring (`ring-ring`); ≥44×44 targets; Esc always closes; focus trapped while open and restored on close.
- Combobox/listbox ARIA as in §4.3; active option announced via `aria-activedescendant`.
- ≥4.5:1 text contrast for every row/label/hint **in all 4 themes** — confirmed in the Playwright visual pass.
- `prefers-reduced-motion`: palette open = instant; theme ripple skipped; Konami burst → ripple-fallback's opacity-pulse path (never the radial expansion); no scroll pinning anywhere.
- All decorative effect surfaces `aria-hidden` + `pointer-events-none`; content parity preserved (everything reachable without the palette via existing nav).

## 6. Testing strategy

**Unit (Vitest, jsdom — pure logic only, no R3F/three imports):**
- `fuzzy.ts`: scoring + `rankCommands` ordering, empty query, no-match, case-insensitivity.
- `konami.ts`: completion, partials, interruption recovery, post-complete.
- `commands.ts`: group membership/counts, unique ids, `run` dispatches to injected ctx.

**E2E (Playwright, build+serve `out/` path — not `npm run dev`):**
- Open via hotkey and via the nav button; type filters; Enter on a Navigate command scrolls; Esc closes; focus returns to opener; Tab stays trapped; no `.pin-spacer` introduced.
- Gate any "canvas mounts" assertions on a real `getContext('webgl2')` probe (headless WebKit has none).

**Visual (Playwright MCP, mandatory — Read every screenshot):**
- Palette open in all 4 themes + mobile (390px) + a reduced-motion context; active-row contrast; group separation; Labs "reloads" hints.
- Konami burst (WebGL path) + ripple fallback path.

## 7. Verification gates (before report)
`npm run lint` (my files), `npm run typecheck`, `npm test`, `npm run build` (static export), then the Playwright MCP visual sweep. Hunt edge cases (hotkey while typing, clipboard unavailable, reduced-motion, no-WebGL, mobile, broken links) and raise to industrial quality before documenting.

## 8. Files (new unless noted)

```
lib/command-palette/fuzzy.ts
lib/command-palette/commands.ts
lib/command-palette/types.ts            (Command / CommandGroup / CommandContext)
components/command-palette/command-palette.tsx
components/command-palette/palette-trigger.tsx
components/command-palette/use-command-palette.ts   (open state + global hotkeys, input-aware)
lib/easter-egg/konami.ts
lib/easter-egg/burst.ts
components/easter-egg/ripple-fallback.tsx
tests/unit/command-palette-fuzzy.test.ts
tests/unit/command-palette-commands.test.ts
tests/unit/konami.test.ts
tests/e2e/command-palette.spec.ts
# edits:
components/three/hero/inkfield-scene.tsx   (+uBurst uniform, burst subscribe, VERT impulse)
components/layout/site-nav.tsx             (mount <PaletteTrigger/>)
app/layout.tsx (or client shell)           (mount palette island + listeners + fallback)
docs/v2/COMMAND-PALETTE.md                 (phase doc)
docs/v2/ROADMAP-V2.5-SIGNATURE.md          (status update)
```

## 9. Risks / watch-items
- **Hotkey hijack:** `/` and `⌘K` must be suppressed when typing in fields and must not break browser find/quick-find unexpectedly — input-aware guard + only `preventDefault` on owned combos.
- **R3F uniform pitfall:** add `uBurst` to the initial uniforms map (don't swap the uniforms object identity); mutate `.value` in `useFrame` only. Burst must not fight the theme-remount `key`.
- **Variant reloads:** Labs commands cause a full reload by design — clearly signposted ("reloads"); acceptable for power-user toys.
- **Hydration:** platform-detected `⌘`/`Ctrl` hint must render client-only (e.g. `useSyncExternalStore` mounted flag like `ThemeSwitcher`) to avoid SSR mismatch.
- **Clipboard:** `navigator.clipboard` may be unavailable (insecure context) — guard + fallback affordance.
