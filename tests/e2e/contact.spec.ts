import { test, expect } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test.describe("Contact section", () => {
  test("renders heading, contact info, and form fields", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#contact");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText("Contact");
    await expect(section.getByText("parshvpatel_0910@berkeley.edu")).toBeVisible();
    await expect(section.getByText("(951) 599-3618")).toBeVisible();
    await expect(section.getByText("Berkeley, CA")).toBeVisible();
    await expect(section.getByRole("form", { name: /contact form/i })).toBeVisible();
  });

  test("submitting empty form shows validation errors", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#contact");
    const submitBtn = section.getByRole("button", { name: /send message/i });
    await expect(async () => {
      await submitBtn.click();
      // Target the visible field-error <p>, not the sr-only aria-live summary
      // <div> which concatenates every error string (would match twice).
      await expect(section.locator("p", { hasText: /name must be at least/i })).toBeVisible();
    }).toPass();
    await expect(section.locator("p", { hasText: /enter a valid email/i })).toBeVisible();
  });

  test("invalid email shows email error", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#contact");
    await section.getByLabel(/name/i).fill("Jane Doe");
    await section.getByLabel(/email/i).fill("notanemail");
    await section.getByLabel(/subject/i).fill("Hello there");
    await section.getByLabel(/message/i).fill("This is a long enough message.");
    await expect(async () => {
      await section.getByRole("button", { name: /send message/i }).click();
      await expect(section.locator("p", { hasText: /enter a valid email/i })).toBeVisible();
    }).toPass();
  });

  test("successful submission shows success overlay (mocked)", async ({ page }) => {
    await page.route("https://api.web3forms.com/submit", (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    await page.goto("/");
    const section = page.locator("#contact");

    // Fill + submit inside the retry: the form is a client island with
    // controlled inputs, so a fill that lands before hydration is reset to ""
    // when React commits. Re-running the fills on retry lands them post-hydration
    // (WebKit hydrates slowest under load). toPass stops once the overlay shows.
    await expect(async () => {
      await section.getByLabel(/name/i).fill("Jane Doe");
      await section.getByLabel(/email/i).fill("jane@example.com");
      await section.getByLabel(/subject/i).fill("Hello there");
      await section.getByLabel(/message/i).fill("This is a long enough message for the form.");
      await section.getByRole("button", { name: /send message/i }).click();
      await expect(section.getByText(/message sent/i)).toBeVisible();
    }).toPass();

    await expect(section.getByText(/i'll get back to you soon/i)).toBeVisible();
  });
});
