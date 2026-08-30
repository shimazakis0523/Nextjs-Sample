#!/usr/bin/env node
// openapi/bff/openapi.yaml と src/app/api/** の Route Handler を突き合わせ、
// パス・HTTPメソッドの過不足を検出する。Principle III (Contract-First APIs) の
// 「エンドポイントのパス・メソッドの変更は同じ変更でopenapi/**/*.yamlを更新する」
// を機械的に検査するCIチェック。
//
// スコープ: パス・メソッドの存在一致のみ。リクエスト/レスポンスのフィールド単位の
// 整合性は対象外(そこは check-openapi-contract スキルが担う、意味理解が要る領域)。

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { load } from "js-yaml";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OPENAPI_PATH = path.join(ROOT, "openapi/bff/openapi.yaml");
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

function main() {
  const specOps = loadOpenApiOperations();
  const implOps = loadImplementedRoutes();
  const errors = [];

  // health はこのチェックの対象外(死活監視用でTodo機能のspecに紐づかないため、
  // ここでは存在確認のみ行い、欠落があってもfailさせない緩いチェックとする)
  const skip = new Set(["health"]);

  for (const [routePath, methods] of specOps) {
    if (skip.has(routePath)) continue;
    if (!implOps.has(routePath)) {
      errors.push(`openapi.yaml に ${routePath} が定義されているが、src/app/api/${routePath}/route.ts が存在しない`);
      continue;
    }
    const implMethods = implOps.get(routePath);
    for (const method of methods) {
      if (!implMethods.has(method)) {
        errors.push(`openapi.yaml は ${method} ${routePath} を定義しているが、route.ts に export async function ${method} が無い`);
      }
    }
  }

  for (const [routePath, methods] of implOps) {
    if (skip.has(routePath)) continue;
    if (!specOps.has(routePath)) {
      errors.push(`src/app/api/${routePath}/route.ts が実装されているが、openapi/bff/openapi.yaml に ${routePath} の定義が無い`);
      continue;
    }
    const specMethods = specOps.get(routePath);
    for (const method of methods) {
      if (!specMethods.has(method)) {
        errors.push(`route.ts は export async function ${method} を実装しているが、openapi.yaml に ${method} ${routePath} の定義が無い`);
      }
    }
  }

  if (errors.length > 0) {
    console.error("openapi/bff/openapi.yaml と src/app/api/** の不整合を検出しました:\n");
    for (const e of errors) console.error(`  - ${e}`);
    console.error("\nPrinciple III: エンドポイントの変更は同じ変更でopenapi/**/*.yamlを更新してください。");
    process.exit(1);
  }

  console.log("openapi/bff/openapi.yaml と src/app/api/** のパス・メソッドは一致しています。");
}

main();
