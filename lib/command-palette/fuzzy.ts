import type { Command } from "./types";

/**
 * Case-insensitive subsequence fuzzy score. `null` when `query` is not a
 * subsequence of `text`; higher = better. Empty query → 0. Pure.
 */
export function fuzzyScore(query: string, text: string): number | null {
  const q = query.trim().toLowerCase();
  if (q === "") return 0;
  const t = text.toLowerCase();
  let qi = 0;
  let score = 0;
  let prevIdx = -2;
  let streak = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] !== q[qi]) continue;
    let pts = 1;
    if (prevIdx === ti - 1) { streak += 1; pts += streak * 4; } else { streak = 0; }
    if (ti === 0 || /[^a-z0-9]/.test(t[ti - 1])) pts += 8; // word-boundary bonus
    score += pts;
    prevIdx = ti;
    qi += 1;
  }
  if (qi < q.length) return null;
  // Prefer denser matches (less filler).
  return score + Math.max(0, 6 - (t.length - q.length) * 0.1);
}

/** Filter + sort commands by best score over label + keywords. Empty query → input order. */
export function rankCommands(query: string, commands: Command[]): Command[] {
  if (query.trim() === "") return commands;
  const scored: { cmd: Command; score: number; order: number }[] = [];
  commands.forEach((cmd, order) => {
    let best: number | null = null;
    for (const hay of [cmd.label, ...(cmd.keywords ?? [])]) {
      const s = fuzzyScore(query, hay);
      if (s !== null && (best === null || s > best)) best = s;
    }
    if (best !== null) scored.push({ cmd, score: best, order });
  });
  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  return scored.map((s) => s.cmd);
}
