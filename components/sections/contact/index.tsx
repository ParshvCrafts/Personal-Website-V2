import { Mail, Phone, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/layout/social-icons";
import { SITE, SOCIAL_LINKS } from "@/lib/site";
import { SplitReveal } from "@/components/motion/split-reveal";
import { Parallax } from "@/components/motion/parallax";
import { ContactForm } from "./contact-form";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-h"
      className="relative scroll-mt-[88px] overflow-hidden border-t border-border px-6 py-24 md:px-10 md:py-32"
    >
      <Parallax
        amount={36}
        className="pointer-events-none absolute -inset-y-24 inset-x-0 -z-10"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(45% 50% at 90% 10%, color-mix(in oklab, var(--accent) 5%, transparent), transparent 70%)",
          }}
        />
      </Parallax>
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          Get in Touch
        </p>
        <SplitReveal
          as="h2"
          id="contact-h"
          className="mt-4 font-display text-4xl leading-[1.05] text-heading md:text-6xl"
        >Contact</SplitReveal>

        <div className="mt-12 grid gap-12 md:grid-cols-2 lg:gap-20">
          {/* Info column */}
          <div>
            <h3 className="font-display text-2xl text-heading">
              Let&apos;s work together!
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              I&apos;m always interested in hearing about new opportunities,
              collaborations, or just connecting with fellow data enthusiasts.
              Feel free to reach out!
            </p>

            <ul className="mt-8 space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Email</p>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="text-sm text-foreground hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-colors"
                  >
                    {SITE.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Phone</p>
                  <a
                    href={`tel:${SITE.phone}`}
                    className="text-sm text-foreground hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-colors"
                  >
                    {SITE.phoneDisplay}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Location</p>
                  <p className="text-sm text-foreground">{SITE.location}</p>
                </div>
              </li>
            </ul>

            <div className="mt-8 flex gap-3">
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile (opens in new tab)"
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LinkedinIcon className="h-4 w-4" />
                LinkedIn
              </a>
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile (opens in new tab)"
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <GithubIcon className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>

          {/* Form column */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
