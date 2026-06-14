import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  // The static server (serving the prebuilt out/) has no per-route compile cost,
  // so it tolerates parallel browsers far better than `next dev` did. Retries
  // recover any residual infra flake; test logic is deterministic in isolation.
  workers: process.env.CI ? 2 : 4,
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
