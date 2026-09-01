#!/usr/bin/env bash
# src/app配下の全画面ルート(page.tsx)に、jest-axeによる自動アクセシビリティ検証
# (axe() + toHaveNoViolations)が対応するテストファイルに含まれているかを検査する。
# check-detailed-design-doc.mjs/check-openapi-bff-routesと同じモデルで、
# PRでの変更有無によらず全件を検査する。
#
# constitution.md Core Principle XV (Automated Accessibility Test Coverage) が根拠。
set -euo pipefail

fail=0

while IFS= read -r page_file; do
  [ -z "$page_file" ] && continue
  test_file="${page_file%.tsx}.test.tsx"

  if [ ! -f "$test_file" ]; then
    echo "NG: $page_file に対応するテスト $test_file がありません。" >&2
    fail=1
    continue
  fi

  if ! grep -q 'axe(' "$test_file" || ! grep -q 'toHaveNoViolations' "$test_file"; then
    echo "NG: $test_file にjest-axeによるアクセシビリティ検証(axe() + toHaveNoViolations)がありません。" >&2
    fail=1
  fi
done < <(find src/app -name "page.tsx" | sort)

if [ "$fail" -ne 0 ]; then
  echo "    各画面ルートのpage.test.tsxに以下を追加してください:" >&2
  echo '    const { container } = render(<Page />);' >&2
  echo '    expect(await axe(container)).toHaveNoViolations();' >&2
  exit 1
fi

echo "全画面ルートにアクセシビリティ自動検証があります。"
