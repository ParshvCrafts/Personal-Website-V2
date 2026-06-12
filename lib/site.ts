export interface NavSection {
  /** Must match a `section[id]` anchor in the page. */
  id: string;
  label: string;
}

/**
 * Curated primary nav (single-page anchors), in document order. Secondary
 * sections (Terminal easter-egg, Certifications, Professional Development) are
 * reachable by scrolling and are intentionally omitted to avoid an overloaded nav.
 */
export const NAV_SECTIONS: NavSection[] = [
  { id: "about", label: "About" },
  { id: "academics", label: "Academics" },
  { id: "research", label: "Research" },
  { id: "journey", label: "Journey" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

/**
 * Sticky-nav clearance in px — the single source of truth shared by scroll-spy's
 * trigger line, programmatic scroll-to offsets, and each section's scroll-margin
 * (`scroll-mt-[88px]`). Keep these in sync if this changes.
 */
export const NAV_OFFSET = 88;

export const SOCIAL_LINKS = {
  github: "https://github.com/ParshvCrafts",
  linkedin: "https://www.linkedin.com/in/parshv-patel-65a90326b/",
  email: "parshvpatel_0910@berkeley.edu",
} as const;

export const SITE = {
  name: "Parshv Patel",
  initials: "PP",
  role: "Data Science · AI/ML",
  location: "Berkeley, CA",
  email: SOCIAL_LINKS.email,
  phone: "+19515993618",
  phoneDisplay: "(951) 599-3618",
} as const;

/** Hero portrait path (shared by the hero render + the preloader warm-up). */
export const HERO_PORTRAIT = "/images/profile.jpg";

/**
 * Default hero 3D variant. Overridable live via `?hero=restrained|bold|off` for
 * in-browser A/B. "off" / reduced-motion / no-WebGL fall back to the static hero.
 */
export const HERO_3D_DEFAULT: import("./hero/hero-variant").HeroVariant = "restrained";

/** Roles cycled in the hero's rotating line (motion-safe; static first role under RM). */
export const HERO_ROLES = [
  "Data Scientist",
  "ML Engineer",
  "Full-Stack Builder",
  "AI Researcher",
] as const;

/** Next index in a cyclic list; safe for empty lists. Pure (unit-tested). */
export function nextRoleIndex(current: number, length: number): number {
  if (length <= 0) return 0;
  return (current + 1) % length;
}
