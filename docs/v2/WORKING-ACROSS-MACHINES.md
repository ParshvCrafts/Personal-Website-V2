# Working across machines (laptop A ↔ laptop B) with Claude Code

This project syncs through GitHub: `github.com/ParshvCrafts/Personal-Website-V2`, branch `main`. Code, docs, plans, specs, and the program memory snapshot all live in the repo, so they travel with a `git pull`. What does **not** travel in the repo is your Claude Code home setup (skills, MCP servers, global config) — you replicate that once per machine. This guide covers both.

> **Key idea:** the repo is the single source of truth for *the work*; your `~/.claude` setup is the single source of truth for *the agent*. Keep both in sync and any laptop continues seamlessly.

---

## 0. TL;DR daily loop

```bash
# start of every session, on whichever laptop you're using
git pull --ff-only

# ... work with Claude (it commits atomically as it goes) ...

# end of session (or before switching laptops / before a likely rate-limit)
git push
```

Never start a session without `git pull` first. Never end a session without `git push`. That's 90% of staying in sync.

---

## 1. One-time setup on the new laptop (laptop B)

### 1.1 Clone to a SPACE-FREE path ⚠️
This repo currently lives under `…/Git Hub Projects/Personal Website V2`. The **spaces in that path break `npm run dev`** (Turbopack panics reading `app/globals.css`). On laptop B, clone somewhere **without spaces** to avoid the bug entirely:

```bash
git clone https://github.com/ParshvCrafts/Personal-Website-V2.git ~/dev/personal-website-v2
cd ~/dev/personal-website-v2
```

(If you must keep spaces, verify via `npm run build` + serving `out/`, not `npm run dev` — same workaround as laptop A.)

### 1.2 Toolchain
- **Node** ≥ 22 (laptop A runs v24.11.1) + npm 11. Use the same major to be safe (`nvm install 24 && nvm use 24`).
- **Python 3** (any 3.x) — only used to serve the static `out/` build for visual checks: `python -m http.server 4321 --directory out`.
- Install deps reproducibly from the committed lockfile:
  ```bash
  npm ci
  ```
  `npm ci` (not `npm install`) installs exactly what `package-lock.json` pins — identical to laptop A.

### 1.3 Claude Code + the agent setup (NOT in the repo — replicate it)
The "it works just as fine" parity depends on your `~/.claude` home config, which git does not carry:

1. **Install Claude Code** on laptop B (same as laptop A).
2. **Global instructions** — copy `~/.claude/CLAUDE.md` and `~/.claude/RTK.md` from laptop A to laptop B (these define the RTK token-proxy rules and your global preferences).
3. **Plugins / skills** — install the same plugin set used here:
   `superpowers`, `caveman`, `ui-ux-pro-max`, `react-bits`, the `gsap-*` family, `context-mode`, `vercel`, `gsd`, `obsidian`, `firecrawl`. (Check `~/.claude/plugins/` on laptop A for the exact list; install the same marketplace/plugins on B.)
4. **MCP servers** — copy the relevant blocks from laptop A's `~/.claude.json` (user scope) to laptop B: `playwright`, `magic` (21st.dev), `context7`, `firecrawl`, `higgsfield`, `filesystem`, `memory`. Restart Claude Code after editing so they load.
5. **rtk** (Rust Token Killer) — install the same binary and confirm `rtk --version` + `rtk gain` work (name-collision note in `~/.claude/RTK.md`).
6. **Playwright browsers** — `npx playwright install chromium firefox webkit` (for e2e + the visual MCP).
7. Optional, only if regenerating cinematic assets: `higgsfield` CLI + the npm `ffmpeg-static`/`sharp` (already in devDeps via `npm ci`).

### 1.4 Sanity check on laptop B
```bash
npm run lint && npm run typecheck && npm test && npm run build
```
All green ⇒ laptop B is at parity with laptop A.

---

## 2. The in-repo "brain" that lets any session continue

These are committed, so they travel automatically. On laptop B, point Claude at them first:

- `docs/v2/HANDOFF-P20-SIGNATURE.md` — the master brief (rules, workflow, gotchas).
- `docs/context/portfolio-v2.5-signature.md` — program state + every phase's gotchas (the memory snapshot).
- `docs/v2/ROADMAP-V2.5-SIGNATURE.md` — phase status (P20a done, **P20b next**).
- `docs/superpowers/specs/` + `docs/superpowers/plans/` — the spec + the **checkboxed TDD plan** for the current phase. The checkboxes are the resume point.
- Per-phase docs `docs/v2/*.md` (e.g. `COMMAND-PALETTE.md`).

A fresh Claude on laptop B that reads these has the same context this session has.

---

## 3. If Claude gets rate-limited mid-feature

Because work is committed **atomically per task**, a rate-limit is rarely destructive — the completed tasks are already in git. To recover on the other laptop:

1. **On laptop A (if it can still run one command):** `git push`. If mid-edit with uncommitted changes, commit them as WIP first:
   `git add <explicit paths> && git commit -m "wip(v2): <feature> — partial, resuming on laptop B" && git push`.
   (If laptop A is fully cut off, you only lose the *uncommitted* working-tree edits since the last task commit — usually minutes of work, re-derivable from the plan.)
2. **On laptop B:** `git pull --ff-only`.
3. Open the active plan in `docs/superpowers/plans/`. Each task is a checkbox; completed commits map to checked items. Tell Claude: *"Continue executing `<plan path>` from the first unchecked task; audit the prior commits first with `git log`."*
4. Claude reconciles against `git log`/`git diff` (trust the diff, not any stale report) and continues.

**Make rate-limits cheap:** keep commits small and frequent (the plan already enforces one commit per task), and push at natural breakpoints. The plan + atomic commits ARE the checkpoint system.

---

## 4. Staying in sync — rules to avoid conflicts

- **One laptop at a time.** Don't run Claude on both against `main` simultaneously — that recreates the "parallel session" entanglement. Finish + push on A before starting on B.
- **Always `git pull --ff-only` before work, `git push` after.** If `--ff-only` refuses, the other laptop pushed first: `git pull --rebase`, resolve, continue.
- **Atomic commits, explicit paths** (`git add <path>` — never `git add -A`); conventional messages ending with the `Co-Authored-By: Claude Opus 4.8` trailer (matches history).
- **Never commit:** `docs/skills/` (vendored skill repos — gitignored), `node_modules/`, `out/`, `.next/`, `.env*`, local screenshots. These are gitignored; re-create them per machine (`npm ci`, re-copy skills from `~/.claude/skills`).
- **`docs/skills/` parity:** it's reference-only and not in git. If a session needs it on laptop B, re-copy from `~/.claude/skills/` (or skip — the skills load from `~/.claude` regardless; the `docs/skills/` copy was just offline reference).
- **OneDrive caution:** laptop A's repo is under OneDrive. Avoid editing the same files via OneDrive sync *and* git at once — let git be the sync mechanism, not OneDrive, to prevent double-writes.

---

## 5. Parity checklist (laptop B "works just as fine")

- [ ] Cloned to a **space-free path**.
- [ ] Node 24.x + Python 3 installed.
- [ ] `npm ci` ran clean from the committed lockfile.
- [ ] `~/.claude/CLAUDE.md` + `RTK.md` copied; `rtk --version` works.
- [ ] Same plugins/skills installed (`superpowers`, `caveman`, `ui-ux-pro-max`, `react-bits`, `gsap-*`, `context-mode`, …).
- [ ] MCP servers configured in `~/.claude.json` (`playwright`, `magic`, `context7`, `firecrawl`, …) + Claude restarted.
- [ ] `npx playwright install` done.
- [ ] `npm run lint && npm run typecheck && npm test && npm run build` all green.
- [ ] Read `docs/v2/HANDOFF-P20-SIGNATURE.md` + the current plan before resuming.

---

## 6. Quick command reference

| Action | Command |
|---|---|
| Start of session | `git pull --ff-only` |
| Verify everything | `npm run lint && npm run typecheck && npm test && npm run build` |
| Visual check (dev-server is flaky) | `npm run build` then serve `out/`: `python -m http.server 4321 --directory out` |
| Save + hand off | `git add <paths> && git commit -m "…" && git push` |
| Resume a phase | read `docs/superpowers/plans/<phase>.md`, continue from first unchecked task |
