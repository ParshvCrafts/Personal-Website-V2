import { test, expect } from "@playwright/test";

test("homepage renders the shell and validated data counts", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("preloader")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: /Parshv Patel/i })).toBeVisible();
  // Data-pipeline proof preserved in the About stub.
  await expect(page.getByTestId("count-projects")).toHaveText("Projects: 12");
  await expect(page.getByTestId("count-courses")).toHaveText("Courses: 13");
  await expect(page.getByTestId("count-research")).toHaveText("Research: 5");
});
