import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// This sandboxed dev environment ships a pre-installed Chromium at a fixed
// path (no network download needed); GitHub Actions runners don't have it,
// so `npx playwright install --with-deps chromium` supplies the managed
// browser there instead. Only pin executablePath when the local one exists.
const LOCAL_CHROMIUM = "/opt/pw-browsers/chromium";
const launchOptions = existsSync(LOCAL_CHROMIUM)
  ? { executablePath: LOCAL_CHROMIUM }
  : {};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions,
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
