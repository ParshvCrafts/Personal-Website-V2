"use client";

import { useEffect, useState } from "react";
import { useSmoothScroll } from "@/components/providers/smooth-scroll";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { NAV_SECTIONS, SITE, NAV_OFFSET } from "@/lib/site";
import { activeSectionForScroll, type SectionTop } from "@/lib/scrollspy";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

export function SiteNav() {
  const { scrollTo } = useSmoothScroll();
  // No section is active until one actually crosses the trigger line (hero in view).
  const [active, setActive] = useState<string | null>(null);
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const getTops = (): SectionTop[] =>
      NAV_SECTIONS.map(({ id }) => {
        const el = document.getElementById(id);
        return el ? { id, top: el.getBoundingClientRect().top + window.scrollY } : null;
      }).filter((s): s is SectionTop => s !== null);

    let tops = getTops();
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      setActive(activeSectionForScroll(tops, y, NAV_OFFSET));
      setCondensed(y > 24);
      // Hide on scroll-down past the nav, show on scroll-up. (Transform is
      // motion-safe only via CSS, so reduced-motion users see no movement.)
      if (y > lastY && y > 200) setHidden(true);
      else if (y < lastY) setHidden(false);
      lastY = y;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    // Section tops shift after web-font swap (display: swap) and full load; recompute.
    const recalc = () => {
      if (!mounted) return;
      tops = getTops();
      update();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", recalc);
    window.addEventListener("load", recalc);
    document.fonts?.ready.then(recalc).catch(() => {});
    return () => {
      mounted = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", recalc);
      window.removeEventListener("load", recalc);
    };
  }, []);

  const go = (id: string) => {
    setMenuOpen(false);
    scrollTo(`#${id}`, { offset: -NAV_OFFSET });
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[101] rounded-md bg-accent px-4 py-2 text-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-[transform,background-color,backdrop-filter,border-color] duration-300 motion-reduce:transform-none",
          condensed
            ? "border-b border-border bg-background/80 backdrop-blur-md"
            : "border-b border-transparent",
          hidden && "-translate-y-full",
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6 md:px-10"
        >
          <button
            type="button"
            onClick={() => scrollTo(0)}
            className="font-display text-lg font-semibold text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {SITE.name}
          </button>

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => go(id)}
                  aria-current={active === id ? "true" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active === id ? "text-accent" : "text-muted hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <ThemeSwitcher />
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="flex h-11 w-11 items-center justify-center rounded-full text-foreground hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} active={active} onNavigate={go} />
    </>
  );
}
