# Context (portable memory snapshot)

These files are a snapshot of the operating context Claude accumulated while building this
project **in the original v1 repo**. They were copied here because Claude's auto-memory is keyed
to a filesystem path — moving to this standalone repo gives it a *different* project key, so the
original memory does not auto-load anymore.

A fresh coding agent working in this repo should read these for full continuity:

- `working-style.md` — how the user wants work done (mandated skills, phasing, TDD, commit-don't-push, autonomy, concise docs).
- `portfolio-v2-project.md` — the v2 rebuild goal + locked decisions.
- `portfolio-v2.5-signature.md` — the active 8-phase enhancement program (P13/P14 done, P15+ pending), gotchas, the stash anomaly.
- `reviewer-subagents-readonly.md` — use read-only `reviewer` agents; audit subagent diffs.
- `v2-e2e-flake-patterns.md` — known Playwright/dev-server flake patterns + rules.

Then read `../v2/HANDOFF-P15-SIGNATURE.md` (the kickoff prompt) and the rest of `../v2/`.

> Note: any file:line references in these snapshots predate the repo move; the app now lives at
> the **repo root** (not `v2/`), canonical data is at `static/data/`, and `scripts/sync-data.ts`
> reads `../static/data`. Verify against current code before relying on a citation.
