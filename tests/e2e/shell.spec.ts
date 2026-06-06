import { test, expect } from "@playwright/test";

test.describe("layout shell", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("skip link is the first focusable control and targets main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /skip to content/i });
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute("href", "#main");
  });

  test("nav link scrolls to its section and marks it active", async ({ page }) => {
    await page.goto("/");
    // Scope to the Primary nav — "Projects"/"Contact" labels also appear in the footer.
    const primary = page.getByRole("navigation", { name: "Primary" });
    await primary.getByRole("button", { name: "Projects", exact: true }).click();
    await expect(page.locator("#projects")).toBeInViewport();
    await expect(
      primary.getByRole("button", { name: "Projects", exact: true }),
    ).toHaveAttribute("aria-current", "true");
  });

  test("mobile menu opens, traps focus, and closes on Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();
    const dialog = page.getByRole("dialog", { name: /site menu/i });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: /close menu/i })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: /open menu/i })).toBeFocused();
  });

  test("footer back-to-top returns to the top", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" })
      .getByRole("button", { name: "Contact", exact: true })
      .click();
    await expect(page.locator("#contact")).toBeInViewport();
    await page.getByRole("button", { name: /back to top/i }).click();
    await expect(page.locator("#top")).toBeInViewport();
  });
});

test("preloader reveals content (no reduced motion)", async ({ page }) => {
  await page.goto("/");
  // Content lives underneath the veil and becomes interactable within the bound.
  await expect(page.getByRole("heading", { level: 1, name: /Parshv Patel/i })).toBeVisible();
});
