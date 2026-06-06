export type ThemeName = "midnight" | "daylight" | "manuscript" | "neon";

export interface Palette {
  background: string;
  elevated: string;
  surface: string;
  foreground: string;
  heading: string;
  muted: string;
  accent: string;
  accent2: string;
  /** Optional tertiary accent (currently Neon only — electric yellow highlight). */
  accent3?: string;
  onAccent: string;
  border: string;
  ring: string;
  colorScheme: "dark" | "light";
}

export const palettes: Record<ThemeName, Palette> = {
  midnight: {
    background: "#0B0F14", elevated: "#1A222E", surface: "#121821",
    foreground: "#E6EDF3", heading: "#E6EDF3", muted: "#9BA8B7",
    accent: "#2DD4BF", accent2: "#818CF8", onAccent: "#0B0F14",
    border: "#1F2935", ring: "#2DD4BF", colorScheme: "dark",
  },
  daylight: {
    background: "#F7F8FA", elevated: "#FFFFFF", surface: "#FFFFFF",
    foreground: "#1F2933", heading: "#0A2540", muted: "#52606D",
    accent: "#2563EB", accent2: "#8A6A1F", onAccent: "#FFFFFF",
    border: "#E4E7EB", ring: "#2563EB", colorScheme: "light",
  },
  manuscript: {
    background: "#FBF8F1", elevated: "#FFFDF7", surface: "#FFFDF7",
    foreground: "#2B2622", heading: "#2B2622", muted: "#6E635A",
    accent: "#AE4A33", accent2: "#5B6B4F", onAccent: "#FFFFFF",
    border: "#E7DECE", ring: "#AE4A33", colorScheme: "light",
  },
  // Neon — futuristic/tech: space-navy base (never pure black), crisp white,
  // electric cyan primary + neon purple secondary. All pairs WCAG-verified.
  neon: {
    background: "#0A0F1E", elevated: "#18233D", surface: "#121A2E",
    foreground: "#FFFFFF", heading: "#FFFFFF", muted: "#A1A1AA",
    accent: "#00E5FF", accent2: "#B026FF", accent3: "#E5FF00", onAccent: "#0A0F1E",
    border: "#243352", ring: "#00E5FF", colorScheme: "dark",
  },
};

export const THEMES: ThemeName[] = ["midnight", "daylight", "manuscript", "neon"];
export const DEFAULT_THEME: ThemeName = "midnight";

export const THEME_LABELS: Record<ThemeName, string> = {
  midnight: "Midnight",
  daylight: "Daylight",
  manuscript: "Manuscript",
  neon: "Neon",
};
