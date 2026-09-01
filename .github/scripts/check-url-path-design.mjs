#!/usr/bin/env node
// src/app配下の各ルート(page.tsx/route.tsを持つディレクトリ)のURLパスが、
// Future Architect社「Webフロントエンド開発ガイドライン」のURLパス設計原則の
// うち機械的に検証可能な範囲に準拠しているかを検査する。
//
// 検査対象(constitution.md Core Principle XIV):
//   1. 静的セグメントはkebab-case(例: test-dashboard)
//   2. 動的セグメント([id]等)はlowerCamelCase
//   3. リソースを表す名詞ではなく操作を表す動詞(search/get/delete等)のセグメント禁止
//
// 対象外(ADR-0024参照): リソース名の複数形判定(辞書が必要で誤検知率が高い)、
// クエリパラメータの命名・利用方法(自然文の意味理解が必要)、SEO観点の階層設計。

import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const APP_ROOT = path.join(ROOT, "src/app");

const KEBAB_CASE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const LOWER_CAMEL_CASE = /^[a-z][a-zA-Z0-9]*$/;
// ガイドラインが明示する「操作を表す動詞」の例(search/get/delete)に加え、
// 同種の一般的なCRUD動詞を含める。new/edit/confirmはガイドライン自身が画面の
// アクションを表すパスとして許可しているため対象外。
const FORBIDDEN_VERBS = new Set([
  "search",
  "get",
  "delete",
  "fetch",
  "list",
  "update",
  "create",
  "remove",
]);

function findRouteDirs(dir, base = "") {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findRouteDirs(full, path.join(base, entry)));
    } else if (entry === "page.tsx" || entry === "route.ts") {
      results.push(base);
    }
  }
  return results;
}

// 1セグメント分の検査。違反があればエラーメッセージの配列を返す(無ければ空配列)。
function checkSegment(segment) {
  // ルートグループ (name) はURLに現れないため検査不要。
  if (segment.startsWith("(") && segment.endsWith(")")) return [];

  const dynamicMatch = segment.match(/^\[{1,2}\.{0,3}([^\]]+)\]{1,2}$/);
  if (dynamicMatch) {
    const paramName = dynamicMatch[1];
    if (!LOWER_CAMEL_CASE.test(paramName)) {
      return [`動的パラメータ "${segment}" はlowerCamelCaseにしてください(例: [orderId])`];
    }
    return [];
  }

  const errors = [];
  if (!KEBAB_CASE.test(segment)) {
    errors.push(`セグメント "${segment}" はkebab-caseにしてください(例: test-dashboard)`);
  }
  if (FORBIDDEN_VERBS.has(segment)) {
    errors.push(
      `セグメント "${segment}" は操作を表す動詞です。リソースを表す名詞を使ってください`
    );
  }
  return errors;
}

function main() {
  const routeDirs = findRouteDirs(APP_ROOT);
  const errors = [];

  for (const routeDir of routeDirs) {
    const segments = routeDir.split(path.sep).filter(Boolean);
    for (const segment of segments) {
      for (const message of checkSegment(segment)) {
        errors.push(`src/app/${routeDir || "(root)"}: ${message}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error("URLパス設計の違反を検出しました:\n");
    for (const e of errors) console.error(`  - ${e}`);
    console.error(
      "\nFuture Architect社Webフロントエンド開発ガイドライン「URLパス設計」章を参照してください。"
    );
    process.exit(1);
  }

  console.log("URLパス設計の違反はありません。");
}

main();
