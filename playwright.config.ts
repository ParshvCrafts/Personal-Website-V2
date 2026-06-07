import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  // The dev server compiles routes on demand; under 3-browser parallel load a first
  // hit can stall navigation. Retries recover these infra flakes (the retry hits an
  // already-compiled route). Test logic is deterministic — they pass in isolation.
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
