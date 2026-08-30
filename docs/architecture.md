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

## 全体構成: Frontend + BFF同居

Next.js App Router単一プロジェクト内に、ブラウザ向けのfrontendとBFF(Backend For
Frontend)が同居する。両者は同一デプロイ単位・同一リポジトリだが、責務は明確に分離
されている。

```text
ブラウザ
  │  fetch("/api/**") のみ (Principle I: BFF-Only Backend Access)
  ▼
src/app/api/**  (BFF Route Handler)
  │  必ず src/lib/backend.ts の関数(getTodos等)経由で呼ぶ
  ▼
src/lib/backend.ts  (swap point。BACKEND_API_URLの有無で分岐。Principle II)
  ├─ 未設定時 → src/lib/mock-*.ts (globalThisキャッシュのインメモリモック)
  └─ 設定時   → src/lib/backend-client.ts → BACKEND_API_URL (実バックエンド)
```

- ブラウザは`/api/**`以外のいかなるバックエンドも直接呼び出さない。
- Route Handler・Server Componentsは`mock-*.ts`や`backend-client.ts`を直接importせず、
  必ず`backend.ts`の関数を経由する。
- この構成により、実バックエンド接続への切り替えは`backend.ts`一箇所の変更で完結する。

## データ永続化

- モック時: `globalThis`にキャッシュしたインメモリ配列(`src/lib/mock-*.ts`)。
  サーバーレス環境での永続化は保証しない。
- 実バックエンド接続時: `BACKEND_API_URL`が指す外部サービスに委譲し、このアプリ
  自身は永続化層を持たない。

## テスト基盤

ユニットテストは Jest、E2Eテストは Playwright を採用する(`package.json`未導入、
今後の導入タスクで追加)。各画面のE2Eテストケースは
`specs/<feature>/screens/<screen>/test-spec.md`に定義し、Playwright導入時に
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
