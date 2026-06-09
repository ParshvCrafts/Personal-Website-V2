import { getCertifications, getProfessionalDevelopment } from "@/lib/data";
import { SKILL_CATEGORIES, MARQUEE_SKILLS } from "@/content/skills";
import { Reveal } from "@/components/motion/reveal";
import { Marquee } from "@/components/motion/marquee";
import { CertGrid } from "./cert-grid";
import { DevList } from "./dev-list";

export function Skills() {
  const certs = getCertifications();
  const dev = getProfessionalDevelopment();

  return (
    <>
      {/* ---- Skills ---- */}
      <section
        id="skills"
        aria-labelledby="skills-h"
        className="relative scroll-mt-[88px] overflow-hidden border-t border-border px-6 py-24 md:px-10 md:py-32"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(55% 45% at 85% 20%, color-mix(in oklab, var(--accent) 7%, transparent), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            Technical Proficiency
          </p>
          <h2
            id="skills-h"
            className="mt-4 font-display text-4xl leading-[1.05] text-heading md:text-6xl"
          >
            Skills
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted">
            A data scientist&apos;s toolkit spanning programming, statistical analysis,
            machine learning, and production tooling.
          </p>

          <Reveal
            stagger={0.07}
            className="mt-16 grid gap-10 sm:grid-cols-2 md:mt-20"
          >
            {SKILL_CATEGORIES.map((cat) => (
              <div key={cat.id} className="space-y-3">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                  {cat.label}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full border border-border px-3 py-1 font-mono text-xs text-muted"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </Reveal>

          <div
            aria-hidden="true"
            className="mt-16 border-y border-border py-4 md:mt-20"
          >
            <Marquee speed={50}>
              {MARQUEE_SKILLS.map((skill, i) => (
                <span
                  key={`${skill}-${i}`}
                  className="font-mono text-xs uppercase tracking-widest text-muted"
                >
                  {skill}
                  <span className="mx-4 text-border">·</span>
                </span>
              ))}
            </Marquee>
          </div>
        </div>
      </section>

      {/* ---- Certifications ---- */}
      <section
        id="certifications"
        aria-labelledby="certifications-h"
        className="scroll-mt-[88px] border-t border-border px-6 py-24 md:px-10 md:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            Verified Learning
          </p>
          <h2
            id="certifications-h"
            className="mt-4 font-display text-4xl leading-[1.05] text-heading md:text-6xl"
          >
            Certifications
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted">
            <span data-testid="stat-certs">{certs.length}</span>{" "}
            industry-recognized certifications in data science, machine learning, and AI
            engineering.
          </p>
          <CertGrid certs={certs} />
        </div>
      </section>

      {/* ---- Professional Development ---- */}
      <section
        id="development"
        aria-labelledby="development-h"
        className="scroll-mt-[88px] border-t border-border px-6 py-24 md:px-10 md:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            Beyond the Classroom
          </p>
          <h2
            id="development-h"
            className="mt-4 font-display text-4xl leading-[1.05] text-heading md:text-6xl"
          >
            Professional Development
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted">
            Fellowships, leadership programs, and community contributions shaping the
            person behind the engineer.
          </p>
          <div className="mt-12">
            <DevList items={dev} />
          </div>
        </div>
      </section>
    </>
  );
}
