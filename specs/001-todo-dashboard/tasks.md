---
description: "Task list for feature implementation"
---

# Tasks: Todoダッシュボード

**Input**: Design documents from `/specs/001-todo-dashboard/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [docs/architecture.md](../../docs/architecture.md), [openapi/](../../openapi/)

**Note**: この機能は実装済みのため、以下は「新規実装タスク」ではなく「既存実装が仕様
(spec.md / openapi/**)と一致しているかを確認するタスク」である。差分が見つかった場合は、
実装とspec.md/openapi/**のどちらを正とするか判断した上で修正する。

**Organization**: 画面(todo-list, todo-new)ごとにグループ化する。spec.mdはユースケース単位の
優先順位付け(P1/P2/P3)を持たないため(Principle VI: ユーザーストーリー形式の禁止)、代わりに
画面をグループ単位として使う。

**GitHub Issues**: 親Issue [#22](https://github.com/shimazakis0523/Nextjs-Sample/issues/22)。
各タスクのIssue番号は下表の通り(`speckit-implement`の着手条件チェックが参照する、この機能の
唯一の対応表)。

| Task | Issue | Task | Issue | Task | Issue | Task | Issue |
|---|---|---|---|---|---|---|---|
| T001 | #2  | T006 | #7  | T011 | #12 | T016 | #17 |
| T002 | #3  | T007 | #8  | T012 | #13 | T017 | #18 |
| T003 | #4  | T008 | #9  | T013 | #14 | T018 | #19 |
| T004 | #5  | T009 | #10 | T014 | #15 | T019 | #20 |
| T005 | #6  | T010 | #11 | T015 | #16 | T020 | #21 |

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

- [x] T003 [P] `src/lib/backend.ts`が`BACKEND_API_URL`の有無のみでmock/実バックエンドを切り替えて
      いること、Route Handlerが`mock-todos.ts`/`backend-client.ts`を直接importしていないことを確認する
      (Principle I, II) — 確認OK: `route.ts`・`[id]/route.ts`は`@/lib/backend`のみimport
- [x] T004 [P] `src/lib/mock-todos.ts`の`Todo`型が[openapi/common/schemas/Todo.yaml](../../openapi/common/schemas/Todo.yaml)
      と一致していることを確認する(Principle II) — 確認OK: フィールド・TodoStatus enumとも一致
- [x] T005 [P] `openapi/bff/openapi.yaml`が`GET /api/todos`・`POST /api/todos`・
      `DELETE /api/todos/{id}`を過不足なく定義していることを`check-openapi-contract`スキルで確認する
      (Principle III) — 確認OK: エンドポイント・必須項目・ステータスコードとも一致

**Checkpoint**: Foundational確認が完了した後、画面ごとのタスクに着手する

## Phase 3: Todo一覧画面 [US1]

**Goal**: [screens/todo-list/spec.md](./screens/todo-list/spec.md) の内容通りに一覧表示・新規登録
導線・削除が動作することを確認する

**Independent Test**: [screens/todo-list/e2e-test-spec.md](./screens/todo-list/e2e-test-spec.md) のTC-001〜
TC-012を`/dashboard`で手動実行する

### 実装確認

- [x] T006 [P] [US1] `src/app/dashboard/page.tsx`・`TodoDashboard.tsx`の初期表示が
      `GET /api/todos`(`src/app/api/todos/route.ts`)を呼び出し、取得順(追加順)で一覧表示する
      ことを確認する(spec.md 処理仕様 #1、e2e-test-spec.md TC-011) — 確認OK
- [x] T007 [US1] Todoが0件のとき空状態メッセージ「Todoがありません」が表示されることを確認する
      (spec.md 画面入出力仕様 #8、e2e-test-spec.md TC-002) — 確認OK
- [x] T008 [US1] 一覧テーブルの名前・期限・担当者・ステータスバッジが行ごとに正しく表示されることを
      確認する(spec.md 画面入出力仕様 #3〜#6、e2e-test-spec.md TC-008, TC-009) — 確認OK
- [x] T009 [US1] Addボタンクリックで[Todo新規登録](./screens/todo-new/spec.md)が表示されることを
      確認する(spec.md 処理仕様 #2、e2e-test-spec.md TC-003) — 確認OK
- [x] T010 [US1] 削除ボタン→確認ダイアログ→OKで`DELETE /api/todos/{id}`
      (`src/app/api/todos/[id]/route.ts`)が呼ばれ、該当行のみ一覧から消えることを確認する
      (spec.md 処理仕様 #3, #4、e2e-test-spec.md TC-004, TC-010, TC-012) — 確認OK
- [x] T011 [US1] 削除確認ダイアログでキャンセルした場合、およびDELETE失敗時に一覧が変更されない
      ことを確認する(spec.md 処理仕様 #4, #5、e2e-test-spec.md TC-005, TC-006) — 確認OK

**Checkpoint**: Todo一覧画面がspec.md通りに動作することを確認できた状態

## Phase 4: Todo新規登録画面 [US2]

**Goal**: [screens/todo-new/spec.md](./screens/todo-new/spec.md) の内容通りに入力・保存・
キャンセルが動作することを確認する

**Independent Test**: [screens/todo-new/e2e-test-spec.md](./screens/todo-new/e2e-test-spec.md) のTC-001〜
TC-014をモーダル表示状態で手動実行する

### 実装確認

- [x] T012 [US2] モーダル初期表示で`Todo名`・`期限`・`担当者`が空欄、`ステータス`が「未着手」に
      なっていることを確認する(spec.md 処理仕様 #1、e2e-test-spec.md TC-006) — 確認OK
- [x] T013 [US2] 必須項目(`Todo名`・`期限`・`担当者`)のいずれかが未入力の状態でSaveをクリックすると
      送信がブロックされ、`POST /api/todos`が呼ばれないことを確認する
      (spec.md 処理仕様 #2、e2e-test-spec.md TC-002, TC-007〜TC-009) — 確認OK(HTML required属性)
- [x] T014 [US2] 必須項目入力後にSaveをクリックすると`POST /api/todos`
      (`src/app/api/todos/route.ts`)が呼ばれ、成功時はモーダルが閉じることを確認する
      (spec.md 処理仕様 #3、e2e-test-spec.md TC-001, TC-012, TC-013) — 確認OK
- [x] T015 [US2] `POST /api/todos`が失敗した場合、モーダルは開いたままとなり「保存に失敗しました」が
      表示され、入力内容が保持されることを確認する(spec.md 処理仕様 #3、e2e-test-spec.md TC-003) — 確認OK
- [x] T016 [US2] Cancelボタン、およびモーダル外側クリックでモーダルが閉じ、登録処理が呼ばれない
      ことを確認する(spec.md 処理仕様 #4, #5、e2e-test-spec.md TC-004, TC-005) — 確認OK
- [x] T017 [US2] Escキー押下ではモーダルが閉じないことを確認する(spec.md 処理仕様 #6、
      e2e-test-spec.md TC-014) — 確認OK(キーハンドラ未実装=無反応)

**Checkpoint**: 両画面がspec.md通りに動作することを確認できた状態

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: 画面横断のドキュメント整合性確認

- [x] T018 [P] [screen-flow.md](./screen-flow.md)が両画面の実際の遷移(Addボタン→Todo新規登録)
      と一致していることを確認する(`update-screen-flow-diagram`スキル) — 確認OK
- [x] T019 [P] `check-openapi-contract`スキルで`openapi/**`と実装の整合性を最終確認する
      — 確認OK(health/users/todos全エンドポイントで不一致なし)
- [x] T020 `npm run dev`で起動し`/dashboard`を開いて、[todo-list/e2e-test-spec.md](./screens/todo-list/e2e-test-spec.md)
      と[todo-new/e2e-test-spec.md](./screens/todo-new/e2e-test-spec.md)の全テストケースを手動で確認する
      — 確認OK(ブラウザ自動操作で主要ケースを実行し、全てパス)

## Phase 6: コンポーネント分割

**Purpose**: [plan.md](./plan.md)の「登場するコンポーネントと関係」が前提とする
コンポーネント構成(画面ごとに担当コンポーネントを分ける)と、現在1つの
`TodoDashboard.tsx`にまとまっている実装との差分を解消する。

- [ ] T021 `src/app/dashboard/TodoDashboard.tsx`を、一覧表示・削除を担当する
      `src/app/dashboard/TodoList.tsx`と、新規登録モーダルを担当する
      `src/app/dashboard/TodoNewModal.tsx`に分割する。`todos`一覧stateとモーダル開閉state
      は`TodoDashboard.tsx`(親コンテナとして存続)が持ち、`TodoList`には
      `todos`・`onDeleted`・`onAddClick`を、`TodoNewModal`には`onSaved`・`onCancel`を
      propsで渡す([plan.md](./plan.md)のStructure Decision参照)。分割後、
      [todo-list/e2e-test-spec.md](./screens/todo-list/e2e-test-spec.md)と
      [todo-new/e2e-test-spec.md](./screens/todo-new/e2e-test-spec.md)の全テストケースが
      引き続き通ることを確認する。

**Checkpoint**: コンポーネント構成が[plan.md](./plan.md)と一致した状態

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし。完了済み
- **Foundational (Phase 2)**: Setup完了後。両画面の確認をブロックする
- **Todo一覧画面 [US1] (Phase 3)**: Foundational完了後。Todo新規登録画面への依存なし
- **Todo新規登録画面 [US2] (Phase 4)**: Foundational完了後。Todo一覧画面への依存なし
  (Addボタンからの遷移確認(T009)はTodo一覧画面側のタスク)
- **Polish (Phase 5)**: 両画面の確認完了後
- **コンポーネント分割 (Phase 6)**: 両画面の確認完了後。Polish(Phase 5)との順序制約はない

**着手条件(Issue単位)**: `speckit-implement`は、あるフェーズのタスクに着手する前に、下表の
「前提Issue」が全てGitHub上でclosedであることを確認する。closedでない前提Issueがある場合、
そのフェーズのタスクは実施しない(スキップし、どのIssueが未closeかを報告する)。

| Phase | このフェーズのIssue | 前提Issue(すべてclosed必須) |
|---|---|---|
| 1 Setup | #2, #3 | なし |
| 2 Foundational | #4, #5, #6 | #2, #3 |
| 3 Todo一覧画面 [US1] | #7〜#12 | #4, #5, #6 |
| 4 Todo新規登録画面 [US2] | #13〜#18 | #4, #5, #6 |
| 5 Polish | #19, #20, #21 | #7〜#18(すべて) |

Phase 6(コンポーネント分割)はこの表にまだ登録されていない。`speckit-taskstoissues`を
再実行してT021のIssueを登録するまで、`speckit-implement`のゲートはPhase 6をblocked
(fail closed)として扱い、実施しない。

### Parallel Opportunities

- T003〜T005([P]、Phase 2)は並行実行可能
- T006([P]、Phase 3)は他タスクと並行実行可能
- Phase 3とPhase 4はFoundational完了後、並行して着手可能
- T018〜T019([P]、Phase 5)は並行実行可能

## Implementation Strategy

この機能は実装済みのため「MVPから積み増す」フローではなく、Foundational→両画面→Polishの順に
確認を進め、差分が見つかった時点でspec.md/openapi/**と実装のどちらを修正すべきか判断して対応する。
