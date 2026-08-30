# Implementation Plan: Todoダッシュボード

**Branch**: `001-todo-dashboard` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-todo-dashboard/spec.md`

## Summary

Todo一覧画面(`/dashboard`)とTodo新規登録モーダルの2画面で構成される。ブラウザはこのアプリ自身の
`/api/todos` Route Handlerのみを呼び出し、`src/lib/backend.ts`が`BACKEND_API_URL`の有無でモック
(`mock-todos.ts`、`globalThis`キャッシュ)と実バックエンド(`backend-client.ts`経由)を切り替える。

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 16 (App Router) / React 19

**Primary Dependencies**: `next`, `react`, `react-dom`。OpenAPI関連ツールとして`@redocly/cli`(lint/bundle)、
`openapi-typescript`(型生成)、`@stoplight/prism-cli`(実バックエンドのモックサーバ)。

**Storage**: モック時は`globalThis`上のインメモリ配列(`src/lib/mock-todos.ts`)。実バックエンド接続時は
`BACKEND_API_URL`が指す外部サービスに委譲し、このアプリ自身は永続化しない(Principle IV)。

**Testing**: 自動テストランナーは未導入。E2E観点のテストケースは各画面の`test-spec.md`
(`specs/001-todo-dashboard/screens/*/test-spec.md`)に定義済みで、テストランナー導入時はこれを
自動化する。ユニットテストは本plan.mdの設計に基づいて別途起こす。

**Target Platform**: Vercel(サーバーレス)へのデプロイを想定したWebブラウザ向けアプリケーション。

**Project Type**: Web application(Next.js App Router、frontend + BFFが単一プロジェクト内に同居)。

**Performance Goals**: 特筆すべき性能目標なし(サンプル/学習用途の規模)。

**Constraints**: Route Handlerはリクエスト間でメモリを共有しない前提で実装すること(Principle IV)。

**Scale/Scope**: 画面2つ(Todo一覧、Todo新規登録)。エンティティ1つ(Todo)。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. BFF-Only Backend Access**: 準拠。`TodoDashboard.tsx`は`fetch("/api/todos")`のみを呼び、
  `src/app/api/todos/route.ts`・`src/app/api/todos/[id]/route.ts`は`src/lib/backend.ts`の
  `getTodos`/`createTodo`/`deleteTodo`だけを呼び出す。mock-todos.tsやbackend-client.tsを直接
  importしていない。
- **II. Mock/Real Backend Swap Point**: 準拠。`backend.ts`が`USE_MOCK_BACKEND = !process.env.BACKEND_API_URL`
  一つの条件でmock-todos.ts分岐とbackendFetch分岐を切り替えている。
- **III. Contract-First APIs**: 準拠。`GET/POST /api/todos`・`DELETE /api/todos/{id}`は
  `openapi/bff/openapi.yaml`に、実バックエンド呼び出しは`openapi/backend/openapi.yaml`に定義済み。
  共有スキーマ(Todo)は`openapi/common/schemas/Todo.yaml`を両方から`$ref`。
- **IV. Serverless-Safe State**: 準拠。`mock-todos.ts`の`globalThis`キャッシュはコメントで
  「サーバーレス環境では永続化を保証しない」ことを明記済み。
- **V. Minimal, Scoped Implementation**: 準拠。認証・ページング・検索など要求されていない機能は
  実装していない。
- 違反なし。Complexity Trackingへの記載は不要。

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-dashboard/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
├── screen-flow.md        # 画面遷移図(update-screen-flow-diagramスキルが管理)
├── screens/               # 画面ごとのspec.md/test-spec.md
└── tasks.md              # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              # Todo一覧画面のエントリ
│   │   ├── TodoDashboard.tsx     # 一覧表示・新規登録モーダル・削除のUIロジック
│   │   └── dashboard.module.css
│   └── api/
│       └── todos/
│           ├── route.ts          # GET /api/todos, POST /api/todos
│           └── [id]/route.ts     # DELETE /api/todos/{id}
└── lib/
    ├── backend.ts                # mock/実バックエンドのswap point (Principle II)
    ├── backend-client.ts         # 実バックエンド呼び出し (backendFetch)
    ├── mock-todos.ts             # モック時のインメモリTodoストレージ
    └── mock-data.ts              # モック時のUserデータ

openapi/
├── bff/openapi.yaml              # このアプリの/api/**契約
├── backend/openapi.yaml          # BACKEND_API_URL契約
└── common/schemas/Todo.yaml      # 共有Todoスキーマ
```

**Structure Decision**: Next.js App Router単一プロジェクト内にfrontendとBFFが同居する構成
(Technology & Deployment Constraints)。screens配下の画面はいずれも`src/app/dashboard/`配下の
同一コンポーネント(`TodoDashboard.tsx`)が担当し、Todo新規登録は独立ルートを持たないモーダルとして
同コンポーネント内で実装されている。

## Complexity Tracking

*Constitution Checkに違反なし。本セクションは空欄。*
