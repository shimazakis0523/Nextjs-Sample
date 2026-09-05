#!/usr/bin/env node
// doc/common/品質不具合台帳.md をパースして dashboard-data/defect-log.json を
// 生成する(/test-dashboard ページが読む)。台帳自体は人が手で追記する
// マークダウン文書であり、このスクリプトは可視化用の構造化データへの変換のみを行う
// (summary.jsonのJest/Playwright/ESLint結果と違い、テスト実行を前提としない)。

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LEDGER_PATH = path.join(ROOT, "doc", "common", "品質不具合台帳.md");
const OUTPUT_PATH = path.join(ROOT, "dashboard-data", "defect-log.json");

const REQUIRED_FIELDS = ["発見日", "種別", "発見区分", "発見契機", "原因分類", "対象ファイル", "修正内容", "横展開", "根拠"];

// 品質不具合の定義(doc/common/品質不具合台帳.md、constitution.md Core Principle XVIII)は
// プログラムバグまたは設計書のエラーのみ。この2値以外は台帳の記載ミスとして弾く。
const ALLOWED_TYPES = ["プログラムバグ", "設計書のエラー"];

// "実施。..." / "対象外。..." のように先頭の一語(句点まで)をステータスとして
// 抜き出し、残りを詳細として扱う。
function parseLateralCheck(text) {
  const match = text.match(/^(実施|対象外|未実施)。?\s*([\s\S]*)$/);
  if (!match) {
    return { status: "不明", detail: text };
  }
  return { status: match[1], detail: match[2] };
}

// "用語・表記の誤り / ドキュメント構造のルール漏れ" のように " / " 区切りで
// 複数の原因分類にまたがるエントリは、両方の集計に加算する。
function parseCategories(text) {
  return text.split(" / ").map((s) => s.trim());
}

function parseEntry(id, title, body) {
  const fields = {};
  const lines = body.split("\n");
  let currentKey = null;

  for (const line of lines) {
    const match = line.match(/^\*\*(.+?)\*\*:\s*(.*)$/);
    if (match) {
      currentKey = match[1];
      fields[currentKey] = match[2];
    } else if (currentKey && line.trim()) {
      // 前の行の続き(折り返された説明文)。
      fields[currentKey] += line.trim();
    }
  }

  const missing = REQUIRED_FIELDS.filter((key) => !(key in fields));
  if (missing.length > 0) {
    throw new Error(`${id}: 必須フィールドが欠落しています: ${missing.join(", ")}`);
  }
  if (!ALLOWED_TYPES.includes(fields["種別"])) {
    throw new Error(
      `${id}: 種別は${ALLOWED_TYPES.join("または")}のいずれかである必要があります(実際: ${fields["種別"]})`
    );
  }

  return {
    id,
    title,
    discoveredAt: fields["発見日"],
    type: fields["種別"],
    discoveryKind: fields["発見区分"],
    discoveryDetail: fields["発見契機"],
    categories: parseCategories(fields["原因分類"]),
    files: fields["対象ファイル"].split(",").map((s) => s.trim()),
    fix: fields["修正内容"],
    lateralCheck: parseLateralCheck(fields["横展開"]),
    reference: fields["根拠"],
  };
}

function parseLedger(content) {
  const entries = [];
  const headingPattern = /^## (BUG-\d+): (.+)$/gm;
  const matches = [...content.matchAll(headingPattern)];

  for (let i = 0; i < matches.length; i++) {
    const [, id, title] = matches[i];
    const bodyStart = matches[i].index + matches[i][0].length;
    const bodyEnd = i + 1 < matches.length ? matches[i + 1].index : content.length;
    const body = content.slice(bodyStart, bodyEnd);
    entries.push(parseEntry(id, title, body));
  }

  return entries;
}

function countBy(entries, selector) {
  const counts = {};
  for (const entry of entries) {
    for (const key of selector(entry)) {
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return counts;
}

function summarize(entries) {
  return {
    total: entries.length,
    byType: countBy(entries, (e) => [e.type]),
    byCategory: countBy(entries, (e) => e.categories),
    byDiscoveryKind: countBy(entries, (e) => [e.discoveryKind]),
    byLateralCheckStatus: countBy(entries, (e) => [e.lateralCheck.status]),
  };
}

function main() {
  const content = readFileSync(LEDGER_PATH, "utf8");
  const entries = parseLedger(content);

  const output = {
    generatedAt: new Date().toISOString(),
    entries,
    summary: summarize(entries),
  };

  mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n", "utf8");

  console.log(`書き出し: ${path.relative(ROOT, OUTPUT_PATH)}`);
  console.log(`  件数: ${output.summary.total}`);
  console.log(`  種別別: ${JSON.stringify(output.summary.byType)}`);
  console.log(`  原因分類別: ${JSON.stringify(output.summary.byCategory)}`);
  console.log(`  発見区分別: ${JSON.stringify(output.summary.byDiscoveryKind)}`);
  console.log(`  横展開状況: ${JSON.stringify(output.summary.byLateralCheckStatus)}`);
}

main();
