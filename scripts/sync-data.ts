import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { globSync } from "glob";
import sharp from "sharp";
import {
  projectsSchema,
  coursesSchema,
  researchListSchema,
  certificationsFileSchema,
} from "../lib/schemas";

const here = path.dirname(fileURLToPath(import.meta.url)); // <repo>/scripts
const SRC = path.resolve(here, "../static/data"); // <repo>/static/data (canonical source)
const DEST = path.resolve(here, "../data"); // <repo>/data (generated, gitignored)

const FILES = [
  { name: "projects.json", schema: projectsSchema },
  { name: "courses.json", schema: coursesSchema },
  { name: "research.json", schema: researchListSchema },
  { name: "certifications.json", schema: certificationsFileSchema },
] as const;

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`[sync-data] canonical data dir not found: ${SRC}`);
    process.exit(1);
  }
  fs.mkdirSync(DEST, { recursive: true });

  // 1. Optimize images in public/images
  console.log("[sync-data] optimizing images...");
  const imageFiles = globSync(path.join(here, "../public/images/**/*.{jpg,jpeg,png}").replace(/\\/g, '/'));
  for (const imgPath of imageFiles) {
    const ext = path.extname(imgPath);
    const webpPath = imgPath.replace(new RegExp(`${ext}$`, 'i'), ".webp");
    if (!fs.existsSync(webpPath)) {
      console.log(`[sync-data] converting to WebP: ${path.basename(imgPath)}`);
      await sharp(imgPath)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toFile(webpPath);
    }
  }

  // 2. Sync data

  for (const { name, schema } of FILES) {
    const srcPath = path.join(SRC, name);
    if (!fs.existsSync(srcPath)) {
      console.error(`[sync-data] source file not found: ${srcPath}`);
      process.exit(1);
    }
    const raw = fs.readFileSync(srcPath, "utf8");
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error(`[sync-data] malformed JSON in ${name}`);
      process.exit(1);
    }
    const result = schema.safeParse(parsed);
    if (!result.success) {
      console.error(`[sync-data] SCHEMA DRIFT in ${name}:`);
      console.error(JSON.stringify(result.error.issues, null, 2));
      process.exit(1);
    }
    fs.writeFileSync(path.join(DEST, name), JSON.stringify(parsed, null, 2));
    console.log(`[sync-data] ok: ${name}`);
  }
  console.log("[sync-data] all data synced + validated");
}

main().catch((err) => {
  console.error("[sync-data] FATAL ERROR", err);
  process.exit(1);
});
