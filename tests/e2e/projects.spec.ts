import { test, expect } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test.describe("Projects section", () => {
  test("renders heading and 12 cards by default", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#projects");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Projects");
    const grid = section.getByTestId("projects-grid");
    await expect(grid).toBeVisible();
    const cards = grid.locator("[data-testid^='project-card-']");
    await expect(cards).toHaveCount(12);
  });

  test("filter 'Computer Vision' shows only cv projects", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#projects");
    const cvBtn = section.getByRole("tab", { name: /computer vision/i });
    await expect(async () => {
      await cvBtn.click();
      await expect(cvBtn).toHaveAttribute("aria-selected", "true");
    }).toPass();
    const cards = section.getByTestId("projects-grid").locator("[data-testid^='project-card-']");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(12);
  });

  test("filter 'All Projects' restores all 12 cards", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#projects");
    await expect(async () => {
      await section.getByRole("tab", { name: /computer vision/i }).click();
      await section.getByRole("tab", { name: /all projects/i }).click();
      const cards = section.getByTestId("projects-grid").locator("[data-testid^='project-card-']");
      await expect(cards).toHaveCount(12);
    }).toPass();
  });

  test("click project card opens modal with title and tech stack", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#projects");
    const firstCard = section.getByTestId("projects-grid").locator("[data-testid^='project-card-']").first();
    await expect(async () => {
      await firstCard.getByRole("button", { name: /open project details/i }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
    }).toPass();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("Escape closes project modal and restores focus", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#projects");
    const btn = section.getByTestId("projects-grid").locator("[data-testid^='project-card-']").first().getByRole("button", { name: /open project details/i });
    // Open via keyboard: WebKit does not focus a <button> on mouse click, so a
    // click would leave document.activeElement on <body> and the modal would
    // restore focus there instead of the opener. Keyboard activation focuses the
    // trigger first (the real a11y path) and also waits out hydration.
    await expect(async () => {
      await btn.focus();
      await btn.press("Enter");
      await expect(page.getByRole("dialog")).toBeVisible();
    }).toPass();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(btn).toBeFocused();
  });

  test("JARVIS panel is visible", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#projects");
    await expect(section.getByText("JARVIS AI Assistant")).toBeVisible();
    await expect(section.getByText(/currently building/i)).toBeVisible();
  });
});
