import { describe, expect, it, vi } from "vitest";
import { buildCommands } from "@/lib/command-palette/commands";
import type { CommandContext } from "@/lib/command-palette/types";
import { NAV_SECTIONS } from "@/lib/site";
import { THEMES } from "@/lib/theme/palettes";

const noopCtx = (over: Partial<CommandContext> = {}): CommandContext => ({
  scrollTo: vi.fn(), setTheme: vi.fn(), toggleAnimations: vi.fn(),
  navigateVariant: vi.fn(), copyEmail: vi.fn(), openUrl: vi.fn(), close: vi.fn(),
  startTour: vi.fn(),
  ...over,
});

describe("buildCommands", () => {
  const cmds = buildCommands();
  it("has unique ids", () => {
    const ids = cmds.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("includes all five groups", () => {
    const groups = new Set(cmds.map((c) => c.group));
    expect(groups).toEqual(new Set(["Navigate", "Theme", "Links", "Actions", "Labs"]));
  });
  it("has a Navigate command per section plus Top", () => {
    expect(cmds.filter((c) => c.group === "Navigate")).toHaveLength(NAV_SECTIONS.length + 1);
  });
  it("has a Theme command per theme", () => {
    expect(cmds.filter((c) => c.group === "Theme")).toHaveLength(THEMES.length);
  });
  it("Labs commands all carry the 'reloads' hint", () => {
    const labs = cmds.filter((c) => c.group === "Labs");
    expect(labs.length).toBeGreaterThan(0);
    expect(labs.every((c) => c.hint === "reloads")).toBe(true);
  });
  it("Top command scrolls to 0 and closes", () => {
    const ctx = noopCtx();
    cmds.find((c) => c.id === "nav-top")!.run(ctx);
    expect(ctx.scrollTo).toHaveBeenCalledWith(0);
    expect(ctx.close).toHaveBeenCalled();
  });
  it("a theme command calls setTheme with the theme name", () => {
    const ctx = noopCtx();
    cmds.find((c) => c.id === "theme-neon")!.run(ctx);
    expect(ctx.setTheme).toHaveBeenCalledWith("neon");
  });
  it("copy-email command calls copyEmail and does NOT close", () => {
    const ctx = noopCtx();
    cmds.find((c) => c.id === "link-copy-email")!.run(ctx);
    expect(ctx.copyEmail).toHaveBeenCalled();
    expect(ctx.close).not.toHaveBeenCalled();
  });
  it("a Labs hero command calls navigateVariant('hero', …)", () => {
    const ctx = noopCtx();
    cmds.find((c) => c.id === "lab-hero-bold")!.run(ctx);
    expect(ctx.navigateVariant).toHaveBeenCalledWith("hero", "bold");
  });
  it("includes a 'Take the tour' command that calls startTour and closes", () => {
    const ctx = noopCtx();
    const cmd = cmds.find((c) => c.id === "action-tour");
    expect(cmd).toBeTruthy();
    cmd!.run(ctx);
    expect(ctx.startTour).toHaveBeenCalled();
    expect(ctx.close).toHaveBeenCalled();
  });
});
