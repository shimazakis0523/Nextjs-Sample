# ADR-0024: Future Architect社Webフロントエンド開発ガイドライン準拠方針の導入

## ステータス

Accepted (2026-09-01)

## コンテキスト

ユーザーからFuture Architect社「Webフロントエンド開発ガイドライン」
(`documents/forWebFrontend/web_frontend_guidelines.html`、ADR-0022が対象とした
OpenAPI規約とは別の、同社の文書)へのリンクが共有され、「実装方式のチェックを
このガイドラインへの準拠で見たい。採用アーキと乖離しすぎている等、チェック対象外に
すべき項目を教えてほしい。Next.js採用は前提であり、それ以外の候補を検討すべきでは
ない」という依頼があった。

対象ページはネットワークegressでブロックされていたため、GitHub上の原文
(`future-architect/arch-guidelines`リポジトリ、`documents/forWebFrontend/
web_frontend_guidelines.md`)をクローンして参照した。全22章を通読し、各章を
以下の観点で分類した。

### 除外すべき章(採用アーキと乖離、または前提が既に固定されている)

- **ホスティング方式**: AWS S3/CloudFront/ALB/Fargate/Lambdaの比較。本プロジェクトは
  Vercelデプロイが確定事項であり、検討し直す余地がない。
- **レンダリング方式**: CSR/SSR/SSGの選定フレームワーク。Next.jsのハイブリッド
  レンダリングが既に前提であり、「どう選ぶか」の議論はそもそも発生しない。
- **ルーティング**: ハッシュ/ヒストリーモードの比較。Next.jsが標準で決めるため
  選択の余地がない。
- **認証・認可**: このプロジェクトは認証機構自体を持たない。
- **オフライン対応(PWA)**: デモ規模に対して明らかに過剰。
- **CORS対応のローカル開発サーバー**: BFFパターンによりブラウザから見て同一
  オリジンになるため無関係。ADR-0022由来のSpectralハーネスが`options`メソッド
  自体を既に禁止している。
- **ディレクトリ構造(コンポーネント設計内)**: ガイドライン自身が「フレームワーク
  が推奨する規則・構成への準拠を推奨する」と明記しており、Next.js App Routerの
  規約が優先される。

上記のうちホスティング方式・レンダリング方式・ルーティングの3章が、ユーザーの
言う「Next.js以外の候補を検討すべきでない」に該当するアーキ選定フレームである。

### C/D/Eの3区分

除外対象を除いた残りを、ユーザーへの提案時に以下3区分に分類した。

- **C(ハーネス化する)**: URLパス設計、A11yテスト自動化、testing-library系
  ESLintルール、コンポーネント設計の命名規則。いずれも機械的に検証可能で、
  かつ現行コードが概ね準拠している(=既存資産を壊さずに導入できる)。
- **D(アーキテクチャドキュメントへの決定記録を、後続工程に進むための受け入れ
  基準にする)**: 対応ブラウザ/サポートバージョン、国際化対応要否、ダークモードの
  状態保持方式、OGP方針。いずれも一度だけ決めればよいプロジェクト全体の方針であり、
  値そのものを機械的に「正しい」と判定することはできない(製品判断)。
- **E(画一的ルール化せず、ガイドとして熟慮を促す)**: CSSクラス命名(kebab-case
  推奨 vs 本プロジェクトのCSS Modules camelCase規約)、バリデーションメッセージの
  文言原則、画面間パラメータ連携の方式選択、静的解析導入の運用哲学。いずれも
  「単一の正解を機械的に判定できない」か「プロジェクトの意図的な既存判断と単純
  比較すると誤検知になる」。

ユーザーはこの3区分をそのまま承認し、「Cはハーネス化する。Dはアーキテクチャ
ドキュメントに対するハーネスとして決定しているかチェックして、後続工程に進む
ための受け入れ基準にする。Eは画一的なルールを示すものではなく、ガイドに記載して
熟慮を促すような形にする」と明確な対応方針を指示した。

## 決定

### C: 新設したハーネス(4件)

1. **URLパス設計** — `.github/scripts/check-url-path-design.mjs`
   (`url-path-design`ジョブ)。`src/app`配下の全ルート生成ディレクトリ
   (page.tsx/route.tsを持つ)のセグメント名を検査する:
   - 静的セグメントはkebab-case
   - 動的セグメント(`[id]`等)はlowerCamelCase
   - 操作を表す動詞(search/get/delete/fetch/list/update/create/remove)禁止

   対象外: リソース名の複数形判定(辞書が必要で誤検知率が高い)、クエリ
   パラメータの命名・利用方法(自然文の意味理解が必要)。

2. **A11yテスト自動化** — `jest-axe`を導入し、`jest.setup.ts`に
   `toHaveNoViolations`マッチャーを登録。全画面ルート(`page.tsx`)の
   `page.test.tsx`に`axe()`アサーションを追加した。
   `.github/scripts/check-a11y-test-coverage.sh`(`a11y-test-coverage`
   ジョブ)が、全画面ルートに対応するアサーションの存在を検査する。

   **サンドボックス検証で判明した実際の違反**: `TodoList.tsx`と
   `mockup/page.tsx`の操作列ヘッダー`<th aria-label="操作"></th>`が、
   axe-coreの`empty-table-header`ルールに抵触した(`aria-label`だけでは
   支援技術によっては読み上げ対象にならないため)。ゲートを緩めず、
   `dashboard.module.css`に`.visuallyHidden`ユーティリティクラスを追加し、
   視覚的に隠しつつスクリーンリーダーには読み上げられる`<span>`に置き換えて
   修正した。

   対象外: Playwright/E2Eレベルでの重複したaxe-coreチェック(コンポーネント
   レベルのRTLテストが各画面の静的マークアップを既にカバーしており、E2E層
   での重複チェックはこのプロジェクトの規模に対して実行時間に見合わないと
   判断した)。

3. **testing-library系ESLintルール** — `eslint-plugin-testing-library`の
   `flat/react`推奨ルールセット(22ルール)を`**/*.test.{ts,tsx}`にのみ
   適用。既存の`code-quality`ジョブがそのまま検証する(新規CIジョブ不要)。

   **サンドボックス検証で判明した実際の違反**:
   - `TodoDashboard.test.tsx`: `waitFor` + `getByText`の代わりに
     `findByText`を使うべき(`prefer-find-by`)。修正後、`waitFor`の
     import が未使用になり、もう1箇所の`waitFor` + `queryByText` +
     `.not.toBeInTheDocument()`という消失待ちパターンも
     `waitForElementToBeRemoved`に置き換えた。
   - `mockup/page.test.tsx`・`page.test.tsx`: `.closest("section")`/
     `.closest("header")`という直接DOM走査(`no-node-access`)。
     `<section aria-labelledby>`は暗黙的にARIA `region`ロールを持つ
     ため、`screen.getByRole("region", { name: ... })`に置き換えた
     (`<header>`はトップレベルで暗黙的に`banner`ロールを持つ)。

   すべてゲートを緩めず、テストコード側を修正して解消した。

   対象外: props/コールバックのcamelCase専用チェック。TypeScript/JSXの
   構文上、非camelCaseのprop名を書く方が既に不自然であり、専用ルールを
   追加する限界効用が低いと判断した。

4. **コンポーネント設計の命名規則** — `.github/scripts/
   check-component-naming.mjs`(`component-naming`ジョブ)。`src/app`配下の
   コンポーネントファイル(Principle VIIと同じ特殊ファイル名除外)の
   ファイル名がPascalCaseであることを検査する。

### D: フロントエンド非機能方針ドキュメント化ハーネス

`doc/common/AP方式設計書(フロントエンド編).md`に「## 非機能方針」節を新設し、
以下4項目の決定事項を記録した:

| 項目 | 決定 |
|---|---|
| 対応ブラウザ/サポートバージョン | 主要ブラウザ最新2バージョン(`package.json`の`browserslist`で表現) |
| 国際化対応 | 対応しない(日本語のみ) |
| ダークモードの状態保持 | OS設定(`prefers-color-scheme`)への追従のみ、手動トグルなし |
| OGP | 設定しない |

`.github/scripts/check-frontend-nonfunctional-policy.mjs`
(`frontend-nonfunctional-policy`ジョブ)が、この4項目の決定事項セクションが
存在し、空でなく、「未定/TBD/検討中/TODO」等のプレースホルダのままでないかを
検査する。**値そのものの正しさではなく、決定が記録されているかだけを見る**
— ADR-0004のモックアップ合意ゲートと同じ「後続工程に進むための受け入れ基準」
という役割を、PRごとにブロックするCIチェックとして実装したもの(既存の
`openapi-routes`/`detailed-design-doc`と同じモデルで、PRでの変更有無に
よらず対象ドキュメント全体を検査する)。

上表の初期決定は、このプロジェクトが小規模なデモ/学習用プロジェクトである
(Principle V)ことを踏まえた妥当な出発点として記録したものであり、実際の
要件が生じた時点でいつでも上書きしてよい。

### E: 熟慮ガイド(非強制)

`doc/common/フロントエンド設計ガイド.md`を新規作成し、以下4項目を
「ハーネス化しない、設計時に思い出してほしい観点」として記載した:

- CSSクラス命名(kebab-case推奨 vs 本プロジェクトのCSS Modules camelCase規約)
- バリデーションメッセージの文言原則(具体的・簡潔・前向き)
- 画面間パラメータ連携の方式選択(パス/クエリ/オンメモリ/Webストレージ)
- 静的解析導入の運用哲学(このプロジェクトは既に整合している旨も記載)

このドキュメントはCIでも検証されず、PRレビューでも違反として指摘する性質の
ものではないことを文書冒頭に明記した。

## 影響

- 新規: `.github/scripts/check-url-path-design.mjs`、
  `check-a11y-test-coverage.sh`、`check-component-naming.mjs`、
  `check-frontend-nonfunctional-policy.mjs`。
- `.github/workflows/spec-consistency.yml`に4ジョブ追加
  (`url-path-design`、`a11y-test-coverage`、`component-naming`、
  `frontend-nonfunctional-policy`)。
- `package.json`に`jest-axe`・`@types/jest-axe`・
  `eslint-plugin-testing-library`を追加、`browserslist`フィールドを追加。
- `jest.setup.ts`に`toHaveNoViolations`マッチャー登録を追加。
- `eslint.config.mjs`に`eslint-plugin-testing-library`の`flat/react`設定を
  テストファイル限定で追加。
- 全画面ルートの`page.test.tsx`にaxeアサーションを追加。
- `TodoList.tsx`・`mockup/page.tsx`の操作列ヘッダーの実アクセシビリティ
  違反を修正、`dashboard.module.css`に`.visuallyHidden`ユーティリティを追加。
- `TodoDashboard.test.tsx`・`mockup/page.test.tsx`・`page.test.tsx`の
  testing-library違反を修正。
- `doc/common/AP方式設計書(フロントエンド編).md`に「非機能方針」節を新設。
- `doc/common/フロントエンド設計ガイド.md`を新規作成(非強制)。
- `constitution.md`に Core Principle XIV〜XVII を追加(v2.19.0)。
