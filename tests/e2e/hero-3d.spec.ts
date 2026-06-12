import { test, expect } from "@playwright/test";

test.describe("P14 hero 3D variants", () => {
  test("?hero=off renders no canvas in the hero", async ({ page }) => {
    await page.goto("/?hero=off");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Deterministic: the switch is read client-side; give hydration time to (not) mount.
    await page.waitForTimeout(1500);
    await expect(page.locator("#top canvas")).toHaveCount(0);
  });

  test("?hero=restrained mounts a WebGL canvas behind the hero copy", async ({ page }) => {
    await page.goto("/?hero=restrained");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Headless WebKit lacks WebGL2 — the rig correctly stays "off" there, so only
    // assert a canvas mounts where WebGL2 actually exists (the tier gate is the point).
    const hasWebgl2 = await page.evaluate(
      () => !!document.createElement("canvas").getContext("webgl2"),
    );
    test.skip(!hasWebgl2, "WebGL2 unavailable in this browser/runtime");
    await expect(async () => {
      expect(await page.locator("#top canvas").count()).toBeGreaterThan(0);
    }).toPass({ timeout: 10_000 });
  });

  test("reduced motion renders the static hero (no canvas) regardless of ?hero", async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/?hero=bold");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(page.locator("#top canvas")).toHaveCount(0);
    await context.close();
  });
});
