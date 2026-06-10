import { test, expect } from "@playwright/test";

test.describe("About section", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("renders bio, stat counters, badges, awards, code, and documents", async ({ page }) => {
    await page.goto("/");
    const about = page.locator("#about");
    await expect(about.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(page.getByTestId("stat-projects")).toHaveText("12");
    await expect(page.getByTestId("stat-research")).toHaveText("5");
    await expect(page.getByTestId("stat-awards")).toHaveText("15");
    await expect(about.getByRole("heading", { name: /achievement badges/i })).toBeVisible();
    await expect(about.getByRole("heading", { name: /awards & recognition/i })).toBeVisible();
    await expect(about.getByRole("heading", { name: /code samples/i })).toBeVisible();
    await expect(about.getByRole("link", { name: /unofficial transcript/i })).toHaveAttribute(
      "href",
      "/documents/transcript.pdf",
    );
  });

  test("an award card opens an accessible modal; Escape closes it and restores focus", async ({
    page,
  }) => {
    await page.goto("/");
    const card = page.locator("#about").getByRole("button", { name: /amazon future engineer/i });
    // Retry the first interaction until the client island has hydrated.
    await expect(async () => {
      await card.click();
      await expect(page.getByRole("dialog")).toBeVisible();
    }).toPass();
    await expect(page.getByRole("dialog")).toContainText(/scholarship of up to \$40,000/i);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(card).toBeFocused();
  });

  test("the code showcase switches tabs via click and arrow keys", async ({ page }) => {
    await page.goto("/");
    const py = page.getByRole("tab", { name: "app.py" });
    const js = page.getByRole("tab", { name: "main.js" });
    await expect(async () => {
      await py.click();
      await expect(py).toHaveAttribute("aria-selected", "true");
    }).toPass();
    await expect(page.locator("#about").getByRole("tabpanel")).toContainText(/AtlasMind/);
    await py.press("ArrowRight");
    await expect(js).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#about").getByRole("tabpanel")).toContainText(/Portfolio Animation/);
  });

  test("reduced motion does not trap scrolling through About", async ({ page }) => {
    await page.goto("/");
    const beforeY = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 9000);
    await page.waitForTimeout(300);
    const afterY = await page.evaluate(() => window.scrollY);
    expect(afterY).toBeGreaterThan(beforeY + 600);
  });
});
