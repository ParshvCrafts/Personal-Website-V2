import { test, expect } from "@playwright/test";

test("motion page renders the sequence and primitives", async ({ page }) => {
  await page.goto("/preview/motion");
  await expect(page.getByRole("heading", { name: /Primitives in motion/i })).toBeVisible();
  // Canvas-based scroll sequence is present with its text alternative.
  await expect(page.getByRole("img", { name: /Placeholder scroll sequence/i })).toBeVisible();
});

test.describe("reduced motion", () => {
  // Playwright 1.60 exposes reducedMotion only via contextOptions (not a direct
  // test option); contextOptions pass through to browser.newContext, which drives
  // the prefers-reduced-motion media query the motion gates read.
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("does not trap scrolling on the sequence", async ({ page }) => {
    await page.goto("/preview/motion");
    const beforeY = await page.evaluate(() => window.scrollY);
    // Scroll well past the pinned section height.
    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(300);
    const afterY = await page.evaluate(() => window.scrollY);
    expect(afterY).toBeGreaterThan(beforeY + 500); // page advanced; not pinned/trapped
  });
});
