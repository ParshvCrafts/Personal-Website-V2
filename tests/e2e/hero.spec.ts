import { test, expect } from "@playwright/test";

test.describe("hero + showpiece", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("renders the hero (single h1, portrait, résumé, CTAs)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: /Parshv Patel/i })).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("img", { name: "Parshv Patel" })).toBeVisible();
    await expect(page.getByRole("link", { name: /r[ée]sum[ée]/i })).toHaveAttribute(
      "href",
      "/documents/resume.pdf",
    );
    await expect(page.getByRole("button", { name: /explore work/i })).toBeVisible();
  });

  test("the scroll showpiece is present with its text alternative", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("img", { name: /converging into an ordered lattice/i })).toBeVisible();
  });

  test("reduced motion does not trap scrolling on the home sequence", async ({ page }) => {
    await page.goto("/");
    const beforeY = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 6000);
    await page.waitForTimeout(300);
    const afterY = await page.evaluate(() => window.scrollY);
    expect(afterY).toBeGreaterThan(beforeY + 600); // page advanced past the (non-pinned) sequence
  });
});
