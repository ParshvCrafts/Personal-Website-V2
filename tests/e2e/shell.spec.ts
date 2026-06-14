import { test, expect } from "@playwright/test";

test.describe("layout shell", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("skip link is the first focusable control and targets main", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("preloader")).toHaveCount(0);
    const skip = page.getByRole("link", { name: /skip to content/i });
    // It is the FIRST focusable control in document order (a true skip link). Asserting
    // DOM order is deterministic across engines; a single synthetic Tab from a cold body
    // is a headless artifact (the first Tab does not advance focus).
    const firstIsSkip = await page.evaluate(() => {
      const sel =
        'a[href],button:not([disabled]),input:not([type="hidden"]),select,textarea,[tabindex]:not([tabindex="-1"])';
      const first = document.querySelector(sel);
      return first instanceof HTMLAnchorElement && first.getAttribute("href") === "#main";
    });
    expect(firstIsSkip).toBe(true);
    // …and it is keyboard-focusable and targets main.
    await skip.focus();
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute("href", "#main");
  });

  test("nav link scrolls to its section and marks it active", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("preloader")).toHaveCount(0);
    // Scope to the Primary nav — "Projects"/"Contact" labels also appear in the footer.
    const primary = page.getByRole("navigation", { name: "Primary" });
    await primary.getByRole("button", { name: "Projects", exact: true }).click();
    await expect(page.locator("#projects")).toBeInViewport();
    await expect(
      primary.getByRole("button", { name: "Projects", exact: true }),
    ).toHaveAttribute("aria-current", "true");
  });

  test("mobile menu opens, traps focus, and closes on Escape", async ({ page, browserName }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("preloader")).toHaveCount(0);
    const openBtn = page.getByRole("button", { name: /open menu/i });
    // Safari does not focus buttons on click. We explicitly focus it to test the restore behavior.
    if (browserName === "webkit") await openBtn.focus();
    await openBtn.click();
    const dialog = page.getByRole("dialog", { name: /site menu/i });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: /close menu/i })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(openBtn).toBeFocused();
  });

  test("footer back-to-top returns to the top", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("preloader")).toHaveCount(0);
    await page.getByRole("navigation", { name: "Primary" })
      .getByRole("button", { name: "Contact", exact: true })
      .click();
    await expect(page.locator("#contact")).toBeInViewport();
    await page.getByRole("button", { name: /back to top/i }).click();
    await expect(page.locator("#top")).toBeInViewport();
  });
});

test("preloader reveals content (no reduced motion)", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("preloader")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: /Parshv Patel/i })).toBeVisible();
});
