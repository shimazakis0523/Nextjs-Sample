import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import sonarjs from "eslint-plugin-sonarjs";
import testingLibrary from "eslint-plugin-testing-library";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // テストが実装の詳細(State・内部関数)ではなくUIの振る舞いを検証することを
    // 強制する(constitution.md Core Principle XVI)。Jestユニット/コンポーネント
    // テストのみが対象(Playwright E2Eはtesting-libraryを使わないため対象外)。
    files: ["**/*.test.{ts,tsx}"],
    ...testingLibrary.configs["flat/react"],
  },
  // 静的コード品質ルール(constitution.md Core Principle XI)。sonarjsの推奨セット
  // (279ルール)を丸ごと有効化すると初回導入時のノイズが大きすぎるため、複雑度・
  // 重複コードという具体的な観点に絞って個別に有効化する。
  {
    plugins: { sonarjs },
    rules: {
      complexity: ["error", 10],
      "max-depth": ["error", 4],
      "max-params": ["error", 4],
      "sonarjs/cognitive-complexity": ["error", 15],
      "sonarjs/no-duplicate-string": ["warn", { threshold: 3 }],
      "sonarjs/no-identical-functions": "error",
    },
  },
  {
    // テストファイルは同じ入力データ・セレクタ文字列を複数ケースで繰り返すのが
    // 普通のスタイルであり、定数化を求めても品質向上にならない(むしろ可読性が
    // 落ちる)ため、この観点のみ対象外にする。複雑度・重複関数の検査は維持する。
    files: ["**/*.test.{ts,tsx}", "e2e/**/*.spec.ts"],
    rules: {
      "sonarjs/no-duplicate-string": "off",
    },
  },
  // eslint-config-nextのデフォルトignoreを上書きする。
  globalIgnores([
    // eslint-config-nextのデフォルトignore:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Jestのカバレッジ生成物(サードパーティ製のHTMLレポート同梱JS)。
    // public/coverage-report/はcoverage/からコピーされた同一の生成物。
    "coverage/**",
    "public/coverage-report/**",
  ]),
]);

export default eslintConfig;
