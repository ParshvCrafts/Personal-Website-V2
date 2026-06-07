import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  // The dev server compiles routes on demand and is the bottleneck under load. Cap
  // concurrency so 3 browsers don't overwhelm it (the heavier Phase-4 home page —
  // portrait + animated canvas + preloader — pushed borderline tests past timeouts).
  // Retries recover any residual infra flake; the test logic is deterministic
  // (every test passes in isolation).
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 2 : 1,
  reporter: "list",
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    // P0 smoke targets the dev server; the QA phase will also smoke-test the static "out/" export.
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
