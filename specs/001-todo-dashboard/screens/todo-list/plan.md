# Implementation Plan: Todo一覧

**Feature**: [001-todo-dashboard](../../spec.md) | **Screen**: `todo-list` | **Spec**: [spec.md](./spec.md)

**Input**: Screen specification from `specs/001-todo-dashboard/screens/todo-list/spec.md`

## Summary

この画面(`todo-list`)が担当するのは一覧表示と削除の2つだけ。

- **一覧表示**: 表示するデータは`page.tsx`(Server Component)が`getTodos()`で取得し、
  `TodoList`にpropsとして渡す。`TodoList`は受け取ったデータを描画するだけ。
- **削除**: `TodoList.tsx`自身が`DELETE /api/todos/{id}`を呼ぶ。成功したら
  `onDeleted(id)`で親に「このTodoが消えた」と伝える(親側の状態更新は下記参照)。

一覧データ(`todos`)そのものは`TodoList.tsx`ではなく、親コンポーネント
`TodoDashboard.tsx`が保持する。理由: このデータは[todo-new](../todo-new/spec.md)
(新規登録モーダル)からも変更される(登録されると1件増える)。`todo-list`と`todo-new`
の両方が同じ一覧データに影響するため、データは片方の画面ではなく両方の親である
`TodoDashboard.tsx`に置く。

## Technical Context

**共通のアーキテクチャ**: [docs/architecture.md](../../../../docs/architecture.md) を参照。

**Scale/Scope**: 一覧テーブル1つ、行あたりの操作は削除のみ。

## Constitution Check

- **I・II・IV**: `docs/architecture.md`の共通インフラ(BFF-onlyアクセス、
  `backend.ts`のswap point、`globalThis`キャッシュの非永続化)により自動的に満たされる。
  この画面固有の追加対応はない。
- **III. Contract-First APIs**: この画面が呼ぶのは`GET /api/todos`(初期表示、
  Server Component経由)と`DELETE /api/todos/{id}`(削除)。いずれも
  [openapi/bff/openapi.yaml](../../../../openapi/bff/openapi.yaml)に定義済み。
- **V. Minimal, Scoped Implementation**: ページング・検索・ソートはspec.mdで
  要求されていないため実装しない。

## Component Design

**担当コンポーネント**: `src/app/dashboard/TodoList.tsx`(新規)。エントリは
`src/app/dashboard/page.tsx`(Server Component、`getTodos()`で初期データ取得)。

**呼び出すBFFエンドポイント**: `GET /api/todos`(`page.tsx`経由)、
`DELETE /api/todos/{id}`(削除ボタン)。詳細は
[openapi/bff/openapi.yaml](../../../../openapi/bff/openapi.yaml)を参照。

**Structure Decision**: `todos`一覧stateと[todo-new](../todo-new/spec.md)モーダルの
開閉stateは、`TodoList`と`TodoNewModal`の親である`src/app/dashboard/TodoDashboard.tsx`
が保持する。`TodoList`がpropsで受け取るのは3つ: `todos`(表示するデータ)、
`onDeleted(id)`(削除成功後に呼ぶ。親はこれを受けて`todos`からその1件を除く)、
`onAddClick`(Addボタン押下時に呼ぶ。親はこれを受けてモーダルを開く)。`TodoList`自身が
持つ責務は一覧描画・削除確認ダイアログの表示・`DELETE`リクエストの送信までで、
`todos`配列の書き換えは行わない。

## Complexity Tracking

*Constitution Checkに違反なし。本セクションは空欄。*
