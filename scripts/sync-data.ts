import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
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

function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`[sync-data] canonical data dir not found: ${SRC}`);
    process.exit(1);
  }
  fs.mkdirSync(DEST, { recursive: true });

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

main();
