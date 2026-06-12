# Claude.md - Portfolio v2

## Mission

Build a separate v2 portfolio that keeps the same content and functionality as v1, but replaces the vibe-coded presentation with a disciplined, professional, high-craft frontend.

## Non-negotiables

- Do not modify the live v1 code path unless the user explicitly asks.
- Keep the v2 app isolated in `v2/`.
- Preserve content parity with v1.
- Respect reduced motion, keyboard navigation, and contrast requirements.
- Prefer static export friendly patterns.
- Do not push to the remote until the user approves the result.

## What counts as parity

- 12 content sections from v1 plus the footer.
- The same resume, contact, project, research, course, certification, skills, development, and hobby content.
- The same external links and document assets where applicable.
- The same contact capability, but the implementation may change if it stays functionally equivalent.

## Build philosophy

- Use a real design system, not ad hoc styling.
- Keep motion purposeful and sparse. One or two strong motion ideas per view is enough.
- Make the site feel editorial, intentional, and premium, not generic or flashy.
- Use typography, spacing, rhythm, and composition as the main design tools.

## Implementation workflow

1. Read the spec and related docs.
2. Inspect current data and content contracts.
3. Implement one small, testable slice.
4. Review the slice for accessibility, responsiveness, and motion safety.
5. Add or update tests.
6. Fix issues before moving on.
7. Commit locally when a phase is stable.

## Motion guidance

- Use GSAP and ScrollTrigger for scroll-based choreography.
- Use transform and opacity based animation only when possible.
- Honor `prefers-reduced-motion` everywhere.
- Any pinned section must release cleanly and never trap the user.

## Data guidance

- Treat `static/data/projects.json`, `courses.json`, `research.json`, and `certifications.json` as canonical.
- If v2 needs typed content that is not in those files, extract it into small typed modules in the v2 app.
- Validate data at build time and fail fast on schema drift.

## Assets likely needed

- A higher-resolution hero portrait.
- An OG share image.
- Optional upgraded project covers.
- Optional generated motion assets or sequence frames.

## Skills (mandatory)

- `frontend-design`, `ui-ux-pro-max`, and the `gsap-*` family ARE available — consult them on
  every UI/motion change (the user requires it). The spec distills their guidance so subagents
  without the skills can still follow it.
- Source-of-truth order: user instructions → this doc + the v2 spec + `DESIGN.md`/`MOTION.md` →
  the skills.

## Phase docs

- `DESIGN.md` — design system & themes (Phase 1). `MOTION.md` — motion system (Phase 2).
- Per-phase plans live in `docs/superpowers/plans/`; the design spec in `docs/superpowers/specs/`.

## Current Context (2026-06-09)

### v1 vs v2 Comparison Complete
- Full section-by-section analysis in `docs/v2/V1-V2-COMPARISON.md`
- Master implementation plan in `docs/v2/MASTER-PLAN.md`

### Already Shipped (Tier A + B1/B3/C1-alt)
- SplitText hero name + section title reveals
- GSAP Flip on Projects filter
- Magnetic primary CTAs
- Animated skill proficiency bars
- Featured-build pinned scroll narrative (Interlace)
- Subtle scroll parallax on section glows
- CSS aurora ambient behind hero
- Custom cursor (dot + ring)

### Remaining v1 Richness Gaps
1. Scroll progress bar
2. Dynamic time-based greeting
3. Section dividers (SVG/CSS)
4. Fun facts ticker/marquee
5. Skills radar visualization
6. Syntax-highlighted code showcase
7. GPA visual card
8. Hobbies visual enrichment
9. SEO/Metadata (P11)
10. Image optimization (P12)

### Active Plan
- **Session 1:** Tier 1 Polish (scroll progress, greeting, dividers, ticker)
- **Session 2:** Tier 2 Richness (radar, code showcase, GPA card, hobbies)
- **Session 3:** SEO & Performance (P11 + P12)
- **Session 4:** Review & Refinement

### Key Decisions
- Keep v1 untouched at repo root; all work in `v2/`
- Do not push to remote until user approves
- All new features must respect `prefers-reduced-motion`
- All new features must work across all 4 themes
- Prefer transform/opacity animations only
- One commit per task; verify build + tests before commit
