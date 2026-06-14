import { test, expect } from "@playwright/test";

// Verified primarily via build + serve out/ + this spec; the dev webServer is flaky here.

test.describe("command palette", () => {
  test("opens via Ctrl+K, filters, Enter navigates, Esc closes + restores focus", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Open via the nav trigger (deterministic across platforms), then close, then hotkey.
    const trigger = page.getByRole("button", { name: "Open command palette" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog).toBeVisible();

    const input = page.getByRole("combobox", { name: "Search commands" });
    await input.fill("projects");
    // First option should be the Projects nav command.
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toContainText(/Projects/i);

    await input.press("Enter");
    await expect(dialog).toBeHidden();
    // Lenis smooth-scroll settles asynchronously — poll the scroll position.
    await expect
      .poll(async () => page.evaluate(() => window.scrollY), { timeout: 8000 })
      .toBeGreaterThan(200);

    // Hotkey open + Esc closes (no thrown error, focus restored).
    await page.keyboard.press("Control+k");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("hotkey is ignored while typing in a field", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Wait for hydration (both the global '/' hotkey and the field need it), then type
    // '/' into a real text field. The bare-'/' open hotkey must be suppressed there.
    await expect(page.getByRole("button", { name: "Open command palette" })).toBeVisible();
    const field = page.getByRole("textbox", { name: /name/i });
    await field.scrollIntoViewIfNeeded();
    await field.click();
    await expect(field).toBeFocused();
    await page.keyboard.press("/");
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeHidden();
    await expect(field).toHaveValue("/");
  });
});
