# AP方式設計書(フロントエンド編)

このアプリのフロントエンド(Next.js App Router)に共通する技術スタック・構成・制約の、
現時点の事実を記載する。個々の業務の詳細設計書はこれを参照し、重複して記載しない
(業務固有の内容のみを詳細設計書に書く)。設計判断の背景・理由は`doc/common/constitution.md`
と`doc/common/adr/`を参照すること — このファイル自体は「なぜ」を説明せず、現在の構成を
記録するだけの事実集である。

バックエンド(BFF)側の構成は[AP方式設計書(バックエンド編)](./AP方式設計書(バックエンド編).md)
を参照。

## 技術スタック

- **言語/バージョン**: TypeScript 5 / Next.js 16 (App Router) / React 19
- **デプロイ先**: Vercel(サーバーレス)。

## 全体構成: Frontend + BFF同居

Next.js App Router単一プロジェクト内に、ブラウザ向けのfrontendとBFF(Backend For
Frontend)が同居する。両者は同一デプロイ単位・同一リポジトリだが、責務は明確に分離
されている。

```text
ブラウザ
  │  fetch("/api/**") のみ (Principle I: BFF-Only Backend Access)
  ▼
src/app/api/**  (BFF Route Handler。詳細はAP方式設計書(バックエンド編)を参照)
```

- ブラウザは`/api/**`以外のいかなるバックエンドも直接呼び出さない。

## テスト基盤

ユニットテストは Jest(`jest.config.ts`、`next/jest`経由でNext.jsのSWCトランスパイルを
利用)、E2Eテストは Playwright(`playwright.config.ts`)を採用する。

- ユニットテスト: `src/**/*.test.ts`に対象コードと同じディレクトリで配置する。
  `npm test`で実行。
- E2Eテスト: `e2e/*.spec.ts`に画面単位でファイルを分ける。各画面の
  `doc/フロントエンド設計書/<業務>/E2E仕様書*.md`のTCをそのままテストケースに
  対応させ、テスト名にTC番号を含める。`npm run test:e2e`で実行(`webServer`設定により
  `npm run dev`を自動起動)。テストは`playwright.config.ts`で`fullyParallel: false`・
  `workers: 1`にしている — モックバックエンドの状態が`globalThis`キャッシュで全テストに
  共有されるため、各テストは`beforeEach`で一覧をクリアしてから自分のデータを用意する
  ことで実行順に依存しないようにする。

## リポジトリレイアウト(フロントエンド関連)

```text
src/
├── app/
│   ├── <feature-route>/        # 画面のエントリ・UIロジック(業務ごと。詳細設計書に記載)
│   └── api/                    # BFF Route Handler (doc/API仕様書/BFF/openapi.yamlと対応)
└── lib/                        # 詳細はAP方式設計書(バックエンド編)を参照

e2e/                            # Playwright E2Eテスト(画面単位でファイルを分ける)

jest.config.ts / jest.setup.ts  # Jestユニットテスト設定
playwright.config.ts            # Playwright E2Eテスト設定
```

## 非機能方針

Future Architect社「Webフロントエンド開発ガイドライン」の該当章のうち、プロジェクト
全体で一度だけ決定すればよい(機能ごとに再検討しない)方針をここに記録する。決定の
背景・理由は`doc/common/adr/0024-web-frontend-guideline-conformance.md`を参照
すること — このファイル自体は「なぜ」を説明せず、現時点の決定事項を記録するだけの
事実集である。

### 対応ブラウザ/サポートバージョン

主要ブラウザ(Chrome, Edge, Firefox, Safari、iOS Safari/Android Chromeを含む)の
最新2バージョンを対象とする。レガシーブラウザ(Internet Explorer等)は対象外。
`package.json`の`browserslist`フィールドで機械的に表現する。

### 国際化対応

対応しない(日本語のみ)。多言語対応の要件が生じた時点で、あらためてADRとして
決定し直す。

### ダークモードの状態保持

OS設定(`prefers-color-scheme`メディアクエリ)への追従のみとする。ユーザーによる
手動切替トグルは設けない。

### OGP

設定しない。SNS等への積極的なリンク共有を想定した公開サービスではないため。

## 制約

- 認証はまだ導入していない。
