# ADR-0025: 品質不具合台帳の新設と、原因分類・横展開状況の可視化

## ステータス

Accepted (2026-09-01)

## コンテキスト

このプロジェクトはこれまで、新しいハーネス(コンポーネントテストカバレッジ・
カバレッジ閾値・ESLint品質ルール・Spectral・jest-axe・eslint-plugin-testing-library
等)を導入するたびに、既に実装済みのコードや文書の中から実際の不具合を見つけ、
その都度ADRに「発見した経緯」と「修正内容」を記録してきた(ADR-0011, 0019, 0021,
0022, 0023, 0024)。Todo編集機能の実装完了確認でも、`check-openapi-contract`
スキルが`doc/API仕様書/Backend/openapi.yaml`の`PUT /todos/{id}`定義漏れを検出した。

ユーザーから、これらの発見を構造化して記録し、(1)似た原因のバグが他にも
潜んでいないかの横展開チェック結果、(2)原因分析を起点にした品質点検の結果、
を可視化する仕組みを作れないかという依頼があった。

## 決定

### 1. `doc/common/品質不具合台帳.md`を新設

過去のADRから実際に見つかった不具合を遡及的に洗い出し、BUG-001〜BUG-009として
記録した。各エントリは発見日・発見区分(統制語彙)・発見契機(自由記述)・
原因分類(統制語彙)・対象ファイル・修正内容・横展開(同じ原因が他に無いかの
確認結果)・根拠(ADRへのリンク、無い場合はコミット)を持つ。

原因分類・発見区分は、自由記述の説明文とは別に機械集計可能な統制語彙のフィールド
として分離した(自由記述だけだと、原因分類が実質1件ずつ異なる文字列になり
集計できないため)。

### 2. `scripts/generate-defect-log-data.mjs`を新設

台帳をパースして`dashboard-data/defect-log.json`を生成する。既存の
`generate-test-dashboard-data.mjs`と異なり、Jest/Playwright/ESLintの実行結果に
依存せず台帳のみから生成できるため、独立したスクリプトとした
(`npm run defect-log:data`、`dashboard:data`からも呼ばれる)。

### 3. `/test-dashboard`に「品質不具合分析」セクションを追加

原因分類別・発見区分別の件数内訳、横展開の実施状況、個別エントリの一覧表を表示する。
`dashboard-data/defect-log.json`が無い場合は、既存の`summary.json`と同じ流儀で
セットアップ手順を案内する(ページ全体を止めない — このセクションだけが表示
されない状態になる)。

### 4. サンドボックス検証で新たに発見した不具合(BUG-010)

`dashboard-data/defect-log.json`もCIが自動コミットする対象に加えるため、
`.github/workflows/test-dashboard.yml`のトリガー(`paths-ignore`)を見直した。
既存の`paths-ignore: ["dashboard-data/**"]`は、生成物である`summary.json`だけで
なく手動保守ファイルの`business-map.json`まで含んでしまい、
`business-map.json`だけを変更するpush(他のファイルが1つも変わらない場合)では
ワークフロー自体が起動しないという実際の不具合を発見した。`git log`で確認した
ところ過去3回の変更はいずれも他ファイルと同時だったため一度も表面化していな
かった(潜伏バグ)。`paths-ignore`を生成物のパス(`dashboard-data/summary.json`・
`dashboard-data/defect-log.json`)だけに限定して修正した。横展開として他の
ワークフロー(`spec-consistency.yml`)にpaths-ignore/pathsの指定が無いことを
確認し、同種の問題が他に無いことを確認した。BUG-010として台帳に追加した。

### 5. Core Principle XVIII(Defect Discovery Ledger and Lateral Check)を新設

新規ハーネス・Lintルールの導入や人によるレビューが、既に実装済みのコード/文書に
実際の不具合を見つけた場合、修正が完了したとみなす前に品質不具合台帳.mdへの
記録と横展開確認を行うことを求める。ADR-0004のモックアップ必須化・
2026-09-01追記のGitHub Issue必須化と同じ理由(「実際に不具合が見つかったか」は
人の判断が必要で機械的に検出できない)により、CIゲートではなくSkillの手順・
constitution.mdの明文化によるソフトゲートとする。

## 影響

- `doc/common/品質不具合台帳.md`を新規作成(BUG-001〜BUG-010)。
- `scripts/generate-defect-log-data.mjs`を新規作成。`package.json`に
  `defect-log:data`スクリプトを追加、`dashboard:data`から呼ぶよう変更。
- `src/app/test-dashboard/page.tsx`に「品質不具合分析」セクションを追加。
- `.github/workflows/test-dashboard.yml`の`paths-ignore`を修正
  (BUG-010、生成物のパスのみに限定)し、`dashboard-data/defect-log.json`も
  コミット対象に追加。
- constitution.mdにCore Principle XVIII(Defect Discovery Ledger and Lateral
  Check)を追加(v2.21.0)。

## 追記(2026-09-02): 「品質不具合」の定義を明確化し、対象外エントリを除外

初回ロールアウト(v2.21.0)は「実装済みのコード/文書に見つかった実際の不具合」
という緩い基準でBUG-001〜BUG-010の10件を記録した。ユーザーから「品質不具合は
プログラムバグまたは設計書のエラーです」という定義そのものの指摘があった。

この定義を既存10件に適用したところ、約半数が実際には「コード/文書は仕様通りに
動作しているが、それを検証・強制する仕組み(テスト・Lintルール)がまだ無かった」
というハーネス整備のギャップであり、プログラムバグでも設計書のエラーでもないと
判明した:

| 除外したエントリ | 除外理由 |
|---|---|
| BUG-001(3コンポーネントのユニットテスト欠如) | テスト未整備。コード自体の誤動作ではない |
| BUG-002(route.tsのバリデーション0%カバレッジ) | 未テストの分岐であり、バリデーションロジック自体は正しかった |
| BUG-004(check-openapi-bff-routes.mjsの複雑度超過) | スクリプトは正しく動作しており、保守性ルール未導入の指摘 |
| BUG-006(トップページの表記誤り+PD工程のハーネス欠如) | 用語表記の食い違いとハーネス欠如の指摘であり、動作不良でも設計書の誤りでもない |
| BUG-008(testing-library推奨に反するテストの書き方) | テストは合格しており、書き方の推奨違反(保守性)の指摘 |

一方、以下5件は定義に明確に該当するため台帳に残した:

| 残したエントリ | 分類 | 理由 |
|---|---|---|
| BUG-003(jest.config.tsのmoduleNameMapper欠落) | プログラムバグ | 実行時importを使うと実際にモジュール解決が失敗する、実際に発現する不具合 |
| BUG-005(OpenAPI YAMLの規約不適合) | 設計書のエラー | 契約文書そのものの誤り |
| BUG-007(axe-coreのempty-table-header違反) | プログラムバグ | スクリーンリーダー利用者に実際に発生するアクセシビリティ上の不具合 |
| BUG-009(Backend openapi.yamlのPUT欠落) | 設計書のエラー | 契約文書の欠落 |
| BUG-010(test-dashboard.ymlのpaths-ignore不備) | プログラムバグ | 該当条件のpushでワークフローが実際に起動しない、実際に発現する不具合 |

`doc/common/品質不具合台帳.md`冒頭にこの定義を明文化し、該当しない5件を台帳から
削除した(BUG番号は欠番のまま維持し、振り直さない — ADR等からの既存参照を保つ
ため)。constitution.md Core Principle XVIIIの本文もこの定義に合わせて改訂した
(v2.22.0)。

## 影響(追記分)

- `doc/common/品質不具合台帳.md`に品質不具合の定義を明記し、BUG-001, 002, 004,
  006, 008を削除(BUG-003, 005, 007, 009, 010の5件のみ残存)。
- constitution.md Core Principle XVIIIの定義文を改訂(v2.22.0)。
