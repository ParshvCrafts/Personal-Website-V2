import { test, expect } from "@playwright/test";

test("homepage renders validated data counts", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /data pipeline OK/i })).toBeVisible();
  await expect(page.getByTestId("count-projects")).toHaveText("Projects: 12");
  await expect(page.getByTestId("count-courses")).toHaveText("Courses: 13");
  await expect(page.getByTestId("count-research")).toHaveText("Research: 5");
});
