import { test, expect } from "@playwright/test";

test.describe("P13 3D foundation (/preview)", () => {
  test("mounts a WebGL canvas after scrolling to the proof section", async ({ page }) => {
    await page.goto("/preview/");
    const heading = page.getByRole("heading", { name: "WebGL rig proof (P13)" });
    await heading.scrollIntoViewIfNeeded();
    // The scene lazy-mounts; poll until the canvas appears (or the fallback if no WebGL in this browser).
    await expect(async () => {
      const canvas = await page.locator("#main, main").locator("canvas").count();
      const fallback = await page.getByText("3D disabled", { exact: false }).count();
      expect(canvas + fallback).toBeGreaterThan(0);
    }).toPass({ timeout: 10_000 });
  });

  test("reduced motion renders the accessible fallback and no canvas", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/preview/");
    await page.getByRole("heading", { name: "WebGL rig proof (P13)" }).scrollIntoViewIfNeeded();
    await expect(page.getByText("3D disabled", { exact: false })).toBeVisible();
    // Give hydration + IntersectionObserver time to (wrongly) mount a canvas, so the
    // assertion is not satisfied vacuously by the pre-hydration SSR fallback.
    await page.waitForTimeout(1500);
    await expect(page.locator("main canvas")).toHaveCount(0);
    await context.close();
  });
});
