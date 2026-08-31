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
  // カバレッジ充足性を機械的に判定するゲート。実測値(statements 99.35%、branches/
  // functions/lines 100%。layout.tsxのexport const metadataがistanbulの計測上
  // 未到達扱いになる既知の計測アーティファクト1件のみ残り、実際の分岐・ロジックは
  // 全て網羅済み)から小さな余裕を持たせている。
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95,
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
