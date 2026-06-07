import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility (Axe-core)", () => {
  test("homepage should not have automatically detectable accessibility violations", async ({ page }) => {
    await page.goto("/");
    // Wait for the page to be ready (e.g. preloader finished)
    await page.waitForTimeout(1000); // Wait for preloader to finish if any
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("mobile menu should be accessible", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Desktop does not show mobile menu button");
    await page.goto("/");
    await page.waitForTimeout(1000);
    
    // Open the mobile menu
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(500); // Wait for animation
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
