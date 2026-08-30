# Implementation Plan: Todo新規登録

**Feature**: [001-todo-dashboard](../../spec.md) | **Screen**: `todo-new` | **Spec**: [spec.md](./spec.md)

**Input**: Screen specification from `specs/001-todo-dashboard/screens/todo-new/spec.md`

## Summary

[todo-list](../todo-list/spec.md)のAddボタンから開くモーダルとして`TodoNewModal.tsx`を
実装する。入力state・バリデーション・保存中state・失敗メッセージはこのコンポーネント
自身が持つ。登録成功時、新しいTodoを一覧stateへ追加する処理は、`todo-list`と共有する
`todos`一覧stateを持つ親コンテナ(`TodoDashboard.tsx`)側のコールバックに委譲する。

## Technical Context

**共通のアーキテクチャ**: [docs/architecture.md](../../../../docs/architecture.md) を参照。

**Scale/Scope**: 入力項目4つ(Todo名・期限・担当者・ステータス)。

## Constitution Check

- **I・II・IV**: `docs/architecture.md`の共通インフラ(BFF-onlyアクセス、
  `backend.ts`のswap point、`globalThis`キャッシュの非永続化)により自動的に満たされる。
  この画面固有の追加対応はない。
- **III. Contract-First APIs**: この画面が呼ぶのは`POST /api/todos`のみ。定義済み。
  詳細は[openapi/bff/openapi.yaml](../../../../openapi/bff/openapi.yaml)を参照。
- **V. Minimal, Scoped Implementation**: 入力途中の一時保存や下書き機能はspec.mdで
  要求されていないため実装しない。

## Component Design

**担当コンポーネント**: `src/app/dashboard/TodoNewModal.tsx`(新規)。独立したURL/route
は持たない。

**呼び出すBFFエンドポイント**: `POST /api/todos`(Saveボタン)。詳細は
[openapi/bff/openapi.yaml](../../../../openapi/bff/openapi.yaml)を参照。

**Structure Decision**: 表示/非表示は親(`src/app/dashboard/TodoDashboard.tsx`)が持つ
`isModalOpen`stateで制御し、`TodoNewModal`は`onSaved(todo)`・`onCancel`をpropsで受け取る。
登録成功時、親の`todos`stateへの追加は`onSaved`経由で親側が行う。

## Complexity Tracking

*Constitution Checkに違反なし。本セクションは空欄。*
