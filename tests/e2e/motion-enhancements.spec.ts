import { test, expect } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test.describe("motion enhancements (reduced motion)", () => {
  test("hero name + section titles render full text", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#projects").getByRole("heading", { level: 2 })).toHaveText("Projects");
    await expect(page.locator("#contact").getByRole("heading", { level: 2 })).toHaveText("Contact");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Parshv");
  });

  test("featured-build shows ALL beats under reduced motion (no hidden text)", async ({ page }) => {
    await page.goto("/");
    const beats = page.locator("[data-testid='featured-build'] [data-testid='featured-beat']");
    await expect(beats).toHaveCount(3);
    // Under reduced motion every beat must be visible (the cross-fade is gated off).
    for (let i = 0; i < 3; i++) {
      await expect(beats.nth(i)).toBeVisible();
    }
    await expect(page.locator("[data-testid='featured-build']")).toContainText("Search that understands intent");
    await expect(page.locator("[data-testid='featured-build']")).toContainText("Production system on free-tier infra");
  });

  test("proficiency bars render with meter semantics", async ({ page }) => {
    await page.goto("/");
    const meters = page.locator("#skills [role='meter']");
    expect(await meters.count()).toBeGreaterThanOrEqual(8);
    // each meter exposes a valid aria-valuenow 0–100
    const first = meters.first();
    const v = Number(await first.getAttribute("aria-valuenow"));
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(100);
  });

  test("filtering keeps 12 -> subset -> 12 card counts (Flip safe)", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#projects");
    const cards = section.getByTestId("projects-grid").locator("[data-testid^='project-card-']");
    await expect(cards).toHaveCount(12);
    await expect(async () => {
      await section.getByRole("tab", { name: /computer vision/i }).click();
      expect(await cards.count()).toBeLessThan(12);
    }).toPass();
    await expect(async () => {
      await section.getByRole("tab", { name: /all projects/i }).click();
      await expect(cards).toHaveCount(12);
    }).toPass();
  });
});
