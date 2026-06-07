"use client";

import { useState } from "react";
import type { Research } from "@/lib/types";
import { Reveal } from "@/components/motion/reveal";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

function FieldDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ background: color }}
      aria-hidden="true"
    />
  );
}

function ResearchCard({
  paper,
  onOpen,
}: {
  paper: Research;
  onOpen: (p: Research) => void;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface transition-colors hover:border-accent/40">
      <button
        type="button"
        onClick={(e) => {
          e.currentTarget.focus();
          onOpen(paper);
        }}
        aria-haspopup="dialog"
        className="flex-1 rounded-t-2xl p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="mb-3 flex items-center gap-2">
          <FieldDot color={paper.fieldColor} />
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            {paper.field}
          </span>
        </div>
        <p className="font-display text-xl leading-snug text-heading">
          {paper.displayTitle}
        </p>
        <p className="mt-2 line-clamp-3 text-sm text-muted">
          {paper.abstractSummary}
        </p>
        {paper.keyTopics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {paper.keyTopics.slice(0, 4).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        )}
      </button>
      <div className="border-t border-border px-5 py-3">
        <a
          href={paper.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded font-mono text-xs text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Read Paper <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

function ResearchModalContent({ paper }: { paper: Research }) {
  return (
    <div className="pr-8">
      <div className="mb-4 flex items-center gap-2">
        <FieldDot color={paper.fieldColor} />
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          {paper.field}
        </span>
      </div>
      <p
        id="research-modal-title"
        className="font-display text-xl text-heading md:text-2xl"
      >
        {paper.fullTitle}
      </p>
      {paper.relatedCourse && (
        <p className="mt-2 font-mono text-xs text-muted/70">
          Related: {paper.relatedCourse}
        </p>
      )}
      <p className="mt-4 text-sm leading-relaxed text-muted">
        {paper.fullAbstract}
      </p>
      {paper.skills.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted">
            Skills
          </p>
          <div className="flex flex-wrap gap-1">
            {paper.skills.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </div>
      )}
      <div className="mt-6 border-t border-border pt-4">
        <a
          href={paper.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded font-mono text-xs text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Open Paper <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

export function ResearchGrid({ papers }: { papers: Research[] }) {
  const [selected, setSelected] = useState<Research | null>(null);

  return (
    <div>
      <Reveal
        stagger={0.05}
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {papers.map((paper) => (
          <ResearchCard key={paper.id} paper={paper} onOpen={setSelected} />
        ))}
      </Reveal>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        labelledBy="research-modal-title"
      >
        {selected && <ResearchModalContent paper={selected} />}
      </Modal>
    </div>
  );
}
