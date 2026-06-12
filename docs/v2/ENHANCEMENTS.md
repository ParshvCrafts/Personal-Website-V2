# v2 — Premium Enhancement Plan & v1↔v2 Parity Audit

> Created 2026-06-09. Companion to `ROADMAP.md`. Captures the v1→v2 visual/feature
> comparison and a prioritized, taste-first animation backlog.
>
> **STATUS — Tier A + animated skill bars SHIPPED (2026-06-09)** via
> `docs/superpowers/plans/2026-06-09-portfolio-v2-tier-a-motion-enhancements.md`:
> SplitText hero name + section-title reveals (A1), GSAP Flip on the Projects
> filter (A2), magnetic hero/contact CTAs (A3), and animated skill proficiency
> bars (B2 — replaces v1's radar gap, `role=meter`, RM-safe). All reduced-motion
> gated, no content changes, axe-clean across all 4 themes, full e2e green.
> Remaining/optional: B1 pinned project story, B3 section transitions, C1 WebGL
> hero, C2 custom cursor, + image compression (P12).

## 1. v1 → v2 feature/parity audit

v1 = single-file `index.html` (deployed at portfolio.parshvpatel.com). v2 = Next.js app in `v2/`.

| v1 feature | v2 status | Verdict |
|---|---|---|
| Nav (Home/About/Education/Research/Skills/Certs/Projects/Hobbies/Contact) | ✅ present (`NAV_SECTIONS`) | parity |
| Hero: three.js **particle-constellation** bg + pastel purple gradients + typed tagline + photo | ✅ reworked into editorial hero + scroll-showpiece | **v2 better for the goal** — the particle net + heavy gradients are the exact "generic-AI portfolio" trope to avoid |
| Dynamic greeting ("Good evening") + rotating role typewriter | ✅ hero rotating roles (`HERO_ROLES`) | parity (typewriter is in Terminal section) |
| About (bio, facts, awards) | ✅ About section + award modal | parity |
| Academics (courses / in-progress / upcoming) | ✅ Academics (course grid + modal) | parity |
| Research papers | ✅ Research (card+modal) | parity |
| **Terminal / code editor** (typed commands) | ✅ Terminal section (typewriter, 5 commands) | parity |
| Journey timeline | ✅ Journey (alternating timeline) | parity |
| **Skills radar chart** (canvas) | ⚠️ replaced with badge clusters + marquee | **gap to evaluate** — radar is a distinctive data-viz; badges are cleaner but less memorable |
| Certifications | ✅ cert grid + modal | parity |
| Professional Development | ✅ dev list | parity |
| Projects (bento + filters) | ✅ bento grid + filter tablist + modal + JARVIS panel | parity+ |
| Hobbies (Tennis/Poetry/secondary) | ✅ featured + secondary cards | parity |
| Contact (form) | ✅ Web3Forms form + validation | parity |
| Footer | ✅ | parity |
| Theme toggle | ✅ 4 themes (midnight/daylight/manuscript/neon) | **v2 better** (v1 had 1 toggle) |

**Content parity: complete.** No v1 information is missing from v2.

### Where v1 is arguably still "richer" (candidates, not regressions)
1. **Skills radar chart** — v1's canvas radar is a memorable data-viz moment. v2's badge clusters read cleaner/more pro but flatter. *Option:* add an optional, tasteful radar/spider or animated proficiency bars — only if it reads premium, not gimmicky.
2. **Hero motion presence** — v1's animated bg gives instant "alive" feeling. v2 is more restrained. *Option:* add a subtle, non-trope ambient hero motion (see §2.1) — NOT a particle network.

Everything else: v2 already equals or beats v1 on craft, and deliberately drops the AI-portfolio clichés (particle net, rainbow gradients, pastel) per the project mission.

## 2. Premium animation backlog (taste-first, 2026 senior-designer patterns)

Principle (from 2026 award trends + project `MOTION.md`): **restraint, story-driven scroll motion, motion that serves content.** All must honor `prefers-reduced-motion` and never block reading. Each item is independently shippable with TDD + review (same workflow as P9/P10).

### Tier A — high value, low risk, on-brand
- **A1. SplitText heading reveals.** Char/word stagger on section `<h2>`s and the hero name as they enter view. Single strong premium signal; GSAP SplitText. Reduced-motion → plain fade.
- **A2. Projects filter Flip animation.** Today filtering swaps cards with an opacity blink. Use GSAP **Flip** so cards smoothly reposition/scale when a filter changes. Directly elevates the just-shipped P9 grid. Reduced-motion → instant (current behavior).
- **A3. Magnetic primary CTAs + refined focus/hover.** `magnetic.tsx` already exists; apply sparingly to hero CTAs and the contact submit. Pointer-fine only.

### Tier B — medium value, medium effort
- **B1. Pinned "scroll story" for a flagship project** (e.g., Interlace) — a short pinned ScrollTrigger sequence revealing problem→approach→result. Builds on existing scroll-showpiece engine.
- **B2. Animated skill proficiency** — replace/augment badge clusters with on-scroll animated bars or a restrained radar (count-up + draw-on). Revisits the one real v1 gap.
- **B3. Section-to-section transitions** — subtle parallax/clip reveals between major sections (already have `parallax.tsx`).

### Tier C — high craft, higher risk (only if it stays tasteful)
- **C1. Subtle WebGL ambient hero** — a slow, low-contrast shader gradient/grain behind the hero (à la Codrops 2026 fluid-WebGL portfolios), NOT a particle network. Must be near-subliminal. Perf-budgeted, reduced-motion static.
- **C2. Custom cursor / hover states** on interactive media. Easy to overdo — gate behind taste review.

### Cross-cutting (do alongside, from QA)
- **Image optimization (P12)** — `interlace.jpg` is 1.9 MB for a 370 px card; compress/resize all migrated project covers (~10× payload cut).

## 3. Suggested sequencing
1. **P11 SEO/metadata** (already next in roadmap) — ship first; cheap, high SEO value.
2. **A1 → A2 → A3** (Tier A polish) — biggest premium lift per effort, low risk.
3. **B2** (skills) — closes the only real v1 richness gap.
4. **C1** (WebGL hero) — only after a design spike proves it reads premium, not trope.
5. **Image optimization** folded into **P12 perf QA**.

## 4. Open decisions for the user
- Skills: keep clean badge clusters, or reintroduce a (tasteful) data-viz moment? (B2)
- Hero: add subtle ambient WebGL motion (C1), or keep the current fully-restrained hero?
- Appetite for Tier C (custom cursor / WebGL) vs. staying Tier A/B minimal?
