# Implementation Plan: Todoダッシュボード

**Branch**: `001-todo-dashboard` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-todo-dashboard/spec.md`

## 登場するコンポーネントと関係

| ファイル | 役割 |
|---|---|
| `page.tsx` | 画面のエントリ(Server Component)。`getTodos()`で初期データを取得するだけ |
| `TodoDashboard.tsx` | 親。`todos`一覧stateとモーダル開閉stateを持つ。[todo-list](./screens/todo-list/spec.md)と[todo-new](./screens/todo-new/spec.md)の両方が使うため、どちらか一方の画面には属さない |
| `TodoList.tsx` | [todo-list](./screens/todo-list/spec.md)画面の実装。一覧描画と削除ボタンの処理を担当 |
| `TodoNewModal.tsx` | [todo-new](./screens/todo-new/spec.md)画面の実装。新規登録フォームを担当 |

```mermaid
flowchart TD
    page["page.tsx<br/>(Server Component)"]
    dashboard["TodoDashboard.tsx<br/>(親・todos一覧stateを保持)"]
    list["TodoList.tsx<br/>(todo-list画面)"]
    modal["TodoNewModal.tsx<br/>(todo-new画面)"]

    page -- "initialTodos" --> dashboard
    dashboard -- "todos, onDeleted, onAddClick" --> list
    dashboard -- "onSaved, onCancel" --> modal
    list -. "onDeleted(id)" .-> dashboard
    modal -. "onSaved(todo)" .-> dashboard
```

実線 = 親から子へpropsで渡す。破線 = 子が親のコールバックを呼んで結果を伝える
(データそのものの書き換えは常に親`TodoDashboard.tsx`側で行う)。

## Project Structure

### Source Code (この機能が追加/変更するパス)

共通インフラ(`src/lib/backend.ts`・`backend-client.ts`・`mock-*.ts`・`openapi/**`)は
[docs/architecture.md](../../docs/architecture.md)のリポジトリレイアウトを参照。以下は
この機能固有のパスのみ。

```text
src/app/
├── dashboard/
│   ├── page.tsx              # Todo一覧画面のエントリ
│   ├── TodoDashboard.tsx     # todos一覧state・モーダル開閉stateを保持する親
│   ├── TodoList.tsx          # todo-list画面: 一覧表示・削除
│   ├── TodoNewModal.tsx      # todo-new画面: 新規登録モーダル
│   └── dashboard.module.css
└── api/todos/
    ├── route.ts               # GET /api/todos, POST /api/todos
    └── [id]/route.ts          # DELETE /api/todos/{id}

openapi/common/schemas/Todo.yaml  # 共有Todoスキーマ
```

**Structure Decision**: Next.js App Router単一プロジェクト内にfrontendとBFFが同居する構成
(docs/architecture.md参照)。画面ごとのコンポーネント(`TodoList.tsx`・`TodoNewModal.tsx`)は、
共有state(`todos`一覧・モーダル開閉)を持つ親(`TodoDashboard.tsx`)の子として実装する
(上図参照)。
