// Validate frame counts + per-grade budget; write manifest.json.
// Usage: npm run cinematic:manifest
import { readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  FRAME_COUNT,
  FRAME_HEIGHT,
  FRAME_PAD,
  FRAME_WIDTH,
  GRADES,
  SEQUENCE_ID,
  assertWithinBudget,
} from "./lib";

const DEST = path.resolve("public/sequences", SEQUENCE_ID);
const grades: Record<string, { bytes: number }> = {};

for (const g of GRADES) {
  const dir = path.join(DEST, g.name);
  const files = readdirSync(dir).filter((f) => f.endsWith(".webp"));
  if (files.length !== FRAME_COUNT) {
    throw new Error(`[manifest] ${g.name}: expected ${FRAME_COUNT} frames, found ${files.length}`);
  }
  const bytes = files.reduce((s, f) => s + statSync(path.join(dir, f)).size, 0);
  assertWithinBudget(g.name, bytes);
  grades[g.name] = { bytes };
}

writeFileSync(
  path.join(DEST, "manifest.json"),
  JSON.stringify(
    {
      id: SEQUENCE_ID,
      frameCount: FRAME_COUNT,
      width: FRAME_WIDTH,
      height: FRAME_HEIGHT,
      ext: "webp",
      pad: FRAME_PAD,
      grades,
    },
    null,
    2,
  ) + "\n",
);
console.log("[manifest] ok", grades);
