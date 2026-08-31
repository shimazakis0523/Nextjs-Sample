#!/usr/bin/env bash
# ガバナンス関連ファイル(Skill定義・constitution.md・ADR・CIワークフロー/スクリプト)を
# 変更するPRに、対応するGitHub Issueへの参照(#<番号>)がPR本文またはコミットメッセージに
# 最低1件あるかを検査する。
#
# 背景: 001-todo-dashboardのタスク(T001-T021)はGitHub Issueベースで追跡されていた(ADR-0002)
# 一方、その後のテスト導入・CI gate関連の作業はspeckit-tasks/speckit-taskstoissuesを経由せず
# 直接実装され、対応するIssueが一つも作られていなかった。ADR-0002が「speckit-implementを
# 経由しない変更には効かない」と明記していた抜け道が実際に起きた形であり、tasks.mdの
# Issue対応表に依存しない、PR単位の存在チェックとしてこのゲートを追加した。
#
# constitution.md Core Principle VIII (Governance Change Traceability) が根拠。
#
# 引数: base_ref (例: origin/main)
# 環境変数: PR_BODY (省略可。GitHub ActionsのgithubコンテキストからPR本文を渡す)
set -euo pipefail

BASE_REF="${1:?usage: check-governance-issue-ref.sh <base_ref>}"
PR_BODY="${PR_BODY:-}"

GOVERNANCE_PATH_PATTERN='^(\.claude/skills/|\.specify/memory/constitution\.md$|doc/common/adr/|\.github/workflows/|\.github/scripts/)'

CHANGED_FILES="$(git -c core.quotePath=false diff --name-only "${BASE_REF}...HEAD")"
GOVERNANCE_CHANGED="$(echo "$CHANGED_FILES" | grep -E "$GOVERNANCE_PATH_PATTERN" || true)"

if [ -z "$GOVERNANCE_CHANGED" ]; then
  echo "ガバナンス関連ファイルの変更はありません。"
  exit 0
fi

COMMIT_MESSAGES="$(git -c core.quotePath=false log --format=%B "${BASE_REF}..HEAD")"

if printf '%s\n%s\n' "$PR_BODY" "$COMMIT_MESSAGES" | grep -qE '#[0-9]+'; then
  echo "Issue参照を確認しました。"
  exit 0
fi

{
  echo "NG: 以下のガバナンス関連ファイルが変更されていますが、PR本文/コミットメッセージに"
  echo "Issue参照(#番号)が見つかりません:"
  echo "$GOVERNANCE_CHANGED" | sed 's/^/  - /'
  echo "    対応するGitHub Issueを作成し、PR本文かコミットメッセージに '#<Issue番号>' を"
  echo "    含めてください(例: Refs #42, Closes #42)。"
} >&2
exit 1
