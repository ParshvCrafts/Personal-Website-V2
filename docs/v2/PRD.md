# Product Requirements Doc

## Problem

The current portfolio is functional but reads as self-made and visually overworked. The v2 goal is to keep the same substance while making the presentation look deliberate, premium, and professionally authored.

## Goals

- Keep content and feature parity with v1.
- Replace the visual language with a more editorial, restrained, and premium system.
- Add a 3-palette theme switcher.
- Add a signature scroll-driven showpiece without hurting performance.
- Keep SEO, accessibility, and mobile quality at production level.
- Preserve rollback safety so v1 can be restored immediately if needed.

## Non-goals

- No CMS.
- No auth.
- No new substantive content sections.
- No backend rewrite.
- No WebGL/3D hero in the first pass.

## Success criteria

- The site feels like a custom portfolio, not a template.
- The same content is still present and easy to find.
- Lighthouse and accessibility budgets are met.
- The site remains usable with reduced motion enabled.
- The deployment path does not endanger v1.

## Scope boundaries

- v1 stays on Render.
- v2 lives in `v2/`.
- Shared content is sourced from `static/data/*.json`.
- Static export is the default deployment model for v2.

## Approval gates

- Phase 1: architecture and design system approved.
- Phase 2: motion foundation approved.
- Phase 3: shell and hero approved.
- Phase 4: content sections approved.
- Phase 5: SEO, performance, and accessibility approved.
- Phase 6: cutover only after explicit user signoff.
