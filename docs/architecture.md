# アーキテクチャ

このアプリ全体に共通する技術スタック・構成・制約の、現時点の事実を記載する。個々の
機能の`plan.md`はこれを参照し、重複して記載しない(機能固有の内容のみを`plan.md`に
書く)。設計判断の背景・理由は`constitution.md`と`docs/adr/`を参照すること — このファイル
自体は「なぜ」を説明せず、現在の構成を記録するだけの事実集である。

## 技術スタック

- **言語/バージョン**: TypeScript 5 / Next.js 16 (App Router) / React 19
- **主要依存**: `next`, `react`, `react-dom`。OpenAPI関連ツールとして`@redocly/cli`
  (lint/bundle)、`openapi-typescript`(型生成)、`@stoplight/prism-cli`(実バックエンドの
  モックサーバ)。
- **デプロイ先**: Vercel(サーバーレス)。
- **プロジェクト種別**: Web application。Next.js App Router単一プロジェクト内に
  frontendとBFFが同居する構成。

## データ永続化

- モック時: `globalThis`にキャッシュしたインメモリ配列(`src/lib/mock-*.ts`)。
  サーバーレス環境での永続化は保証しない。
- 実バックエンド接続時: `BACKEND_API_URL`が指す外部サービスに委譲し、このアプリ
  自身は永続化層を持たない。

## テスト基盤

自動テストランナーは未導入。各画面のE2Eテストケースは
`specs/<feature>/screens/<screen>/test-spec.md`に定義し、テストランナー導入時に
これを自動化する。ユニットテストは各機能の`plan.md`の設計に基づいて別途起こす。

## リポジトリレイアウト

```text
src/
├── app/
│   ├── <feature-route>/        # 画面のエントリ・UIロジック(機能ごと。plan.mdに記載)
│   └── api/                    # BFF Route Handler (openapi/bff/openapi.yamlと対応)
└── lib/
    ├── backend.ts               # mock/実バックエンドのswap point (Principle II)
    ├── backend-client.ts        # 実バックエンド呼び出し (backendFetch)
    └── mock-*.ts                 # モック時のインメモリストレージ

openapi/
├── bff/openapi.yaml            # このアプリの/api/**契約
├── backend/openapi.yaml        # BACKEND_API_URL契約
└── common/schemas/             # 両方から$refする共有スキーマ
```

## 制約

- Route Handlerはリクエスト間でメモリを共有しない前提で実装する(Principle IV)。
- 認証はまだ導入していない(Technology & Deployment Constraints)。
