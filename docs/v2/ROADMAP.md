# Roadmap

## Status

- Session 1 (Foundations) — **complete**.
- Session 2 (Design system) — **complete** (4 themes: midnight/daylight/manuscript/neon).
- Session 3 (Motion foundation) — **complete**. See `MOTION.md`.
- Session 4 — **complete**: layout shell (`SHELL.md`) + **Hero + ScrollSequence showpiece** (`HERO.md`). Cross-browser e2e (chromium/firefox/webkit) + axe a11y scans in place.
- Session 5 (Content sections) — **in progress**. **About (P5) complete** (`ABOUT.md`): bio + facts, data-derived stat counters, typographic badge wall, award modal, code tablist, documents; reusable `Modal` primitive added.
- ✅ **P6 Academics + Research complete** (`ACADEMICS-RESEARCH.md`): course grid (13 courses, 3 groups, card+modal), research papers (5, card+modal), unit tests, e2e smoke assertion.
- ✅ **P7 Journey + Terminal complete** (`JOURNEY-TERMINAL.md`): decorative terminal typewriter (5 commands, loop, reduced-motion static), center-line alternating timeline (11 milestones, active Amazon intern).
- ✅ **P8 Skills/Certifications/Professional Development complete** (`SKILLS-CERTS-DEV.md`): skill badge clusters (4 categories, 27 skills), CSS marquee, 10 certification cards with modal, 9 professional development cards with status badges.
- ✅ **P9 Projects complete**: bento grid (12 projects, 6-category filter tablist with roving-tabindex keyboard nav, 2 featured), JARVIS currently-building panel, project detail modal.
- ✅ **P10 Hobbies + Contact complete**: hobbies section (Tennis + Poetry featured with awards, 4 secondary), Web3Forms contact form with inline validation, aria-live errors, and success overlay (submit logic isolated in `lib/contact-submit.ts`). All content stubs replaced — `page.tsx` now renders every real section.
- ✅ **Tier-A motion enhancements shipped** (`ENHANCEMENTS.md`): SplitText hero+section-title reveals, Projects-filter GSAP Flip, magnetic CTAs, animated skill proficiency bars — all reduced-motion-safe, axe-clean, no content change.
- Next: **P11 SEO/metadata**, then P12 A11y/perf/responsive QA (incl. project-image compression).

## Session 1 - Foundations

- Confirm parity scope and content boundaries.
- Set up the v2 app structure.
- Create typed data loaders and validation.
- Establish linting, formatting, and testing.

## Session 2 - Design system

- Build tokens, palettes, spacing, and typography.
- Add theme switching.
- Create core UI primitives.
- Verify contrast and keyboard support.

## Session 3 - Motion foundation

- Add GSAP and ScrollTrigger infrastructure.
- Implement reduced-motion gating.
- Build reusable motion primitives.
- Prototype the scroll sequence engine.

## Session 4 - Shell and hero

- Build navigation, footer, preloader, and background treatment.
- Implement the redesigned hero.
- Wire in the theme switcher and active-section behavior.

## Session 5 - Content sections

- Rebuild About, Academics, Research, Terminal, Journey, Skills, Certifications, Development, Projects, Hobbies, and Contact.
- Keep data-driven rendering and accessible interactions.

## Session 6 - SEO, QA, and docs

- Add metadata, sitemap, robots, and social cards.
- Run accessibility and performance verification.
- Finish asset instructions and rollback notes.

## Session 7 - Approval and cutover

- Review with the user.
- Fix final issues.
- Only then consider DNS cutover.
