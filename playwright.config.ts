import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// このサンドボックス開発環境には固定パスにChromiumがプリインストール済み(ネットワーク
// ダウンロード不要)。GitHub Actionsランナーにはこれが無いため、そちらでは
// `npx playwright install --with-deps chromium` がPlaywright管理下のブラウザを用意する。
// ローカルのChromiumが存在する場合のみexecutablePathを固定する。
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
