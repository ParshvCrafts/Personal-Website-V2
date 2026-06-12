# Portfolio v2 — Phase 5: About Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page's `#about` stub with the real, full-parity **About** section: an editorial bio + key facts, animated **stat counters** (GPA + live data-loader counts), a typographic **achievement badge wall** with hover tooltips, an **awards grid** whose cards open an **accessible focus-trapped modal** (16 badges / 15 award citations), a keyboard-accessible **code-showcase tablist** (python/js/sql), and a **documents** row (résumé / transcript / LinkedIn) — all content extracted from v1's `index.html` into typed `content/*.ts` modules.

**Architecture:** A new server component `About` (`components/sections/about/index.tsx`) owns the composition and reads build-time counts from `lib/data.ts`. It renders presentational sub-parts (`BadgeWall`, `AboutDocuments` — server) and interactive islands (`Awards`, `CodeShowcase` — `"use client"`). A new reusable `Modal` primitive (`components/ui/modal.tsx`) encapsulates the focus-trap/Esc/scrim/return-focus pattern (mirrors `MobileMenu`; reused by Projects in P9). All content (bio, facts, badges, awards, code, documents) lives in `content/about.ts`; icon-bearing content is **imported directly** by the components that use it (never passed as a prop) so no function ever crosses the RSC boundary. Motion reuses the existing `Reveal` + `CountUp` primitives and one `gsap.matchMedia`-gated modal entrance — every motion path is reduced-motion-safe and nothing pins/traps scroll.

**Tech Stack:** Next 16 (App Router, static export, `images: { unoptimized: true }` → plain `<img>` with intrinsic `width/height`), React 19, Tailwind v4 (semantic tokens only — no hardcoded hex), GSAP + `@gsap/react` (`useGSAP`, `matchMedia`), lucide-react v1.17, Vitest + Testing Library (jsdom), Playwright (chromium/firefox/webkit + axe).

---

## How the mandated skills were applied (state-of-record)

- **frontend-design** — Exaggerated-Minimalism, editorial composition: an **asymmetric intro split** (bio ‖ hairline-divided facts list), a full-width **stats band** ruled top/bottom, then alternating-density blocks (badge wall → awards → code window → documents). Oversized Fraunces headings, mono micro-labels, **one accent per theme**, restraint (the only motion is the stat count-up + staggered reveals + the modal entrance). Atmosphere via one low-opacity accent radial (decorative, `aria-hidden`). **No emoji** — every v1 emoji becomes a Lucide glyph or typographic mark.
- **ui-ux-pro-max** — `color-contrast` (semantic tokens, AA in all 4 themes; code rendered in `text-foreground`, no low-alpha text), `focus-states` (visible `ring-ring` on every interactive), `touch-target-size` (≥44px: cards `min-h`, tabs `min-h-9`+padding, close button `h-11 w-11`), `keyboard-nav` + ARIA **tablist** (roving `tabIndex`, ArrowLeft/Right/Home/End), **modal** escape route + scrim (`bg-background/80`) + focus trap + return-focus + `aria-modal`, `heading-hierarchy` (single page h1 in the hero; About uses one `h2` + `h3`s, no skips), `no-emoji-icons`, `duration-timing` (150–300ms transitions), `reduced-motion`, `image-dimension` (intrinsic `width/height`, CLS-safe), `number-tabular` (`tabular-nums` on stats).
- **gsap-core / gsap-react / gsap-scrolltrigger / gsap-performance** — applied by **reusing** the project's audited primitives (`CountUp`, `Reveal`: `useGSAP` scoped + auto-clean, `gsap.matchMedia` gate, transforms/opacity only, `ScrollTrigger { once: true }`) and by adding exactly one new gated tween (the modal entrance: `gsap.from` opacity + `y`/`scale` inside `matchMedia("(prefers-reduced-motion: no-preference)")`, reverted on close/unmount). No raw ScrollTrigger pinning is introduced.

---

## Context the executor needs

- Repo root: `c:\Users\p1a2r\OneDrive\Desktop\Git Hub Projects\Personal Website`. App in `v2/`. Branch `feat/portfolio-v2` (verify with `git branch --show-current`). **Never touch v1** (`app.py`, `index.html`, `static/**`, repo-root configs). **Do not push.** Commit locally, one per task, verbatim messages below. End each commit message with the trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Run all `npm` commands **from `v2/`**.
- **Existing APIs to reuse (do not reinvent):**
  - `lib/motion.ts` → `gsap`, `useGSAP`, `registerGsap`, `prefersReducedMotion`.
  - `components/motion/count-up.tsx` → `CountUp` (`to`, `decimals`, `suffix`; RM/SSR renders the final value; animates once on scroll-in).
  - `components/motion/reveal.tsx` → `Reveal` (`stagger` staggers **direct children**; RM → children visible/static).
  - `components/layout/social-icons.tsx` → `LinkedinIcon` (inline brand SVG, `currentColor`, `aria-hidden`; lucide-react v1.x has no brand glyphs).
  - `components/layout/mobile-menu.tsx` → the **focus-trap reference** (Esc, Tab cycle, `body.overflow` lock, focus restore) the new `Modal` mirrors.
  - `lib/site.ts` → `SITE` (`location`, `email`, `phone`, `phoneDisplay`), `SOCIAL_LINKS`, `NAV_SECTIONS`, `NAV_OFFSET = 88`.
  - `lib/data.ts` → `getProjects()`, `getResearch()` (build-time, Zod-validated). `lib/utils.ts` → `cn`.
  - Theme tokens via Tailwind utilities only: `bg-background bg-surface bg-elevated text-heading text-foreground text-muted text-accent text-on-accent border-border ring-ring font-display font-mono` (+ `color-mix(... var(--accent) ...)` for atmosphere). **Never hardcode hex in a component.**
- **Verified facts (do not re-litigate):** all Lucide icons used below exist in `lucide-react@1.17` and `LucideIcon` is exported. Award logos exist at `static/images/awards/{amazon,greenhouse,mlt,questbridge,caa-tla,rsm}.png` and `transcript.pdf` at `static/documents/`. `v2/public/images/profile.jpg` + `documents/resume.pdf` already exist. `v2/.gitignore` ignores only **root-level** `/*.png`, so `public/images/awards/*.png` **are** committed. `next.config.ts` = `output:'export'`, `trailingSlash:true`, `images:{unoptimized:true}` → use plain `<img>`. `vitest.config.ts` = jsdom + `globals:true` + `tests/setup.ts`; tests live in `tests/unit/**`.
- **Data-derived stat values:** `getProjects().length === 12`, `getResearch().length === 5` (asserted by the current smoke test). The **Awards** stat is tied to `AWARDS.length` (15) so it can never drift from the content. GPA (`4.0`) and Volunteer Hours (`136+`) are static.
- **jsdom + GSAP in component tests:** components that use `useGSAP`/`gsap.matchMedia` (the `Modal`) must **mock `gsap.matchMedia`** in their test (`vi.spyOn(gsap,"matchMedia").mockReturnValue({ add: vi.fn(), revert: vi.fn() } as never)`) so no real tween runs — mirror `tests/unit/motion-cleanup.test.tsx`. `CodeShowcase` uses no GSAP and renders directly.
- **E2E flake note (already understood):** the dev server compiles on demand, so a single `firefox › /preview … color-contrast` axe failure can appear under load; it **passes in isolation** (`npx playwright test tests/e2e/accessibility.spec.ts --project=firefox -g "preview should not"`). `playwright.config.ts` already caps workers + retries. Treat a lone firefox `/preview` flake as infra, not a regression — but **any failure on `/` (the home page, which now includes About) is real** and must be fixed.

## File Structure (this phase)

```
v2/
├─ public/
│  ├─ images/awards/{amazon,greenhouse,mlt,questbridge,caa-tla,rsm}.png   # NEW (copied from v1)
│  └─ documents/transcript.pdf                                            # NEW (copied from v1)
├─ content/
│  └─ about.ts                         # NEW: typed content (bio, facts, badges×16, awards×15, code×3, docs×3)
├─ lib/
│  └─ about.ts                         # NEW: tabKeyToIndex (pure, TDD)
├─ components/
│  ├─ ui/modal.tsx                     # NEW: accessible Modal primitive (focus-trap, Esc, scrim, return-focus)
│  └─ sections/about/
│     ├─ index.tsx                     # NEW: About composition (server) — intro, facts, stat counters
│     ├─ badge-wall.tsx                # NEW: BadgeWall (server; Reveal + hover tooltips + sr-only labels)
│     ├─ awards.tsx                    # NEW: Awards (client; grid + Modal)
│     ├─ code-showcase.tsx             # NEW: CodeShowcase (client; ARIA tablist)
│     └─ documents.tsx                 # NEW: AboutDocuments (server)
├─ app/page.tsx                        # MODIFY: render <About/>; drop the #about stub + count plumbing
└─ tests/
   ├─ unit/about-content.test.ts       # NEW: content invariants (TDD)
   ├─ unit/about.test.ts               # NEW: tabKeyToIndex (TDD)
   ├─ unit/modal.test.tsx              # NEW: Modal behavior (TDD)
   ├─ unit/code-showcase.test.tsx      # NEW: tablist behavior
   ├─ e2e/about.spec.ts                # NEW: section smoke + modal + tabs + reduced-motion no-trap
   └─ e2e/smoke.spec.ts                # MODIFY: assert About stat counters (pipeline proof)
```

---

## Task 0: Copy v1 assets into `v2/public`

**Files:** Create `v2/public/images/awards/*.png` (6), `v2/public/documents/transcript.pdf`.

- [ ] **Step 1: Copy the award logos + transcript** (do NOT modify the v1 originals). From `v2/` (Bash):

```bash
mkdir -p public/images/awards
cp ../static/images/awards/amazon.png      public/images/awards/amazon.png
cp ../static/images/awards/greenhouse.png  public/images/awards/greenhouse.png
cp ../static/images/awards/mlt.png         public/images/awards/mlt.png
cp ../static/images/awards/questbridge.png public/images/awards/questbridge.png
cp ../static/images/awards/caa-tla.png     public/images/awards/caa-tla.png
cp ../static/images/awards/rsm.png         public/images/awards/rsm.png
cp ../static/documents/transcript.pdf      public/documents/transcript.pdf
```

- [ ] **Step 2: Verify** — `ls public/images/awards` shows 6 PNGs; `ls public/documents` shows `resume.pdf` + `transcript.pdf`.

- [ ] **Step 3: Commit**

```bash
git add v2/public/images/awards v2/public/documents/transcript.pdf
git commit -m "chore(v2): copy v1 award logos + transcript into v2/public for About"
```

---

## Task 1: About content modules (`content/about.ts`) — TDD

**Files:** Create `v2/tests/unit/about-content.test.ts`, then `v2/content/about.ts`.

- [ ] **Step 1: Write the failing test `v2/tests/unit/about-content.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import {
  ABOUT_BIO,
  ABOUT_FACTS,
  ACHIEVEMENT_BADGES,
  AWARDS,
  CODE_SAMPLES,
  ABOUT_DOCUMENTS,
} from "@/content/about";

const uniqueIds = (xs: { id: string }[]) => new Set(xs.map((x) => x.id)).size;

describe("about content", () => {
  it("has at least two non-empty bio paragraphs", () => {
    expect(ABOUT_BIO.length).toBeGreaterThanOrEqual(2);
    for (const p of ABOUT_BIO) expect(p.trim().length).toBeGreaterThan(0);
  });

  it("has four key facts, all labelled", () => {
    expect(ABOUT_FACTS).toHaveLength(4);
    for (const f of ABOUT_FACTS) {
      expect(f.label.trim().length).toBeGreaterThan(0);
      expect(f.value.trim().length).toBeGreaterThan(0);
    }
  });

  it("has 16 achievement badges with id, label, and an icon", () => {
    expect(ACHIEVEMENT_BADGES).toHaveLength(16);
    for (const b of ACHIEVEMENT_BADGES) {
      expect(b.id.trim().length).toBeGreaterThan(0);
      expect(b.label.trim().length).toBeGreaterThan(0);
      expect(b.icon).toBeTruthy(); // lucide forwardRef component (object), not a function
    }
    expect(uniqueIds(ACHIEVEMENT_BADGES)).toBe(ACHIEVEMENT_BADGES.length);
  });

  it("has 15 awards, each with a title, a substantive description, and a mark", () => {
    expect(AWARDS).toHaveLength(15);
    for (const a of AWARDS) {
      expect(a.title.trim().length).toBeGreaterThan(0);
      expect(a.description.trim().length).toBeGreaterThan(20);
      expect(Boolean(a.logo) || Boolean(a.icon)).toBe(true);
    }
    expect(uniqueIds(AWARDS)).toBe(AWARDS.length);
  });

  it("has three code samples in python/js/sql order with code", () => {
    expect(CODE_SAMPLES).toHaveLength(3);
    expect(CODE_SAMPLES.map((s) => s.lang)).toEqual(["python", "javascript", "sql"]);
    for (const s of CODE_SAMPLES) {
      expect(s.filename.trim().length).toBeGreaterThan(0);
      expect(s.code.trim().length).toBeGreaterThan(0);
    }
  });

  it("has three documents with non-empty hrefs", () => {
    expect(ABOUT_DOCUMENTS).toHaveLength(3);
    for (const d of ABOUT_DOCUMENTS) {
      expect(d.id.trim().length).toBeGreaterThan(0);
      expect(d.href.trim().length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run to verify it fails** — `npx vitest run tests/unit/about-content.test.ts` → FAIL (cannot resolve `@/content/about`).

- [ ] **Step 3: Create `v2/content/about.ts`** (verbatim v1 copy, HTML entities decoded, the two v1 typos fixed: `deployment,bringing` → `deployment — bringing`; em-dashes/`×` normalized)

```ts
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Cloud,
  Dumbbell,
  Feather,
  FlaskConical,
  GraduationCap,
  Library,
  Medal,
  Package,
  PenTool,
  Rocket,
  Sigma,
  Sparkles,
  Sprout,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { SITE, SOCIAL_LINKS } from "@/lib/site";

/** Two-paragraph bio (from v1 About; typos cleaned). */
export const ABOUT_BIO: string[] = [
  "I'm a rising sophomore at UC Berkeley pursuing a B.A. in Data Science with a focus on AI and Machine Learning. I completed my first year with a perfect 4.0 GPA and Dean's List honors both semesters, and I'll be joining Amazon as a Software Engineering Intern in Summer 2026.",
  "From agentic AI systems to computer vision and data pipelines, I love building projects that solve real-world problems. My work spans data wrangling, statistical modeling, deep learning, and full-stack deployment — bringing models from Jupyter notebooks to production-ready web applications.",
];

export interface AboutFact {
  label: string;
  value: string;
  href?: string;
}

/** Key facts; email/phone link out. Location/email/phone reuse SITE. */
export const ABOUT_FACTS: AboutFact[] = [
  { label: "Education", value: "UC Berkeley · B.A. Data Science" },
  { label: "Location", value: SITE.location },
  { label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
  { label: "Phone", value: SITE.phoneDisplay, href: `tel:${SITE.phone}` },
];

export interface AchievementBadge {
  id: string;
  label: string;
  icon: LucideIcon;
}

/** 16 achievement badges — v1 emoji replaced by typographic Lucide marks. */
export const ACHIEVEMENT_BADGES: AchievementBadge[] = [
  { id: "valedictorian", label: "Valedictorian", icon: GraduationCap },
  { id: "board-rank1", label: "Rank 1 Indian Board Exam", icon: Medal },
  { id: "questbridge", label: "QuestBridge Finalist", icon: Sparkles },
  { id: "greenhouse", label: "Greenhouse Scholar", icon: Sprout },
  { id: "amazon-fe", label: "Amazon Future Engineer", icon: Package },
  { id: "mlt", label: "MLT Ascend Scholar", icon: Rocket },
  { id: "poetry-champ", label: "National Poetry Champion", icon: Feather },
  { id: "imo-gold", label: "2 IMO Gold Medals", icon: Sigma },
  { id: "gpa", label: "4.00 GPA", icon: Target },
  { id: "athlete", label: "Athlete of the Year", icon: Dumbbell },
  { id: "student-month", label: "Student of the Month", icon: Star },
  { id: "published", label: "Published Researcher", icon: BookOpen },
  { id: "deans-list", label: "Dean's List × 2", icon: Award },
  { id: "library-prize", label: "Library Prize Honorable Mention", icon: Library },
  { id: "literary", label: "4 Berkeley Literary Prizes", icon: PenTool },
  { id: "amazon-swe", label: "Amazon SWE Intern 2026", icon: Cloud },
];

export interface Award {
  id: string;
  title: string;
  description: string;
  /** Brand logo path under /images/awards (white chip in the UI). */
  logo?: string;
  /** Lucide mark when there is no brand logo. */
  icon?: LucideIcon;
}

/** 15 award citations (verbatim from v1; entities decoded). */
export const AWARDS: Award[] = [
  {
    id: "amazon-fe",
    title: "Amazon Future Engineer",
    description:
      "Scholarship of up to $40,000 (up to $10,000/year) towards an undergraduate degree in computer science and an offer to complete a summer internship at Amazon!",
    logo: "/images/awards/amazon.png",
  },
  {
    id: "greenhouse",
    title: "Greenhouse Scholar",
    description:
      "The Greenhouse Whole Person College Program offers up to $5,000/year scholarships and extensive mentorship, professional development, and financial guidance over five years for high-achieving, low-income students. Requirements: 3.5+ GPA, leadership, community commitment.",
    logo: "/images/awards/greenhouse.png",
  },
  {
    id: "mlt",
    title: "MLT Ascend Scholar",
    description:
      "MLT Ascend is a free, one-year career accelerator by Management Leadership for Tomorrow for high-achieving, first-generation college freshmen, providing personalized coaching, employer exposure, and pathways to careers in business or technology.",
    logo: "/images/awards/mlt.png",
  },
  {
    id: "questbridge",
    title: "QuestBridge Finalist",
    description:
      "QuestBridge National College Match connects high-achieving, low-income seniors with full four-year scholarships (tuition, room, board) to top U.S. colleges. Finalists rank up to 15 partner colleges for guaranteed early admission and full Match Scholarship.",
    logo: "/images/awards/questbridge.png",
  },
  {
    id: "library-prize",
    title: "Library Prize for Undergraduate Research",
    description:
      "Received the sole Honorable Mention for the Charlene Conrad Liebau Library Prize for Undergraduate Research at UC Berkeley. Awarded to the computational physics research paper on a 2D Navier-Stokes CFD Solver, which is archived in Berkeley's institutional repository (eScholarship) as an exemplary model of undergraduate research. Only STEM paper recognized in the lower-division category from 51 applications.",
    icon: BookOpen,
  },
  {
    id: "literary-sweep",
    title: "Berkeley Literary Prize Sweep — 4 Awards",
    description:
      "Received four competitive literary and essay prizes at UC Berkeley in Spring 2026: the Leslie Lipson Essay Prize (most prestigious undergraduate essay award), the Elizabeth Mills Crothers Prize in Literary Composition, the Dorothy Rosenberg Memorial Prize in Lyric Poetry, and the Lili Fabilli & Eric Hoffer Essay Prize. A rare multi-prize sweep in a single academic year.",
    icon: PenTool,
  },
  {
    id: "deans-list",
    title: "Dean's List × 2 — UC Berkeley",
    description:
      "Earned Dean's List recognition from the College of Computing, Data Science, and Society (CDSS) for both Fall 2025 and Spring 2026 semesters, maintaining a 4.00 GPA across an intensive STEM curriculum including Data Structures, Principles of Data Science, and Linear Algebra.",
    icon: Star,
  },
  {
    id: "caa-tla",
    title: "CAA The Leadership Award Scholar",
    description:
      "Selected as a recipient of The Leadership Award (TLA) by the Cal Alumni Association, one of the most competitive merit scholarships at UC Berkeley, recognizing exceptional leadership, community impact, and academic achievement.",
    logo: "/images/awards/caa-tla.png",
  },
  {
    id: "rsm",
    title: "RSM First Generation Scholar",
    description:
      "Awarded the RSM First Generation Scholarship, a competitive merit award supporting first-generation college students demonstrating academic excellence, leadership, and commitment to creating a positive impact in their communities.",
    logo: "/images/awards/rsm.png",
  },
  {
    id: "valedictorian",
    title: "Valedictorian",
    description:
      "Top-performing student in the senior class based on overall GPA from 9th to 12th grade. Out of 455 students, only one is recognized as the highest achiever. Maintained a 4.61 GPA while balancing 23 advanced courses and extracurricular activities.",
    icon: Trophy,
  },
  {
    id: "imo-gold",
    title: "IMO Gold Medalist",
    description:
      "Rank 1 award for the International Mathematics Olympiad (IMO) Level 1 2022-23, awarded to the top student for each grade level. Students who pass the cutoff advance to Level 2, competing for gold medal and honors. A proud moment reflecting passion for mathematics.",
    icon: Medal,
  },
  {
    id: "ap-scholar",
    title: "AP Scholar with Distinction",
    description:
      "Granted to students who receive an average score of at least 3.5 on all AP Exams taken, and scores of 3 or higher on five or more of these exams. Demonstrates mastery across multiple college-level subjects.",
    icon: Award,
  },
  {
    id: "science-student",
    title: "Outstanding Science Student",
    description:
      "Only student selected from the school (2023-24) for demonstrating exceptional commitment to scientific inquiry and excellence in science coursework and projects.",
    icon: FlaskConical,
  },
  {
    id: "board-rank1",
    title: "Rank 1 — Indian Board Exam X",
    description:
      "Achieved Rank 1 in my district for the Indian Board Exam X with 97% score. Competed against 2.4 million candidates. Featured in local newspapers and received a trophy from my school for this significant academic milestone.",
    icon: GraduationCap,
  },
  {
    id: "student-month",
    title: "Student of the Month",
    description:
      "Nominated by the principal for Student of the Month, given the opportunity to share my journey and community contributions. Received the Mike Christie Memorial Scholarship ($1000) out of 48 students from 11 schools in the Hemet and San Jacinto districts.",
    icon: Sparkles,
  },
];

export type CodeLang = "python" | "javascript" | "sql";

export interface CodeSample {
  id: string;
  lang: CodeLang;
  filename: string;
  code: string;
}

/** 3 code samples (verbatim from v1's code window). */
export const CODE_SAMPLES: CodeSample[] = [
  {
    id: "python",
    lang: "python",
    filename: "app.py",
    code: `# AtlasMind Trip Planner
def generate_itinerary(destination, preferences):
    """AI-powered travel planning"""
    context = analyze_destination(destination)
    activities = recommend_activities(context, preferences)
    return optimize_schedule(activities)`,
  },
  {
    id: "javascript",
    lang: "javascript",
    filename: "main.js",
    code: `// Portfolio Animation System
const initAnimations = () => {
  gsap.registerPlugin(ScrollTrigger);
  sections.forEach(section => {
    gsap.from(section, {
      opacity: 0, y: 50,
      scrollTrigger: { trigger: section }
    });
  });
};`,
  },
  {
    id: "sql",
    lang: "sql",
    filename: "query.sql",
    code: `-- Student Performance Analysis
SELECT course_name, AVG(grade) AS avg_grade,
       COUNT(*) AS enrollment
FROM student_records
GROUP BY course_name
HAVING AVG(grade) > 3.5
ORDER BY avg_grade DESC;`,
  },
];

export interface AboutDocument {
  id: "resume" | "transcript" | "linkedin";
  label: string;
  href: string;
}

/** Résumé + transcript (in v2/public) + LinkedIn. */
export const ABOUT_DOCUMENTS: AboutDocument[] = [
  { id: "resume", label: "Résumé", href: "/documents/resume.pdf" },
  { id: "transcript", label: "Unofficial Transcript", href: "/documents/transcript.pdf" },
  { id: "linkedin", label: "LinkedIn Profile", href: SOCIAL_LINKS.linkedin },
];
```

- [ ] **Step 4: Run to verify it passes** — `npx vitest run tests/unit/about-content.test.ts` → PASS. Then `npm run lint && npm run typecheck` → clean.

- [ ] **Step 5: Commit**

```bash
git add v2/content/about.ts v2/tests/unit/about-content.test.ts
git commit -m "feat(v2): About content modules — bio, facts, badges, awards, code, documents (typed, from v1)"
```

---

## Task 2: `tabKeyToIndex` tablist helper (`lib/about.ts`) — TDD

**Files:** Create `v2/tests/unit/about.test.ts`, then `v2/lib/about.ts`.

- [ ] **Step 1: Write the failing test `v2/tests/unit/about.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { tabKeyToIndex } from "@/lib/about";

describe("tabKeyToIndex", () => {
  it("advances right and wraps at the end", () => {
    expect(tabKeyToIndex("ArrowRight", 0, 3)).toBe(1);
    expect(tabKeyToIndex("ArrowRight", 2, 3)).toBe(0);
  });
  it("moves left and wraps at the start", () => {
    expect(tabKeyToIndex("ArrowLeft", 0, 3)).toBe(2);
    expect(tabKeyToIndex("ArrowLeft", 2, 3)).toBe(1);
  });
  it("jumps to Home and End", () => {
    expect(tabKeyToIndex("Home", 2, 3)).toBe(0);
    expect(tabKeyToIndex("End", 0, 3)).toBe(2);
  });
  it("returns the current index for unrelated keys", () => {
    expect(tabKeyToIndex("Enter", 1, 3)).toBe(1);
  });
  it("is safe for an empty list", () => {
    expect(tabKeyToIndex("ArrowRight", 0, 0)).toBe(0);
  });
});
```

- [ ] **Step 2: Run to verify it fails** — `npx vitest run tests/unit/about.test.ts` → FAIL (`tabKeyToIndex` not exported).

- [ ] **Step 3: Create `v2/lib/about.ts`**

```ts
/** Maps a roving-tablist navigation key to the next tab index. Pure (unit-tested). */
export function tabKeyToIndex(key: string, current: number, count: number): number {
  if (count <= 0) return 0;
  switch (key) {
    case "ArrowRight":
      return (current + 1) % count;
    case "ArrowLeft":
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return current;
  }
}
```

- [ ] **Step 4: Run to verify it passes** — `npx vitest run tests/unit/about.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add v2/lib/about.ts v2/tests/unit/about.test.ts
git commit -m "feat(v2): tabKeyToIndex roving-tablist helper (TDD)"
```

---

## Task 3: Accessible `Modal` primitive (`components/ui/modal.tsx`) — TDD

**Files:** Create `v2/tests/unit/modal.test.tsx`, then `v2/components/ui/modal.tsx`.

- [ ] **Step 1: Write the failing test `v2/tests/unit/modal.test.tsx`**

```tsx
import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { gsap } from "@/lib/motion";
import { Modal } from "@/components/ui/modal";

afterEach(() => vi.restoreAllMocks());

// Prevent any real GSAP tween from running in jsdom (mirrors motion-cleanup.test).
function mockMatchMedia() {
  vi.spyOn(gsap, "matchMedia").mockReturnValue({ add: vi.fn(), revert: vi.fn() } as never);
}

describe("Modal", () => {
  it("renders nothing when closed", () => {
    mockMatchMedia();
    render(
      <Modal open={false} onClose={() => {}} labelledBy="t">
        <p id="t">Hidden</p>
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders children in a labelled, modal dialog when open", () => {
    mockMatchMedia();
    render(
      <Modal open onClose={() => {}} labelledBy="t">
        <p id="t">Award title</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "t");
    expect(screen.getByText("Award title")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("calls onClose on Escape", () => {
    mockMatchMedia();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} labelledBy="t">
        <p id="t">x</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the scrim is clicked", () => {
    mockMatchMedia();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} labelledBy="t">
        <p id="t">x</p>
      </Modal>,
    );
    fireEvent.click(screen.getByTestId("modal-scrim"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run to verify it fails** — `npx vitest run tests/unit/modal.test.tsx` → FAIL (cannot resolve `@/components/ui/modal`).

- [ ] **Step 3: Create `v2/components/ui/modal.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** id of an element inside `children` that labels the dialog. */
  labelledBy?: string;
  /** Fallback accessible name when there is no visible title to reference. */
  ariaLabel?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Accessible modal: focus-trapped, Esc/scrim to close, body-scroll locked,
 * focus restored to the opener on close (mirrors MobileMenu). One motion-safe
 * entrance; reduced motion leaves the panel fully visible. Returns null when
 * closed (no aria-hidden subtree for axe to walk). z-[80] sits above grain
 * (z-50) and below the preloader (z-100).
 */
export function Modal({ open, onClose, labelledBy, ariaLabel, children, className }: ModalProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  registerGsap();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Focus trap + scroll lock + Esc + focus restore.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        "a[href],button:not([disabled]),[tabindex]:not([tabindex='-1'])",
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus();
    };
  }, [open]);

  // Motion-safe entrance; reduced motion skips it (panel stays visible).
  useGSAP(
    () => {
      if (!open) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(rootRef.current, { opacity: 0, duration: 0.2, ease: "power2.out" });
        gsap.from(panelRef.current, { y: 12, scale: 0.98, duration: 0.3, ease: "power3.out" });
      });
      return () => mm.revert();
    },
    { dependencies: [open] },
  );

  if (!open) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        data-testid="modal-scrim"
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={ariaLabel}
        className={cn(
          "relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl",
          className,
        )}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes** — `npx vitest run tests/unit/modal.test.tsx` → PASS. Then `npm run typecheck` → clean.

- [ ] **Step 5: Commit**

```bash
git add v2/components/ui/modal.tsx v2/tests/unit/modal.test.tsx
git commit -m "feat(v2): accessible Modal primitive (focus-trap, Esc, scrim, return-focus)"
```

---

## Task 4: Badge wall (`components/sections/about/badge-wall.tsx`)

**Files:** Create `v2/components/sections/about/badge-wall.tsx`.

Design note: tiles are **non-interactive** (informational). The label is exposed to assistive tech via an `sr-only` span (so it is *not* hover-only), and shown visually as a hover tooltip. Tiles are intentionally not focusable to avoid 16 actionless tab stops; the accessible name lives in the tree regardless.

- [ ] **Step 1: Implement `v2/components/sections/about/badge-wall.tsx`**

```tsx
import { Reveal } from "@/components/motion/reveal";
import { ACHIEVEMENT_BADGES } from "@/content/about";

export function BadgeWall() {
  return (
    <div>
      <h3 className="font-display text-2xl text-heading md:text-3xl">Achievement Badges</h3>
      <p className="mt-2 max-w-xl text-sm text-muted">
        A wall of recognitions — hover any mark for its title.
      </p>
      <Reveal stagger={0.03} className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
        {ACHIEVEMENT_BADGES.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.id}
              className="group relative flex aspect-square items-center justify-center rounded-xl border border-border bg-surface transition-colors hover:border-accent/40"
            >
              <Icon
                className="h-6 w-6 text-muted transition-colors group-hover:text-accent"
                aria-hidden="true"
              />
              <span className="sr-only">{badge.label}</span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-elevated px-2 py-1 font-mono text-[10px] text-foreground opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
              >
                {badge.label}
              </span>
            </div>
          );
        })}
      </Reveal>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + build** — `npm run typecheck && npm run build` → succeed.

- [ ] **Step 3: Commit**

```bash
git add v2/components/sections/about/badge-wall.tsx
git commit -m "feat(v2): About badge wall (typographic marks, hover tooltips, sr-only labels)"
```

---

## Task 5: Awards grid + award modal (`components/sections/about/awards.tsx`)

**Files:** Create `v2/components/sections/about/awards.tsx`.

- [ ] **Step 1: Implement `v2/components/sections/about/awards.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Modal } from "@/components/ui/modal";
import { AWARDS, type Award } from "@/content/about";
import { cn } from "@/lib/utils";

/** Brand logo on a neutral white chip (renders on every theme) or a Lucide mark. */
function AwardMark({ award, size = "h-12 w-12" }: { award: Award; size?: string }) {
  if (award.logo) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-white p-1.5 ring-1 ring-border",
          size,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={award.logo} alt="" width={48} height={48} className="h-full w-full object-contain" />
      </span>
    );
  }
  const Icon = award.icon!;
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-elevated text-accent",
        size,
      )}
    >
      <Icon className="h-6 w-6" aria-hidden="true" />
    </span>
  );
}

export function Awards() {
  const [selected, setSelected] = useState<Award | null>(null);

  return (
    <div>
      <h3 className="font-display text-2xl text-heading md:text-3xl">Awards &amp; Recognition</h3>
      <p className="mt-2 max-w-xl text-sm text-muted">Select any award to read the full citation.</p>

      <Reveal stagger={0.05} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AWARDS.map((award) => (
          <button
            key={award.id}
            type="button"
            onClick={() => setSelected(award)}
            aria-haspopup="dialog"
            className="group flex min-h-[88px] items-start gap-4 rounded-2xl border border-border bg-surface p-5 text-left transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AwardMark award={award} />
            <span className="min-w-0 flex-1">
              <span className="block font-display text-lg leading-snug text-heading">
                {award.title}
              </span>
              <span className="mt-1 line-clamp-2 block text-sm text-muted">{award.description}</span>
            </span>
          </button>
        ))}
      </Reveal>

      <Modal open={selected !== null} onClose={() => setSelected(null)} labelledBy="award-modal-title">
        {selected && (
          <div className="pr-8">
            <div className="flex items-center gap-4">
              <AwardMark award={selected} size="h-14 w-14" />
              <p id="award-modal-title" className="font-display text-xl text-heading md:text-2xl">
                {selected.title}
              </p>
            </div>
            <p className="mt-5 leading-relaxed text-foreground">{selected.description}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + build** — `npm run typecheck && npm run build` → succeed.

- [ ] **Step 3: Commit**

```bash
git add v2/components/sections/about/awards.tsx
git commit -m "feat(v2): About awards grid + accessible award modal"
```

---

## Task 6: Code-showcase tablist (`components/sections/about/code-showcase.tsx`) + test

**Files:** Create `v2/tests/unit/code-showcase.test.tsx`, then `v2/components/sections/about/code-showcase.tsx`.

- [ ] **Step 1: Write the failing test `v2/tests/unit/code-showcase.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CodeShowcase } from "@/components/sections/about/code-showcase";

describe("CodeShowcase", () => {
  it("shows the first sample by default", () => {
    render(<CodeShowcase />);
    expect(screen.getByRole("tab", { name: "app.py" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent(/AtlasMind/);
  });

  it("switches the panel when another tab is clicked", () => {
    render(<CodeShowcase />);
    fireEvent.click(screen.getByRole("tab", { name: "main.js" }));
    expect(screen.getByRole("tab", { name: "main.js" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent(/Portfolio Animation/);
  });

  it("moves selection with ArrowRight", () => {
    render(<CodeShowcase />);
    fireEvent.keyDown(screen.getByRole("tab", { name: "app.py" }), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "main.js" })).toHaveAttribute("aria-selected", "true");
  });
});
```

- [ ] **Step 2: Run to verify it fails** — `npx vitest run tests/unit/code-showcase.test.tsx` → FAIL (cannot resolve the component).

- [ ] **Step 3: Implement `v2/components/sections/about/code-showcase.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import { CODE_SAMPLES } from "@/content/about";
import { tabKeyToIndex } from "@/lib/about";
import { cn } from "@/lib/utils";

const NAV_KEYS = ["ArrowRight", "ArrowLeft", "Home", "End"];

export function CodeShowcase() {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!NAV_KEYS.includes(e.key)) return;
    e.preventDefault();
    const next = tabKeyToIndex(e.key, active, CODE_SAMPLES.length);
    setActive(next);
    tabsRef.current[next]?.focus();
  };

  return (
    <div>
      <h3 className="font-display text-2xl text-heading md:text-3xl">Code Samples</h3>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center gap-3 border-b border-border bg-elevated px-4 py-3">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-muted/30" />
            <span className="h-3 w-3 rounded-full bg-muted/30" />
            <span className="h-3 w-3 rounded-full bg-muted/30" />
          </span>
          <div role="tablist" aria-label="Code samples" className="flex gap-1">
            {CODE_SAMPLES.map((sample, i) => (
              <button
                key={sample.id}
                ref={(el) => {
                  tabsRef.current[i] = el;
                }}
                role="tab"
                id={`code-tab-${sample.id}`}
                aria-selected={active === i}
                aria-controls={`code-panel-${sample.id}`}
                tabIndex={active === i ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={onKeyDown}
                className={cn(
                  "min-h-9 rounded-md px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active === i ? "bg-surface text-foreground" : "text-muted hover:text-foreground",
                )}
              >
                {sample.filename}
              </button>
            ))}
          </div>
        </div>
        {CODE_SAMPLES.map((sample, i) => (
          <pre
            key={sample.id}
            role="tabpanel"
            id={`code-panel-${sample.id}`}
            aria-labelledby={`code-tab-${sample.id}`}
            tabIndex={0}
            hidden={active !== i}
            className="min-h-[12rem] overflow-x-auto p-5 font-mono text-sm leading-relaxed text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <code>{sample.code}</code>
          </pre>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes** — `npx vitest run tests/unit/code-showcase.test.tsx` → PASS. Then `npm run typecheck && npm run build` → succeed.

- [ ] **Step 5: Commit**

```bash
git add v2/components/sections/about/code-showcase.tsx v2/tests/unit/code-showcase.test.tsx
git commit -m "feat(v2): About code-showcase tabs (ARIA tablist, arrow-key nav)"
```

---

## Task 7: Documents (`components/sections/about/documents.tsx`)

**Files:** Create `v2/components/sections/about/documents.tsx`.

- [ ] **Step 1: Implement `v2/components/sections/about/documents.tsx`** (LinkedIn uses the inline brand SVG; lucide-react has no brand glyphs)

```tsx
import { FileText, ScrollText } from "lucide-react";
import { LinkedinIcon } from "@/components/layout/social-icons";
import { ABOUT_DOCUMENTS } from "@/content/about";

export function AboutDocuments() {
  return (
    <div>
      <h3 className="font-display text-2xl text-heading md:text-3xl">Documents &amp; Credentials</h3>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {ABOUT_DOCUMENTS.map((doc) => (
          <a
            key={doc.id}
            href={doc.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-h-[64px] items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-elevated text-accent">
              {doc.id === "resume" && <FileText className="h-5 w-5" aria-hidden="true" />}
              {doc.id === "transcript" && <ScrollText className="h-5 w-5" aria-hidden="true" />}
              {doc.id === "linkedin" && <LinkedinIcon className="h-5 w-5" />}
            </span>
            <span className="font-display text-lg text-heading">{doc.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + build** — `npm run typecheck && npm run build` → succeed.

- [ ] **Step 3: Commit**

```bash
git add v2/components/sections/about/documents.tsx
git commit -m "feat(v2): About documents (résumé/transcript/LinkedIn)"
```

---

## Task 8: About composition (`components/sections/about/index.tsx`)

**Files:** Create `v2/components/sections/about/index.tsx`. Server component — reads build-time counts and composes the sub-parts.

- [ ] **Step 1: Implement `v2/components/sections/about/index.tsx`**

```tsx
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { BadgeWall } from "@/components/sections/about/badge-wall";
import { Awards } from "@/components/sections/about/awards";
import { CodeShowcase } from "@/components/sections/about/code-showcase";
import { AboutDocuments } from "@/components/sections/about/documents";
import { ABOUT_BIO, ABOUT_FACTS, AWARDS } from "@/content/about";
import { getProjects, getResearch } from "@/lib/data";

export function About() {
  // Stats tie to real data where possible (projects/research from loaders, awards
  // from the content array); GPA + volunteer hours are static. testids prove the
  // build-time data pipeline on the page.
  const stats = [
    { id: "gpa", label: "GPA", value: 4.0, decimals: 1, suffix: "" },
    { id: "projects", label: "Projects", value: getProjects().length, decimals: 0, suffix: "" },
    { id: "research", label: "Research Papers", value: getResearch().length, decimals: 0, suffix: "" },
    { id: "awards", label: "Awards", value: AWARDS.length, decimals: 0, suffix: "" },
    { id: "volunteer", label: "Volunteer Hours", value: 136, decimals: 0, suffix: "+" },
  ];

  return (
    <section
      id="about"
      aria-labelledby="about-h"
      className="relative scroll-mt-[88px] overflow-hidden border-t border-border px-6 py-24 md:px-10 md:py-32"
    >
      {/* Decorative per-theme atmosphere. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 40% at 12% 25%, color-mix(in oklab, var(--accent) 10%, transparent), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-6xl">
        {/* Intro: asymmetric editorial split */}
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">About</p>
            <h2
              id="about-h"
              className="mt-4 font-display text-4xl leading-[1.05] text-heading md:text-6xl"
            >
              Hello — I&apos;m Parshv.
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
              {ABOUT_BIO.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* Key facts — hairline-divided list */}
          <dl className="grid grid-cols-1 gap-px self-start overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 md:grid-cols-1">
            {ABOUT_FACTS.map((fact) => (
              <div key={fact.label} className="bg-surface px-5 py-4">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-muted">
                  {fact.label}
                </dt>
                <dd className="mt-1 break-words text-foreground">
                  {fact.href ? (
                    <a
                      href={fact.href}
                      className="underline-offset-2 hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {fact.value}
                    </a>
                  ) : (
                    fact.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Stats band */}
        <h3 className="sr-only">By the numbers</h3>
        <Reveal
          stagger={0.08}
          className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-y border-border py-10 sm:grid-cols-3 md:mt-20 md:grid-cols-5"
        >
          {stats.map((s) => (
            <div key={s.id} className="flex flex-col gap-1">
              <span
                data-testid={`stat-${s.id}`}
                className="font-display text-4xl tabular-nums text-heading md:text-5xl"
              >
                <CountUp to={s.value} decimals={s.decimals} suffix={s.suffix} />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
                {s.label}
              </span>
            </div>
          ))}
        </Reveal>

        <div className="mt-16 md:mt-24">
          <BadgeWall />
        </div>
        <div className="mt-16 md:mt-24">
          <Awards />
        </div>
        <div className="mt-16 md:mt-24">
          <CodeShowcase />
        </div>
        <div className="mt-16 md:mt-24">
          <AboutDocuments />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + build** — `npm run typecheck && npm run build` → succeed.

- [ ] **Step 3: Commit**

```bash
git add v2/components/sections/about/index.tsx
git commit -m "feat(v2): About section composition (bio, facts, animated stat counters)"
```

---

## Task 9: Wire About into the home page + update the smoke test

**Files:** Modify `v2/app/page.tsx`, `v2/tests/e2e/smoke.spec.ts`.

- [ ] **Step 1: Replace `v2/app/page.tsx`** with (drops the `#about` stub + the `counts`/loader plumbing; the remaining stubs are unchanged):

```tsx
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { Preloader } from "@/components/layout/preloader";
import { Hero } from "@/components/sections/hero";
import { ScrollShowpiece } from "@/components/sections/scroll-showpiece";
import { About } from "@/components/sections/about";
import { NAV_SECTIONS } from "@/lib/site";

// Stub placeholders until each real section lands (P6+). Each anchored section is
// tall enough to exercise scroll-spy and smooth scroll-to.
const STUB_COPY: Record<string, string> = {
  academics: "UC Berkeley — coursework, GPA, and the course grid land here.",
  research: "Research papers render here.",
  journey: "The India → Berkeley → Amazon timeline lands here.",
  skills: "Skill clusters and the logo marquee land here.",
  projects: "The projects bento grid with filters lands here.",
  contact: "The contact form and footer land here.",
};

export default function Home() {
  return (
    <>
      <Preloader />
      <SiteNav />
      <main id="main" className="bg-background text-foreground">
        <Hero />
        <ScrollShowpiece />
        <About />

        {/* Remaining anchored stubs (everything after About in NAV_SECTIONS). */}
        {NAV_SECTIONS.filter((s) => s.id !== "about").map(({ id, label }) => (
          <section
            key={id}
            id={id}
            aria-labelledby={`${id}-h`}
            className="scroll-mt-[88px] border-t border-border px-6 py-24 md:px-10"
          >
            <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center">
              <h2 id={`${id}-h`} className="font-display text-3xl text-heading md:text-5xl">
                {label}
              </h2>
              <p className="mt-4 max-w-xl text-muted">{STUB_COPY[id]}</p>
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 2: Replace `v2/tests/e2e/smoke.spec.ts`** (the data-pipeline proof now lives in the About stat counters; reduced motion makes `CountUp` render the final value deterministically):

```ts
import { test, expect } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test("homepage renders the shell and validated data counts", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("preloader")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: /Parshv Patel/i })).toBeVisible();
  // About stat counters render the build-time, Zod-validated loader counts.
  await expect(page.getByTestId("stat-projects")).toHaveText("12");
  await expect(page.getByTestId("stat-research")).toHaveText("5");
});
```

- [ ] **Step 3: Build + verify** — `npm run build` → succeeds; `out/index.html` exists and contains `Hello`. `npm run lint && npm run typecheck` → clean.

- [ ] **Step 4: Commit**

```bash
git add v2/app/page.tsx v2/tests/e2e/smoke.spec.ts
git commit -m "feat(v2): home — real About section replaces the stub"
```

---

## Task 10: E2E for About + full gate sweep

**Files:** Create `v2/tests/e2e/about.spec.ts`.

- [ ] **Step 1: Implement `v2/tests/e2e/about.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test.describe("About section", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("renders bio, stat counters, badges, awards, code, and documents", async ({ page }) => {
    await page.goto("/");
    const about = page.locator("#about");
    await expect(about.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(page.getByTestId("stat-projects")).toHaveText("12");
    await expect(page.getByTestId("stat-research")).toHaveText("5");
    await expect(page.getByTestId("stat-awards")).toHaveText("15");
    await expect(about.getByRole("heading", { name: /achievement badges/i })).toBeVisible();
    await expect(about.getByRole("heading", { name: /awards & recognition/i })).toBeVisible();
    await expect(about.getByRole("heading", { name: /code samples/i })).toBeVisible();
    await expect(about.getByRole("link", { name: /unofficial transcript/i })).toHaveAttribute(
      "href",
      "/documents/transcript.pdf",
    );
  });

  test("an award card opens an accessible modal; Escape closes it and restores focus", async ({
    page,
  }) => {
    await page.goto("/");
    const card = page.locator("#about").getByRole("button", { name: /amazon future engineer/i });
    // Retry the first interaction until the client island has hydrated.
    await expect(async () => {
      await card.click();
      await expect(page.getByRole("dialog")).toBeVisible();
    }).toPass();
    await expect(page.getByRole("dialog")).toContainText(/scholarship of up to \$40,000/i);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(card).toBeFocused();
  });

  test("the code showcase switches tabs via click and arrow keys", async ({ page }) => {
    await page.goto("/");
    const py = page.getByRole("tab", { name: "app.py" });
    const js = page.getByRole("tab", { name: "main.js" });
    await expect(async () => {
      await py.click();
      await expect(py).toHaveAttribute("aria-selected", "true");
    }).toPass();
    await expect(page.getByRole("tabpanel")).toContainText(/AtlasMind/);
    await py.press("ArrowRight");
    await expect(js).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toContainText(/Portfolio Animation/);
  });

  test("reduced motion does not trap scrolling through About", async ({ page }) => {
    await page.goto("/");
    const beforeY = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 9000);
    await page.waitForTimeout(300);
    const afterY = await page.evaluate(() => window.scrollY);
    expect(afterY).toBeGreaterThan(beforeY + 600);
  });
});
```

- [ ] **Step 2: Run the e2e for About** — `npx playwright test tests/e2e/about.spec.ts` → all pass (chromium/firefox/webkit). If a first-interaction assertion flakes once under dev-server compile load, the config retry recovers it; confirm it passes in isolation.

- [ ] **Step 3: Full gate sweep** (from `v2/`) — all green:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

The accessibility suite (`tests/e2e/accessibility.spec.ts`) now scans the home page **with About** across all 4 themes — it must report **zero** axe violations on `/`. (A lone `firefox › /preview` color-contrast failure is the known dev-server-load flake; re-run it in isolation to confirm.)

- [ ] **Step 4: Commit**

```bash
git add v2/tests/e2e/about.spec.ts
git commit -m "test(v2): e2e About — stats, badge wall, award modal, code tabs, reduced-motion no-trap"
```

- [ ] **Step 5: Phase-5 checkpoint (report; do NOT push)** — report green gates (counts + per-browser e2e). The controller then drives the browser (Playwright MCP): screenshot About across **midnight/daylight/manuscript/neon + mobile (390px)**, exercise the award modal (open/Esc/focus return), badge hover tooltips, and the code tabs; run `@axe-core/playwright` on the new surface; **eyeball award-logo legibility in the two dark themes** (the white chip should keep every logo readable).

---

## Task 11: Docs + roadmap

**Files:** Create `v2/../docs/v2/ABOUT.md`; modify `docs/v2/ROADMAP.md`.

- [ ] **Step 1: Create `docs/v2/ABOUT.md`** — a concise reference (mirror `HERO.md`'s tone): components + responsibilities, the content module as the single edit point, the badge-wall a11y rationale (sr-only label + hover tooltip, intentionally non-focusable), the reusable `Modal` (focus-trap/Esc/scrim/return-focus, `z-[80]`, reused in P9), the code tablist (roving `tabIndex`, `tabKeyToIndex`), stat counters (data-derived where possible), asset paths (`public/images/awards/*`, `public/documents/transcript.pdf`), and gates.

- [ ] **Step 2: Update `docs/v2/ROADMAP.md`** — mark Session 5 **in progress** with "About (P5) complete"; note Academics/Research (P6) next.

- [ ] **Step 3: Commit**

```bash
git add docs/v2/ABOUT.md docs/v2/ROADMAP.md
git commit -m "docs(v2): About section reference (ABOUT.md) + roadmap status (P5)"
```

---

## Self-Review (against spec §7.4 About, §10 TDD, §11 a11y/perf, §13 P5 acceptance)

**1. Spec coverage**
- **§7.4 bio + key facts** → Task 1 (`ABOUT_BIO`, `ABOUT_FACTS`) + Task 8 (intro split). ✔
- **§7.4 animated stat counters (GPA, projects, research, awards, volunteer)** → Task 8 (`CountUp`; projects/research from loaders, awards from `AWARDS.length`). ✔
- **§7.4 achievement badge wall (SVG/typographic, NOT emoji; hover tooltips)** → Tasks 1 + 4 (Lucide marks, hover tooltip, `sr-only` labels). ✔
- **§7.4 expandable award cards → accessible modal (~16)** → Tasks 3 + 5 (15 citations; focus-trapped Modal). ✔
- **§7.4 code-showcase tabs (python/js/sql, keyboard-accessible tablist)** → Tasks 2 + 6 (ARIA tablist, roving tabIndex, Arrow/Home/End). ✔
- **§7.4 documents (résumé/transcript/LinkedIn)** → Tasks 0 + 7. ✔
- **§10 strict TDD** → failing-test-first for `about-content`, `tabKeyToIndex`, `Modal`, `CodeShowcase`; e2e for interactions. ✔
- **§11 a11y/perf** → single h1 preserved (h2 + h3s, no skips; sr-only "By the numbers"); ≥44px targets; visible focus rings; `aria-modal`+escape+return-focus; AA tokens only (no hex); CLS-safe `<img width/height>`; tabular-nums; reduced-motion gated + e2e no-trap. ✔
- **§13 P5 acceptance ("Parity with v1 About; modals accessible; counts animate once")** → content parity verified by `about-content.test`; Modal a11y by `modal.test` + e2e; `CountUp` is `once:true`. ✔
- **Mandated skills (frontend-design / ui-ux-pro-max / gsap-*)** → stated above + applied throughout. ✔

**2. Placeholder scan** — every step ships complete code (full content module, full components, full tests). The only deliberately deferred items are *content for later phases* (the remaining home stubs), explicitly out of P5 scope. No "TBD"/"handle errors"/"similar to". ✔

**3. Type consistency** — `Award`/`AchievementBadge`/`CodeSample`/`AboutDocument`/`AboutFact` defined in Task 1 are the exact shapes consumed in Tasks 5/6/7/8; `tabKeyToIndex(key,current,count)` (Task 2) matches its `CodeShowcase` call site (Task 6); `Modal` props (`open/onClose/labelledBy/ariaLabel/children/className`, Task 3) match the `Awards` usage (Task 5); `CountUp`/`Reveal` props match their real signatures; `getProjects()/getResearch()` return arrays whose `.length` feeds the stats. ✔

**4. RSC boundary** — every icon-bearing array (`ACHIEVEMENT_BADGES`, `AWARDS`) is imported **directly** by the component that renders it (`BadgeWall` server; `Awards` client); no function/component is ever passed as a prop from a server to a client component. ✔

## Notes carried to later phases
- The **`Modal`** primitive (`components/ui/modal.tsx`) is reused for the **Projects detail modal (P9)** — keep its API stable.
- If a brand award logo reads poorly on a dark theme during visual verification, the white chip in `AwardMark` is the safety net; adjust chip padding/size rather than per-theme hacks.
- Courses / certifications / professional-development counts (currently parsed at build but no longer shown on the page) return to the UI in **P6 (Academics + Research)** and **P8**; the build-time Zod validation still runs via `sync-data` + the loaders every build.
- A higher-res editorial portrait + award-logo SVGs (if the user wants crisper marks) can be dropped in at the same paths with no code change.
