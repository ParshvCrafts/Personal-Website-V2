import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { Preloader } from "@/components/layout/preloader";
import { Hero } from "@/components/sections/hero";
import { ScrollShowpiece } from "@/components/sections/scroll-showpiece";
import { About } from "@/components/sections/about";
import { NAV_SECTIONS } from "@/lib/site";

// Stub placeholders until each real section lands (P6+). Each anchored section is
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
  return (
    <>
      <Preloader />
      <SiteNav />
      <main id="main" className="bg-background text-foreground">
        <Hero />
        <ScrollShowpiece />
        <About />

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
