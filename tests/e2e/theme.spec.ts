import { test, expect } from "@playwright/test";

test("theme switcher changes data-theme on /preview", async ({ page }) => {
  await page.goto("/preview");
  const html = page.locator("html");
  // default theme
  await expect(html).toHaveAttribute("data-theme", "midnight");
  // switch to Daylight
  await page.getByRole("radio", { name: "Daylight" }).click();
  await expect(html).toHaveAttribute("data-theme", "daylight");
  // switch to Manuscript
  await page.getByRole("radio", { name: "Manuscript" }).click();
  await expect(html).toHaveAttribute("data-theme", "manuscript");
  // persists across reload (localStorage)
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "manuscript");
});
