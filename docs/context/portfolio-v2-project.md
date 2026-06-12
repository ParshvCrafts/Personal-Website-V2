---
name: portfolio-v2-project
description: "Portfolio v2 rebuild — goal, locked decisions, and where the spec lives"
metadata: 
  node_type: memory
  type: project
  originSessionId: c617f9bf-91dd-4b32-83e5-784b2dde6e00
---

Building **v2** of the personal portfolio: same content/features as v1 but a professional, distinctive, animated frontend that does not look "vibe-coded." v1 (Flask + vanilla HTML/CSS/JS at repo root, deployed on Render free + cronjob.com keep-alive, custom domain https://www.portfolio.parshvpatel.com with SEO) stays untouched and live as the rollback.

**Locked decisions (2026-06-06):**
- Stack: Next.js 15 + React + TypeScript + Tailwind v4; shadcn/ui + Aceternity/Magic UI; GSAP+ScrollTrigger+Lenis+Framer Motion.
- Rendering: static export (`output: 'export'`). Deploy: Vercel (Root Directory `v2/`). Rollback: domain switch back to Render.
- Structure: new app in `/v2` subfolder; 4 JSON files in `static/data/` stay the single source of truth (synced into v2 at build).
- Aesthetic: **Exaggerated Minimalism** + a **4-palette theme switcher** — Midnight (dark/default), Daylight (light/corporate), Manuscript (warm editorial), Neon (futuristic/tech: space-navy + electric cyan #00E5FF + neon purple, robot icon). Type: Fraunces (display) + Hanken Grotesk (body) + Geist Mono (labels). All palettes WCAG-AA verified in CI.
- Progress: Phase 0 (Next.js static-export foundation + validated data pipeline) and Phase 1 (design system + 4-theme engine) DONE, reviewed, visually verified, all on branch `feat/portfolio-v2` (not pushed). Next: P2 motion foundation (Lenis+GSAP) + ScrollSequence engine.
- Signature feature: reusable **scroll-scrubbed image-sequence engine** (Apple-style canvas frames via GSAP pin+scrub); build engine + placeholder first, real frames/subject decided during build.

**Full spec:** `docs/superpowers/specs/2026-06-06-portfolio-v2-design.md` (phased plan P0–P14). Work on branch `feat/portfolio-v2`. See [[working-style]].
