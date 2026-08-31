# ADR-0021: 静的コード解析(ESLint品質ルール)の導入とCIゲート・可視化

## ステータス

Accepted (2026-08-31)

## コンテキスト

ユーザーから、静的コード解析・Linterによるコードの品質チェックを導入し、可視化も
したいという依頼があった。確認したところ、方針は以下の通り:

- 導入する解析: ESLintの品質ルール強化(既存の`eslint-config-next`はNext.jsの
  ベストプラクティス中心で、複雑度・重複コードのような品質観点は持たない)
- 適用方針: CIでブロックするゲートも即時導入する

`eslint-plugin-sonarjs`はESLint 9(flat config)に対応しているが、`recommended`
設定は279ルールと非常に多く、初回導入でまとめて有効化すると導入コストに見合わない
ノイズが出る。そのため、複雑度・重複コードという具体的な観点に絞って個別に
有効化する方針とした。

## 決定

1. **有効化するルール**(`eslint.config.mjs`):
   - `complexity`(サイクロマティック複雑度上限10、ESLint本体)
   - `max-depth`(ネスト深さ上限4)
   - `max-params`(パラメータ数上限4)
   - `sonarjs/cognitive-complexity`(認知的複雑度上限15)
   - `sonarjs/no-duplicate-string`(同一文字列リテラルの3回以上の重複を警告。
     ただしテストファイル(`**/*.test.{ts,tsx}`・`e2e/**/*.spec.ts`)は対象外
     ―― 同じ入力データ・セレクタ文字列を複数ケースで繰り返すのは通常のテスト
     スタイルであり、定数化を強制しても品質向上にならないため)
   - `sonarjs/no-identical-functions`(内容が同一の関数の重複を検出)

2. **ルール導入で実際に見つかった違反を修正する**(閾値を緩めて回避しない):
   `.github/scripts/check-openapi-bff-routes.mjs`の`main`関数が、
   複雑度13(上限10)・認知的複雑度23(上限15)で違反した。spec→impl・impl→spec
   の2方向チェックがほぼ完全に対称なロジックを別々に書いていたことが原因。
   `collectMismatches`という共通ヘルパーに抽出して解消した。抽出したヘルパーが
   最初5つの位置引数を取る形になり、それ自体が`max-params`(上限4)に抵触した
   ため、2つのメッセージ生成コールバックを`messages`オブジェクトにまとめて
   4引数に収めた。挙動が変わっていないことは、既存の一致ケースに加えて
   サンドボックス環境で「メソッド欠落」「ルート欠落」「実装側にのみ存在する
   ルート」の3パターンを再現して確認した。

3. **CIゲート**: `.github/workflows/spec-consistency.yml`に`code-quality`
   ジョブを追加し、`npm run lint:ci`(`eslint --max-warnings 0`)をPRごとに
   実行する。エラー0件・警告0件が必須。

4. **可視化**: `npm run lint:json`(`eslint --format json --output-file
   coverage/eslint-results.json`)の出力を`scripts/generate-test-dashboard-data.mjs`
   が集計し、`dashboard-data/summary.json`の`codeQuality`フィールド
   (全体/業務単位/ルール単位のエラー・警告件数)として`/test-dashboard`に表示する。
   業務単位の内訳は、テスト密度で既に使っている`business-map.json`の
   `unitPathPrefixes`(実装ファイルのパスにマッチする)をそのまま再利用できた。

## 影響

- `package.json`に`eslint-plugin-sonarjs`を追加(既存の`@stoplight/prism-cli`
  由来の脆弱性とは無関係、新規追加による脆弱性なし)。
- `package.json`に`lint:ci`(ゲート用)・`lint:json`(可視化用)スクリプトを追加。
- `.github/scripts/check-openapi-bff-routes.mjs`を複雑度低減のためリファクタリング
  (挙動は不変)。
- constitution.mdにCore Principle XI(Static Code Quality Gate)を追加(v2.16.0)。
- `.github/workflows/spec-consistency.yml`に`code-quality`ジョブを追加(PRごとに
  ESLintエラー・警告0件を強制)。
- `/test-dashboard`に「コード品質(静的解析)」セクションを追加。
