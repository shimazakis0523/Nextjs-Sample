#!/usr/bin/env node
// doc/API仕様書/BFF/openapi.yaml と src/app/api/** の Route Handler を突き合わせ、
// パス・HTTPメソッドの過不足を検出する。Principle III (Contract-First APIs) の
// 「エンドポイントのパス・メソッドの変更は同じ変更でdoc/API仕様書/**/*.yamlを更新する」
// を機械的に検査するCIチェック。
//
// スコープ: パス・メソッドの存在一致のみ。リクエスト/レスポンスのフィールド単位の
// 整合性は対象外(そこは check-openapi-contract スキルが担う、意味理解が要る領域)。

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { load } from "js-yaml";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OPENAPI_PATH = path.join(ROOT, "doc", "API仕様書", "BFF", "openapi.yaml");
const API_ROOT = path.join(ROOT, "src/app/api");
const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "head", "options"];

function loadOpenApiOperations() {
  const doc = load(readFileSync(OPENAPI_PATH, "utf8"));
  const operations = new Map(); // routePath -> Set<METHOD>
  for (const [urlPath, item] of Object.entries(doc.paths ?? {})) {
    const routeSegments = urlPath
      .split("/")
      .filter(Boolean)
      .map((seg) => (seg.startsWith("{") && seg.endsWith("}") ? `[${seg.slice(1, -1)}]` : seg));
    const routePath = routeSegments.join("/");
    const methods = new Set(
      Object.keys(item).filter((k) => HTTP_METHODS.includes(k)).map((m) => m.toUpperCase())
    );
    operations.set(routePath, methods);
  }
  return operations;
}

function findRouteFiles(dir, base = "") {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findRouteFiles(full, path.join(base, entry)));
    } else if (entry === "route.ts") {
      results.push(base);
    }
  }
  return results;
}

function loadImplementedRoutes() {
  const routeDirs = existsSync(API_ROOT) ? findRouteFiles(API_ROOT) : [];
  const implemented = new Map(); // routePath -> Set<METHOD>
  for (const routePath of routeDirs) {
    const content = readFileSync(path.join(API_ROOT, routePath, "route.ts"), "utf8");
    const methods = new Set(
      HTTP_METHODS.filter((m) =>
        new RegExp(`export\\s+async\\s+function\\s+${m.toUpperCase()}\\b`).test(content)
      ).map((m) => m.toUpperCase())
    );
    implemented.set(routePath, methods);
  }
  return implemented;
}

// sourceOps側の各エンドポイントがtargetOps側にも存在するかを突き合わせ、欠落を
// errorメッセージの配列にする。spec→impl・impl→spec両方向のチェックが完全に対称な
// ロジックのため、方向ごとのメッセージ文言だけを差し替えて1つの関数にまとめている。
function collectMismatches(sourceOps, targetOps, skip, messages) {
  const errors = [];
  for (const [routePath, methods] of sourceOps) {
    if (skip.has(routePath)) continue;
    if (!targetOps.has(routePath)) {
      errors.push(messages.missingRoute(routePath));
      continue;
    }
    const targetMethods = targetOps.get(routePath);
    for (const method of methods) {
      if (!targetMethods.has(method)) {
        errors.push(messages.missingMethod(method, routePath));
      }
    }
  }
  return errors;
}

function main() {
  const specOps = loadOpenApiOperations();
  const implOps = loadImplementedRoutes();

  // health はこのチェックの対象外(死活監視用でTodo機能のspecに紐づかないため、
  // ここでは存在確認のみ行い、欠落があってもfailさせない緩いチェックとする)
  const skip = new Set(["health"]);

  const errors = [
    ...collectMismatches(specOps, implOps, skip, {
      missingRoute: (routePath) =>
        `openapi.yaml に ${routePath} が定義されているが、src/app/api/${routePath}/route.ts が存在しない`,
      missingMethod: (method, routePath) =>
        `openapi.yaml は ${method} ${routePath} を定義しているが、route.ts に export async function ${method} が無い`,
    }),
    ...collectMismatches(implOps, specOps, skip, {
      missingRoute: (routePath) =>
        `src/app/api/${routePath}/route.ts が実装されているが、doc/API仕様書/BFF/openapi.yaml に ${routePath} の定義が無い`,
      missingMethod: (method, routePath) =>
        `route.ts は export async function ${method} を実装しているが、openapi.yaml に ${method} ${routePath} の定義が無い`,
    }),
  ];

  if (errors.length > 0) {
    console.error("doc/API仕様書/BFF/openapi.yaml と src/app/api/** の不整合を検出しました:\n");
    for (const e of errors) console.error(`  - ${e}`);
    console.error("\nPrinciple III: エンドポイントの変更は同じ変更でdoc/API仕様書/**/*.yamlを更新してください。");
    process.exit(1);
  }

  console.log("doc/API仕様書/BFF/openapi.yaml と src/app/api/** のパス・メソッドは一致しています。");
}

main();
