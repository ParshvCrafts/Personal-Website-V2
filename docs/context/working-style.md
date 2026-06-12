---
name: working-style
description: "Parshv's working-style preferences for how Claude should build on this project"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: c617f9bf-91dd-4b32-83e5-784b2dde6e00
---

How Parshv wants work done on the Personal Website project:

- **Always use the required skills**: `/frontend-design`, `/gsap` (all variants), and `/ui-ux-pro-max` must be consulted for any frontend/animation work. He explicitly mandates this for every relevant phase.
- **Phase the work**: break large work into multiple sessions/phases; per phase follow plan → read code → implement → code review → test → bug-fix. Do NOT one-shot.
- **TDD where it pays**: write failing tests first for logic (data, validation, filters, theme, sequence math), then implement.
- **Commit often locally; do NOT push** until he and Claude have both tested and approved. v2 work lives on branch `feat/portfolio-v2`.
- **Autonomy**: solve problems independently (web search, MCP/Playwright for browser/screenshots, multiple attempts) and only report back finished, verified results — no broken handoffs.
- **Concise docs**: keep documentation tight to avoid context rot; an agent should be able to onboard from `docs/v2/`.
- Prefer proven existing tools/libraries over building from scratch.

**Why:** He values professional, industry-standard, non-"vibe-coded" output and a reliable, verifiable process across many sessions.

**How to apply:** Invoke the mandated skills, work phase-by-phase with verification, commit without pushing, and verify in a real browser before claiming done. See [[portfolio-v2-project]].
