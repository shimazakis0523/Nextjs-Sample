# Implementation Plan: Todo一覧

**Feature**: [001-todo-dashboard](../../spec.md) | **Screen**: `todo-list` | **Spec**: [spec.md](./spec.md)

**Input**: Screen specification from `specs/001-todo-dashboard/screens/todo-list/spec.md`

## Summary

`/dashboard`の一覧表示・削除を担当する`TodoList.tsx`を実装する。初期表示はServer
Component(`page.tsx`)側で`getTodos()`を呼び、`TodoList`にはpropsとして渡す。削除は
`TodoList.tsx`自身が`DELETE /api/todos/{id}`を呼ぶ。Todo新規登録モーダル
([todo-new](../todo-new/spec.md))の開閉状態と、登録成功時に一覧へ追加する処理は、
`todo-list`と`todo-new`で共有する`todos`一覧state自体を持つ親コンテナ
(`TodoDashboard.tsx`)が担当し、`TodoList`はその子として一覧描画のみを担当する。

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
が保持する。`TodoList`は`todos`・`onDelete`・`onAddClick`をpropsで受け取り、一覧描画と
削除確認ダイアログの表示のみを担当する。

## Complexity Tracking

*Constitution Checkに違反なし。本セクションは空欄。*
