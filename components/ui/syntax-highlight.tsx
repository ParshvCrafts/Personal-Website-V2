import { cn } from "@/lib/utils";

interface SyntaxHighlightProps {
  code: string;
  lang: "python" | "javascript" | "sql";
  className?: string;
}

/**
 * Lightweight regex-based syntax highlighter.
 *
 * No runtime library — just CSS classes + small regex passes.
 * Theme-aware via semantic color tokens.
 */
export function SyntaxHighlight({ code, lang, className }: SyntaxHighlightProps) {
  const lines = code.split("\n");

  return (
    <code className={cn("block", className)}>
      {lines.map((line, i) => (
        <span key={i} className="block w-max" data-code-line>
          <span
            aria-hidden="true"
            className="inline-block w-8 select-none pr-3 text-right text-muted/40"
          >
            {i + 1}
          </span>
          <span dangerouslySetInnerHTML={{ __html: highlightLine(line, lang) }} />
        </span>
      ))}
    </code>
  );
}

const KEYWORDS: Record<string, string[]> = {
  python: ["def", "return", "import", "from", "class", "if", "else", "elif", "for", "while", "try", "except", "with", "as", "pass", "break", "continue"],
  javascript: ["const", "let", "var", "function", "return", "import", "from", "export", "default", "class", "if", "else", "for", "while", "try", "catch", "async", "await", "new", "this"],
  sql: ["SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "HAVING", "INSERT", "UPDATE", "DELETE", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "AS", "AND", "OR", "NOT", "NULL", "COUNT", "AVG", "SUM", "MIN", "MAX"],
};

// Private-use code point base for stashing generated <span> markup behind a
// single placeholder character. \w / \d / \b never match these, so later
// highlight passes cannot rescan (and corrupt) already-inserted markup.
const STASH_BASE = 0xe000;
const STASH_RE = new RegExp("[\\uE000-\\uF8FF]", "g");

/**
 * Highlight one line. Each pass replaces a matched segment with a private-use
 * placeholder char (stashing the real <span> markup), so a later pass — e.g. the
 * numbers pass matching the "60" inside `text-muted/60` — can never touch
 * already-generated HTML. Placeholders are restored last. This keeps the emitted
 * HTML well-formed and byte-identical on server and client (the previous in-place
 * approach produced malformed nested tags and a hydration mismatch).
 */
function highlightLine(line: string, lang: "python" | "javascript" | "sql"): string {
  const stash: string[] = [];
  const stashSpan = (cls: string) => (m: string): string => {
    const ch = String.fromCharCode(STASH_BASE + stash.length);
    stash.push(`<span class="${cls}">${m}</span>`);
    return ch;
  };

  let html = escapeHtml(line);

  // Comments first (so their contents aren't re-highlighted as keywords).
  const commentRe = lang === "sql" ? /--.*$/gm : /(?:\/\/|#).*$/gm;
  // Full `text-muted` (not /60) so comments meet AA contrast on every theme.
  html = html.replace(commentRe, stashSpan("text-muted italic"));

  // Strings — neutral foreground (accent-2 fails AA contrast on the neon theme).
  html = html.replace(/"[^"]*"|'[^']*'|`[^`]*`/g, stashSpan("text-foreground"));

  // Keywords
  const kw = KEYWORDS[lang] ?? [];
  if (kw.length) {
    const kwRegex = new RegExp(
      `\\b(?:${kw.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
      "gi",
    );
    html = html.replace(kwRegex, stashSpan("text-accent"));
  }

  // Function names (identifier immediately before an opening paren).
  html = html.replace(/([A-Za-z_]\w*)(\()/g, (_m, name: string, paren: string) => {
    const ch = String.fromCharCode(STASH_BASE + stash.length);
    stash.push(`<span class="text-heading">${name}</span>`);
    return ch + paren;
  });

  // Numbers — neutral foreground (AA-safe on all themes).
  html = html.replace(/\b\d+\.?\d*\b/g, stashSpan("text-foreground"));

  // Restore stashed markup.
  html = html.replace(STASH_RE, (ch) => stash[ch.charCodeAt(0) - STASH_BASE] ?? ch);

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
