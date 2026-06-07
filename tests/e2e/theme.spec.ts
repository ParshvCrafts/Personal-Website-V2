import { test, expect } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test("theme switcher changes data-theme on /preview", async ({ page }) => {
  await page.goto("/preview", { waitUntil: "domcontentloaded" });
  const html = page.locator("html");
  // default theme
  await expect(html).toHaveAttribute("data-theme", "midnight");
  // Retry the FIRST interaction until the switcher island has hydrated: its onClick
  // is only attached after React hydration, and chromium can reach the click before
  // that (domcontentloaded fires pre-hydration). The inner timeout (2500ms) clears the
  // measured worst-case switch latency (~873ms on WebKit under parallel load) so a
  // hydrated click is never a false miss; once hydrated, later clicks stick.
  await expect(async () => {
    await page.getByRole("radio", { name: "Daylight" }).click();
    await expect(html).toHaveAttribute("data-theme", "daylight", { timeout: 2500 });
  }).toPass({ timeout: 15_000 });
  // switch to Manuscript
  await page.getByRole("radio", { name: "Manuscript" }).click();
  await expect(html).toHaveAttribute("data-theme", "manuscript");
  // switch to Neon (futuristic/tech)
  await page.getByRole("radio", { name: "Neon" }).click();
  await expect(html).toHaveAttribute("data-theme", "neon");
  // persists across reload (localStorage)
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "neon");
});

test("theme switcher supports keyboard navigation", async ({ page }) => {
  await page.goto("/preview", { waitUntil: "domcontentloaded" });
  const html = page.locator("html");

  const midnight = page.getByRole("radio", { name: "Midnight" });
  // Wait for hydration before the first key interaction: focusing Midnight and
  // pressing ArrowRight is idempotent (always targets Daylight), so retry until
  // the keydown handler is attached (domcontentloaded fires pre-hydration). Inner
  // timeout clears WebKit's worst-case switch latency so a hydrated press never
  // false-misses.
  await expect(async () => {
    await midnight.focus();
    await midnight.press("ArrowRight");
    await expect(html).toHaveAttribute("data-theme", "daylight", { timeout: 2500 });
  }).toPass({ timeout: 15_000 });
  await expect(page.getByRole("radio", { name: "Daylight" })).toBeFocused();

  await page.getByRole("radio", { name: "Daylight" }).press("End");
  await expect(html).toHaveAttribute("data-theme", "neon");
  await expect(page.getByRole("radio", { name: "Neon" })).toBeFocused();
});
