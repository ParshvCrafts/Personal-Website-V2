"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Modal } from "@/components/ui/modal";
import { AWARDS, type Award } from "@/content/about";
import { cn } from "@/lib/utils";

/** Brand logo on a neutral white chip (renders on every theme) or a Lucide mark. */
function AwardMark({ award, size = "h-12 w-12" }: { award: Award; size?: string }) {
  if (award.logo) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-white p-1.5 ring-1 ring-border",
          size,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={award.logo} alt="" width={48} height={48} className="h-full w-full object-contain" />
      </span>
    );
  }
  const Icon = award.icon!;
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-elevated text-accent",
        size,
      )}
    >
      <Icon className="h-6 w-6" aria-hidden="true" />
    </span>
  );
}

export function Awards() {
  const [selected, setSelected] = useState<Award | null>(null);

  return (
    <div>
      <h3 className="font-display text-2xl text-heading md:text-3xl">Awards &amp; Recognition</h3>
      <p className="mt-2 max-w-xl text-sm text-muted">Select any award to read the full citation.</p>

      <Reveal stagger={0.05} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AWARDS.map((award) => (
          <button
            key={award.id}
            type="button"
            onClick={(e) => {
              // WebKit doesn't focus a <button> on mouse click, so focus it
              // explicitly — the Modal returns focus here when it closes.
              e.currentTarget.focus();
              setSelected(award);
            }}
            aria-haspopup="dialog"
            className="group flex min-h-[88px] items-start gap-4 rounded-2xl border border-border bg-surface p-5 text-left transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AwardMark award={award} />
            <span className="min-w-0 flex-1">
              <span className="block font-display text-lg leading-snug text-heading">
                {award.title}
              </span>
              <span className="mt-1 line-clamp-2 text-sm text-muted">{award.description}</span>
            </span>
          </button>
        ))}
      </Reveal>

      <Modal open={selected !== null} onClose={() => setSelected(null)} labelledBy="award-modal-title">
        {selected && (
          <div className="pr-8">
            <div className="flex items-center gap-4">
              <AwardMark award={selected} size="h-14 w-14" />
              <p id="award-modal-title" className="font-display text-xl text-heading md:text-2xl">
                {selected.title}
              </p>
            </div>
            <p className="mt-5 leading-relaxed text-foreground">{selected.description}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
