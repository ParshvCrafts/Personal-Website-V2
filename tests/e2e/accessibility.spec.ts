import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ contextOptions: { reducedMotion: "reduce" } });
test.setTimeout(60_000);

const THEMES = [
  { label: "Midnight", value: "midnight" },
  { label: "Daylight", value: "daylight" },
  { label: "Manuscript", value: "manuscript" },
  { label: "Neon", value: "neon" },
] as const;

async function waitForLoadedShell(page: Page) {
  await expect(page.getByTestId("preloader")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: /Parshv Patel/i })).toBeVisible();
}

async function scanCurrentTheme(page: Page) {
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
}

async function scanPageAcrossThemes(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });

  if (path === "/") {
    await waitForLoadedShell(page);
  }

  const html = page.locator("html");
  for (const theme of THEMES) {
    const radio = page.getByRole("radio", { name: theme.label });
    if ((await radio.count()) > 0) {
      await radio.click();
      await expect(html).toHaveAttribute("data-theme", theme.value);
    }
    await scanCurrentTheme(page);
  }
}

test.describe("Accessibility (Axe-core)", () => {
  test("homepage should not have automatically detectable accessibility violations", async ({ page }) => {
    await scanPageAcrossThemes(page, "/");
  });

  test("preview should not have automatically detectable accessibility violations", async ({ page }) => {
    await scanPageAcrossThemes(page, "/preview");
  });

  test("motion preview should not have automatically detectable accessibility violations", async ({ page }) => {
    await scanPageAcrossThemes(page, "/preview/motion");
  });

  test("mobile menu should be accessible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/");
    await waitForLoadedShell(page);

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: /site menu/i })).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
