# Journey + Terminal — Phase 7 Reference

## Sections

### Terminal (`id="terminal"`)
Non-nav decorative section between Research and Journey. No `scroll-mt`.

**Component:** `v2/components/sections/terminal/index.tsx` ("use client")  
**Behavior:** Typewriter loop — 5 cmd/output pairs, loops after 4 s pause.  
**Reduced motion:** Shows all lines statically (no animation).  
**A11y:** `<section>` has sr-only `<h2>Terminal Demo</h2>`. Inner content is `aria-hidden="true"`.  
**macOS chrome dots:** Hardcoded hex (`#ff5f57` / `#febc2e` / `#28c840`) — purely decorative, same exception as `fieldColor`.  
**Cursor:** `animate-[cursor-blink_1s_step-end_infinite]` using `@keyframes cursor-blink` in `globals.css`.

### Journey (`id="journey"`, in nav)
**Component:** `v2/components/sections/journey/index.tsx` (server component)  
**Data:** `v2/content/journey.ts` — 11 `Milestone` objects  
**Layout:** Center-line alternating — even items left, odd items right. Mobile: single left-rail column.

## Data: Milestones (11 total)

| Year | Title | Status |
|------|-------|--------|
| 2023 | Indian Board X Exam | — |
| 2023 | IMO Math Olympiad | — |
| 2023 | Immigrated to USA | — |
| 2023 | West Valley High School | — |
| 2024 | Coastline Community College | — |
| 2024 | QuestBridge Finalist | — |
| 2025 | Greenhouse Scholar | — |
| 2025 | Amazon Future Engineer | — |
| 2025 | UC Berkeley | — |
| 2025 | MLT Ascend Scholar | — |
| Summer 2026 | Amazon SWE Intern | `active` |

## Milestone type

```ts
export type Milestone = {
  year: string;
  title: string;
  body: string;
  status?: "active";  // only Amazon SWE Intern
};
```

## Active milestone treatment
- Dot: `bg-accent ring-accent` (solid accent dot with ring)
- Badge: inline-flex with `animate-pulse` accent dot + "Active" text
- No specific dates on the label — just "Summer 2026"

## Terminal commands

| Command | Output summary |
|---------|---------------|
| `whoami` | Parshv Patel — Data Science @ UC Berkeley |
| `cat expertise.json` | languages, ml, web stacks |
| `ls ~/projects/` | 6 project dirs |
| `cat ~/stats.txt` | Projects: 12 \| Research: 5 \| Certs: 9 |
| `./connect.sh` | email + LinkedIn |

## center-line dot math (desktop)
- Content col: `calc(50% - 1.5rem)` = 50% - 24px  
- Dot col: `w-12` = 3rem = 48px  
- Spacer col: `calc(50% - 1.5rem)` = 50% - 24px  
- Total = 100%, dot center at exactly 50% ✓
