# Implementation Plan: Todoダッシュボード

**Branch**: `001-todo-dashboard` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-todo-dashboard/spec.md`

## Summary

Todo一覧画面(`/dashboard`)とTodo新規登録モーダルの2画面で構成される。ブラウザはこのアプリ自身の
`/api/todos` Route Handlerのみを呼び出し、`src/lib/backend.ts`が`BACKEND_API_URL`の有無でモック
(`mock-todos.ts`、`globalThis`キャッシュ)と実バックエンド(`backend-client.ts`経由)を切り替える。

## Technical Context

**共通のアーキテクチャ**: [docs/architecture.md](../../docs/architecture.md) を参照。

**Performance Goals**: 特筆すべき性能目標なし(サンプル/学習用途の規模)。

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
├── screen-flow.md        # 画面遷移図(update-screen-flow-diagramスキルが管理)
├── screens/               # 画面ごとのspec.md/e2e-test-spec.md/checklists/
└── tasks.md              # Phase 2 output (/speckit-tasks command)
```

### Source Code (この機能が追加したパス)

共通インフラ(`src/lib/backend.ts`・`backend-client.ts`・`mock-*.ts`・`openapi/**`)は
[docs/architecture.md](../../docs/architecture.md)のリポジトリレイアウトを参照。以下は
この機能固有のパスのみ。

```text
src/app/
├── dashboard/
│   ├── page.tsx              # Todo一覧画面のエントリ
│   ├── TodoDashboard.tsx     # 一覧表示・新規登録モーダル・削除のUIロジック
│   └── dashboard.module.css
└── api/todos/
    ├── route.ts               # GET /api/todos, POST /api/todos
    └── [id]/route.ts          # DELETE /api/todos/{id}

openapi/common/schemas/Todo.yaml  # 共有Todoスキーマ
```

**Structure Decision**: Next.js App Router単一プロジェクト内にfrontendとBFFが同居する構成
(docs/architecture.md参照)。screens配下の画面はいずれも`src/app/dashboard/`配下の
同一コンポーネント(`TodoDashboard.tsx`)が担当し、Todo新規登録は独立ルートを持たないモーダルとして
同コンポーネント内で実装されている。

## Complexity Tracking

*Constitution Checkに違反なし。本セクションは空欄。*
