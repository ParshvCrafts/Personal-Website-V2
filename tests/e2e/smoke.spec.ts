import { test, expect } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test("homepage renders the shell and validated data counts", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("preloader")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: /Parshv Patel/i })).toBeVisible();
  // About stat counters render the build-time, Zod-validated loader counts.
  await expect(page.getByTestId("stat-projects")).toHaveText("12");
  await expect(page.getByTestId("stat-research")).toHaveText("5");
  // Academics: 9 = getCourses().filter(status==="completed").length
  await expect(
    page.locator('#academics').getByTestId('stat-courses')
  ).toHaveText('9');
  // Journey: heading present + active milestone rendered
  await expect(page.locator('#journey').getByRole('heading', { level: 2 })).toBeVisible();
  await expect(page.locator('#journey').getByText('Amazon SWE Intern')).toBeVisible();
  // Certifications: 10 = getCertifications().length (Zod-validated from certifications.json)
  await expect(
    page.locator('#certifications').getByTestId('stat-certs')
  ).toHaveText('10');
});
