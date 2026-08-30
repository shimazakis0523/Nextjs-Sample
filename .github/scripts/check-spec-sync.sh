#!/usr/bin/env bash
# spec.md を変更したPRが、対応するe2e-test-spec.md(常に)とscreen-flow.md
# (画面遷移を記述する行を変更した場合)を同じPRで追従させているかを検査する。
#
# constitution.md Development Workflow:
#   - screens/*/spec.md のユースケース定義/画面入出力仕様/処理仕様の変更は
#     update-e2e-test-spec スキルでe2e-test-spec.mdを追従させること
#   - screens/*/spec.md の処理仕様(遷移先を記述する行)の変更は
#     update-screen-flow-diagram スキルでscreen-flow.mdを追従させること
#
# 引数: base_ref (例: origin/main)
set -euo pipefail

BASE_REF="${1:?usage: check-spec-sync.sh <base_ref>}"

CHANGED_FILES="$(git diff --name-only "${BASE_REF}...HEAD")"

fail=0

while IFS= read -r spec_file; do
  [ -z "$spec_file" ] && continue

  screen_dir="$(dirname "$spec_file")"
  feature_dir="$(echo "$screen_dir" | sed -E 's#(specs/[^/]+)/.*#\1#')"
  e2e_test_spec_file="$screen_dir/e2e-test-spec.md"
  screen_flow_file="$feature_dir/screen-flow.md"

  if ! echo "$CHANGED_FILES" | grep -qxF "$e2e_test_spec_file"; then
    echo "NG: $spec_file を変更していますが $e2e_test_spec_file が同じ変更に含まれていません。" >&2
    echo "    update-e2e-test-spec スキルで e2e-test-spec.md を再生成してください。" >&2
    fail=1
  fi

  # 処理仕様表の行のうち、他画面のspec.mdへのMarkdownリンクを含む行(=遷移先を
  # 記述している行)が変更されていれば、screen-flow.md の追従も必須とする。
  nav_line_changed="$(git diff "${BASE_REF}...HEAD" -- "$spec_file" \
    | grep -E '^[+-]\|' \
    | grep -E '\]\([^)]*\.\./[^)]*spec\.md' || true)"

  if [ -n "$nav_line_changed" ] && ! echo "$CHANGED_FILES" | grep -qxF "$screen_flow_file"; then
    echo "NG: $spec_file の画面遷移(処理仕様)を変更していますが $screen_flow_file が同じ変更に含まれていません。" >&2
    echo "    update-screen-flow-diagram スキルで screen-flow.md を再生成してください。" >&2
    fail=1
  fi
done < <(echo "$CHANGED_FILES" | grep -E '^specs/[^/]+/screens/[^/]+/spec\.md$' || true)

if [ "$fail" -ne 0 ]; then
  exit 1
fi

echo "spec.md の変更と e2e-test-spec.md / screen-flow.md の追従に不整合はありません。"
