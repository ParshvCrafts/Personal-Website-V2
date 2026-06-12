# Portfolio v2 — P9 Projects + P10 Hobbies + Contact Design

**Date:** 2026-06-08  
**Phases:** P9 (Projects section), P10 (Hobbies section + Contact section)  
**Branch:** feat/portfolio-v2  
**Stack:** Next.js 16 static export · Tailwind v4 · GSAP+ScrollTrigger · 4 themes · Fraunces+Hanken+GeistMono

---

## 1. Scope

Two phases that complete all remaining stub sections in `v2/app/page.tsx`:

| Phase | Sections | Nav entry |
|-------|----------|-----------|
| P9 | `#projects` | ✓ (in NAV_SECTIONS) |
| P10 | `#hobbies`, `#contact` | hobbies: no; contact: ✓ |

After P10 the home page has zero stubs. P11 (SEO), P12 (QA), P13 (Docs), P14 (Cutover) follow separately.

---

## 2. P9 — Projects

### 2.1 Data

- Source: `getProjects()` → `v2/data/projects.json` (12 items, already Zod-validated via `projectsSchema`)
- Categories in data: `all | saas | cv | ml | deployment | analytics`
- Featured projects (2): `interlace-fashion-search`, `atlasmind-ai-trip-planner`
- No new data files needed

### 2.2 Content module

`v2/content/projects.ts` — static data not derivable from JSON:

```ts
export const CURRENTLY_BUILDING = {
  name: "JARVIS AI Assistant",
  description:
    "A comprehensive personal AI assistant featuring voice control, task automation, multi-LLM integration, and 8+ specialized modules including Academic, Career, Finance, and Research assistants.",
  tech: ["Python", "LangChain", "OpenAI", "Groq", "Flask"],
};

export const CURRENTLY_LEARNING = [
  "Agentic AI & Autonomous Systems",
  "Large Language Models (LLMs)",
  "Advanced Machine Learning",
];

export const LEARNING_GOAL =
  "Goal: Build production-ready AI systems";

export const FILTER_LABELS: Record<string, string> = {
  all: "All Projects",
  saas: "Full-Stack SaaS",
  cv: "Computer Vision",
  ml: "Machine Learning",
  deployment: "Deployed Apps",
  analytics: "Data Analytics",
};
```

### 2.3 Component tree

```
v2/components/sections/projects/
  index.tsx          — server component; fetches data, renders section shell
  project-grid.tsx   — "use client"; filter state + bento grid + modal
  project-card.tsx   — pure presentational card (client, receives open handler)
  project-modal.tsx  — modal content (client, receives project)
  jarvis-panel.tsx   — server component; JARVIS + learning panels (static)
```

### 2.4 Layout

**Section header** (server):
- Overline: `font-mono text-xs uppercase tracking-[0.25em] text-accent` → "Selected Work"
- H2: `font-display text-4xl md:text-6xl text-heading` → "Projects"
- Subtitle: count + tagline

**Filter bar** (client):
- Horizontal scroll on mobile; flex-wrap on tablet+
- Each filter: `<button role="tab">` inside `<div role="tablist" aria-label="Filter projects by category">`
- Active: `bg-accent text-on-accent`; inactive: `border border-border text-muted hover:border-accent/40`
- On change: `useTransition` wraps state update → React defers re-render without blocking

**Bento grid** (client):
- CSS grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5`
- Featured cards (`featured: true`): `sm:col-span-2` — wider cell with image visible at `h-48`
- Normal cards: single cell, no image shown (title + description excerpt + tags + links)
- Filter hides cards via `display:none` (avoids layout shift jank vs. opacity-only)
- Reduced-motion: skip GSAP card entrance, cards appear statically

**Project card:**
- `<button>` wrapping the card area (opens modal), `aria-haspopup="dialog"`
- Featured card additionally shows: `<Image>` from `/images/{project.image}` (with fallback placeholder div if image 404s), truncated description, all tags
- Normal card: title, 2-line description clip, top-3 tags
- External link buttons (`<a target="_blank" rel="noopener noreferrer">`) float to card bottom: GitHub (if not null), Live (if not null), Presentation — these use `e.stopPropagation()` so clicking a link doesn't also open the modal
- "Featured" badge on `featured: true` cards: `font-mono text-[10px] uppercase tracking-widest text-accent`

**Modal:**
- Reuses existing `<Modal>` primitive
- Content: issuer/overline (categories), title (Fraunces), full description, `Highlights` section (bullet list with accent bullets), `Tech Stack` badges, link buttons row
- `labelledBy` → title element `useId()`

### 2.5 JARVIS "Currently Building" panel

Server component (no interactivity needed):

```
┌─────────────────────────────────────┐
│ ⚡ WHAT I'M WORKING ON    ● ACTIVE  │
├──────────────────┬──────────────────┤
│ 🚀 CURRENTLY     │ 📚 CURRENTLY     │
│    BUILDING      │    LEARNING      │
│                  │                  │
│ JARVIS AI        │ • Agentic AI     │
│ Assistant        │ • LLMs           │
│                  │ • Advanced ML    │
│ [description]    │                  │
│                  │ 🎯 Goal: …       │
│ [tech badges]    │                  │
└──────────────────┴──────────────────┘
```

- Container: `border border-border rounded-2xl bg-surface` with top `border-l-2 border-accent`
- Header row: `font-mono text-xs uppercase tracking-widest` + pulsing dot (`animate-pulse bg-accent`)
- Two panels side-by-side at `md:` breakpoint, stacked on mobile
- No animation (server component; GSAP Reveal wrapper on the outer div handled by a client `<Reveal>` wrapper)

### 2.6 Accessibility

- Filter buttons: `role="tab"` in `role="tablist"`, `aria-selected`, `aria-controls` pointing to grid id
- Grid: `role="tabpanel"` with `aria-labelledby` pointing to active filter
- Cards: `aria-label="{title} — open project details"` on the card button
- External links: `aria-label="{type} for {title}"`, `<span class="sr-only">(opens in new tab)</span>`
- Modal: existing focus-trap, Esc, scrim-close, focus-restore

### 2.7 Tests

Unit (`v2/tests/unit/projects.test.ts`):
- `getProjects()` returns 12 items
- Featured count = 2
- All items have valid categories array containing "all"
- `nextRoleIndex`-style pure function for filter logic (if extracted)

E2E (`v2/tests/e2e/projects.spec.ts`):
- Projects section visible, `h2` contains "Projects"
- Default "All Projects" shows 12 cards
- Filter "Computer Vision" → correct count visible
- Click featured card → modal opens, title visible
- Esc closes modal, focus returns to card
- axe scan on projects section (no violations)

---

## 3. P10 — Hobbies

### 3.1 Data

`v2/content/hobbies.ts` — all static, no JSON source:

```ts
export interface HobbyAward {
  tier: "gold" | "silver" | "bronze";
  name: string;
  detail?: string;
}

export interface FeaturedHobby {
  id: string;
  title: string;
  role: string;
  icon: string; // lucide icon name
  description: string;
  awards: HobbyAward[];
  extra?: React.ReactNode; // Poetry journey + poem
}

export interface SecondaryHobby {
  id: string;
  title: string;
  role: string;
  icon: string;
  description: string;
}
```

Content matches v1 exactly:

**Tennis:** VP | 2 years. Awards: CBAADA Scholarship (gold), Outstanding Doubles Play (gold), Athlete of Year + Athletic Scholar Badge (silver), Most Improved Player (bronze).

**Poetry:** Published Poet | National Champion. Journey: Club → District (12 clubs) → State (185 clubs) → National (50+ states). Poem: "The Pencil, the Rocket, and the Sky" — tribute to Katherine Johnson. Award: 1st Place National GFWC Youth Writing. Link to published poem.

**Secondary (4):** Calisthenics, Hiking & Mountain Climbing, Music, Anime.

### 3.2 Component tree

```
v2/components/sections/hobbies/
  index.tsx      — server component; section shell + featured + secondary grid
```

Single file (no modal needed — all content fits on cards).

### 3.3 Layout

- Not in `NAV_SECTIONS` → add `id="hobbies"` section in `page.tsx` between `<Projects>` and `<Contact>` directly
- `scroll-mt-[88px]` for consistency even without nav link

**Featured row:** `grid grid-cols-1 md:grid-cols-2 gap-6`
- Each card: `rounded-2xl border border-border bg-surface p-6`
- Top-left: Lucide icon in `text-accent` + title (Fraunces) + role (Geist Mono)
- Awards list: tier icon (Trophy/Star/TrendingUp from lucide) + `text-[10px]` badge matching tier (gold → `text-accent`, silver → `text-muted`, bronze → `text-muted/70`)
- Poetry card: 4-step journey `flex gap-2 items-center font-mono text-xs` with `→` separators, step pill for "National" highlighted in `bg-accent text-on-accent`; poem block with italic title + recognition line; external "View Published Poem →" link

**Secondary grid:** `grid grid-cols-2 md:grid-cols-4 gap-4 mt-6`
- Simpler cards: icon + title + role + description
- Reveal stagger animation

### 3.4 Tests

Unit: data shape validation (TypeScript compilation is sufficient; no runtime Zod schema needed for static content).

E2E (`v2/tests/e2e/hobbies.spec.ts`):
- Section visible, `h2` "Beyond the Code"
- Tennis and Poetry featured cards rendered
- Secondary grid has 4 cards
- axe scan (no violations)

---

## 4. P10 — Contact

### 4.1 Component tree

```
v2/components/sections/contact/
  index.tsx        — server component; section shell + layout
  contact-form.tsx — "use client"; form state, validation, Web3Forms submit
```

### 4.2 Layout

Two-column at `md:` breakpoint:

**Left column (info):**
- Heading: "Let's work together!" (Fraunces)
- Intro paragraph
- Contact items: `<Mail>`, `<Phone>`, `<MapPin>` lucide icons + label + value/link
- Social buttons: LinkedIn + GitHub (lucide icons)

**Right column (form):**
- Fields: name (text), email (email), subject (text), message (textarea rows=5)
- Honeypot: `<input name="botcheck" tabIndex={-1} aria-hidden="true" style={{display:'none'}}>`
- Hidden `<input name="access_key" value="510ff904-9c86-4c43-acce-03ba01e12a12">`
- Submit button: `<button type="submit">` with loading state (spinner icon, disabled during fetch)

### 4.3 Validation

Client-side before submit (no library, minimal):
- Required: name (≥2 chars), email (regex), subject (≥2 chars), message (≥10 chars)
- On submit attempt: run all field checks, set `errors` state map
- `aria-describedby` on each input → matching error `<span id="{field}-error">` 
- Error region: `<div role="alert" aria-live="polite" aria-atomic="true">` — announces first error to screen readers

### 4.4 Submit flow

```
handleSubmit →
  validate() → if errors: set errors state, focus first invalid field, return
  setStatus("sending")
  fetch("https://api.web3forms.com/submit", { method:"POST", body: FormData })
  200 → setStatus("success") → show success overlay
  non-200 / network error → setStatus("error") → show error message in aria-live region
```

**Success overlay:** absolute-positioned over the form panel, fade in, checkmark icon + "Message sent!" + "I'll get back to you soon." No dismiss button — persistent until page reload (contact sent, no need to re-submit).

### 4.5 Tests

Unit (`v2/tests/unit/contact-validation.test.ts`):
- Validates required fields
- Email regex accepts valid, rejects invalid
- Short name/message triggers error

E2E (`v2/tests/e2e/contact.spec.ts`):
- Section visible, form fields present
- Submit empty → aria errors shown
- Fill valid data → mock fetch → success overlay appears (mock via `page.route`)
- axe scan (no violations)

---

## 5. Page assembly

Update `v2/app/page.tsx`:
1. Import `Projects` from `@/components/sections/projects`
2. Import `Hobbies` from `@/components/sections/hobbies`
3. Import `Contact` from `@/components/sections/contact`
4. Replace the stub loop entirely:
   ```tsx
   <Projects />
   <Hobbies />
   <Contact />
   ```

---

## 6. Non-negotiable constraints

- All 4 themes: midnight/daylight/manuscript/neon — semantic tokens only, no hardcoded colors
- WCAG 2.1 AA contrast in every theme — use `color-mix(in oklab, var(--accent) …)` for tints
- Reduced-motion: all GSAP wrapped in `gsap.matchMedia()` → `prefers-reduced-motion: no-preference`; content visible statically under reduced motion
- No `any` types
- Existing `<Modal>`, `<Badge>`, `<Reveal>` primitives reused
- `v1` untouched: no edits to `app.py`, `index.html`, `static/**`
- No push until user approves

---

## 7. File checklist

```
NEW:
  v2/content/projects.ts
  v2/content/hobbies.ts
  v2/components/sections/projects/index.tsx
  v2/components/sections/projects/project-grid.tsx
  v2/components/sections/projects/project-card.tsx
  v2/components/sections/projects/project-modal.tsx
  v2/components/sections/projects/jarvis-panel.tsx
  v2/components/sections/hobbies/index.tsx
  v2/components/sections/contact/index.tsx
  v2/components/sections/contact/contact-form.tsx
  v2/tests/unit/projects.test.ts
  v2/tests/unit/contact-validation.test.ts
  v2/tests/e2e/projects.spec.ts
  v2/tests/e2e/hobbies.spec.ts
  v2/tests/e2e/contact.spec.ts

MODIFIED:
  v2/app/page.tsx               — replace stub loop with real sections
  docs/v2/ROADMAP.md            — mark P9 + P10 complete
```
