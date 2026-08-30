# Implementation Plan: Todoダッシュボード

**Branch**: `001-todo-dashboard` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-todo-dashboard/spec.md`

## Summary

Todo一覧画面(`/dashboard`)とTodo新規登録モーダルの2画面を実装する。ブラウザはこのアプリ自身の
`/api/todos` Route Handlerのみを呼び出す設計とし、`src/lib/backend.ts`が`BACKEND_API_URL`の有無で
モック(`mock-todos.ts`、`globalThis`キャッシュ)と実バックエンド(`backend-client.ts`経由)を
切り替える、既存のswap point(docs/architecture.md参照)をそのまま利用する。

## Technical Context

**共通のアーキテクチャ**: [docs/architecture.md](../../docs/architecture.md) を参照。

**Performance Goals**: 特筆すべき性能目標なし(サンプル/学習用途の規模)。

**Scale/Scope**: 画面2つ(Todo一覧、Todo新規登録)。エンティティ1つ(Todo)。

## Constitution Check

*GATE: Must pass before implementation. Re-check after implementation for drift.*

- **I. BFF-Only Backend Access**: `TodoDashboard.tsx`は`fetch("/api/todos")`のみを呼ぶ設計とし、
  `src/app/api/todos/route.ts`・`src/app/api/todos/[id]/route.ts`は`src/lib/backend.ts`の
  `getTodos`/`createTodo`/`deleteTodo`だけを呼び出す。mock-todos.tsやbackend-client.tsは
  Route Handler・Componentから直接importしない。
- **II. Mock/Real Backend Swap Point**: `backend.ts`側で`USE_MOCK_BACKEND = !process.env.BACKEND_API_URL`
  一つの条件のみでmock-todos.ts分岐とbackendFetch分岐を切り替える設計とする。
- **III. Contract-First APIs**: `GET/POST /api/todos`・`DELETE /api/todos/{id}`を
  `openapi/bff/openapi.yaml`に、実バックエンド呼び出しを`openapi/backend/openapi.yaml`に定義する。
  共有スキーマ(Todo)は`openapi/common/schemas/Todo.yaml`を両方から`$ref`する。
- **IV. Serverless-Safe State**: `mock-todos.ts`の`globalThis`キャッシュには、サーバーレス環境で
  永続化を保証しない旨をコメントで明記する。
- **V. Minimal, Scoped Implementation**: 認証・ページング・検索など、spec.mdで要求されていない
  機能は実装しない。
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

### Source Code (この機能が追加するパス)

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
同コンポーネント内に実装する。

## Complexity Tracking

*Constitution Checkに違反なし。本セクションは空欄。*
