// tests/e2e/accessibility-overlays.spec.ts
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ contextOptions: { reducedMotion: "reduce" } });
test.setTimeout(60_000);

const THEMES = ["midnight", "daylight", "manuscript", "neon"] as const;

test.describe("Accessibility — open overlays (chromium)", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "axe is engine-agnostic; run once");

  async function setTheme(page: Page, theme: string) {
    await page.evaluate((t) => {
      localStorage.setItem("theme", t);
    }, theme);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("preloader")).toHaveCount(0);
  }

  test("command palette open is axe-clean in all 4 themes", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    for (const theme of THEMES) {
      await setTheme(page, theme);
      await page.getByRole("button", { name: "Open command palette" }).click();
      await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
      const results = await new AxeBuilder({ page })
        .include('[role="dialog"][aria-label="Command palette"]')
        .analyze();
      expect(results.violations, `palette/${theme}`).toEqual([]);
      await page.keyboard.press("Escape");
    }
  });

  test("guided tour open is axe-clean in all 4 themes", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    for (const theme of THEMES) {
      await setTheme(page, theme);
      await page.keyboard.press("Control+k");
      const input = page.getByRole("combobox", { name: "Search commands" });
      await input.fill("tour");
      await input.press("Enter");
      await expect(page.getByRole("dialog", { name: "Site tour" })).toBeVisible();
      const results = await new AxeBuilder({ page })
        .include('[role="dialog"][aria-label="Site tour"]')
        .analyze();
      expect(results.violations, `tour/${theme}`).toEqual([]);
      await page.keyboard.press("Escape");
    }
  });
});
