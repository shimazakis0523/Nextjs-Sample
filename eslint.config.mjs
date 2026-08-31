import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
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
