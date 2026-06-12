# Portfolio v2 — Design Specification

**Date:** 2026-06-06
**Owner:** Parshv Patel
**Status:** Approved direction; pending final spec review → implementation planning
**Author:** Senior full-stack/frontend (agentic build)

---

## 1. Purpose & Goals

Rebuild the existing "v1" personal portfolio (Flask + vanilla HTML/CSS/JS) as a **v2** that keeps **identical content and features** but delivers a **professional, distinctive, award-tier frontend** with high-craft animation — explicitly *not* looking AI/"vibe-coded."

**Success criteria**
- 100% content/feature parity with v1 (all 13 sections, all data, contact form, SEO).
- Reads as *designed by a senior human*, not templated: real design system, editorial typography, intentional layout, restrained high-impact motion. Adopt 2026 design trends: Asymmetrical/Organic tactility, Purposeful "Smart" Motion, and Clarity-First minimalism.
- A **3-palette theme switcher** as a signature, accessible feature.
- A **reusable scroll-scrubbed image-sequence engine** as a premium showpiece.
- Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100 (desktop + mobile).
- WCAG 2.1 AA: 4.5:1 text contrast in every theme; full keyboard nav; `prefers-reduced-motion` honored everywhere.
- **Zero risk to v1**: v1 stays live and instantly restorable throughout.

**Non-goals (this milestone)**
- No new content/sections beyond v1 parity (the scroll-sequence is a presentation feature, not new content).
- No CMS/backend/database. No auth. Contact stays client-side (Web3Forms).
- WebGL/3D hero is explicitly deferred (optional future phase).

---

## 2. Locked Decisions

| Area | Decision |
|---|---|
| Framework | **Next.js 15 (App Router) + React 19 + TypeScript** |
| Styling | **Tailwind CSS v4** (`@theme` design tokens) |
| Components | **shadcn/ui** (structural: form, dialog, select) + **Aceternity UI / Magic UI** (select effects, used sparingly) |
| Animation | **GSAP + ScrollTrigger** (scroll choreography, pin/scrub, SplitText reveals) + **Lenis** (smooth scroll) + **Framer Motion** (declarative micro-interactions, theme/route transitions) |
| Rendering | **Static export** (`output: 'export'`) — perfect SEO, zero cold starts |
| Deploy | **Vercel** (Root Directory = `v2/`); v1 stays on Render until cutover |
| Structure | **`/v2` subfolder** in the existing repo; v1 untouched at root |
| Data | 4 JSON files in `static/data/` remain the **single source of truth**; synced into v2 at build time |
| Theme | **4 palettes** (Midnight / Daylight / Manuscript / Neon) via a switcher |
| Approach | **A — Editorial-Tech hybrid** (high polish, performant, accessible) |
| Style | **Exaggerated Minimalism** (oversized type, high contrast, whitespace, mono + one accent) |
| Scroll-sequence | Build the **reusable engine + placeholder now**; real frames + final subject/count decided during build |

---

## 3. Architecture

### 3.1 Repository layout (v1 fully intact)
```
Personal Website/                    # repo root — v1 untouched (Render)
├─ app.py · index.html · static/     # v1 site + assets
├─ static/data/*.json                # SHARED source of truth (projects, certifications, courses, research)
├─ docs/
│  ├─ superpowers/specs/             # this spec + future specs
│  └─ v2/                            # PRD, FEATURES, DESIGN, CLAUDE.md, ROLLBACK runbook (built in P12)
└─ v2/                               # Next.js 15 app (Vercel)
   ├─ app/
   │  ├─ layout.tsx                  # providers (theme, lenis), fonts, metadata, JSON-LD
   │  ├─ page.tsx                    # single-page portfolio composition
   │  ├─ globals.css                 # Tailwind v4 @theme tokens + 3 palette blocks
   │  └─ (route handlers for sitemap/robots if needed)
   ├─ components/
   │  ├─ sections/                   # Hero, About, Academics, Research, Terminal, Journey, Skills, Certifications, ProfDev, Projects, Hobbies, Contact
   │  ├─ ui/                         # shadcn components
   │  ├─ motion/                     # Reveal, Parallax, TextReveal, Magnetic, Marquee, CountUp, TiltCard, ScrollSequence
   │  ├─ theme/                      # ThemeProvider, ThemeSwitcher
   │  └─ layout/                     # Nav, Footer, Preloader, CustomCursor, GrainOverlay
   ├─ lib/
   │  ├─ data.ts                     # typed loaders (build-time)
   │  ├─ types.ts                    # Project, Course, Certification, Research interfaces
   │  └─ motion.ts                   # gsap registration, lenis setup, reduced-motion helpers
   ├─ content/                       # bio, journey, skills, hobbies, badges, awards, profDev as typed TS modules (extracted from v1 HTML)
   ├─ data/                          # synced copies of static/data/*.json (gitignored; produced by prebuild)
   ├─ scripts/sync-data.mjs          # prebuild: copy ../static/data/*.json → v2/data + validate
   ├─ public/                        # optimized images, OG image, sequence frames, favicons
   ├─ tests/                         # vitest unit + playwright e2e
   ├─ next.config.ts · tsconfig.json · package.json · postcss/tailwind config
   └─ vercel.json (if needed)
```

### 3.2 Data layer (single source of truth)
- **Canonical:** `static/data/{projects,certifications,courses,research}.json` (unchanged; v1 keeps consuming them).
- **Sync:** `scripts/sync-data.mjs` runs in `prebuild`, copying the 4 JSON files into `v2/data/` and **validating** them against `lib/types.ts` (fail the build on schema drift). This keeps one source of truth without bundler path hacks across the project boundary.
- **Content not in v1 JSON** (bio, stats, achievement badges, award cards, journey timeline, skills clusters, hobbies, professional development, academics copy, "currently building" panel) is **extracted from v1's `index.html` into typed `content/*.ts` modules** — a core de-vibe-coding deliverable (structured, typed, maintainable).
- All sections consume **typed loaders**; no `fetch` at runtime (data is inlined at build for SSG).

### 3.3 Rendering & contact
- `output: 'export'` → fully static HTML/CSS/JS on Vercel CDN. No server, no cold starts, no cronjob keep-alive.
- **Contact form:** Web3Forms (client-side POST) with client validation, honeypot, basic rate limiting, and a success overlay — parity with v1's current contact implementation.

---

## 4. Design System

### 4.1 Style direction
**Exaggerated Minimalism** (ui-ux-pro-max best match for portfolio/editorial): oversized display type `clamp(3rem, 10vw, 12rem)` with tight tracking and `leading-[0.9]`, generous negative space, monochrome canvas + a single accent per theme, grid-breaking/asymmetric composition, atmosphere via subtle grain + soft gradient mesh. **No emoji as structural icons** — use Lucide (v1's emoji badges become SVG/icon treatments or typographic marks).

### 4.2 Typography (distinctive — never Inter/Roboto/Space Grotesk)
- **Display:** **Fraunces** (variable; high-contrast editorial serif; optical sizing + soft axis) — heroes, section titles.
- **Body / UI:** **Hanken Grotesk** (or General Sans) — readable, characterful, not generic.
- **Mono:** **Geist Mono** — tags, dates, labels, terminal, code; uppercase + `tracking-widest` for labels. (Replaced JetBrains Mono per user preference.)
- `font-display: swap`; preload only the critical display + body weights. Tabular figures for stats/metrics.
- *Final type tuning is performed using the `frontend-design` skill during P1; per-theme display treatment is allowed if it improves cohesion.*

### 4.3 Color tokens (semantic; CSS variables; Tailwind v4 `@theme`)
Semantic token set (per theme): `--bg`, `--bg-elevated`, `--surface`, `--text`, `--text-muted`, `--accent`, `--accent-2`, `--border`, `--ring`, `--scrim`. Per-section accent tinting is allowed (e.g., projects vs research) using accent-derived shades.

**① Midnight** — Modern Tech / Developer (dark, **default**)
| token | hex |
|---|---|
| bg | `#0B0F14` |
| surface | `#121821` |
| bg-elevated | `#1A222E` |
| text | `#E6EDF3` |
| text-muted | `#9BA8B7` |
| accent | `#2DD4BF` (electric teal) · on-accent `#0B0F14` (dark; white fails on these accents) |
| accent-2 | `#818CF8` (violet glow) |
| border | `#1F2935` |

**② Daylight** — Classic & Corporate (light; recruiter/Amazon-safe)
| token | hex |
|---|---|
| bg | `#F7F8FA` |
| surface | `#FFFFFF` |
| text | `#1F2933` (charcoal) |
| headings | `#0A2540` (deep navy) |
| text-muted | `#52606D` |
| accent | `#2563EB` (steel blue) · on-accent `#FFFFFF` |
| accent-2 | `#8A6A1F` (deep gold — AA 4.75:1; vibrant `#C8A24B` is decorative-only) |
| border | `#E4E7EB` |

**③ Manuscript** — Creative / Editorial (warm; literary)
| token | hex |
|---|---|
| bg | `#FBF8F1` (cream) |
| surface | `#FFFDF7` |
| text | `#2B2622` (espresso) |
| text-muted | `#6E635A` |
| accent | `#AE4A33` (terracotta — AA 5.1:1 text / 5.5:1 white label; vibrant `#C25B3F` decorative-only) · on-accent `#FFFFFF` |
| accent-2 | `#5B6B4F` (deep sage) · on-accent `#FFFFFF` |
| border | `#E7DECE` |

**④ Neon** — Futuristic / Tech (dark; added per user request)
| token | hex |
|---|---|
| bg | `#0A0F1E` (space navy — never pure black) |
| elevated | `#18233D` |
| surface | `#121A2E` |
| text / heading | `#FFFFFF` (crisp white) |
| text-muted | `#A1A1AA` |
| accent | `#00E5FF` (electric cyan) · on-accent `#0A0F1E` |
| accent-2 | `#B026FF` (neon purple — AA 4.15:1, UI/large) |
| accent-3 | `#E5FF00` (electric yellow — Neon-only tertiary accent, AA 16.9:1; `--color-accent-3` utility) |
| border | `#243352` |
| switcher icon | robot (`Bot`) |

**Accessibility rule:** every `text`/`bg` and `accent`/`bg` pair must be verified ≥ 4.5:1 (≥ 3:1 for large text/UI glyphs) **per theme** before that theme ships (automated contrast test in CI). No pure `#000`/`#fff` for large text areas.

### 4.4 Spacing, radius, elevation
- 4/8px spacing scale; section vertical rhythm tiers (e.g., 64/96/128px). Consistent radius + elevation scales as tokens. Container max-width consistent (e.g., `max-w-6xl/7xl`).

---

## 5. Theme Engine

- **`next-themes`** with `attribute="data-theme"`, `themes=['midnight','daylight','manuscript','neon']`, `defaultTheme='midnight'`, persisted to `localStorage`, **no-flash inline script**. (System auto-mapping deferred — §16.)
- Each palette is a `[data-theme="..."]` block overriding the CSS variables consumed by Tailwind tokens.
- **Switcher UI:** accessible segmented control / select (keyboard + ARIA), labeled, in the nav.
- **Switch animation:** **View Transitions API circular reveal** clipping from the toggle origin; disable CSS transitions during the swap to avoid jank; **reduced-motion → instant crossfade**. Next.js `viewTransition` config enabled.

---

## 6. Motion System

### 6.1 Foundation
- `LenisProvider` (client) drives smooth scroll, synced to GSAP via `gsap.ticker` + `lenis.on('scroll', ScrollTrigger.update)`; `lagSmoothing(0)`.
- **All GSAP runs client-only via `useGSAP()`** (`@gsap/react`) with scoped refs + automatic cleanup; `gsap.registerPlugin(useGSAP, ScrollTrigger)` once. No GSAP/ScrollTrigger during SSR.
- **`prefers-reduced-motion`** is the master gate: wrap scroll/parallax/sequence in `gsap.matchMedia()`; Framer Motion `MotionConfig reducedMotion="user"`. Reduced-motion path = content fully visible, no pin/scrub/parallax, opacity-only or no motion.
- Performance: animate **transform/opacity only**; `will-change` only on actively animating elements; `gsap.quickTo()` for cursor; `ScrollTrigger.refresh()` only on real layout change (debounced); test on low-end mobile.

### 6.2 Reusable motion primitives (`components/motion/`)
`Reveal` (stagger-in on enter), `Parallax`, `TextReveal` (SplitText headings), `Magnetic` (buttons/links, pointer:fine only), `Marquee` (logos/skills), `CountUp` (stats), `TiltCard` (project/award cards). Each respects reduced-motion and cleans up on unmount.

### 6.3 Curated micro-features (restraint: 1–2 key animations per view)
- **Preloader:** 0→100 counter (GSAP `steps`) that **preloads the scroll-sequence frames + hero media**, then reveals the page. Skippable; bounded max duration; reduced-motion → minimal.
- **Custom cursor + magnetic interactions:** desktop `pointer:fine` only; hidden on touch; reduced-motion safe; never required for any action.
- **Grain/noise overlay + soft gradient mesh** for atmosphere (generated asset / CSS).
- **View Transitions** for theme switch and project detail open.

### 6.4 ScrollSequence engine (`components/motion/ScrollSequence.tsx`) — signature feature
**Behavior:** pinned full-viewport (or split) section; scroll scrubs through numbered frames drawn to `<canvas>`; releases to normal scroll at the last frame; side/overlay text beats reveal in sync.

**API (config-driven, reusable):**
```ts
interface ScrollSequenceProps {
  framePath: string;          // e.g. "/sequences/notebook/frame_"
  frameExt: 'webp' | 'avif' | 'jpg';
  frameCount: number;         // recommended 90–150
  pad: number;                // zero-pad width, e.g. 4 → frame_0001
  width: number; height: number;        // intrinsic frame size
  mobileFrameCount?: number;  // smaller set for narrow viewports
  layout?: 'full' | 'split';  // 'split' = sticky text column + canvas
  pinLength?: string;         // e.g. "+=150%"
  textBeats?: { at: number; heading: string; body?: string }[]; // at = 0..1 progress
  alt: string;                // text alternative (a11y)
}
```
**Engine details:** build frame URL list → preload `Image` objects → `img.decode()` (await all before enabling scrub) → `gsap.to(state, { frame: count-1, snap:'frame', ease:'none', scrollTrigger:{ trigger, start:'top top', end: pinLength, pin:true, scrub:1, onUpdate: render }})`. Canvas sized to devicePixelRatio; `object-fit: cover` math; redraw current frame on resize (throttled).

**Performance safeguards (the critical risk):** cap intrinsic dimensions (≈1440px longest edge desktop; serve a smaller mobile set); **WebP/AVIF**; total sequence budget target ≤ ~3–4 MB after compression; preloaded during the preloader; lazy-init ScrollTrigger when section nears viewport.

**Mobile:** use `mobileFrameCount` (fewer/smaller frames) or a short autoplay-muted `<video loop playsinline>` fallback; never trap scroll.

**Accessibility:** reduced-motion → render a single representative frame (first or mid), no pin/scrub, beats shown as static text; always provide `alt` + the beats as readable text; keyboard users can scroll/tab past freely.

**Placeholder (P2/P-sequence):** ship with a programmatically generated placeholder frame set (or a simple canvas-drawn sequence) so the engine is fully testable before real assets exist. Real frames are dropped into `public/sequences/<name>/` later.

---

## 7. Sections (full v1 parity, redesigned)

Single-page composition (anchored sections) with scroll-spy nav. Each section is a self-contained component consuming typed data/content.

1. **Nav** — sticky, scroll-aware (hide/condense on scroll), active-section indicator, **theme switcher**, mobile menu (accessible, focus-trapped).
2. **Hero** — name (Fraunces, oversized), animated role (rotating/typewriter), portrait, CTAs (Explore Work / Contact / Resume), socials, scroll cue; atmospheric background tinted per theme.
3. **ScrollSequence showpiece** — full-viewport pinned statement section (placeholder until frames provided). Placement: directly after hero (revisit during build).
4. **About** — bio, key facts, **animated stat counters** (4.0 GPA, 10+ projects, 5 research papers, 15+ awards, 136+ volunteer hrs), **achievement "badge wall"** (hover tooltips, SVG/typographic, not emoji), **expandable award cards** → accessible modal (16 awards), **code-showcase tabs** (python/js/sql), **documents** (resume/transcript/LinkedIn).
5. **Academics** — UC Berkeley header stats, GPA, **course grid** (completed / currently enrolled / upcoming) from `courses.json` with course images.
6. **Research** — papers from `research.json`.
7. **Terminal** — interactive terminal easter-egg (typed commands; keyboard accessible; mono font).
8. **Journey** — timeline India → Berkeley → Amazon (Summer 2026). May use pinned/horizontal-scroll storytelling pattern; reduced-motion → plain vertical list.
9. **Skills** — categorized clusters + logo **marquee**; proficiency indicators (not color-only).
10. **Certifications** — cards from `certifications.json`.
11. **Professional Development** — leadership/community.
12. **Projects** — bento/masonry grid, **category filters** (All, Full-Stack SaaS, Computer Vision, Machine Learning, Deployed Apps, Data Analytics) from `projects.json`, **featured** treatment. *Ruthless Curation strategy*: Highlight 2-3 high-impact projects as rich case studies (focusing on problem, constraints, outcomes, and impact) within the detail view, rather than just showing a generic list. **"⚡ Currently Building" panel** (JARVIS AI). Project **detail** (modal or route) with highlights/links (GitHub/live/presentation). Visuals-first, fast, filterable.
13. **Contact** — Web3Forms form (shadcn + RHF + Zod, inline validation, aria-live errors, success overlay) + socials; **Footer**.

---

## 8. SEO / Metadata Parity

- Next Metadata API: title/description, **Open Graph + Twitter cards**, canonical `https://www.portfolio.parshvpatel.com/`.
- **JSON-LD `Person` schema** (name, role, education, sameAs links).
- `sitemap.xml`, `robots.txt` (disallow nothing meaningful; allow Bingbot), **IndexNow key route**, Google Search Console verification meta, full **favicon set** + apple-touch-icon, **OG share image** (1200×630).
- Semantic landmarks, heading hierarchy (single h1), skip-link.

---

## 9. Deployment & Rollback

- **During build:** commit often **locally only**; **do not push** until both user and agent have tested and approved.
- v2 → Vercel project, Root Directory `v2/`, preview URL per commit for review.
- v1 stays on **Render + cronjob** with the domain pointing at it throughout.
- **Cutover (post-approval only):** repoint `www.portfolio.parshvpatel.com` → Vercel; verify SEO/SSL/redirects.
- **Rollback:** repoint DNS → Render (instant); keep Render warm during a grace window. Documented step-by-step in `docs/v2/ROLLBACK.md` (P12).

---

## 10. Testing Strategy

- **Unit (Vitest + Testing Library):** data loaders + schema validation, theme logic, project filter logic, contact form validation, motion reduced-motion guards, ScrollSequence frame-index math.
- **E2E / visual (Playwright):** per-section smoke; theme switch across all 3 palettes; nav + scroll-spy; project filters; contact happy + error paths; ScrollSequence pin/scrub + reduced-motion fallback; responsive at 375/768/1024/1440; **axe accessibility** pass; Lighthouse budget check; screenshots for user visual review.
- **Build gate:** `next build` static export clean, no console errors, internal link check, bundle-size budget.
- **Strict TDD Requirement (User Mandate):** You must complete the software development cycle by writing failing tests first for data/validation/filter/contact/theme/sequence-math logic, UI states, and interactions before implementation. This proves the test catches bugs and ensures the fix resolves it. Validate that results actually make sense.

---

## 11. Accessibility & Performance Budgets

- WCAG 2.1 AA; 4.5:1 text contrast per theme (CI-verified); visible focus rings; 44×44px touch targets; keyboard-complete; `aria-live` form errors; reduced-motion full coverage.
- Lighthouse: Perf ≥ 90 / A11y ≥ 95 / BP ≥ 95 / SEO 100. CLS < 0.1 (reserve image space). Transform/opacity-only animation. Lazy-load below-fold media. Sequence payload budgeted.

---

## 12. Skill-Usage Mandate (required by user)

Every relevant implementation phase **must** consult these skills and the implementing agent must state how it applied them:
- **`frontend-design`** — aesthetic direction, typography, layout, atmosphere; avoid generic AI aesthetics.
- **`gsap` family** (`gsap-core`, `gsap-scrolltrigger`, `gsap-react`, `gsap-performance`, `gsap-timeline`, `gsap-plugins`) — all animation work.
- **`ui-ux-pro-max`** — design-system queries, color/typography/UX validation, pre-delivery checklist.
Per-phase mapping is in §13.

---

## 13. Phased Multi-Session Plan

Each phase = **plan → read code → implement → code review → test → bug-fix → commit** (atomic commits, no push). Skills column = which must be used.

| Phase | Scope | Skills | Acceptance |
|---|---|---|---|
| **P0 Scaffold & infra** | Next.js 15 + TS + Tailwind v4; lint/format; Vitest + Playwright; `sync-data.mjs` + `lib/types.ts`; Vercel preview ("hello") | ui-ux-pro-max | App builds + deploys to preview; data sync validates; CI green |
| **P1 Design system + theme engine** | tokens, 3 palettes, type scale, primitives (Button/Card/Section/Container), next-themes + View Transitions switch, contrast tests, kitchen-sink preview page | frontend-design, ui-ux-pro-max | 3 themes switch with no flash; all contrast tests pass; switcher keyboard-accessible |
| **P2 Motion foundation** | Lenis+GSAP provider, reduced-motion gating, motion primitives, **ScrollSequence engine + placeholder frames** | gsap-*, ui-ux-pro-max | Primitives + sequence work; reduced-motion verified; no SSR errors; cleanup verified |
| **P3 Layout shell** | Nav (scroll-spy, theme switch, mobile menu), Footer, Preloader, CustomCursor, GrainOverlay, page scaffold | frontend-design, gsap-*, ui-ux-pro-max | Nav/footer/preloader work; a11y + reduced-motion pass |
| **P4 Hero + Sequence showpiece** | Hero section + wire ScrollSequence placeholder into layout | frontend-design, gsap-* | Hero animates; sequence pins/scrubs/releases; reduced-motion fallback |
| **P5 About** | bio, stat counters, badge wall, award modals, code tabs, documents | frontend-design, gsap-*, ui-ux-pro-max | Parity with v1 About; modals accessible; counts animate once |
| **P6 Academics + Research** | course grid (3 states), research papers | frontend-design, ui-ux-pro-max | Renders from JSON; responsive |
| **P7 Journey + Terminal** | timeline (pinned/horizontal pattern), interactive terminal | frontend-design, gsap-* | Timeline + terminal work; reduced-motion → static |
| **P8 Skills + Certifications + Professional Development** | clusters + marquee, cert cards, prof-dev | frontend-design, ui-ux-pro-max | Parity; marquee pauses on hover; a11y |
| **P9 Projects** | bento grid, filters, featured, "currently building", detail view | frontend-design, gsap-*, ui-ux-pro-max | Filter logic tested; detail accessible; visuals-first |
| **P10 Hobbies + Contact** | hobbies, Web3Forms contact + footer | frontend-design, ui-ux-pro-max | Form validates + submits; success overlay; aria-live errors |
| **P11 SEO/meta** | metadata, OG/Twitter, JSON-LD, sitemap/robots/IndexNow, favicons, OG image, GSC verify | ui-ux-pro-max | All meta present; rich-results valid; sitemap/robots served |
| **P12 A11y/perf/responsive QA** | axe, Lighthouse, cross-browser, 375→1440, reduced-motion sweep, contrast re-verify | ui-ux-pro-max, gsap-performance | Budgets met across browsers/breakpoints |
| **P13 Docs** | `docs/v2/`: CLAUDE.md, PRD.md, FEATURES.md, DESIGN.md, ROLLBACK.md, asset/sequence generation guide | — | Concise, complete; an agent can onboard from them |
| **P14 Cutover** | (post user approval) push, domain switch, post-deploy verification | — | v2 live on domain; rollback documented + tested |

---

## 13.5 Multi-Agent Task Execution Strategy

To avoid context rot and ensure unbiased code review, execution should be distributed among autonomous subagents with fresh context windows. The parent agent will delegate targeted chunks of work (e.g., implementing a single component, writing a test suite, creating an animation) to specialized subagents.

- **Research/Design Subagents:** Invoked for gathering styling inspiration or validating UX contrast rules.
- **Implementation Subagents:** Delegated isolated UI components or logic modules. Given strict boundaries and TDD mandates.
- **Review/Testing Subagents:** Separate agents invoked specifically to review code produced by implementation subagents, run the tests, and verify performance/accessibility.

---

## 14. Images / Assets — what the user provides

Reuse all v1 images. To elevate v2, the agent will request (with exact specs + Nano Banana Pro prompts) at the relevant phase:
- **Higher-res portrait** for the editorial hero (≥ 1200px, neutral background ideal).
- **OG share image** 1200×630 (or agent-generated).
- **Optional** higher-res project covers.
- **Scroll-sequence frames** (when subject chosen): generated via Nano Banana Pro (start + end frame) → Higgsfield (start/end → video) → frame extraction → numbered `frame_0001.webp …`. Spec: ~90–150 frames, ≤ ~1440px longest edge, WebP/AVIF, consistent dimensions, zero-padded names, placed in `v2/public/sequences/<name>/`. Full generation guide lives in `docs/v2/` (P13), but the asset spec is fixed here.
- Grain/noise + gradient-mesh textures: agent-generated.

---

## 15. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Scroll-sequence payload tanks performance | dimension cap + WebP/AVIF + budget + preloader + mobile fallback + lazy init |
| Scroll-jacking causes motion sickness (HIGH per ux rules) | reduced-motion fallback mandatory; never trap scroll; sequence releases at end |
| Theme flash (FOUC) on load | next-themes no-flash inline script; SSR-safe default |
| Cross-project data boundary (v2 reading v1 JSON) | prebuild sync + schema validation (fail fast) |
| Looking "vibe-coded" | real token system, distinctive type, Exaggerated Minimalism, restraint, frontend-design skill gate |
| v1 breakage / risky cutover | v1 untouched; subfolder isolation; DNS-only cutover with instant rollback |
| Static export limitations | no runtime server features used; contact stays client-side (Web3Forms) |

---

## 16. Open Items (resolved during build)
- Final scroll-sequence subject + count (engine + placeholder ship first).
- Exact display-font tuning / optional per-theme type treatment (P1 via frontend-design).
- Projects detail = modal vs dedicated route (decide in P9 based on feel/SEO).
- Journey layout = pinned vertical vs horizontal-scroll (decide in P7).

---

## 17. Review notes and corrections

This section records the main gaps and ambiguities that need to be carried into implementation so the v2 does not drift from the intent of the spec.

- The current v1 has 12 content sections plus the footer. When the spec says 13 sections, that should be interpreted as 12 content sections plus footer, not 13 distinct content blocks.
- The SEO/metadata plan should use static-export friendly Next.js metadata files or public assets for `robots.txt`, `sitemap.xml`, favicon files, and the IndexNow key. Runtime route handlers are not the right default for a static-export build.
- The theme switch and project-detail transitions need graceful feature detection. If View Transitions are unsupported, the fallback should be a clean fade rather than a broken interaction.
- The scroll-sequence must never trap scrolling on mobile or on reduced-motion devices. The fallback should be a single static frame or lightweight media instead of a pinned scrub.
- The contact experience should explicitly acknowledge that the implementation is client-side and provider-backed, so the UX needs clear success and failure states.
- The design docs should treat the missing `frontend-design` and `ui-ux-pro-max` skill files as unavailable in this environment. Motion and UX decisions should still be made, but the fallback references are the GSAP skills and this spec pack.
- The shared-data contract should stay build-time only. v2 should not depend on runtime cross-root fetches from v1.
- The project-detail decision should favor the least risky option for the first release. A modal is usually safer for parity; a dedicated route should only be chosen if it is clearly justified by the final information architecture.
