import {
  ArrowUp, Hash, Palette, Copy, Mail, GitFork, Link, FileText,
  Sparkles, FlaskConical,
} from "lucide-react";
import { NAV_SECTIONS, NAV_OFFSET, SOCIAL_LINKS } from "@/lib/site";
import { THEMES, THEME_LABELS } from "@/lib/theme/palettes";
import { HERO_VARIANTS } from "@/lib/hero/hero-variant";
import { SHOWPIECE_VARIANTS } from "@/lib/showpiece/showpiece-variant";
import type { Command } from "./types";

/** Assemble the full command registry. Pure: side effects come from the injected ctx. */
export function buildCommands(): Command[] {
  const navigate: Command[] = [
    {
      id: "nav-top", group: "Navigate", label: "Top", keywords: ["home", "hero", "start"],
      icon: ArrowUp, run: (c) => { c.scrollTo(0); c.close(); },
    },
    ...NAV_SECTIONS.map<Command>((s) => ({
      id: `nav-${s.id}`, group: "Navigate", label: s.label,
      keywords: ["go to", "jump", s.id], icon: Hash,
      run: (c) => { c.scrollTo(`#${s.id}`, { offset: -NAV_OFFSET }); c.close(); },
    })),
  ];

  const theme: Command[] = THEMES.map<Command>((t) => ({
    id: `theme-${t}`, group: "Theme", label: `Theme: ${THEME_LABELS[t]}`,
    keywords: ["color", "appearance", t], icon: Palette,
    run: (c) => { c.setTheme(t); c.close(); },
  }));

  const links: Command[] = [
    { id: "link-copy-email", group: "Links", label: "Copy email", keywords: ["clipboard", "contact"], icon: Copy, run: (c) => { c.copyEmail(); } },
    { id: "link-email", group: "Links", label: "Email Parshv", keywords: ["mail", "contact"], icon: Mail, run: (c) => { c.openUrl(`mailto:${SOCIAL_LINKS.email}`); c.close(); } },
    { id: "link-github", group: "Links", label: "GitHub", keywords: ["code", "repos"], icon: GitFork, run: (c) => { c.openUrl(SOCIAL_LINKS.github, true); c.close(); } },
    { id: "link-linkedin", group: "Links", label: "LinkedIn", keywords: ["social", "profile"], icon: Link, run: (c) => { c.openUrl(SOCIAL_LINKS.linkedin, true); c.close(); } },
    { id: "link-resume", group: "Links", label: "Résumé (PDF)", keywords: ["cv", "download"], icon: FileText, run: (c) => { c.openUrl("/documents/resume.pdf", true); c.close(); } },
    { id: "link-transcript", group: "Links", label: "Transcript (PDF)", keywords: ["grades", "academics"], icon: FileText, run: (c) => { c.openUrl("/documents/transcript.pdf", true); c.close(); } },
  ];

  const actions: Command[] = [
    { id: "action-toggle-motion", group: "Actions", label: "Toggle animations", keywords: ["reduce motion", "accessibility"], icon: Sparkles, run: (c) => { c.toggleAnimations(); } },
  ];

  const labs: Command[] = [
    ...HERO_VARIANTS.map<Command>((v) => ({
      id: `lab-hero-${v}`, group: "Labs", label: `Hero: ${v}`, hint: "reloads",
      keywords: ["variant", "3d", "background"], icon: FlaskConical,
      run: (c) => { c.navigateVariant("hero", v); },
    })),
    ...SHOWPIECE_VARIANTS.map<Command>((v) => ({
      id: `lab-show-${v}`, group: "Labs", label: `Showpiece: ${v}`, hint: "reloads",
      keywords: ["variant", "scroll"], icon: FlaskConical,
      run: (c) => { c.navigateVariant("show", v); },
    })),
  ];

  return [...navigate, ...theme, ...links, ...actions, ...labs];
}
