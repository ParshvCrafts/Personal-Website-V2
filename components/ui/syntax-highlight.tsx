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
        <span key={i} className="block">
          <span className="inline-block w-8 select-none pr-3 text-right text-muted/40">
            {i + 1}
          </span>
          <span dangerouslySetInnerHTML={{ __html: highlightLine(line, lang) }} />
        </span>
      ))}
    </code>
  );
}

function highlightLine(line: string, lang: "python" | "javascript" | "sql"): string {
  let html = escapeHtml(line);

  // Comments first (so they don't get highlighted as keywords)
  if (lang === "python" || lang === "javascript") {
    html = html.replace(
      /(\/\/.*$|#.*$)/gm,
      '<span class="text-muted/60 italic">$1</span>'
    );
  } else if (lang === "sql") {
    html = html.replace(
      /(--.*$)/gm,
      '<span class="text-muted/60 italic">$1</span>'
    );
  }

  // Strings
  html = html.replace(
    /("[^"]*"|'[^']*'|`[^`]*`)/g,
    '<span class="text-accent-2">$1</span>'
  );

  // Keywords
  const keywords: Record<string, string[]> = {
    python: ["def", "return", "import", "from", "class", "if", "else", "elif", "for", "while", "try", "except", "with", "as", "pass", "break", "continue"],
    javascript: ["const", "let", "var", "function", "return", "import", "from", "export", "default", "class", "if", "else", "for", "while", "try", "catch", "async", "await", "new", "this"],
    sql: ["SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "HAVING", "INSERT", "UPDATE", "DELETE", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "AS", "AND", "OR", "NOT", "NULL", "COUNT", "AVG", "SUM", "MIN", "MAX"],
  };

  const kw = keywords[lang] || [];
  if (kw.length) {
    const kwRegex = new RegExp(
      `\\b(${kw.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
      "gi"
    );
    html = html.replace(kwRegex, '<span class="text-accent">$1</span>');
  }

  // Functions (word followed by opening paren)
  html = html.replace(
    /(\w+)(\()/g,
    '<span class="text-heading">$1</span>$2'
  );

  // Numbers
  html = html.replace(
    /\b(\d+\.?\d*)\b/g,
    '<span class="text-accent-2/80">$1</span>'
  );

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
