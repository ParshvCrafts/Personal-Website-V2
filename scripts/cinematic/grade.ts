// Sample FRAME_COUNT frames from the full extraction and write both graded
// webp sequences. Usage: npm run cinematic:grade  (env SEQ_QUALITY=58 default)
import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  FRAME_COUNT,
  FRAME_HEIGHT,
  FRAME_WIDTH,
  GRADES,
  SEQUENCE_ID,
  frameFileName,
  sampleIndices,
} from "./lib";

const QUALITY = Number(process.env.SEQ_QUALITY ?? 58);
const SRC = path.resolve("assets/cinematic/work/frames-all");
const DEST = path.resolve("public/sequences", SEQUENCE_ID);

async function main(): Promise<void> {
  const all = readdirSync(SRC)
    .filter((f) => f.endsWith(".png"))
    .sort();
  const picks = sampleIndices(all.length, FRAME_COUNT);
  for (const grade of GRADES) {
    const dir = path.join(DEST, grade.name);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    let bytes = 0;
    for (let i = 0; i < picks.length; i++) {
      let img = sharp(path.join(SRC, all[picks[i]])).resize(FRAME_WIDTH, FRAME_HEIGHT, {
        fit: "cover",
      });
      if (grade.negate) img = img.negate({ alpha: false });
      img = img.modulate({ brightness: grade.brightness, saturation: grade.saturation });
      if (grade.gamma > 1.0) img = img.gamma(grade.gamma);
      const out = path.join(dir, frameFileName(i + 1));
      await img.webp({ quality: QUALITY }).toFile(out);
      bytes += statSync(out).size;
    }
    console.log(`[grade] ${grade.name}: ${picks.length} frames, ${(bytes / 1024).toFixed(0)} KB (q=${QUALITY})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
