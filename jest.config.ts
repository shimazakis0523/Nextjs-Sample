import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e/"],
  collectCoverageFrom: ["src/app/**/*.{ts,tsx}", "src/lib/**/*.{ts,tsx}", "!**/*.test.{ts,tsx}"],
  coverageReporters: ["json-summary", "html", "text-summary"],
  // カバレッジ充足性を機械的に判定するゲート。100%は求めない(page.tsx/layout.tsxなど
  // 分岐のない宣言的なNext.js特殊ファイルまで含めた全体平均のため、それらが増えるだけで
  // 自然に下がる)。現在の実測値(statements/lines約90%, branches約92%, functions約91%)
  // から余裕を持たせつつ、実質的な退行は検知できる水準に設定している。
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  // tsconfig.jsonの"@/*"パスエイリアスをJestのモジュール解決にも反映する。next/jestは
  // 型のみのimport(import type)では素通りするため気づかれにくいが、実行時に評価される
  // importでは無いと解決に失敗する。
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default createJestConfig(config);
