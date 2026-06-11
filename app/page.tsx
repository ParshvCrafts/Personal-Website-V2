import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { Preloader } from "@/components/layout/preloader";
import { Hero } from "@/components/sections/hero";
import { ScrollShowpiece } from "@/components/sections/scroll-showpiece";
import { About } from "@/components/sections/about";
import { Academics } from "@/components/sections/academics";
import { Research } from "@/components/sections/research";
import { Terminal } from "@/components/sections/terminal";
import { Journey } from "@/components/sections/journey";
import { Skills } from "@/components/sections/skills";
import { Projects } from "@/components/sections/projects";
import { Hobbies } from "@/components/sections/hobbies";
import { Contact } from "@/components/sections/contact";
import { SectionDivider } from "@/components/ui/section-divider";
import { FunFactsTicker } from "@/components/motion/fun-facts-ticker";

export default function Home() {
  return (
    <>
      <Preloader />
      <SiteNav />
      <main id="main" className="bg-background text-foreground">
        <Hero />
        <SectionDivider />
        <ScrollShowpiece />
        <About />
        <FunFactsTicker />
        <SectionDivider flip />
        <Academics />
        <Research />
        <Terminal />
        <Journey />
        <SectionDivider />
        <Skills />
        <Projects />
        <SectionDivider flip />
        <Hobbies />
        <SectionDivider />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
