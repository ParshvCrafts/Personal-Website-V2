// Extract EVERY frame of the stitched master to PNGs; grade.ts picks the subset.
// Usage: npm run cinematic:extract
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";

const MASTER = path.resolve("assets/cinematic/master.mp4");
const OUT = path.resolve("assets/cinematic/work/frames-all");

if (!existsSync(MASTER)) {
  console.error(`[extract] missing ${MASTER} — generate + stitch the master first (see prompts.md)`);
  process.exit(1);
}
if (!ffmpegPath) {
  console.error("[extract] ffmpeg-static did not resolve a binary for this platform");
  process.exit(1);
}
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
execFileSync(ffmpegPath, ["-y", "-i", MASTER, path.join(OUT, "frame_%05d.png")], {
  stdio: "inherit",
});
const n = readdirSync(OUT).filter((f) => f.endsWith(".png")).length;
console.log(`[extract] ${n} frames → ${OUT}`);
