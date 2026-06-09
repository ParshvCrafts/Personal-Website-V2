import { test, expect } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test.describe("Hobbies section", () => {
  test("renders heading, featured hobbies, and secondary grid", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#hobbies");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Beyond the Code");
    // exact:true matches the standalone card <h3>, not description text that
    // contains the same word (e.g. the Music/Anime blurbs).
    await expect(section.getByText("Varsity Tennis", { exact: true })).toBeVisible();
    await expect(section.getByText("Poetry & Creative Writing", { exact: true })).toBeVisible();
    await expect(section.getByText("Calisthenics", { exact: true })).toBeVisible();
    await expect(section.getByText("Hiking & Mountain Climbing", { exact: true })).toBeVisible();
    await expect(section.getByText("Music", { exact: true })).toBeVisible();
    await expect(section.getByText("Anime", { exact: true })).toBeVisible();
  });

  test("poetry card shows competition journey and poem link", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#hobbies");
    await expect(section.getByText("National (50+ states)")).toBeVisible();
    await expect(section.getByText(/The Pencil, the Rocket/i)).toBeVisible();
    const link = section.getByRole("link", { name: /view published poem/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "https://www.cfwcdeanzadistrict.org/general-7-1");
  });

  test("tennis card shows CBAADA award", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#hobbies");
    await expect(section.getByText("CBAADA Scholarship Winner")).toBeVisible();
  });
});
