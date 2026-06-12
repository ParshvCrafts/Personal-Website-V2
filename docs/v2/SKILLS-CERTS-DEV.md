# Skills / Certifications / Professional Development — Phase 8 Reference

## Sections

### Skills (`id="skills"`, in nav)

**Component:** `v2/components/sections/skills/index.tsx` (server component)  
**Data:** `v2/content/skills.ts` — 4 `SkillCategory` objects + `MARQUEE_SKILLS` flat array  
**Sub-components:**
- Skill category grid — `<Reveal stagger={0.07}>` wrapping 4 category blocks
- Marquee — decorative, `aria-hidden="true"`, using `<Marquee speed={50}>` from `@/components/motion/marquee`

### Certifications (`id="certifications"`, not in nav)

**Component:** `v2/components/sections/skills/cert-grid.tsx` ("use client")  
**Data:** `getCertifications()` from `@/lib/data` → validated via `certificationsFileSchema` → 10 items  
**Behavior:** Card grid with modal on click. `useId()` per instance for unique modal label IDs.  
**A11y:** `aria-haspopup="dialog"` on card buttons. `labelledBy={titleId}` on `<Modal>`.

### Professional Development (`id="development"`, not in nav)

**Component:** `v2/components/sections/skills/dev-list.tsx` (server component)  
**Data:** `getProfessionalDevelopment()` from `@/lib/data` → 9 items  
**Behavior:** Static card grid with status badges.  
**Status badge treatment:**
- `"Active"` / `"In Progress"` → `bg-accent text-on-accent` (WCAG AA across all 4 themes)
- `"Completed"` → `border border-border text-muted`

## Data

### Skill Categories (4)

| ID | Label | Count |
|----|-------|-------|
| languages | Programming Languages | 4 |
| data-science | Data Science & Analysis | 5 |
| ml-ai | Machine Learning & AI | 6 |
| tools | Tools & Frameworks | 12 |

Total: 27 skills. All 27 appear in `MARQUEE_SKILLS` (via `flatMap`).

### Certifications (10)

Loaded from `v2/data/certifications.json` (symlinked from `static/data/certifications.json`).
All 10 have valid `link` fields (Google Drive URLs).

### Professional Development (9)

Also from `certifications.json` under `professionalDevelopment` key.
`link` is `nullable().optional()` — guarded before render.
`duration` and `impact` are `nullable().optional()` — guarded before render.

## Component Structure

```
v2/
  content/
    skills.ts               # SkillCategory[] + MARQUEE_SKILLS
  components/sections/skills/
    index.tsx               # server — renders all 3 sections as <>…</>
    cert-grid.tsx           # "use client" — cert cards + modal
    dev-list.tsx            # server — dev cards (imports Reveal client component)
```

## Token Usage

- Skill pills: `border border-border text-muted rounded-full` (no background fill)
- Status chips (active): `bg-accent text-on-accent`
- Status chips (completed): `border border-border text-muted`
- Section backgrounds: `radial-gradient` with `color-mix(in oklab, var(--accent) 7%, transparent)` on skills only

## scroll-mt

All three sections have `scroll-mt-[88px]` for sticky-nav clearance on direct hash navigation.

## Marquee

Uses the existing `<Marquee>` component from `v2/components/motion/marquee.tsx`:
- `repeat=4` copies for seamless loop
- `motion-safe:animate-[marquee_...]` — animation disabled under `prefers-reduced-motion`
- `aria-hidden={copy !== 0}` on duplicate copies
- Container is `aria-hidden="true"` since it's decorative
