// One-off image compression for public/images. Resizes oversized assets and
// re-encodes (mozjpeg / palette PNG) in place. Originals are recoverable via git.
import sharp from "sharp";
import { readdir, stat, writeFile, readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../public/images/", import.meta.url));

const JPG_MAX = 1200; // longest edge for photographic covers/portrait
const PNG_MAX = 900;  // longest edge for UI screenshots/logos
const SKIP = new Set(["og-image.jpg"]); // already optimized at 1200x630

async function* walk(dir) {
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    const s = await stat(p);
    if (s.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let before = 0, after = 0, count = 0;
for await (const file of walk(ROOT)) {
  const ext = extname(file).toLowerCase();
  const base = file.split(/[\\/]/).pop();
  if (SKIP.has(base)) continue;
  if (![".jpg", ".jpeg", ".png"].includes(ext)) continue;

  const orig = await readFile(file);
  const img = sharp(orig, { failOn: "none" });
  const meta = await img.metadata();
  const isPng = ext === ".png";
  const max = isPng ? PNG_MAX : JPG_MAX;
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0);

  let pipe = sharp(orig, { failOn: "none" }).rotate();
  if (longest > max) {
    pipe = pipe.resize({ width: meta.width >= meta.height ? max : undefined, height: meta.height > meta.width ? max : undefined, fit: "inside", withoutEnlargement: true });
  }
  pipe = isPng
    ? pipe.png({ compressionLevel: 9, quality: 80, palette: true, effort: 8 })
    : pipe.jpeg({ quality: 80, mozjpeg: true, progressive: true });

  const out = await pipe.toBuffer();
  // Only write if we actually saved bytes.
  if (out.length < orig.length) {
    await writeFile(file, out);
    before += orig.length; after += out.length; count++;
    console.log(`${base}: ${(orig.length / 1024).toFixed(0)}KB -> ${(out.length / 1024).toFixed(0)}KB`);
  }
}
console.log(`\nCompressed ${count} files: ${(before / 1024 / 1024).toFixed(2)}MB -> ${(after / 1024 / 1024).toFixed(2)}MB (saved ${((1 - after / before) * 100).toFixed(0)}%)`);
