# Academics & Research (Phase 6 — complete)

## Components
- `components/sections/academics/index.tsx` — server component; reads getCourses()+getResearch(), groups+sorts, renders header/stats/3 course groups
- `components/sections/academics/course-grid.tsx` — client; course cards + modal (all 13 courses)
- `components/sections/research/index.tsx` — server component
- `components/sections/research/research-grid.tsx` — client; research cards + modal (all 5 papers)

## Key decisions
- `groupCoursesByState()` in `lib/academics.ts`: completed (status="completed"), inProgress (status="upcoming" && grade="Ongoing"), upcoming (status="upcoming" && grade≠"Ongoing")
- `fieldColor` (raw hex from JSON): decorative dot only via `style={{ background: fieldColor }}` — no text fill, no WCAG concern
- All course modals open for all 13 courses; rich courses (projects.length > 0) show project breakdown
- `data-testid="stat-courses"` in Academics stats band (smoke assertion); `stat-research` intentionally omitted to avoid collision with About

## Assets
- `public/images/courses/*.png` (13 images, copied from v1 originals)

## Gates (all green)
- lint ✓, typecheck ✓, tests (unit + e2e: chromium/firefox/webkit) ✓, build ✓
