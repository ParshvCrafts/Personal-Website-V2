"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    // global-error must include its own html and body tags (replaces root layout)
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "var(--background, #0b0f14)",
          color: "var(--foreground, #e6edf3)",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h2>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            borderRadius: "9999px",
            border: "1px solid var(--border, #1f2935)",
            background: "var(--accent, #2dd4bf)",
            color: "var(--on-accent, #0b0f14)",
            padding: "0.625rem 1.5rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
