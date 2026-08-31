#!/usr/bin/env bash
# ユースケース記述_*.md / 画面定義書_*.md を変更したPRが、対応する
# E2E仕様書_*.md(本文が変わった場合)と画面遷移図.md(遷移先を記述する行を変更した場合)を
# 同じPRで追従させているかを検査する。
#
# constitution.md Development Workflow:
#   - 画面のユースケース記述・画面定義書の変更は update-e2e-test-spec スキルで
#     対応するE2E仕様書_*.mdを追従させること
#   - 画面定義書の処理仕様(遷移先を記述する行)の変更は
#     update-screen-flow-diagram スキルで画面遷移図.mdを追従させること
#
# ヘッダー(最初の "## " 見出しより前。画面ID・モックアップ・作成日・関連 等)のみの変更は
# 対象外とする。E2E仕様書はユースケース記述・画面定義書の「本文」(update-e2e-test-spec
# スキルが読む基本フロー・画面入出力仕様・処理仕様)からのみ機械導出されるため、ヘッダーの
# メタ情報(例: ADR-0004のモックアップURL)を変更してもテストケースは1つも変わらず、
# 追従先のE2E仕様書に反映しようがない(doc/common/adr/0004-mockup-first-requirements.md)。
#
# 引数: base_ref (例: origin/main)
set -euo pipefail

# design_fileの「本文」(最初の"## "見出し以降)をbase_refとHEADで比較し、差分があれば1を返す。
body_changed() {
  local design_file="$1"
  local old_body new_body
  old_body="$(git show "${BASE_REF}:${design_file}" 2>/dev/null | awk '/^## /{f=1} f' || true)"
  new_body="$(awk '/^## /{f=1} f' "$design_file" 2>/dev/null || true)"
  [ "$old_body" != "$new_body" ]
}

BASE_REF="${1:?usage: check-spec-sync.sh <base_ref>}"

CHANGED_FILES="$(git -c core.quotePath=false diff --name-only "${BASE_REF}...HEAD")"

fail=0

while IFS= read -r design_file; do
  [ -z "$design_file" ] && continue

  business_dir="$(dirname "$design_file")"
  filename="$(basename "$design_file")"
  # ファイル名は「(ユースケース記述|画面定義書)_<画面名>.md」の形式。画面名を取り出す。
  screen_name="$(echo "$filename" | sed -E 's#^(ユースケース記述|画面定義書)_(.*)\.md$#\2#')"
  screen_flow_file="$business_dir/画面遷移図.md"
  e2e_test_spec_file="$business_dir/E2E仕様書_${screen_name}.md"

  if body_changed "$design_file" && ! echo "$CHANGED_FILES" | grep -qxF "$e2e_test_spec_file"; then
    echo "NG: $design_file の本文を変更していますが $e2e_test_spec_file が同じ変更に含まれていません。" >&2
    echo "    update-e2e-test-spec スキルでE2E仕様書を再生成してください。" >&2
    fail=1
  fi

  # 処理仕様表の行のうち、他画面のユースケース記述へのMarkdownリンクを含む行
  # (=遷移先を記述している行)が変更されていれば、画面遷移図.md の追従も必須とする。
  nav_line_changed="$(git diff "${BASE_REF}...HEAD" -- "$design_file" \
    | grep -E '^[+-]\|' \
    | grep -E '\]\(\./ユースケース記述_' || true)"

  if [ -n "$nav_line_changed" ] && ! echo "$CHANGED_FILES" | grep -qxF "$screen_flow_file"; then
    echo "NG: $design_file の画面遷移(処理仕様)を変更していますが $screen_flow_file が同じ変更に含まれていません。" >&2
    echo "    update-screen-flow-diagram スキルで画面遷移図.md を再生成してください。" >&2
    fail=1
  fi
done < <(echo "$CHANGED_FILES" | grep -E '^doc/フロントエンド設計書/[^/]+/(ユースケース記述|画面定義書)_[^/]+\.md$' || true)

if [ "$fail" -ne 0 ]; then
  exit 1
fi

echo "ユースケース記述/画面定義書の変更とE2E仕様書/画面遷移図の追従に不整合はありません。"
