#!/usr/bin/env node
// doc/common/AP方式設計書(フロントエンド編).mdの「非機能方針」節が、Future Architect社
// 「Webフロントエンド開発ガイドライン」のうちプロジェクト全体で一度だけ決定すべき
// 4項目(対応ブラウザ/サポートバージョン・国際化対応・ダークモードの状態保持・OGP)を
// 「未決定」のまま放置していないかを検査する。値の正しさではなく、決定が記録されて
// いるか(プレースホルダのままでないか)だけを見る、後続工程に進むための受け入れ基準。
//
// constitution.md Core Principle XVII (Frontend Non-Functional Policy Documented)。

import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const DOC_PATH = path.join(ROOT, "doc/common/AP方式設計書(フロントエンド編).md");

const REQUIRED_HEADINGS = [
  "対応ブラウザ/サポートバージョン",
  "国際化対応",
  "ダークモードの状態保持",
  "OGP",
];

const PLACEHOLDER_PATTERN = /未定|TBD|検討中|TODO/i;

function parseSections(lines) {
  const sections = [];
  let current = null;
  for (const line of lines) {
    const match = line.match(/^### (.+)$/);
    if (match) {
      if (current) sections.push(current);
      current = { heading: match[1].trim(), body: [] };
    } else if (current) {
      current.body.push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}

function main() {
  const content = readFileSync(DOC_PATH, "utf8");
  const lines = content.split("\n");
  const sections = parseSections(lines);
  const errors = [];

  for (const heading of REQUIRED_HEADINGS) {
    const section = sections.find((s) => s.heading === heading);
    if (!section) {
      errors.push(`「${heading}」の決定事項セクションがありません`);
      continue;
    }
    const body = section.body.join("\n").trim();
    if (body.length === 0) {
      errors.push(`「${heading}」の決定事項が空です`);
    } else if (PLACEHOLDER_PATTERN.test(body)) {
      errors.push(`「${heading}」の決定事項が未決定のプレースホルダのままです: ${body}`);
    }
  }

  if (errors.length > 0) {
    console.error(
      "doc/common/AP方式設計書(フロントエンド編).mdの非機能方針が未決定です:\n"
    );
    for (const e of errors) console.error(`  - ${e}`);
    console.error(
      "\n後続の詳細設計・実装に進む前に、これらの項目を決定してドキュメントに記録してください。"
    );
    process.exit(1);
  }

  console.log("フロントエンド非機能方針はすべて決定済みです。");
}

main();
