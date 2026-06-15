// tests/e2e/reduced-motion.spec.ts
import { test, expect } from "@playwright/test";

const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

test.describe("reduced motion — OS media-query path", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("home: no pinned ScrollTrigger spacers, hero visible/static", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("preloader")).toHaveCount(0);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1, name: /Parshv Patel/i })).toBeVisible();
  });

  test("command palette opens instantly (no fade), input focused", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "Open command palette" })).toBeVisible();
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Search commands" })).toBeFocused();
  });

  test("Konami reward uses the opacity pulse, not the expanding ripple", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "Open command palette" })).toBeVisible();
    for (const k of KONAMI) await page.keyboard.press(k);
    // Under reduced motion the WebGL Inkfield tier is "off" → the fallback mounts.
    const ripple = page.getByTestId("konami-ripple");
    await expect(ripple).toBeAttached({ timeout: 3000 });
    await expect(ripple.locator('[data-mode="pulse"]').first()).toBeAttached();
    await expect(ripple.locator('[data-mode="expand"]')).toHaveCount(0);
  });

  test("guided tour starts with no pinning", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "Open command palette" })).toBeVisible();
    await page.keyboard.press("Control+k");
    const input = page.getByRole("combobox", { name: "Search commands" });
    await input.fill("tour");
    await input.press("Enter");
    await expect(page.getByRole("dialog", { name: "Site tour" })).toBeVisible();
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
  });
});

test.describe("reduced motion — on-page toggle path", () => {
  test("AnimationToggle quiets motion site-wide after its reload", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("preloader")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveAttribute("data-reduce-motion", "");
    await page.getByRole("button", { name: "Disable animations" }).click();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("html")).toHaveAttribute("data-reduce-motion", "");
    await expect(page.getByTestId("preloader")).toHaveCount(0);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
  });
});
