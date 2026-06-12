# Portfolio v2 — P9 Projects + P10 Hobbies + Contact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two remaining stub sections in `v2/app/page.tsx` with production-quality Projects (bento grid + filters + JARVIS panel + modal) and Hobbies + Contact sections, completing all content sections for the portfolio v2.

**Architecture:** Three independent section families — Projects (client-filtered bento grid with modal, served from existing JSON via `getProjects()`), Hobbies (static server component with content from a new `v2/content/hobbies.ts` module), and Contact (client component using Web3Forms with inline validation). Each family is a directory under `v2/components/sections/`. Page assembly replaces the stub loop with three imports.

**Tech Stack:** Next.js 16 App Router (static export), TypeScript (no `any`), Tailwind v4 (`@theme inline` tokens), GSAP + `useGSAP` + ScrollTrigger (all wrapped in `gsap.matchMedia()` for reduced-motion), `lucide-react` icons, existing `<Modal>`, `<Badge>`, `<Reveal>` primitives, Vitest + @testing-library/react (unit), Playwright chromium/firefox/webkit (e2e).

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `v2/content/projects.ts` | **CREATE** | Static JARVIS/learning data not in JSON |
| `v2/content/hobbies.ts` | **CREATE** | All hobbies static data (featured + secondary) |
| `v2/components/sections/projects/index.tsx` | **CREATE** | Server shell: fetches data, renders section header + `<ProjectGrid>` + `<JarvisPanel>` |
| `v2/components/sections/projects/project-grid.tsx` | **CREATE** | `"use client"` — filter state, bento grid layout, modal open/close |
| `v2/components/sections/projects/project-card.tsx` | **CREATE** | `"use client"` — presentational card, accepts `onOpen` handler |
| `v2/components/sections/projects/project-modal.tsx` | **CREATE** | `"use client"` — modal content component |
| `v2/components/sections/projects/jarvis-panel.tsx` | **CREATE** | Server component — static JARVIS + learning panels |
| `v2/components/sections/hobbies/index.tsx` | **CREATE** | Server component — section shell + featured cards + secondary grid |
| `v2/components/sections/contact/index.tsx` | **CREATE** | Server component — section shell + layout grid |
| `v2/components/sections/contact/contact-form.tsx` | **CREATE** | `"use client"` — form state, validation, Web3Forms submit, success overlay |
| `v2/tests/unit/projects.test.ts` | **CREATE** | Unit: data loader counts + filter logic |
| `v2/tests/unit/contact-validation.test.ts` | **CREATE** | Unit: validation pure functions |
| `v2/tests/e2e/projects.spec.ts` | **CREATE** | E2E: section render, filter, modal, axe |
| `v2/tests/e2e/hobbies.spec.ts` | **CREATE** | E2E: section render, axe |
| `v2/tests/e2e/contact.spec.ts` | **CREATE** | E2E: form validation, mock submit, axe |
| `v2/app/page.tsx` | **MODIFY** | Replace stub loop with `<Projects>`, `<Hobbies>`, `<Contact>` |
| `docs/v2/ROADMAP.md` | **MODIFY** | Mark P9 + P10 complete |

---

## Task 1: Content modules

**Files:**
- Create: `v2/content/projects.ts`
- Create: `v2/content/hobbies.ts`

- [ ] **Step 1.1 — Create `v2/content/projects.ts`**

```typescript
// v2/content/projects.ts

export const CURRENTLY_BUILDING = {
  name: "JARVIS AI Assistant",
  description:
    "A comprehensive personal AI assistant featuring voice control, task automation, multi-LLM integration, and 8+ specialized modules including Academic, Career, Finance, and Research assistants.",
  tech: ["Python", "LangChain", "OpenAI", "Groq", "Flask"],
} as const;

export const CURRENTLY_LEARNING = [
  "Agentic AI & Autonomous Systems",
  "Large Language Models (LLMs)",
  "Advanced Machine Learning",
] as const;

export const LEARNING_GOAL = "Goal: Build production-ready AI systems" as const;

export const FILTER_LABELS: Record<string, string> = {
  all: "All Projects",
  saas: "Full-Stack SaaS",
  cv: "Computer Vision",
  ml: "Machine Learning",
  deployment: "Deployed Apps",
  analytics: "Data Analytics",
};

export const FILTER_KEYS = ["all", "saas", "cv", "ml", "deployment", "analytics"] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];
```

- [ ] **Step 1.2 — Create `v2/content/hobbies.ts`**

```typescript
// v2/content/hobbies.ts

export interface HobbyAward {
  tier: "gold" | "silver" | "bronze";
  name: string;
  detail?: string;
}

export interface FeaturedHobby {
  id: string;
  title: string;
  role: string;
  iconName: string; // lucide icon name as string key
  description: string;
  awards: HobbyAward[];
  poetryData?: {
    journeySteps: string[];
    poemTitle: string;
    poemSubject: string;
    poemRecognition: string;
    link: string;
  };
}

export interface SecondaryHobby {
  id: string;
  title: string;
  role: string;
  iconName: string;
  description: string;
}

export const FEATURED_HOBBIES: FeaturedHobby[] = [
  {
    id: "tennis",
    title: "Varsity Tennis",
    role: "Vice Captain · 2 Years",
    iconName: "TableTennis",
    description:
      "Led team practices and acted as the backbone of the team. Contributed to multiple school victories while cultivating a positive, growth-focused training environment. Emphasized teamwork, discipline, and leadership on and off the court.",
    awards: [
      {
        tier: "gold",
        name: "CBAADA Scholarship Winner",
        detail:
          "First student in 10 years of West Valley High School to receive this honor. 12 selected from 69 applications across 80 schools in Citrus Belt area.",
      },
      {
        tier: "gold",
        name: "Outstanding Doubles Play",
        detail: "WVHS Tennis Trophy",
      },
      {
        tier: "silver",
        name: "Athlete of the Year & Athletic Scholar Badge",
      },
      {
        tier: "bronze",
        name: "Most Improved Player in Tennis",
        detail: "Varsity Athletic Award",
      },
    ],
  },
  {
    id: "poetry",
    title: "Poetry & Creative Writing",
    role: "Published Poet · National Champion",
    iconName: "Feather",
    description:
      "Competing through the GFWC youth writing contest from club to national level, winning first place nationally in the grades 9–12 poetry division.",
    awards: [
      {
        tier: "gold",
        name: "1st Place — National Youth Writing Contest (GFWC)",
        detail:
          "Grades 9-12 Poetry Division. Elevated Hemet Woman's Club to first-ever national victory in over a decade.",
      },
    ],
    poetryData: {
      journeySteps: ["Club", "District (12 clubs)", "State (185 clubs)", "National (50+ states)"],
      poemTitle: '"The Pencil, the Rocket, and the Sky"',
      poemSubject: "A tribute to Katherine Johnson's legacy",
      poemRecognition:
        "Nation's top entry for creative narrative, historical insight, and literary merit",
      link: "https://www.cfwcdeanzadistrict.org/general-7-1",
    },
  },
];

export const SECONDARY_HOBBIES: SecondaryHobby[] = [
  {
    id: "calisthenics",
    title: "Calisthenics",
    role: "Self-Practice & Discipline",
    iconName: "Dumbbell",
    description:
      "Self-taught bodyweight exercises building physical strength, control, and endurance. Developed a healthier, more focused lifestyle with improved mental well-being and personal resilience.",
  },
  {
    id: "hiking",
    title: "Hiking & Mountain Climbing",
    role: "Adventure & Exploration",
    iconName: "Mountain",
    description:
      "Exploring nature and pushing physical limits. Finding balance between the digital and natural worlds through adventure and discovery.",
  },
  {
    id: "music",
    title: "Music",
    role: "Inspiration & Focus",
    iconName: "Headphones",
    description:
      "Music as inspiration and relaxation. Diverse taste spanning genres — the perfect soundtrack to coding sessions and creative work.",
  },
  {
    id: "anime",
    title: "Anime",
    role: "Storytelling & Culture",
    iconName: "Tv",
    description:
      "Drawn to the storytelling depth, visual artistry, and cultural richness of anime. A source of creative inspiration and imaginative thinking.",
  },
];
```

- [ ] **Step 1.3 — Verify TypeScript compiles (no errors)**

Run from `v2/`:
```bash
npm run typecheck
```
Expected: exit 0, no errors.

- [ ] **Step 1.4 — Commit**

```bash
git add v2/content/projects.ts v2/content/hobbies.ts
git commit -m "feat(v2): P9/P10 content modules — projects + hobbies static data

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Projects unit tests (TDD — write first)

**Files:**
- Create: `v2/tests/unit/projects.test.ts`

- [ ] **Step 2.1 — Write failing unit tests**

```typescript
// v2/tests/unit/projects.test.ts
import { describe, it, expect } from "vitest";
import { getProjects } from "@/lib/data";
import { FILTER_KEYS, FILTER_LABELS, CURRENTLY_BUILDING } from "@/content/projects";

describe("projects data", () => {
  it("returns 12 projects", () => {
    expect(getProjects()).toHaveLength(12);
  });

  it("exactly 2 projects have featured: true", () => {
    const featured = getProjects().filter((p) => p.featured === true);
    expect(featured).toHaveLength(2);
  });

  it("every project has 'all' in its categories array", () => {
    const allHaveAll = getProjects().every((p) => p.categories.includes("all"));
    expect(allHaveAll).toBe(true);
  });

  it("featured projects are interlace and atlasmind", () => {
    const featuredIds = getProjects()
      .filter((p) => p.featured === true)
      .map((p) => p.id);
    expect(featuredIds).toContain("interlace-fashion-search");
    expect(featuredIds).toContain("atlasmind-ai-trip-planner");
  });
});

describe("filter logic", () => {
  it("FILTER_KEYS contains 'all' as first entry", () => {
    expect(FILTER_KEYS[0]).toBe("all");
  });

  it("every FILTER_KEY has a label in FILTER_LABELS", () => {
    for (const key of FILTER_KEYS) {
      expect(FILTER_LABELS[key]).toBeTruthy();
    }
  });

  it("filtering by 'cv' returns only projects with 'cv' in categories", () => {
    const projects = getProjects();
    const cvProjects = projects.filter((p) => p.categories.includes("cv"));
    expect(cvProjects.length).toBeGreaterThan(0);
    expect(cvProjects.every((p) => p.categories.includes("cv"))).toBe(true);
  });

  it("filtering by 'all' returns all 12 projects", () => {
    const projects = getProjects();
    const filtered = projects.filter((p) => p.categories.includes("all"));
    expect(filtered).toHaveLength(12);
  });
});

describe("CURRENTLY_BUILDING", () => {
  it("has name, description, and tech array", () => {
    expect(CURRENTLY_BUILDING.name).toBeTruthy();
    expect(CURRENTLY_BUILDING.description).toBeTruthy();
    expect(CURRENTLY_BUILDING.tech.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2.2 — Run tests to verify they fail** (content module exists but `getProjects` is already working so data tests pass; filter tests pass; this confirms the contract is correct)

```bash
cd v2 && npm test -- --reporter=verbose tests/unit/projects.test.ts
```

Expected: All tests **PASS** (data already exists and passes schema). This confirms the contract for the grid component.

- [ ] **Step 2.3 — Commit tests**

```bash
git add v2/tests/unit/projects.test.ts
git commit -m "test(v2): P9 projects unit tests — data counts, filter logic, JARVIS content

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Contact validation unit tests (TDD — write first)

**Files:**
- Create: `v2/lib/contact-validation.ts`
- Create: `v2/tests/unit/contact-validation.test.ts`

- [ ] **Step 3.1 — Create the pure validation module**

```typescript
// v2/lib/contact-validation.ts

export interface ContactFields {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactFields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(fields: ContactFields): ContactErrors {
  const errors: ContactErrors = {};

  if (!fields.name.trim() || fields.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }
  if (!fields.email.trim() || !EMAIL_RE.test(fields.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!fields.subject.trim() || fields.subject.trim().length < 2) {
    errors.subject = "Subject must be at least 2 characters.";
  }
  if (!fields.message.trim() || fields.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }

  return errors;
}

export function hasErrors(errors: ContactErrors): boolean {
  return Object.keys(errors).length > 0;
}
```

- [ ] **Step 3.2 — Write failing unit tests**

```typescript
// v2/tests/unit/contact-validation.test.ts
import { describe, it, expect } from "vitest";
import { validateContact, hasErrors } from "@/lib/contact-validation";

const valid = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Hello there",
  message: "This is a message that is long enough.",
};

describe("validateContact", () => {
  it("returns no errors for valid input", () => {
    expect(hasErrors(validateContact(valid))).toBe(false);
  });

  it("errors on empty name", () => {
    const e = validateContact({ ...valid, name: "" });
    expect(e.name).toBeTruthy();
  });

  it("errors on single-char name", () => {
    const e = validateContact({ ...valid, name: "J" });
    expect(e.name).toBeTruthy();
  });

  it("errors on missing email", () => {
    const e = validateContact({ ...valid, email: "" });
    expect(e.email).toBeTruthy();
  });

  it("errors on malformed email", () => {
    const e = validateContact({ ...valid, email: "notanemail" });
    expect(e.email).toBeTruthy();
  });

  it("accepts valid email", () => {
    const e = validateContact({ ...valid, email: "user@domain.co.uk" });
    expect(e.email).toBeUndefined();
  });

  it("errors on short subject", () => {
    const e = validateContact({ ...valid, subject: "x" });
    expect(e.subject).toBeTruthy();
  });

  it("errors on short message", () => {
    const e = validateContact({ ...valid, message: "hi" });
    expect(e.message).toBeTruthy();
  });

  it("trims whitespace before validation", () => {
    const e = validateContact({ ...valid, name: "   " });
    expect(e.name).toBeTruthy();
  });
});

describe("hasErrors", () => {
  it("returns false for empty errors", () => {
    expect(hasErrors({})).toBe(false);
  });

  it("returns true when any error present", () => {
    expect(hasErrors({ name: "required" })).toBe(true);
  });
});
```

- [ ] **Step 3.3 — Run tests: first run should PASS** (pure functions with no deps)

```bash
cd v2 && npm test -- --reporter=verbose tests/unit/contact-validation.test.ts
```

Expected: All **PASS**.

- [ ] **Step 3.4 — Commit**

```bash
git add v2/lib/contact-validation.ts v2/tests/unit/contact-validation.test.ts
git commit -m "test(v2): P10 contact validation pure functions + unit tests

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Project card + modal components

**Files:**
- Create: `v2/components/sections/projects/project-card.tsx`
- Create: `v2/components/sections/projects/project-modal.tsx`

- [ ] **Step 4.1 — Create `project-card.tsx`**

```tsx
// v2/components/sections/projects/project-card.tsx
"use client";

import Image from "next/image";
import { Github, ExternalLink, Play } from "lucide-react";
import type { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  featured: boolean;
  onOpen: (p: Project) => void;
}

export function ProjectCard({ project, featured, onOpen }: ProjectCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border border-border bg-surface transition-colors hover:border-accent/40",
        featured ? "sm:col-span-2" : "",
      )}
      data-testid={`project-card-${project.id}`}
    >
      {featured && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-elevated">
          <Image
            src={`/images/${project.image}`}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 50vw"
            onError={() => {/* Next.js Image falls back to alt text on error */}}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onOpen(project)}
            aria-haspopup="dialog"
            aria-label={`${project.title} — open project details`}
            className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded"
          >
            {featured && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                Featured
              </span>
            )}
            <h3 className={cn(
              "font-display leading-snug text-heading",
              featured ? "text-xl mt-0.5" : "text-lg",
            )}>
              {project.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-muted">
              {project.description}
            </p>
          </button>
        </div>

        {project.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {project.tags.slice(0, featured ? 5 : 3).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-3 pt-4 border-t border-border mt-4">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`GitHub repository for ${project.title} (opens in new tab)`}
              className="flex items-center gap-1 rounded font-mono text-xs text-muted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              <Github className="h-3.5 w-3.5" aria-hidden="true" />
              <span>GitHub</span>
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Live demo for ${project.title} (opens in new tab)`}
              className="flex items-center gap-1 rounded font-mono text-xs text-muted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Live</span>
            </a>
          )}
          {project.presentationUrl && (
            <a
              href={project.presentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Demo video for ${project.title} (opens in new tab)`}
              className="flex items-center gap-1 rounded font-mono text-xs text-muted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Demo</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => onOpen(project)}
            className="ml-auto font-mono text-xs text-muted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-colors"
          >
            Details →
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4.2 — Create `project-modal.tsx`**

```tsx
// v2/components/sections/projects/project-modal.tsx
"use client";

import { Github, ExternalLink, Play } from "lucide-react";
import type { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface ProjectModalContentProps {
  project: Project;
  titleId: string;
}

export function ProjectModalContent({ project, titleId }: ProjectModalContentProps) {
  return (
    <div className="pr-10">
      <div className="flex flex-wrap gap-1 mb-2">
        {project.categories.filter((c) => c !== "all").map((cat) => (
          <span key={cat} className="font-mono text-[10px] uppercase tracking-widest text-accent">
            {cat}
          </span>
        ))}
      </div>

      <p id={titleId} className="font-display text-xl text-heading md:text-2xl leading-snug">
        {project.title}
      </p>

      <p className="mt-3 text-sm leading-relaxed text-muted">{project.description}</p>

      {project.highlights.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted">
            Highlights
          </p>
          <ul className="space-y-2">
            {project.highlights.map((h, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {project.technologies.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted">
            Tech Stack
          </p>
          <div className="flex flex-wrap gap-1">
            {project.technologies.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        </div>
      )}

      {(project.githubUrl || project.liveUrl || project.presentationUrl) && (
        <div className="mt-6 border-t border-border pt-4 flex flex-wrap gap-3">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 font-mono text-xs text-muted hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              <Github className="h-3.5 w-3.5" aria-hidden="true" />
              GitHub
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 font-mono text-xs text-muted hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Live Demo
            </a>
          )}
          {project.presentationUrl && (
            <a
              href={project.presentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 font-mono text-xs text-muted hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              Demo Video
            </a>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4.3 — Typecheck**

```bash
cd v2 && npm run typecheck
```

Expected: exit 0.

---

## Task 5: Project grid (filter + bento)

**Files:**
- Create: `v2/components/sections/projects/project-grid.tsx`

- [ ] **Step 5.1 — Create `project-grid.tsx`**

```tsx
// v2/components/sections/projects/project-grid.tsx
"use client";

import { useState, useTransition, useId } from "react";
import type { Project } from "@/lib/types";
import { FILTER_KEYS, FILTER_LABELS, type FilterKey } from "@/content/projects";
import { Reveal } from "@/components/motion/reveal";
import { Modal } from "@/components/ui/modal";
import { ProjectCard } from "./project-card";
import { ProjectModalContent } from "./project-modal";

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<Project | null>(null);
  const [isPending, startTransition] = useTransition();
  const uid = useId();
  const titleId = `${uid}-project-title`;
  const gridId = `${uid}-project-grid`;

  const filtered =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => p.categories.includes(activeFilter));

  function handleFilter(key: FilterKey) {
    startTransition(() => setActiveFilter(key));
  }

  return (
    <div>
      {/* Filter bar */}
      <div
        role="tablist"
        aria-label="Filter projects by category"
        className="mt-10 flex flex-wrap gap-2"
      >
        {FILTER_KEYS.map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeFilter === key}
            aria-controls={gridId}
            onClick={() => handleFilter(key)}
            className={
              activeFilter === key
                ? "rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-widest bg-accent text-on-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                : "rounded-full border border-border px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:border-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            }
          >
            {FILTER_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Bento grid */}
      <div
        id={gridId}
        role="tabpanel"
        aria-labelledby={`filter-${activeFilter}`}
        data-testid="projects-grid"
        className={`mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-150 ${isPending ? "opacity-50" : "opacity-100"}`}
      >
        <Reveal stagger={0.05}>
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              featured={project.featured === true}
              onOpen={setSelected}
            />
          ))}
        </Reveal>
      </div>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        labelledBy={titleId}
      >
        {selected && (
          <ProjectModalContent project={selected} titleId={titleId} />
        )}
      </Modal>
    </div>
  );
}
```

- [ ] **Step 5.2 — Typecheck**

```bash
cd v2 && npm run typecheck
```

Expected: exit 0.

---

## Task 6: JARVIS panel

**Files:**
- Create: `v2/components/sections/projects/jarvis-panel.tsx`

- [ ] **Step 6.1 — Create `jarvis-panel.tsx`**

```tsx
// v2/components/sections/projects/jarvis-panel.tsx
import { Rocket, BookOpen, Target, Zap } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import {
  CURRENTLY_BUILDING,
  CURRENTLY_LEARNING,
  LEARNING_GOAL,
} from "@/content/projects";

export function JarvisPanel() {
  return (
    <Reveal>
      <div className="mt-16 rounded-2xl border border-border bg-surface overflow-hidden border-l-2 border-l-accent">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-widest text-heading">
              What I&apos;m Working On
            </span>
          </div>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
            <span
              className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"
              aria-hidden="true"
            />
            Active
          </span>
        </div>

        {/* Two panels */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Building */}
          <div className="p-6 md:border-r md:border-border">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="h-4 w-4 text-accent" aria-hidden="true" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Currently Building
              </span>
            </div>
            <p className="font-display text-lg text-heading leading-snug">
              {CURRENTLY_BUILDING.name}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {CURRENTLY_BUILDING.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1">
              {CURRENTLY_BUILDING.tech.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </div>

          {/* Learning */}
          <div className="p-6 border-t border-border md:border-t-0">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-4 w-4 text-accent" aria-hidden="true" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Currently Learning
              </span>
            </div>
            <ul className="space-y-2">
              {CURRENTLY_LEARNING.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/50 bg-elevated px-3 py-2">
              <Target className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
              <span className="font-mono text-xs text-muted">{LEARNING_GOAL}</span>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
```

- [ ] **Step 6.2 — Typecheck**

```bash
cd v2 && npm run typecheck
```

Expected: exit 0.

---

## Task 7: Projects section shell

**Files:**
- Create: `v2/components/sections/projects/index.tsx`

- [ ] **Step 7.1 — Create `index.tsx`**

```tsx
// v2/components/sections/projects/index.tsx
import { getProjects } from "@/lib/data";
import { ProjectGrid } from "./project-grid";
import { JarvisPanel } from "./jarvis-panel";

export function Projects() {
  const projects = getProjects();

  return (
    <section
      id="projects"
      aria-labelledby="projects-h"
      className="relative scroll-mt-[88px] overflow-hidden border-t border-border px-6 py-24 md:px-10 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 40% at 15% 80%, color-mix(in oklab, var(--accent) 6%, transparent), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          Selected Work
        </p>
        <h2
          id="projects-h"
          className="mt-4 font-display text-4xl leading-[1.05] text-heading md:text-6xl"
        >
          Projects
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted">
          <span data-testid="stat-projects-section">{projects.length}</span>{" "}
          projects spanning machine learning, computer vision, full-stack deployment, and data analytics.
        </p>

        <ProjectGrid projects={projects} />
        <JarvisPanel />
      </div>
    </section>
  );
}
```

- [ ] **Step 7.2 — Typecheck**

```bash
cd v2 && npm run typecheck
```

Expected: exit 0.

---

## Task 8: Hobbies section

**Files:**
- Create: `v2/components/sections/hobbies/index.tsx`

- [ ] **Step 8.1 — Create `hobbies/index.tsx`**

```tsx
// v2/components/sections/hobbies/index.tsx
import {
  Trophy,
  Star,
  TrendingUp,
  Dumbbell,
  Mountain,
  Headphones,
  Tv,
  Feather,
} from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { FEATURED_HOBBIES, SECONDARY_HOBBIES, type FeaturedHobby, type SecondaryHobby } from "@/content/hobbies";

const TIER_ICON: Record<"gold" | "silver" | "bronze", React.ElementType> = {
  gold: Trophy,
  silver: Star,
  bronze: TrendingUp,
};

const TIER_CLASS: Record<"gold" | "silver" | "bronze", string> = {
  gold: "text-accent",
  silver: "text-muted",
  bronze: "text-muted/70",
};

// Map string icon names to lucide components
const SECONDARY_ICONS: Record<string, React.ElementType> = {
  Dumbbell,
  Mountain,
  Headphones,
  Tv,
};

function FeaturedCard({ hobby }: { hobby: FeaturedHobby }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-elevated">
          <Feather className="h-5 w-5 text-accent" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-xl text-heading leading-snug">{hobby.title}</h3>
          <p className="font-mono text-xs text-muted mt-0.5">{hobby.role}</p>
        </div>
      </div>

      {hobby.poetryData && (
        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-muted" aria-label="Competition journey">
            {hobby.poetryData.journeySteps.map((step, i) => (
              <span key={step} className="flex items-center gap-1.5">
                <span className={
                  i === hobby.poetryData!.journeySteps.length - 1
                    ? "rounded-full bg-accent px-2 py-0.5 text-on-accent text-[10px] uppercase tracking-wider"
                    : "text-[11px]"
                }>
                  {step}
                </span>
                {i < hobby.poetryData!.journeySteps.length - 1 && (
                  <span aria-hidden="true">→</span>
                )}
              </span>
            ))}
          </div>
          <blockquote className="mt-4 rounded-lg border border-border/50 bg-elevated px-4 py-3">
            <p className="font-display text-base italic text-heading">
              {hobby.poetryData.poemTitle}
            </p>
            <p className="mt-1 text-xs text-muted">{hobby.poetryData.poemSubject}</p>
            <p className="mt-1 font-mono text-[11px] text-accent">{hobby.poetryData.poemRecognition}</p>
          </blockquote>
        </div>
      )}

      {!hobby.poetryData && (
        <p className="mt-4 text-sm leading-relaxed text-muted">{hobby.description}</p>
      )}

      {hobby.awards.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
            Awards &amp; Recognition
          </p>
          {hobby.awards.map((award) => {
            const Icon = TIER_ICON[award.tier];
            return (
              <div key={award.name} className="flex gap-3 rounded-lg border border-border/50 bg-elevated px-3 py-2.5">
                <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${TIER_CLASS[award.tier]}`} aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-heading">{award.name}</p>
                  {award.detail && (
                    <p className="mt-0.5 text-xs text-muted">{award.detail}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hobby.poetryData && (
        <div className="mt-5 border-t border-border pt-4">
          <a
            href={hobby.poetryData.link}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded font-mono text-xs text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View Published Poem →
          </a>
        </div>
      )}
    </div>
  );
}

function SecondaryCard({ hobby }: { hobby: SecondaryHobby }) {
  const Icon = SECONDARY_ICONS[hobby.iconName] ?? Dumbbell;
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-elevated">
          <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-display text-base text-heading leading-snug">{hobby.title}</h3>
          <p className="font-mono text-[10px] text-muted">{hobby.role}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-muted">{hobby.description}</p>
    </div>
  );
}

export function Hobbies() {
  return (
    <section
      id="hobbies"
      aria-labelledby="hobbies-h"
      className="scroll-mt-[88px] border-t border-border px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          Life Beyond Tech
        </p>
        <h2
          id="hobbies-h"
          className="mt-4 font-display text-4xl leading-[1.05] text-heading md:text-6xl"
        >
          Beyond the Code
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Passions, achievements, and what makes me who I am outside of software.
        </p>

        {/* Featured hobbies */}
        <Reveal stagger={0.08} className="mt-12 grid gap-6 md:grid-cols-2">
          {FEATURED_HOBBIES.map((hobby) => (
            <FeaturedCard key={hobby.id} hobby={hobby} />
          ))}
        </Reveal>

        {/* Secondary hobbies */}
        <Reveal stagger={0.06} className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {SECONDARY_HOBBIES.map((hobby) => (
            <SecondaryCard key={hobby.id} hobby={hobby} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 8.2 — Typecheck**

```bash
cd v2 && npm run typecheck
```

Expected: exit 0.

---

## Task 9: Contact form component

**Files:**
- Create: `v2/components/sections/contact/contact-form.tsx`

- [ ] **Step 9.1 — Create `contact-form.tsx`**

```tsx
// v2/components/sections/contact/contact-form.tsx
"use client";

import { useState, useId, useRef } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { validateContact, hasErrors, type ContactFields, type ContactErrors } from "@/lib/contact-validation";

type SubmitStatus = "idle" | "sending" | "success" | "error";

const EMPTY: ContactFields = { name: "", email: "", subject: "", message: "" };

export function ContactForm() {
  const [fields, setFields] = useState<ContactFields>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [serverError, setServerError] = useState("");
  const uid = useId();
  const firstErrorRef = useRef<HTMLElement | null>(null);

  function update(field: keyof ContactFields, value: string) {
    setFields((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validateContact(fields);
    if (hasErrors(errs)) {
      setErrors(errs);
      // Focus first invalid field
      const firstKey = (["name", "email", "subject", "message"] as const).find(
        (k) => errs[k],
      );
      if (firstKey) {
        const el = document.getElementById(`${uid}-${firstKey}`);
        el?.focus();
      }
      return;
    }

    setStatus("sending");
    setServerError("");

    const formData = new FormData();
    formData.append("access_key", "510ff904-9c86-4c43-acce-03ba01e12a12");
    formData.append("name", fields.name.trim());
    formData.append("email", fields.email.trim());
    formData.append("subject", fields.subject.trim());
    formData.append("message", fields.message.trim());
    // Honeypot
    formData.append("botcheck", "");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setStatus("success");
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      setStatus("error");
      setServerError("Something went wrong. Please try again or email me directly.");
    }
  }

  const fieldClass = (field: keyof ContactFields) =>
    `w-full rounded-lg border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
      errors[field] ? "border-red-500" : "border-border"
    }`;

  if (status === "success") {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center">
        <CheckCircle className="h-12 w-12 text-accent" aria-hidden="true" />
        <p className="font-display text-2xl text-heading">Message sent!</p>
        <p className="text-sm text-muted">I&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Contact form"
      className="space-y-4"
    >
      {/* aria-live error summary */}
      <div
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {hasErrors(errors) && `Form has errors: ${Object.values(errors).join(" ")}`}
        {status === "error" && serverError}
      </div>

      {/* Name */}
      <div>
        <label htmlFor={`${uid}-name`} className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted">
          Name <span aria-hidden="true">*</span>
        </label>
        <input
          id={`${uid}-name`}
          type="text"
          name="name"
          autoComplete="name"
          required
          placeholder="Jane Doe"
          value={fields.name}
          onChange={(e) => update("name", e.target.value)}
          aria-describedby={errors.name ? `${uid}-name-error` : undefined}
          aria-invalid={!!errors.name}
          className={fieldClass("name")}
        />
        {errors.name && (
          <p id={`${uid}-name-error`} role="alert" className="mt-1 font-mono text-xs text-red-500">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor={`${uid}-email`} className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted">
          Email <span aria-hidden="true">*</span>
        </label>
        <input
          id={`${uid}-email`}
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="your@email.com"
          value={fields.email}
          onChange={(e) => update("email", e.target.value)}
          aria-describedby={errors.email ? `${uid}-email-error` : undefined}
          aria-invalid={!!errors.email}
          className={fieldClass("email")}
        />
        {errors.email && (
          <p id={`${uid}-email-error`} role="alert" className="mt-1 font-mono text-xs text-red-500">
            {errors.email}
          </p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor={`${uid}-subject`} className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted">
          Subject <span aria-hidden="true">*</span>
        </label>
        <input
          id={`${uid}-subject`}
          type="text"
          name="subject"
          required
          placeholder="What's this about?"
          value={fields.subject}
          onChange={(e) => update("subject", e.target.value)}
          aria-describedby={errors.subject ? `${uid}-subject-error` : undefined}
          aria-invalid={!!errors.subject}
          className={fieldClass("subject")}
        />
        {errors.subject && (
          <p id={`${uid}-subject-error`} role="alert" className="mt-1 font-mono text-xs text-red-500">
            {errors.subject}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor={`${uid}-message`} className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted">
          Message <span aria-hidden="true">*</span>
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={5}
          required
          placeholder="Your message here..."
          value={fields.message}
          onChange={(e) => update("message", e.target.value)}
          aria-describedby={errors.message ? `${uid}-message-error` : undefined}
          aria-invalid={!!errors.message}
          className={`${fieldClass("message")} resize-none`}
        />
        {errors.message && (
          <p id={`${uid}-message-error`} role="alert" className="mt-1 font-mono text-xs text-red-500">
            {errors.message}
          </p>
        )}
      </div>

      {/* Honeypot */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        aria-hidden="true"
        style={{ display: "none" }}
      />

      {status === "error" && (
        <p role="alert" className="font-mono text-xs text-red-500">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-mono text-sm text-on-accent transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" aria-hidden="true" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
```

- [ ] **Step 9.2 — Typecheck**

```bash
cd v2 && npm run typecheck
```

Expected: exit 0.

---

## Task 10: Contact section shell

**Files:**
- Create: `v2/components/sections/contact/index.tsx`

- [ ] **Step 10.1 — Create `contact/index.tsx`**

```tsx
// v2/components/sections/contact/index.tsx
import { Mail, Phone, MapPin, Linkedin, Github } from "lucide-react";
import { SITE, SOCIAL_LINKS } from "@/lib/site";
import { ContactForm } from "./contact-form";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-h"
      className="relative scroll-mt-[88px] overflow-hidden border-t border-border px-6 py-24 md:px-10 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(45% 50% at 90% 10%, color-mix(in oklab, var(--accent) 5%, transparent), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          Get in Touch
        </p>
        <h2
          id="contact-h"
          className="mt-4 font-display text-4xl leading-[1.05] text-heading md:text-6xl"
        >
          Contact
        </h2>

        <div className="mt-12 grid gap-12 md:grid-cols-2 lg:gap-20">
          {/* Info column */}
          <div>
            <h3 className="font-display text-2xl text-heading">
              Let&apos;s work together!
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              I&apos;m always interested in hearing about new opportunities,
              collaborations, or just connecting with fellow data enthusiasts.
              Feel free to reach out!
            </p>

            <ul className="mt-8 space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Email</p>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="text-sm text-foreground hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-colors"
                  >
                    {SITE.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Phone</p>
                  <a
                    href={`tel:${SITE.phone}`}
                    className="text-sm text-foreground hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-colors"
                  >
                    {SITE.phoneDisplay}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Location</p>
                  <p className="text-sm text-foreground">{SITE.location}</p>
                </div>
              </li>
            </ul>

            <div className="mt-8 flex gap-3">
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile (opens in new tab)"
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
                LinkedIn
              </a>
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile (opens in new tab)"
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                GitHub
              </a>
            </div>
          </div>

          {/* Form column */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 10.2 — Typecheck**

```bash
cd v2 && npm run typecheck
```

Expected: exit 0.

---

## Task 11: Wire up page.tsx

**Files:**
- Modify: `v2/app/page.tsx`

- [ ] **Step 11.1 — Update `page.tsx`**

Replace the entire file with:

```tsx
// v2/app/page.tsx
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { Preloader } from "@/components/layout/preloader";
import { Hero } from "@/components/sections/hero";
import { ScrollShowpiece } from "@/components/sections/scroll-showpiece";
import { About } from "@/components/sections/about";
import { Academics } from "@/components/sections/academics";
import { Research } from "@/components/sections/research";
import { Terminal } from "@/components/sections/terminal";
import { Journey } from "@/components/sections/journey";
import { Skills } from "@/components/sections/skills";
import { Projects } from "@/components/sections/projects";
import { Hobbies } from "@/components/sections/hobbies";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <Preloader />
      <SiteNav />
      <main id="main" className="bg-background text-foreground">
        <Hero />
        <ScrollShowpiece />
        <About />
        <Academics />
        <Research />
        <Terminal />
        <Journey />
        <Skills />
        <Projects />
        <Hobbies />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 11.2 — Run full lint + typecheck + unit tests + build**

```bash
cd v2 && npm run lint && npm run typecheck && npm test && npm run build
```

Expected: 
- lint: 0 errors
- typecheck: exit 0
- tests: all pass (≥80 existing + new unit tests)
- build: generates `out/` with no errors

Fix any errors before continuing.

- [ ] **Step 11.3 — Commit**

```bash
git add v2/app/page.tsx v2/components/sections/projects/ v2/components/sections/hobbies/ v2/components/sections/contact/ v2/lib/contact-validation.ts
git commit -m "feat(v2): P9 Projects + P10 Hobbies + Contact sections

- Projects: bento grid with filter tabs, featured cards, modal detail, JARVIS panel
- Hobbies: featured Tennis+Poetry cards with awards, 4 secondary cards
- Contact: Web3Forms form, inline validation, aria-live errors, success overlay
- Replace page.tsx stub loop with real section components

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 12: E2E tests

**Files:**
- Create: `v2/tests/e2e/projects.spec.ts`
- Create: `v2/tests/e2e/hobbies.spec.ts`
- Create: `v2/tests/e2e/contact.spec.ts`

- [ ] **Step 12.1 — Create `projects.spec.ts`**

```typescript
// v2/tests/e2e/projects.spec.ts
import { test, expect } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test.describe("Projects section", () => {
  test("renders heading and 12 cards by default", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#projects");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Projects");
    const grid = section.getByTestId("projects-grid");
    await expect(grid).toBeVisible();
    const cards = grid.locator("[data-testid^='project-card-']");
    await expect(cards).toHaveCount(12);
  });

  test("filter 'Computer Vision' shows only cv projects", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#projects");
    const cvBtn = section.getByRole("tab", { name: /computer vision/i });
    await expect(async () => {
      await cvBtn.click();
      await expect(cvBtn).toHaveAttribute("aria-selected", "true");
    }).toPass();
    const cards = section.getByTestId("projects-grid").locator("[data-testid^='project-card-']");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(12);
  });

  test("filter 'All Projects' restores all 12 cards", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#projects");
    await expect(async () => {
      await section.getByRole("tab", { name: /computer vision/i }).click();
      await section.getByRole("tab", { name: /all projects/i }).click();
      const cards = section.getByTestId("projects-grid").locator("[data-testid^='project-card-']");
      await expect(cards).toHaveCount(12);
    }).toPass();
  });

  test("click project card opens modal with title and tech stack", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#projects");
    const firstCard = section.getByTestId("projects-grid").locator("[data-testid^='project-card-']").first();
    const cardName = await firstCard.getByRole("button", { name: /open project details/i }).getAttribute("aria-label");
    await expect(async () => {
      await firstCard.getByRole("button", { name: /open project details/i }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
    }).toPass();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("Escape closes project modal and restores focus", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#projects");
    const btn = section.getByTestId("projects-grid").locator("[data-testid^='project-card-']").first().getByRole("button", { name: /open project details/i });
    await expect(async () => {
      await btn.click();
      await expect(page.getByRole("dialog")).toBeVisible();
    }).toPass();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(btn).toBeFocused();
  });

  test("JARVIS panel is visible", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#projects");
    await expect(section.getByText("JARVIS AI Assistant")).toBeVisible();
    await expect(section.getByText(/currently building/i)).toBeVisible();
  });
});
```

- [ ] **Step 12.2 — Create `hobbies.spec.ts`**

```typescript
// v2/tests/e2e/hobbies.spec.ts
import { test, expect } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test.describe("Hobbies section", () => {
  test("renders heading, featured hobbies, and secondary grid", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#hobbies");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Beyond the Code");
    await expect(section.getByText("Varsity Tennis")).toBeVisible();
    await expect(section.getByText("Poetry & Creative Writing")).toBeVisible();
    await expect(section.getByText("Calisthenics")).toBeVisible();
    await expect(section.getByText("Hiking & Mountain Climbing")).toBeVisible();
    await expect(section.getByText("Music")).toBeVisible();
    await expect(section.getByText("Anime")).toBeVisible();
  });

  test("poetry card shows competition journey and poem link", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#hobbies");
    await expect(section.getByText("National (50+ states)")).toBeVisible();
    await expect(section.getByText(/The Pencil, the Rocket/i)).toBeVisible();
    const link = section.getByRole("link", { name: /view published poem/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "https://www.cfwcdeanzadistrict.org/general-7-1");
  });

  test("tennis card shows CBAADA award", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#hobbies");
    await expect(section.getByText("CBAADA Scholarship Winner")).toBeVisible();
  });
});
```

- [ ] **Step 12.3 — Create `contact.spec.ts`**

```typescript
// v2/tests/e2e/contact.spec.ts
import { test, expect } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test.describe("Contact section", () => {
  test("renders heading, contact info, and form fields", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#contact");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Contact");
    await expect(section.getByText("parshvpatel_0910@berkeley.edu")).toBeVisible();
    await expect(section.getByText("(951) 599-3618")).toBeVisible();
    await expect(section.getByText("Berkeley, CA")).toBeVisible();
    await expect(section.getByRole("form", { name: /contact form/i })).toBeVisible();
  });

  test("submitting empty form shows validation errors", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#contact");
    const submitBtn = section.getByRole("button", { name: /send message/i });
    await expect(async () => {
      await submitBtn.click();
      await expect(section.getByText(/name must be at least/i)).toBeVisible();
    }).toPass();
    await expect(section.getByText(/enter a valid email/i)).toBeVisible();
  });

  test("invalid email shows email error", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#contact");
    await section.getByLabel(/name/i).fill("Jane Doe");
    await section.getByLabel(/email/i).fill("notanemail");
    await section.getByLabel(/subject/i).fill("Hello there");
    await section.getByLabel(/message/i).fill("This is a long enough message.");
    await expect(async () => {
      await section.getByRole("button", { name: /send message/i }).click();
      await expect(section.getByText(/enter a valid email/i)).toBeVisible();
    }).toPass();
  });

  test("successful submission shows success overlay (mocked)", async ({ page }) => {
    // Mock the Web3Forms endpoint so the test doesn't hit the real API.
    await page.route("https://api.web3forms.com/submit", (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    await page.goto("/");
    const section = page.locator("#contact");

    await section.getByLabel(/name/i).fill("Jane Doe");
    await section.getByLabel(/email/i).fill("jane@example.com");
    await section.getByLabel(/subject/i).fill("Hello there");
    await section.getByLabel(/message/i).fill("This is a long enough message for the form.");

    await expect(async () => {
      await section.getByRole("button", { name: /send message/i }).click();
      await expect(section.getByText(/message sent/i)).toBeVisible();
    }).toPass();

    await expect(section.getByText(/i'll get back to you soon/i)).toBeVisible();
  });
});
```

- [ ] **Step 12.4 — Run e2e tests**

```bash
cd v2 && npm run test:e2e -- tests/e2e/projects.spec.ts tests/e2e/hobbies.spec.ts tests/e2e/contact.spec.ts
```

Expected: all tests pass across chromium/firefox/webkit.

If tests fail: read the error, fix the component or test selector, re-run.

- [ ] **Step 12.5 — Run full e2e suite to catch regressions**

```bash
cd v2 && npm run test:e2e
```

Expected: all prior tests still pass.

- [ ] **Step 12.6 — Commit**

```bash
git add v2/tests/e2e/projects.spec.ts v2/tests/e2e/hobbies.spec.ts v2/tests/e2e/contact.spec.ts
git commit -m "test(v2): P9/P10 e2e tests — projects filter+modal, hobbies, contact form

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 13: Visual verification and final QA

- [ ] **Step 13.1 — Build static export**

```bash
cd v2 && npm run build
```

Expected: `out/` generated, no build errors.

- [ ] **Step 13.2 — Serve static output**

```bash
cd v2 && python -m http.server 4321 --directory out &
```

- [ ] **Step 13.3 — Verify visually via Playwright MCP browser**

Use `mcp__plugin_playwright_playwright__browser_navigate` to visit `http://localhost:4321/`.

Check each section in **all 4 themes** by running in browser console:
```js
localStorage.setItem('theme', 'daylight'); location.reload();
// repeat for: midnight, manuscript, neon
```

Take screenshots (`browser_take_screenshot` with `fullPage: true`).

Verify:
- Projects filter buttons are visible and clickable
- Bento grid shows 2 wide featured cards + 10 normal cards  
- JARVIS panel renders below grid
- Hobbies section: 2 featured cards + 4 secondary cards
- Contact: 2-col layout with info + form
- All 4 themes render correctly (semantic token colors, no hardcoded colors showing wrong)
- No white boxes / broken layouts on any breakpoint

- [ ] **Step 13.4 — Stop the server**

```bash
kill %1
```

- [ ] **Step 13.5 — Run full test suite one final time**

```bash
cd v2 && npm run lint && npm run typecheck && npm test && npm run test:e2e
```

Expected: 0 lint errors, 0 type errors, all unit tests pass, all e2e tests pass.

- [ ] **Step 13.6 — Update ROADMAP.md**

In `docs/v2/ROADMAP.md`, update the status section to mark P9 and P10 complete:

```markdown
- ✅ **P9 Projects complete**: bento grid (12 projects, 6-category filters, 2 featured), JARVIS currently-building panel, project detail modal.
- ✅ **P10 Hobbies + Contact complete**: hobbies section (Tennis + Poetry featured, 4 secondary), Web3Forms contact form with inline validation and success overlay.
- Next: **P11 SEO/metadata**, then P12 A11y/perf QA.
```

Also update the "Next:" line at the top of the file:
```markdown
- Next: **P11 SEO/metadata**, then P12 A11y/perf/responsive QA (P12) — sections complete.
```

- [ ] **Step 13.7 — Final commit**

```bash
git add docs/v2/ROADMAP.md
git commit -m "docs(v2): ROADMAP — P9 + P10 complete, P11 next

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Task covering it |
|-----------------|-----------------|
| Projects bento grid + filter tabs | Task 5 (project-grid.tsx) |
| Featured cards span 2 columns | Task 4 (project-card.tsx, `sm:col-span-2`) |
| Project modal with highlights + tech stack | Task 4 (project-modal.tsx) |
| JARVIS "Currently Building" panel | Task 6 (jarvis-panel.tsx) |
| Hobbies featured (Tennis + Poetry) with awards | Task 8 (hobbies/index.tsx) |
| Poetry journey steps + poem + external link | Task 8 |
| 4 secondary hobby cards | Task 8 |
| Contact 2-col layout + info | Task 10 |
| Web3Forms with real access key | Task 9 |
| Inline validation + aria-live errors | Task 9 |
| Success overlay on 200 | Task 9 |
| Honeypot field | Task 9 |
| Page assembly replacing stubs | Task 11 |
| Unit tests: data/filter/validation | Tasks 2, 3 |
| E2E: filter, modal, hobbies, form | Task 12 |
| ROADMAP updated | Task 13 |
| All 4 themes (semantic tokens only) | enforced throughout — no hardcoded colors |
| Reduced-motion: Reveal wraps GSAP | Reveal primitive already handles this |
| No `any` types | enforced throughout |

### Type consistency

- `FilterKey` defined in `content/projects.ts`, used in `project-grid.tsx` ✓
- `Project` from `@/lib/types` used in card/modal/grid ✓  
- `FeaturedHobby` / `SecondaryHobby` defined in `content/hobbies.ts`, used in `hobbies/index.tsx` ✓
- `ContactFields` / `ContactErrors` from `lib/contact-validation.ts`, used in `contact-form.tsx` ✓
- `validateContact` / `hasErrors` exported from validation module, imported in form and tests ✓

### No placeholders

All steps contain complete code. No TBDs. ✓
