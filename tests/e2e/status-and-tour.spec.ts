import { test, expect } from "@playwright/test";

test.describe("status widget + guided tour", () => {
  test("footer shows availability + Berkeley time", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(page.getByText(/Open to|Building/i).first()).toBeVisible();
    // Berkeley time renders a PT/PST/PDT zone label (word-bounded to avoid
    // matching SCRIPT/INPUT etc.).
    await expect(page.getByText(/\b(PDT|PST|PT)\b/).first()).toBeVisible({ timeout: 5000 });
  });

  test("first-visit prompt appears, starts the tour, and does not reappear", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const prompt = page.getByRole("region", { name: "Take a tour" });
    await expect(prompt).toBeVisible({ timeout: 5000 });
    await prompt.getByRole("button", { name: "Start" }).click();
    await expect(page.getByRole("dialog", { name: "Site tour" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Site tour" })).toBeHidden();
    // Reload → prompt gone (seen persisted).
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("region", { name: "Take a tour" })).toBeHidden();
  });

  test("the ⌘K 'Take the tour' command starts the tour", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.keyboard.press("Control+k");
    const input = page.getByRole("combobox", { name: "Search commands" });
    await input.fill("tour");
    await input.press("Enter");
    await expect(page.getByRole("dialog", { name: "Site tour" })).toBeVisible();
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
  });
});
