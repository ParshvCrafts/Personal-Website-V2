import { FileText, ScrollText } from "lucide-react";
import { LinkedinIcon } from "@/components/layout/social-icons";
import { ABOUT_DOCUMENTS } from "@/content/about";

export function AboutDocuments() {
  return (
    <div>
      <h3 className="font-display text-2xl text-heading md:text-3xl">Documents &amp; Credentials</h3>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {ABOUT_DOCUMENTS.map((doc) => (
          <a
            key={doc.id}
            href={doc.href}
            target="_blank"
            rel="noopener noreferrer"
            className="card-lift group flex min-h-[64px] items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-elevated text-accent">
              {doc.id === "resume" && <FileText className="h-5 w-5" aria-hidden="true" />}
              {doc.id === "transcript" && <ScrollText className="h-5 w-5" aria-hidden="true" />}
              {doc.id === "linkedin" && <LinkedinIcon className="h-5 w-5" />}
            </span>
            <span className="font-display text-lg text-heading">{doc.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
