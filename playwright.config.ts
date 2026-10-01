import { defineConfig, devices } from "@playwright/test";
import { E2E_BASE_URL, E2E_PORT, TEST_DATABASE_URL } from "./e2e/test-env";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: E2E_BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // Always a dedicated server on its own port and database, never the dev server
    // CI tests the production build; locally a dev server is faster to start.
    command: isCI
      ? `npm run start -- -p ${E2E_PORT}`
      : `npm run dev -- -p ${E2E_PORT}`,
    url: E2E_BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    // These take precedence over values in .env
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      BETTER_AUTH_URL: E2E_BASE_URL,
      // Separate build folder so it can run while `npm run dev` is running
      ...(isCI ? {} : { NEXT_DIST_DIR: ".next-e2e" }),
    },
  },
});
