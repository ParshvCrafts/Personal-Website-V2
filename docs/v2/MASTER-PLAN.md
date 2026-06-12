# Portfolio v2 — Master Implementation Plan

> Created: 2026-06-09  
> Based on: `V1-V2-COMPARISON.md`, `ENHANCEMENTS.md`, `ROADMAP.md`  
> Goal: Close remaining v1 richness gaps with taste-first, premium implementations.

---

## Current State (Post-Tier-A + B1/B3/C1-alt)

**Already shipped:**
- ✅ SplitText hero name + section title reveals
- ✅ GSAP Flip on Projects filter
- ✅ Magnetic primary CTAs
- ✅ Animated skill proficiency bars
- ✅ Featured-build pinned scroll narrative (Interlace)
- ✅ Subtle scroll parallax on section glows
- ✅ CSS aurora ambient behind hero
- ✅ Custom cursor (dot + ring)
- ✅ Grain overlay
- ✅ Lenis smooth scroll
- ✅ Preloader with counter wipe
- ✅ All 12 content sections with parity
- ✅ 4 themes (midnight/daylight/manuscript/neon)
- ✅ Full accessibility (keyboard, focus, RM, axe)
- ✅ Vitest + Playwright test suite

**Remaining gaps from v1:**
1. Scroll progress bar
2. Dynamic time-based greeting
3. Section dividers (SVG/CSS)
4. Fun facts ticker/marquee
5. Skills radar visualization
6. Syntax-highlighted code showcase
7. GPA visual card
8. Hobbies visual enrichment (national winner banner, accent colors)
9. SEO/Metadata (P11)
10. Image optimization (P12)

---

## Session 1: Tier 1 Polish — Immediate Visual Impact

### Task 1.1: Scroll Progress Bar
**File:** `v2/components/layout/scroll-progress.tsx`  
**Approach:** Fixed top bar, `transform: scaleX()` driven by scroll position. Pure CSS + minimal JS. Theme-aware color using `var(--accent)`. Reduced motion: still visible (it's informational, not decorative motion).

**Why it matters:** Premium portfolios use this. It's a subtle but constant signal of progress.

### Task 1.2: Dynamic Hero Greeting
**File:** `v2/components/sections/hero.tsx`  
**Approach:** Client-only `useEffect` with `new Date().getHours()`. Returns "Good morning" (5-11), "Good afternoon" (12-16), "Good evening" (17-20), "Hello" (21-4). No hydration mismatch because eyebrow text is not SEO-critical.

**Why it matters:** Adds personality and warmth. v1 had this and it was charming.

### Task 1.3: Section Dividers
**Files:** `v2/components/ui/section-divider.tsx`, applied between major sections  
**Approach:** Subtle SVG wave or angled clip-path divider. Theme-aware (uses `var(--border)` or `var(--accent)` at low opacity). Not between every section — only between major thematic shifts (Hero→About, About→Academics, Journey→Skills, Projects→Hobbies, Hobbies→Contact).

**Why it matters:** Creates visual rhythm and pacing. v1's wave dividers were distinctive.

### Task 1.4: Fun Facts Ticker
**File:** `v2/components/sections/about/fun-facts-ticker.tsx` or standalone  
**Approach:** CSS `animation: marquee` with duplicated content for seamless loop. 15-20 key achievements. Theme-aware text color. Reduced motion: static grid or slower speed.

**Why it matters:** v1's ticker was energetic and showcased density of achievements.

---

## Session 2: Tier 2 Richness — Data Visualization & Content Polish

### Task 2.1: SVG Skills Radar Chart
**File:** `v2/components/sections/skills/radar-chart.tsx`  
**Approach:** Custom SVG (not Chart.js) with 5-6 axes (Languages, Data Science, ML/AI, Tools, Web, Math). Animated draw-on with GSAP `stroke-dashoffset` or scale. Theme-aware colors. Reduced motion: static filled shape. Positioned as an alternative view to proficiency bars — not a replacement.

**Why it matters:** v1's radar was the most distinctive data-viz moment. A custom SVG version feels premium and intentional.

### Task 2.2: Syntax-Highlighted Code Showcase
**File:** `v2/components/sections/about/code-showcase.tsx`  
**Approach:** Add CSS syntax highlighting classes (keyword, string, comment, function, number) with theme-aware colors. The structure is already a macOS-style window. Just needs color tokens.

**Why it matters:** v1's code window popped because of syntax colors. v2's is clean but flat.

### Task 2.3: GPA Visual Card
**File:** `v2/components/sections/academics/gpa-card.tsx`  
**Approach:** Dedicated card with large "4.00" display, animated counter, Dean's List badges, major/focus info. Editorial styling matching the design system.

**Why it matters:** v1's GPA showcase was a visual anchor in the Academics section.

### Task 2.4: Hobbies Visual Enrichment
**File:** `v2/components/sections/hobbies/index.tsx`  
**Approach:**
- Add "National 1st Place Winner" banner to Poetry card
- Add subtle category accent colors to secondary hobby cards
- Enhance award badges with tier-appropriate colors

**Why it matters:** v1's hobbies section was colorful and celebratory. v2 is editorial but could use more warmth.

---

## Session 3: SEO & Performance (P11 + P12)

### Task 3.1: SEO Metadata
**File:** `v2/app/layout.tsx`, `v2/app/robots.ts`, `v2/app/sitemap.ts`  
**Approach:**
- Full metadata object with title, description, keywords, authors
- Open Graph tags (title, description, image, url, type, site_name)
- Twitter Card tags
- Canonical URL
- JSON-LD structured data (Person schema)
- robots.txt
- sitemap.xml
- OG image generation or static asset

### Task 3.2: Image Optimization
**File:** `v2/public/images/`  
**Approach:**
- Compress all project cover images
- Generate WebP/AVIF variants where possible
- Ensure hero portrait is high-res but optimized
- Add `sizes` and `priority` attributes to all Next.js Image components

---

## Session 4: Review & Refinement

### Task 4.1: Visual Audit
- Screenshot v2 in all 4 themes at multiple breakpoints
- Compare side-by-side with v1 screenshots
- Identify any remaining flatness or missed opportunities

### Task 4.2: Performance Audit
- Lighthouse run (target: 90+ on all 4 categories)
- Core Web Vitals check (LCP, FID/INP, CLS)
- Bundle analysis

### Task 4.3: Accessibility Audit
- axe-core scan
- Keyboard navigation test
- Screen reader test (NVDA/VoiceOver)
- Reduced motion test

### Task 4.4: Documentation Update
- Update `CLAUDE.md` with final state
- Update `ROADMAP.md` — mark all items complete
- Update `ENHANCEMENTS.md` — document all shipped features
- Create `DEPLOYMENT.md` with cutover instructions

---

## Commit Strategy

- One commit per task (e.g., `feat(v2): scroll progress bar`)
- Group related tasks in single commits when small
- Never commit broken builds
- Run `npm run typecheck && npm run lint && npm run build && npm test` before every commit
- Update docs in the same commit as the feature when applicable

---

## Testing Strategy

- **Unit tests:** For pure functions (greeting logic, data validation)
- **Component tests:** For interactive components (ticker, radar, progress)
- **e2e tests:** For full user flows (scroll progress visibility, greeting presence, divider rendering)
- **Visual regression:** Screenshot comparison across themes
- **Accessibility:** axe scans in CI

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| Radar chart feels gimmicky | Keep it subtle, low-opacity fill, positioned as secondary to bars |
| Section dividers feel busy | Only use between major sections, keep them thin and low-contrast |
| Ticker feels distracting | Slow speed, pause on hover, respect reduced motion |
| Dynamic greeting causes hydration mismatch | Render static fallback server-side, hydrate client-side |
| Build size increase from SVG radar | Inline SVG is tiny (~2KB); no library needed |
| Performance regression from new animations | All animations use transform/opacity only; no layout thrash |

---

## Definition of Done

- [ ] All Tier 1 features implemented and committed
- [ ] All Tier 2 features implemented and committed
- [ ] P11 SEO complete
- [ ] P12 image optimization complete
- [ ] All tests pass (unit + e2e)
- [ ] axe accessibility scan passes on all 4 themes
- [ ] Lighthouse score ≥ 90 on all categories
- [ ] Build succeeds with static export
- [ ] Visual comparison shows v2 is definitively richer than v1
- [ ] User approves the result
- [ ] Documentation updated
- [ ] Ready for deployment consideration
