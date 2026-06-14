import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  // Cap concurrency at 2. The home page is heavy (axe scans 4 themes, 3D canvas,
  // smooth-scroll RAF) and WebKit in particular times out creating pages — and a
  // WebKit worker can hang on teardown — when 3 projects fight over more workers.
  // Every spec is deterministic per-project in isolation; retries cover residual flake.
  workers: 2,
  retries: process.env.CI ? 2 : 1,
  reporter: "list",
  use: { baseURL, trace: "on-first-retry" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    // Serve the static export; `npm run test:e2e` builds out/ first. Dev server is
    // unusable here (Turbopack panics on globals.css under the spaces-in-path).
    command: "npm run serve:out",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
