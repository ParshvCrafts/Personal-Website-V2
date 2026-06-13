import { test, expect } from "@playwright/test";

// The showpiece scrubs 120 baked webp frames on a plain 2D canvas (no WebGL —
// runs in all three engines). The engine decodes every frame before painting,
// so the paint assertion polls generously for slow runners.

test.describe("cinematic showpiece", () => {
  test("canvas paints a real frame after decode", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const canvas = page.locator('canvas[role="img"]');
    await canvas.scrollIntoViewIfNeeded();
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const c = document.querySelector('canvas[role="img"]') as HTMLCanvasElement | null;
            const ctx = c?.getContext("2d");
            if (!c || !ctx) return -1;
            const { data } = ctx.getImageData(0, 0, c.width, Math.min(c.height, 200));
            let lit = 0;
            for (let i = 0; i < data.length; i += 4) {
              if (data[i + 3] > 0 && (data[i] > 8 || data[i + 1] > 8 || data[i + 2] > 8)) lit++;
            }
            return lit;
          }),
        { timeout: 30_000 },
      )
      .toBeGreaterThan(500);
  });

  test("reduced motion: all beats readable, nothing pinned", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Beat containers carry inline opacity; under reduced motion the engine
    // sets every one to 1 (visible). Playwright's toBeVisible() ignores
    // opacity, so assert computed style instead.
    await expect
      .poll(() =>
        page.evaluate(() =>
          ["Data, everywhere", "Structure emerges", "Intelligence"].map((t) => {
            const p = Array.from(document.querySelectorAll("p")).find(
              (el) => el.textContent === t,
            );
            return p ? getComputedStyle(p.parentElement as Element).opacity : "missing";
          }),
        ),
      )
      .toEqual(["1", "1", "1"]);
    // GSAP pinning wraps the trigger in .pin-spacer; reduced motion must never pin.
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
  });
});

test.describe("showpiece variants", () => {
  test("keystroke: chapters present + reduced motion shows all, no pin", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?show=keystroke", { waitUntil: "domcontentloaded" });
    for (const h of ["Data, everywhere", "Structure emerges", "Intelligence"]) {
      await expect(page.getByText(h, { exact: true })).toBeVisible();
    }
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
  });

  test("keyboard: canvas mounts with WebGL2, else fallback words show", async ({ page }) => {
    await page.goto("/?show=keyboard", { waitUntil: "domcontentloaded" });
    const hasWebgl2 = await page.evaluate(
      () => !!document.createElement("canvas").getContext("webgl2"),
    );
    if (hasWebgl2) {
      await expect(page.locator("section canvas").first()).toBeVisible({ timeout: 15_000 });
    } else {
      await expect(page.getByText("INTELLIGENCE", { exact: true })).toBeVisible();
    }
  });

  test("cinematic (default) still renders the frame canvas", async ({ page }) => {
    await page.goto("/?show=cinematic", { waitUntil: "domcontentloaded" });
    await expect(page.locator('canvas[role="img"]')).toBeVisible({ timeout: 20_000 });
  });
});
