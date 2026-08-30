---
description: "Task list for feature implementation"
---

# Tasks: Todoダッシュボード

**Input**: Design documents from `/specs/001-todo-dashboard/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Note**: この機能は実装済みのため、以下は「新規実装タスク」ではなく「既存実装が仕様
(spec.md / openapi/**)と一致しているかを確認するタスク」である。差分が見つかった場合は、
実装とspec.md/openapi/**のどちらを正とするか判断した上で修正する。

**Organization**: 画面(todo-list, todo-new)ごとにグループ化する。spec.mdはユースケース単位の
優先順位付け(P1/P2/P3)を持たないため(Principle VI: ユーザーストーリー形式の禁止)、代わりに
画面をグループ単位として使う。

## Format: `[ID] [P?] [Screen] Description`

- **[P]**: 並行実行可能(異なるファイル、依存関係なし)
- **[Screen]**: 対象画面(US1 = todo-list, US2 = todo-new)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: プロジェクトの基盤(既に構築済み)

- [x] T001 Next.js App Router構成の確認(`src/app/`, `package.json`)
- [x] T002 OpenAPIツールチェーンの確認(`@redocly/cli`, `openapi-typescript`, `@stoplight/prism-cli` — `package.json`)

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 両画面が共通で依存するBFF層・契約定義の確認

**⚠️ CRITICAL**: このフェーズの確認が完了するまで、画面ごとのタスクの結果は信頼できない

- [ ] T003 [P] `src/lib/backend.ts`が`BACKEND_API_URL`の有無のみでmock/実バックエンドを切り替えて
      いること、Route Handlerが`mock-todos.ts`/`backend-client.ts`を直接importしていないことを確認する
      (Principle I, II)
- [ ] T004 [P] `src/lib/mock-todos.ts`の`Todo`型が[openapi/common/schemas/Todo.yaml](../../openapi/common/schemas/Todo.yaml)
      と一致していることを確認する(Principle II)
- [ ] T005 [P] `openapi/bff/openapi.yaml`が`GET /api/todos`・`POST /api/todos`・
      `DELETE /api/todos/{id}`を過不足なく定義していることを`check-openapi-contract`スキルで確認する
      (Principle III)

**Checkpoint**: Foundational確認が完了した後、画面ごとのタスクに着手する

## Phase 3: Todo一覧画面 [US1]

**Goal**: [screens/todo-list/spec.md](./screens/todo-list/spec.md) の内容通りに一覧表示・新規登録
導線・削除が動作することを確認する

**Independent Test**: [screens/todo-list/test-spec.md](./screens/todo-list/test-spec.md) のTC-001〜
TC-012を`/dashboard`で手動実行する

### 実装確認

- [ ] T006 [P] [US1] `src/app/dashboard/page.tsx`・`TodoDashboard.tsx`の初期表示が
      `GET /api/todos`(`src/app/api/todos/route.ts`)を呼び出し、取得順(追加順)で一覧表示する
      ことを確認する(spec.md 処理仕様 #1、test-spec.md TC-011)
- [ ] T007 [US1] Todoが0件のとき空状態メッセージ「Todoがありません」が表示されることを確認する
      (spec.md 画面入出力仕様 #8、test-spec.md TC-002)
- [ ] T008 [US1] 一覧テーブルの名前・期限・担当者・ステータスバッジが行ごとに正しく表示されることを
      確認する(spec.md 画面入出力仕様 #3〜#6、test-spec.md TC-008, TC-009)
- [ ] T009 [US1] Addボタンクリックで[Todo新規登録](./screens/todo-new/spec.md)が表示されることを
      確認する(spec.md 処理仕様 #2、test-spec.md TC-003)
- [ ] T010 [US1] 削除ボタン→確認ダイアログ→OKで`DELETE /api/todos/{id}`
      (`src/app/api/todos/[id]/route.ts`)が呼ばれ、該当行のみ一覧から消えることを確認する
      (spec.md 処理仕様 #3, #4、test-spec.md TC-004, TC-010, TC-012)
- [ ] T011 [US1] 削除確認ダイアログでキャンセルした場合、およびDELETE失敗時に一覧が変更されない
      ことを確認する(spec.md 処理仕様 #4, #5、test-spec.md TC-005, TC-006)

**Checkpoint**: Todo一覧画面がspec.md通りに動作することを確認できた状態

## Phase 4: Todo新規登録画面 [US2]

**Goal**: [screens/todo-new/spec.md](./screens/todo-new/spec.md) の内容通りに入力・保存・
キャンセルが動作することを確認する

**Independent Test**: [screens/todo-new/test-spec.md](./screens/todo-new/test-spec.md) のTC-001〜
TC-014をモーダル表示状態で手動実行する

### 実装確認

- [ ] T012 [US2] モーダル初期表示で`Todo名`・`期限`・`担当者`が空欄、`ステータス`が「未着手」に
      なっていることを確認する(spec.md 処理仕様 #1、test-spec.md TC-006)
- [ ] T013 [US2] 必須項目(`Todo名`・`期限`・`担当者`)のいずれかが未入力の状態でSaveをクリックすると
      送信がブロックされ、`POST /api/todos`が呼ばれないことを確認する
      (spec.md 処理仕様 #2、test-spec.md TC-002, TC-007〜TC-009)
- [ ] T014 [US2] 必須項目入力後にSaveをクリックすると`POST /api/todos`
      (`src/app/api/todos/route.ts`)が呼ばれ、成功時はモーダルが閉じることを確認する
      (spec.md 処理仕様 #3、test-spec.md TC-001, TC-012, TC-013)
- [ ] T015 [US2] `POST /api/todos`が失敗した場合、モーダルは開いたままとなり「保存に失敗しました」が
      表示され、入力内容が保持されることを確認する(spec.md 処理仕様 #3、test-spec.md TC-003)
- [ ] T016 [US2] Cancelボタン、およびモーダル外側クリックでモーダルが閉じ、登録処理が呼ばれない
      ことを確認する(spec.md 処理仕様 #4, #5、test-spec.md TC-004, TC-005)
- [ ] T017 [US2] Escキー押下ではモーダルが閉じないことを確認する(spec.md 処理仕様 #6、
      test-spec.md TC-014)

**Checkpoint**: 両画面がspec.md通りに動作することを確認できた状態

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: 画面横断のドキュメント整合性確認

- [ ] T018 [P] [screen-flow.md](./screen-flow.md)が両画面の実際の遷移(Addボタン→Todo新規登録)
      と一致していることを確認する(`update-screen-flow-diagram`スキル)
- [ ] T019 [P] `check-openapi-contract`スキルで`openapi/**`と実装の整合性を最終確認する
- [ ] T020 [quickstart.md](./quickstart.md)の検証シナリオを`npm run dev`で実行し、全て期待結果通りに
      なることを確認する

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし。完了済み
- **Foundational (Phase 2)**: Setup完了後。両画面の確認をブロックする
- **Todo一覧画面 [US1] (Phase 3)**: Foundational完了後。Todo新規登録画面への依存なし
- **Todo新規登録画面 [US2] (Phase 4)**: Foundational完了後。Todo一覧画面への依存なし
  (Addボタンからの遷移確認(T009)はTodo一覧画面側のタスク)
- **Polish (Phase 5)**: 両画面の確認完了後

### Parallel Opportunities

- T003〜T005([P]、Phase 2)は並行実行可能
- T006([P]、Phase 3)は他タスクと並行実行可能
- Phase 3とPhase 4はFoundational完了後、並行して着手可能
- T018〜T019([P]、Phase 5)は並行実行可能

## Implementation Strategy

この機能は実装済みのため「MVPから積み増す」フローではなく、Foundational→両画面→Polishの順に
確認を進め、差分が見つかった時点でspec.md/openapi/**と実装のどちらを修正すべきか判断して対応する。
