#!/usr/bin/env node
// 業務単位のユニットテスト・E2Eテストの実施件数/合格件数と、ユニットテストの
// カバレッジ集計を dashboard-data/summary.json に書き出す(/test-dashboard ページが
// 読む)。あわせて、Jestが生成したHTMLカバレッジレポートを public/coverage-report/ に
// コピーする(Next.jsが静的配信できる場所はpublic/配下のみのため)。
//
// このスクリプト自身はJest/Playwrightを実行しない。事前に
//   npx jest --coverage --json --outputFile=coverage/jest-results.json
//   PLAYWRIGHT_JSON_OUTPUT_NAME=playwright-report/results.json npx playwright test --reporter=json
// を実行しておくこと(`npm run dashboard:data` はこの2つとこのスクリプトをまとめて
// 実行する)。
//
// 新しい業務を追加したときは dashboard-data/business-map.json に
// { "<業務ディレクトリ名>": { "unitPathPrefixes": [...], "e2eFiles": [...] } } を
// 追記する。どちらのマッピングにも一致しないテストファイルは「未分類」として
// 集計される(取りこぼしが起きても黙って消えず、必ず可視化されるようにするため)。
// unitPathPrefixesは、テスト結果の集計(テストファイルのパス)と、テスト密度算出用の
// step数集計(対応する実装ファイルのパス)の両方に使う。実装ファイルとそのテスト
// ファイルが同じディレクトリ・同じファイル名幹を共有する前提のため、両方にマッチする
// prefixにすること(例: "src/lib/backend"はbackend.ts/backend.test.ts両方にマッチする)。

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import sloc from "sloc";

const ROOT = path.resolve(import.meta.dirname, "..");
const BUSINESS_MAP_PATH = path.join(ROOT, "dashboard-data", "business-map.json");
const JEST_RESULTS_PATH = path.join(ROOT, "coverage", "jest-results.json");
const COVERAGE_SUMMARY_PATH = path.join(ROOT, "coverage", "coverage-summary.json");
const PLAYWRIGHT_RESULTS_PATH = path.join(ROOT, "playwright-report", "results.json");
const OUTPUT_PATH = path.join(ROOT, "dashboard-data", "summary.json");
const COVERAGE_HTML_SRC = path.join(ROOT, "coverage");
const COVERAGE_HTML_DEST = path.join(ROOT, "public", "coverage-report");
const UNMAPPED_BUSINESS = "未分類";
// テスト密度(NTTDATA用語: テスト密度 = テスト件数 ÷ step数(Ks))の分母となるstep数の
// 集計対象。jest.config.tsのcollectCoverageFromと同じ範囲(テストファイル自身は除く)に
// 揃える — ずれるとカバレッジと密度で「テスト対象」の定義が食い違ってしまうため。
const STEP_COUNT_ROOTS = [path.join(ROOT, "src", "app"), path.join(ROOT, "src", "lib")];

function loadJson(filePath, label) {
  if (!existsSync(filePath)) {
    throw new Error(
      `${label}が見つかりません: ${filePath}\n先に対応するテストを実行してください(README代わりにこのファイルの先頭コメント参照)。`
    );
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function emptyCounts() {
  return { total: 0, passed: 0, failed: 0 };
}

function addCounts(target, passed, failed) {
  target.total += passed + failed;
  target.passed += passed;
  target.failed += failed;
}

function resolveUnitBusiness(businessMap, absoluteTestFilePath) {
  const relPath = path.relative(ROOT, absoluteTestFilePath).split(path.sep).join("/");
  for (const [business, def] of Object.entries(businessMap)) {
    if ((def.unitPathPrefixes ?? []).some((prefix) => relPath.startsWith(prefix))) {
      return business;
    }
  }
  return UNMAPPED_BUSINESS;
}

function resolveE2eBusiness(businessMap, specFileName) {
  for (const [business, def] of Object.entries(businessMap)) {
    if ((def.e2eFiles ?? []).includes(specFileName)) {
      return business;
    }
  }
  return UNMAPPED_BUSINESS;
}

function aggregateUnit(businessMap, jestResults) {
  const overall = emptyCounts();
  const byBusiness = {};

  for (const fileResult of jestResults.testResults) {
    const business = resolveUnitBusiness(businessMap, fileResult.name);
    const passed = fileResult.assertionResults.filter((a) => a.status === "passed").length;
    const failed = fileResult.assertionResults.filter((a) => a.status !== "passed").length;

    addCounts(overall, passed, failed);
    byBusiness[business] ??= emptyCounts();
    addCounts(byBusiness[business], passed, failed);
  }

  return { overall, byBusiness };
}

function collectPlaywrightSpecs(suite, specs) {
  for (const spec of suite.specs ?? []) {
    specs.push(spec);
  }
  for (const child of suite.suites ?? []) {
    collectPlaywrightSpecs(child, specs);
  }
}

function aggregateE2e(businessMap, playwrightResults) {
  const overall = emptyCounts();
  const byBusiness = {};
  const specs = [];

  for (const suite of playwrightResults.suites ?? []) {
    collectPlaywrightSpecs(suite, specs);
  }

  for (const spec of specs) {
    const business = resolveE2eBusiness(businessMap, spec.file);
    const passed = spec.ok ? 1 : 0;
    const failed = spec.ok ? 0 : 1;

    addCounts(overall, passed, failed);
    byBusiness[business] ??= emptyCounts();
    addCounts(byBusiness[business], passed, failed);
  }

  return { overall, byBusiness };
}

function collectSourceFiles(dir) {
  const results = [];
  if (!existsSync(dir)) {
    return results;
  }
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectSourceFiles(full));
      continue;
    }
    if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) {
      results.push(full);
    }
  }
  return results;
}

// 「実行可能ステップ数」= 空行・コメント行を除いた行数(NTTDATAのstep数の一般的な定義)。
// slocはJSX/TSXのコメント判定も含めて数えられるため、素朴な正規表現による除外より正確。
// 業務単位のテスト密度を出すため、ファイル単位でstep数を業務に振り分けて積み上げる。
function computeStepCountByBusiness(businessMap) {
  const overall = { total: 0 };
  const byBusiness = {};

  for (const root of STEP_COUNT_ROOTS) {
    for (const file of collectSourceFiles(root)) {
      const ext = file.endsWith(".tsx") ? "tsx" : "ts";
      const code = readFileSync(file, "utf8");
      const steps = sloc(code, ext).source;
      const business = resolveUnitBusiness(businessMap, file);

      overall.total += steps;
      byBusiness[business] = (byBusiness[business] ?? 0) + steps;
    }
  }

  return { overall: overall.total, byBusiness };
}

function densityFor(stepCount, count) {
  const kStep = stepCount / 1000;
  return { count, density: kStep > 0 ? count / kStep : 0 };
}

function computeTestDensity(stepCountByBusiness, unit, e2e) {
  const businesses = new Set([
    ...Object.keys(stepCountByBusiness.byBusiness),
    ...Object.keys(unit.byBusiness),
    ...Object.keys(e2e.byBusiness),
  ]);

  const byBusiness = {};
  for (const business of businesses) {
    const stepCount = stepCountByBusiness.byBusiness[business] ?? 0;
    const unitCount = unit.byBusiness[business]?.total ?? 0;
    const e2eCount = e2e.byBusiness[business]?.total ?? 0;
    byBusiness[business] = {
      stepCount,
      kStep: stepCount / 1000,
      unit: densityFor(stepCount, unitCount),
      e2e: densityFor(stepCount, e2eCount),
      total: densityFor(stepCount, unitCount + e2eCount),
    };
  }

  const overallStepCount = stepCountByBusiness.overall;
  const overall = {
    stepCount: overallStepCount,
    kStep: overallStepCount / 1000,
    unit: densityFor(overallStepCount, unit.overall.total),
    e2e: densityFor(overallStepCount, e2e.overall.total),
    total: densityFor(overallStepCount, unit.overall.total + e2e.overall.total),
  };

  return { overall, byBusiness };
}

function copyCoverageHtmlReport() {
  if (!existsSync(COVERAGE_HTML_SRC)) {
    return false;
  }
  cpSync(COVERAGE_HTML_SRC, COVERAGE_HTML_DEST, {
    recursive: true,
    filter: (src) => !src.endsWith("jest-results.json") && !src.endsWith("coverage-final.json"),
  });
  return true;
}

function main() {
  const businessMap = loadJson(BUSINESS_MAP_PATH, "業務マッピング");
  const jestResults = loadJson(JEST_RESULTS_PATH, "Jest結果");
  const coverageSummary = loadJson(COVERAGE_SUMMARY_PATH, "カバレッジ集計");
  const playwrightResults = loadJson(PLAYWRIGHT_RESULTS_PATH, "Playwright結果");

  const unit = aggregateUnit(businessMap, jestResults);
  const e2e = aggregateE2e(businessMap, playwrightResults);
  const stepCountByBusiness = computeStepCountByBusiness(businessMap);
  const testDensity = computeTestDensity(stepCountByBusiness, unit, e2e);

  const summary = {
    generatedAt: new Date().toISOString(),
    unit: {
      overall: unit.overall,
      byBusiness: unit.byBusiness,
      coverage: coverageSummary.total,
    },
    e2e,
    testDensity,
  };

  mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(summary, null, 2) + "\n", "utf8");

  const copiedHtmlReport = copyCoverageHtmlReport();

  console.log(`書き出し: ${path.relative(ROOT, OUTPUT_PATH)}`);
  console.log(`  unit: ${unit.overall.passed}/${unit.overall.total} passed`);
  console.log(`  e2e:  ${e2e.overall.passed}/${e2e.overall.total} passed`);
  console.log(
    `  step数: ${testDensity.overall.stepCount} (${testDensity.overall.kStep.toFixed(3)} KStep) / ` +
      `テスト密度: unit ${testDensity.overall.unit.density.toFixed(2)}件/KStep, ` +
      `e2e ${testDensity.overall.e2e.density.toFixed(2)}件/KStep, ` +
      `合計 ${testDensity.overall.total.density.toFixed(2)}件/KStep`
  );
  console.log(
    copiedHtmlReport
      ? `  HTMLカバレッジレポートを ${path.relative(ROOT, COVERAGE_HTML_DEST)} にコピーしました`
      : "  HTMLカバレッジレポートのコピーをスキップしました(coverage/が見つかりません)"
  );
}

main();
