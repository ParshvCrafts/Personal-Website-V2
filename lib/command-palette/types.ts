import type { LucideIcon } from "lucide-react";

export type CommandGroup = "Navigate" | "Theme" | "Links" | "Actions" | "Labs";

export const COMMAND_GROUP_ORDER: CommandGroup[] = [
  "Navigate", "Theme", "Links", "Actions", "Labs",
];

/** Side-effecting deps injected into command.run so the registry stays pure. */
export interface CommandContext {
  scrollTo: (target: string | number, opts?: { offset?: number }) => void;
  setTheme: (theme: string) => void;
  toggleAnimations: () => void;
  navigateVariant: (param: "hero" | "show", value: string) => void;
  copyEmail: () => void;
  openUrl: (url: string, external?: boolean) => void;
  close: () => void;
}

export interface Command {
  id: string;
  group: CommandGroup;
  label: string;
  keywords?: string[];
  hint?: string;
  icon: LucideIcon;
  run: (ctx: CommandContext) => void;
}
