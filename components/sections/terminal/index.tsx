"use client";

import { useEffect, useRef, useState } from "react";

const COMMANDS = [
  { cmd: "whoami", out: "Parshv Patel — Data Science @ UC Berkeley | GPA 4.00" },
  {
    cmd: "cat expertise.json",
    out: '{ "languages": ["Python", "SQL", "JavaScript"],\n  "ml": ["scikit-learn", "OpenCV", "LangChain"],\n  "web": ["Flask", "FastAPI", "React"] }',
  },
  {
    cmd: "ls ~/projects/",
    out: "atlasmind/     ai-trainer/     parking-detection/\nvirtual-mouse/ spacex-ml/      movie-rec/",
  },
  {
    cmd: "cat ~/stats.txt",
    out: "Projects: 12 | Research: 5 | Certifications: 9 | GPA: 4.00",
  },
  {
    cmd: "./connect.sh",
    out: "Email: parshvpatel_0910@berkeley.edu\nLinkedIn: linkedin.com/in/parshv-patel-65a90326b/\nReady to connect. 🚀",
  },
] as const;

const TYPING_SPEED = 45;
const OUTPUT_DELAY = 300;
const COMMAND_DELAY = 1800;
const LOOP_DELAY = 4000;

type Line = { type: "cmd"; text: string } | { type: "out"; text: string };

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return void reject(new Error("aborted"));
    const id = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => { clearTimeout(id); reject(new Error("aborted")); }, { once: true });
  });
}

export function Terminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function startAnimation() {
      if (prefersReduced) {
        setLines(
          COMMANDS.flatMap(({ cmd, out }) => [
            { type: "cmd" as const, text: cmd },
            { type: "out" as const, text: out },
          ])
        );
        return;
      }

      const ac = new AbortController();
      abortRef.current = ac;

      async function run() {
        try {
          while (!ac.signal.aborted) {
            setLines([]);
            for (const { cmd, out } of COMMANDS) {
              if (ac.signal.aborted) break;
              for (let i = 1; i <= cmd.length; i++) {
                if (ac.signal.aborted) break;
                const typed = cmd.slice(0, i);
                setLines((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.type === "cmd") {
                    return [...prev.slice(0, -1), { type: "cmd", text: typed }];
                  }
                  return [...prev, { type: "cmd", text: typed }];
                });
                await sleep(TYPING_SPEED, ac.signal);
              }
              await sleep(OUTPUT_DELAY, ac.signal);
              if (ac.signal.aborted) break;
              setLines((prev) => [...prev, { type: "out", text: out }]);
              await sleep(COMMAND_DELAY, ac.signal);
            }
            await sleep(LOOP_DELAY, ac.signal);
          }
        } catch {
          // aborted — clean exit
        }
      }

      run();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          startAnimation();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      abortRef.current?.abort();
    };
  }, []);

  return (
    <section id="terminal" className="border-t border-border px-6 py-16 md:px-10">
      <h2 className="sr-only">Terminal Demo</h2>
      <div ref={containerRef} className="mx-auto max-w-3xl" aria-hidden="true">
        <div className="overflow-hidden rounded-xl border border-border bg-elevated shadow-lg">
          {/* macOS window chrome */}
          <div className="flex items-center gap-1.5 border-b border-border bg-surface px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-4 font-mono text-xs text-muted">parshv@portfolio ~</span>
          </div>
          {/* Terminal body */}
          <div className="min-h-[220px] p-5 font-mono text-sm leading-relaxed">
            {lines.map((line, i) =>
              line.type === "cmd" ? (
                <p key={i} className="text-foreground">
                  <span className="select-none text-accent">$ </span>
                  {line.text}
                </p>
              ) : (
                <p key={i} className="mb-4 whitespace-pre-wrap pl-4 text-muted">
                  {line.text}
                </p>
              )
            )}
            <span className="animate-[cursor-blink_1s_step-end_infinite] text-accent">▋</span>
          </div>
        </div>
      </div>
    </section>
  );
}
