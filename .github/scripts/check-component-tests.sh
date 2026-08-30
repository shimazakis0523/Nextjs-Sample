#!/usr/bin/env bash
# PRが新規/変更したReactコンポーネントファイル(src/app/**/*.tsx)に、対応するユニット
# テスト(同名の.test.tsx)が存在するかを検査する。Next.js App Router自身が要求する
# 特殊ファイル名(page.tsx等)は、このプロジェクトが書いたコンポーネントではないため対象外。
#
# constitution.md Core Principle VII (Component Test Coverage) が根拠。
#
# 引数: base_ref (例: origin/main)
set -euo pipefail

BASE_REF="${1:?usage: check-component-tests.sh <base_ref>}"

CHANGED_FILES="$(git diff --name-only "${BASE_REF}...HEAD")"

# Next.js App Routerがファイル名で意味を持たせる特殊ファイル。フレームワークの
# エントリポイントであり、このプロジェクト固有のコンポーネントではないため対象外とする。
is_special_filename() {
  case "$(basename "$1" .tsx)" in
    page | layout | template | loading | error | global-error | not-found | default) return 0 ;;
    *) return 1 ;;
  esac
}

fail=0

while IFS= read -r file; do
  [ -z "$file" ] && continue
  is_special_filename "$file" && continue

  test_file="${file%.tsx}.test.tsx"
  if [ ! -f "$test_file" ]; then
    echo "NG: $file にコンポーネントの変更がありますが、対応するユニットテスト $test_file がありません。" >&2
    fail=1
  fi
done < <(echo "$CHANGED_FILES" | grep -E '^src/app/.*\.tsx$' | grep -v '\.test\.tsx$' || true)

if [ "$fail" -ne 0 ]; then
  echo "    @testing-library/reactでコンポーネントのprops/コールバック契約と成功/失敗パスをテストしてください。" >&2
  exit 1
fi

echo "コンポーネントの変更に対するユニットテストの不足はありません。"
