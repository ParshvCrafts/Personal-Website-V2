// scripts/serve-static.ts
// Minimal, dependency-free static file server for the Next static-export `out/`
// directory. Replaces `next dev` as the Playwright webServer: Turbopack panics
// reading globals.css under this repo's spaces-in-path. Honors trailingSlash:true
// (folder index.html) and serves out/404.html (status 404) for unknown paths.
import { createServer, type Server } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

/** Ordered candidate relative file paths to try for a request pathname. Pure. */
export function resolveCandidates(pathname: string): string[] {
  let p = pathname.split("?")[0].split("#")[0];
  try {
    p = decodeURIComponent(p);
  } catch {
    // malformed percent-encoding: fall through with the raw value
  }
  if (!p.startsWith("/")) p = "/" + p;
  if (p === "/") return ["/index.html"];
  if (p.endsWith("/")) return [p + "index.html", p.slice(0, -1) + ".html"];
  const last = p.split("/").pop() ?? "";
  if (/\.[a-zA-Z0-9]+$/.test(last)) return [p];
  return [p + ".html", p + "/index.html"];
}

/** Build (but do not start) a static server rooted at `outDir`. */
export function createStaticServer(outDir: string): Server {
  const root = resolve(outDir);

  async function readableFile(relPath: string): Promise<string | null> {
    const abs = resolve(root, "." + relPath);
    // Path-traversal guard: must stay inside root.
    if (abs !== root && !abs.startsWith(root + sep)) return null;
    try {
      const s = await stat(abs);
      return s.isFile() ? abs : null;
    } catch {
      return null;
    }
  }

  return createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
      for (const candidate of resolveCandidates(pathname)) {
        const abs = await readableFile(candidate);
        if (abs) {
          const body = await readFile(abs);
          res.writeHead(200, {
            "content-type": CONTENT_TYPES[extname(abs).toLowerCase()] ?? "application/octet-stream",
            "cache-control": "no-cache",
          });
          res.end(body);
          return;
        }
      }
      const notFound = await readableFile("/404.html");
      const body = notFound ? await readFile(notFound) : Buffer.from("Not found");
      res.writeHead(404, {
        "content-type": notFound ? "text/html; charset=utf-8" : "text/plain; charset=utf-8",
      });
      res.end(body);
    } catch {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end("Internal server error");
    }
  });
}

// Only bind a port when run directly (`tsx scripts/serve-static.ts`), never on import.
const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const port = Number(process.env.PORT ?? 4321);
  const outDir = resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "out");
  createStaticServer(outDir).listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[serve-static] ${outDir} -> http://localhost:${port}`);
  });
}
