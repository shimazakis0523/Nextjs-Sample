#!/usr/bin/env node
// doc/フロントエンド設計書/<業務>/詳細設計書.md が、constitution.md Core Principle XIII
// (Detailed Design Document Structural Conformance)が定める構造を満たしているかを検査する。
//
// 検査する観点:
// 1. セクション構成が ["登場するコンポーネントと関係", "Project Structure"] または
//    ["概要", "登場するコンポーネントと関係", "Project Structure"] のいずれかに完全一致する
//    (この順序で、過不足なく)。
// 2. 「登場するコンポーネントと関係」セクションの内容が空・省略記載でない場合、
//    ```mermaid フェンスが、最初の`### `サブセクション(ファイルごとの役割説明)より前に
//    現れる(図ファースト)。
// 3. 「登場するコンポーネントと関係」内の各`### `サブセクションは、見出し直後の最初の
//    非空行として役割の説明を持つ(見出しの直後がいきなり次の見出しや空行のまま終わらない)。
//
// 意図的に対象外とした観点(doc/common/adr/0023-detailed-design-doc-harness.md参照):
// - 「概要」セクション内の画面一覧表が実際のユースケース記述_*.mdと過不足なく対応しているか
// - 「登場するコンポーネントと関係」の図が実際のprops/callback/fetch関係と一致しているか
// - props/callbackのエッジラベルが型シグネチャを含んでいるか(constitution.md本文が要求する
//   内容だが、自由形式のMermaid記法の意味を検証するには自然言語理解が必要で、単純な
//   テキスト処理では高い誤検知率になる)
// これらは人のレビューに委ねる。

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "doc/フロントエンド設計書";
const TAIL_SECTIONS = ["登場するコンポーネントと関係", "Project Structure"];
const ALLOWED_SECTION_SETS = [TAIL_SECTIONS, ["概要", ...TAIL_SECTIONS]];
const FORBIDDEN_HEADINGS = new Set([
  "Summary",
  "Technical Context",
  "Constitution Check",
  "Complexity Tracking",
  "Documentation (this feature)",
  "Documentation",
]);
const OMISSION_MARKER = "省略";

function findDetailedDesignDocs() {
  const files = [];
  for (const entry of readdirSync(ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = join(ROOT, entry.name, "詳細設計書.md");
    if (statSync(path, { throwIfNoEntry: false })) {
      files.push(path);
    }
  }
  return files;
}

function parseSections(lines) {
  const sections = [];
  lines.forEach((line, i) => {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) sections.push({ name: m[1], startLine: i });
  });
  sections.forEach((s, i) => {
    s.endLine = i + 1 < sections.length ? sections[i + 1].startLine : lines.length;
  });
  return sections;
}

function checkSectionSet(sections, path, errors) {
  const names = sections.map((s) => s.name);
  const matches = ALLOWED_SECTION_SETS.some(
    (allowed) => allowed.length === names.length && allowed.every((n, i) => n === names[i])
  );
  if (matches) return;

  const forbiddenFound = names.filter((n) => FORBIDDEN_HEADINGS.has(n));
  if (forbiddenFound.length > 0) {
    errors.push(
      `${path}: 廃止済みのセクション(${forbiddenFound.join("、")})が含まれています。` +
        `詳細設計書は「概要」(任意)・「登場するコンポーネントと関係」・` +
        `「Project Structure」のみを持てます。`
    );
    return;
  }
  errors.push(
    `${path}: セクション構成が想定と異なります(実際: ${names.join(" > ") || "(見出しなし)"})。` +
      `想定: 「登場するコンポーネントと関係」> 「Project Structure」` +
      `(先頭に任意で「概要」を追加可)。`
  );
}

function isEffectivelyOmitted(sectionLines) {
  const text = sectionLines.join("\n").trim();
  return text.length === 0 || text.includes(OMISSION_MARKER);
}

function checkComponentSection(lines, section, path, errors) {
  const sectionLines = lines.slice(section.startLine + 1, section.endLine);
  if (isEffectivelyOmitted(sectionLines)) return;

  const mermaidIndex = sectionLines.findIndex((l) => l.trim().startsWith("```mermaid"));
  const subheadingIndexes = [];
  sectionLines.forEach((l, i) => {
    if (/^###\s+/.test(l)) subheadingIndexes.push(i);
  });

  if (mermaidIndex === -1) {
    errors.push(
      `${path}: 「登場するコンポーネントと関係」にmermaid図がありません` +
        `(省略する場合は「(省略)」等、省略である旨を明記してください)。`
    );
  } else if (subheadingIndexes.length > 0 && mermaidIndex > subheadingIndexes[0]) {
    errors.push(
      `${path}: 「登場するコンポーネントと関係」で、mermaid図がファイルごとの` +
        `サブセクション(### )より後に置かれています。図ファースト(全体像→個別詳細)`+
        `の順序にしてください。`
    );
  }

  for (const idx of subheadingIndexes) {
    const heading = sectionLines[idx].replace(/^###\s+/, "").trim();
    let bodyStart = idx + 1;
    while (bodyStart < sectionLines.length && sectionLines[bodyStart].trim() === "") {
      bodyStart++;
    }
    const firstBodyLine = sectionLines[bodyStart];
    if (firstBodyLine === undefined || /^#{1,6}\s+/.test(firstBodyLine)) {
      errors.push(
        `${path}: 「${heading}」サブセクションに役割の説明(見出し直後の本文)が` +
          `ありません。`
      );
    }
  }
}

function checkFile(path) {
  const errors = [];
  const lines = readFileSync(path, "utf8").split("\n");
  const sections = parseSections(lines);

  checkSectionSet(sections, path, errors);

  const componentSection = sections.find((s) => s.name === "登場するコンポーネントと関係");
  if (componentSection) {
    checkComponentSection(lines, componentSection, path, errors);
  }

  return errors;
}

function main() {
  const files = findDetailedDesignDocs();
  const allErrors = files.flatMap(checkFile);

  if (allErrors.length > 0) {
    for (const err of allErrors) {
      console.error(`NG: ${err}`);
    }
    console.error(
      "    constitution.md Core Principle XIII / doc/common/adr/0023-detailed-design-doc-harness.md を参照してください。"
    );
    process.exit(1);
  }

  console.log(`詳細設計書の構造チェック: 対象${files.length}件、違反なし。`);
}

main();
