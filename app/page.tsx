import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { Preloader } from "@/components/layout/preloader";
import { NAV_SECTIONS, SITE } from "@/lib/site";
import {
  getProjects,
  getCourses,
  getResearch,
  getCertifications,
  getProfessionalDevelopment,
} from "@/lib/data";

// Stub placeholders until each real section lands (P4+). Each anchored section is
// tall enough to exercise scroll-spy and smooth scroll-to.
const STUB_COPY: Record<string, string> = {
  academics: "UC Berkeley — coursework, GPA, and the course grid land here.",
  research: "Research papers render here.",
  journey: "The India → Berkeley → Amazon timeline lands here.",
  skills: "Skill clusters and the logo marquee land here.",
  projects: "The projects bento grid with filters lands here.",
  contact: "The contact form and footer land here.",
};

export default function Home() {
  const counts = {
    projects: getProjects().length,
    courses: getCourses().length,
    research: getResearch().length,
    certifications: getCertifications().length,
    professionalDevelopment: getProfessionalDevelopment().length,
  };

  return (
    <>
      <Preloader />
      <SiteNav />
      <main id="main" className="bg-background text-foreground">
        {/* Hero placeholder (real hero = P4). Single h1 for heading hierarchy. */}
        <section
          id="top"
          className="flex min-h-dvh flex-col justify-center px-6 md:px-10 mx-auto max-w-6xl"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-accent">{SITE.role}</p>
          <h1 className="mt-4 font-display text-5xl text-heading md:text-8xl">{SITE.name}</h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Layout shell preview — nav, scroll-spy, mobile menu, footer, preloader, cursor, and
            grain. Real sections arrive next.
          </p>
        </section>

        {/* About stub — keeps the validated data counts (pipeline proof). */}
        <section
          id="about"
          aria-labelledby="about-h"
          className="scroll-mt-[88px] border-t border-border px-6 py-24 md:px-10"
        >
          <div className="mx-auto max-w-6xl">
            <h2 id="about-h" className="font-display text-3xl text-heading md:text-5xl">
              About
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-3 font-mono text-sm md:grid-cols-3">
              <li data-testid="count-projects">Projects: {counts.projects}</li>
              <li data-testid="count-courses">Courses: {counts.courses}</li>
              <li data-testid="count-research">Research: {counts.research}</li>
              <li data-testid="count-certifications">Certifications: {counts.certifications}</li>
              <li data-testid="count-profdev">Professional Dev: {counts.professionalDevelopment}</li>
            </ul>
          </div>
        </section>

        {/* Remaining anchored stubs (everything after About in NAV_SECTIONS). */}
        {NAV_SECTIONS.filter((s) => s.id !== "about").map(({ id, label }) => (
          <section
            key={id}
            id={id}
            aria-labelledby={`${id}-h`}
            className="scroll-mt-[88px] border-t border-border px-6 py-24 md:px-10"
          >
            <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center">
              <h2 id={`${id}-h`} className="font-display text-3xl text-heading md:text-5xl">
                {label}
              </h2>
              <p className="mt-4 max-w-xl text-muted">{STUB_COPY[id]}</p>
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
