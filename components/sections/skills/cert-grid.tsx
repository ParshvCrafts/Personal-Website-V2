"use client";

import { useState, useId } from "react";
import type { Certification } from "@/lib/types";
import { Reveal } from "@/components/motion/reveal";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";

function CertCard({
  cert,
  onOpen,
}: {
  cert: Certification;
  onOpen: (c: Certification) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.currentTarget.focus();
        onOpen(cert);
      }}
      aria-haspopup="dialog"
      className="cert-sheen group flex w-full min-h-[88px] flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-5 text-left transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="min-w-0 w-full">
        <span className="block font-mono text-xs uppercase tracking-widest text-accent">
          {cert.issuer}
        </span>
        <span className="mt-0.5 block font-display text-lg leading-snug text-heading">
          {cert.title}
        </span>
      </div>
      {cert.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {cert.skills.slice(0, 3).map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
      )}
    </button>
  );
}

function CertModalContent({
  cert,
  titleId,
}: {
  cert: Certification;
  titleId: string;
}) {
  return (
    <div className="pr-10">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        {cert.issuer}
      </p>
      <p id={titleId} className="mt-1 font-display text-xl text-heading md:text-2xl">
        {cert.title}
      </p>
      {cert.description && (
        <p className="mt-4 text-sm leading-relaxed text-muted">{cert.description}</p>
      )}
      {cert.skills.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted">
            Skills
          </p>
          <div className="flex flex-wrap gap-1">
            {cert.skills.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </div>
      )}
      {cert.link && (
        <div className="mt-6 border-t border-border pt-4">
          <a
            href={cert.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded font-mono text-xs text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View Certificate →
          </a>
        </div>
      )}
    </div>
  );
}

export function CertGrid({ certs }: { certs: Certification[] }) {
  const [selected, setSelected] = useState<Certification | null>(null);
  const uid = useId();
  const titleId = `${uid}-cert-title`;

  return (
    <div>
      <Reveal stagger={0.05} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certs.map((cert) => (
          <CertCard key={cert.id} cert={cert} onOpen={setSelected} />
        ))}
      </Reveal>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        labelledBy={titleId}
      >
        {selected && <CertModalContent cert={selected} titleId={titleId} />}
      </Modal>
    </div>
  );
}
