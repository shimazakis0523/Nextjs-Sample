#!/usr/bin/env node
// src/app配下のReactコンポーネントファイルが、Future Architect社「Webフロントエンド
// 開発ガイドライン」コンポーネント設計章の命名規則(コンポーネントファイルはPascalCase)
// に準拠しているかを検査する。
//
// constitution.md Core Principle XVI (Component & Test Authoring Lint Conventions)。
// props/コールバックのcamelCaseは、TypeScript/JSXの構文上ほぼ必然的にそうなる
// (非camelCaseのprop名は書けなくはないが実質使われない)ため、独立した機械チェックは
// 追加しない — ADR-0024参照。

import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const APP_ROOT = path.join(ROOT, "src/app");
const PASCAL_CASE = /^[A-Z][a-zA-Z0-9]*$/;

// Next.js App Routerがファイル名で意味を持たせる特殊ファイル。フレームワークの
// エントリポイントであり、このプロジェクト固有のコンポーネントではないため対象外。
const SPECIAL_FILENAMES = new Set([
  "page",
  "layout",
  "template",
  "loading",
  "error",
  "global-error",
  "not-found",
  "default",
]);

function findComponentFiles(dir, base = "") {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findComponentFiles(full, path.join(base, entry)));
    } else if (entry.endsWith(".tsx") && !entry.endsWith(".test.tsx")) {
      const name = entry.slice(0, -".tsx".length);
      if (!SPECIAL_FILENAMES.has(name)) {
        results.push(path.join(base, entry));
      }
    }
  }
  return results;
}

function main() {
  const files = findComponentFiles(APP_ROOT);
  const errors = files
    .filter((file) => !PASCAL_CASE.test(path.basename(file, ".tsx")))
    .map((file) => `src/app/${file}: コンポーネントファイル名はPascalCaseにしてください`);

  if (errors.length > 0) {
    console.error("コンポーネント命名規則の違反を検出しました:\n");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log("コンポーネント命名規則の違反はありません。");
}

main();
