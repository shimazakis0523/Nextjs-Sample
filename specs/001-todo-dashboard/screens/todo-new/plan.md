# Implementation Plan: Todo新規登録

**Feature**: [001-todo-dashboard](../../spec.md) | **Screen**: `todo-new` | **Spec**: [spec.md](./spec.md)

**Input**: Screen specification from `specs/001-todo-dashboard/screens/todo-new/spec.md`

## Summary

[todo-list](../todo-list/spec.md)のAddボタンから開くモーダルとして`TodoNewModal.tsx`を
実装する。

- **入力〜保存**: 入力内容・バリデーション・保存中の表示・失敗メッセージは、すべて
  `TodoNewModal.tsx`自身が持つ。Saveボタン押下時、`POST /api/todos`を呼ぶのもこの
  コンポーネント自身。
- **保存成功後**: 新しいTodoを一覧に追加する処理は、`TodoNewModal.tsx`ではなく親
  `TodoDashboard.tsx`が行う(`onSaved(todo)`で通知するだけ)。

一覧データ(`todos`)を`TodoNewModal.tsx`に持たせない理由: このデータは
[todo-list](../todo-list/spec.md)(一覧画面)からも変更される(削除すると1件減る)。
`todo-list`と`todo-new`の両方が同じ一覧データに影響するため、データは片方の画面ではなく
両方の親である`TodoDashboard.tsx`に置く(todo-list側のplan.mdと同じ理由)。

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
