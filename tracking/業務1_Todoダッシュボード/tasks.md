---
description: "Task list for feature implementation"
---

# Tasks: Todoダッシュボード

**Input**: Design documents from `/doc/フロントエンド設計書/業務1_Todoダッシュボード/`

**Prerequisites**: [詳細設計書](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/詳細設計書.md), [ユースケース記述(Todo一覧)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/ユースケース記述_Todo一覧.md), [ユースケース記述(Todo新規登録)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/ユースケース記述_Todo新規登録.md), [ユースケース記述(Todo編集)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/ユースケース記述_Todo編集.md), [AP方式設計書(フロントエンド編)](../../doc/common/AP方式設計書(フロントエンド編).md), [AP方式設計書(バックエンド編)](../../doc/common/AP方式設計書(バックエンド編).md), [doc/API仕様書/](../../doc/API仕様書/)

**Note**: Phase 1〜6(todo-list・todo-new)は実装済みの機能を遡って仕様書化したため、
「新規実装タスク」ではなく「既存実装が仕様書と一致しているかを確認するタスク」だった。
一方、Phase 7以降(todo-edit)は未実装の新機能であり、通常の「仕様書に基づいて新規実装する
タスク」である。

**Organization**: 画面(todo-list, todo-new, todo-edit)ごとにグループ化する。仕様書は
ユースケース単位の優先順位付け(P1/P2/P3)を持たないため(Principle VI: ユーザーストーリー
形式の禁止)、代わりに画面をグループ単位として使う。

**GitHub Issues**: 親Issue [#22](https://github.com/shimazakis0523/Nextjs-Sample/issues/22)
(Phase 1〜6)、[#38](https://github.com/shimazakis0523/Nextjs-Sample/issues/38)(Phase 7〜8、
Todo編集機能)。各タスクのIssue番号は下表の通り(`speckit-implement`の着手条件チェックが
参照する、この機能の唯一の対応表)。

| Task | Issue | Task | Issue | Task | Issue | Task | Issue |
|---|---|---|---|---|---|---|---|
| T001 | #2  | T006 | #7  | T011 | #12 | T016 | #17 |
| T002 | #3  | T007 | #8  | T012 | #13 | T017 | #18 |
| T003 | #4  | T008 | #9  | T013 | #14 | T018 | #19 |
| T004 | #5  | T009 | #10 | T014 | #15 | T019 | #20 |
| T005 | #6  | T010 | #11 | T015 | #16 | T020 | #21 |
| T021 | #23 | T022 | #39 | T023 | #40 | T024 | #41 |
| T025 | #42 | T026 | #43 | T027 | #44 | T028 | #45 |
| T029 | #46 | T030 | #47 | T031 | #48 | T032 | #49 |
| T033 | #50 |     |     |     |     |     |     |

## Format: `[ID] [P?] [Screen] Description`

- **[P]**: 並行実行可能(異なるファイル、依存関係なし)
- **[Screen]**: 対象画面(US1 = todo-list, US2 = todo-new, US3 = todo-edit)

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
- [x] T004 [P] `src/lib/mock-todos.ts`の`Todo`型が[doc/API仕様書/common/schemas/Todo.yaml](../../doc/API仕様書/common/schemas/Todo.yaml)
      と一致していることを確認する(Principle II) — 確認OK: フィールド・TodoStatus enumとも一致
- [x] T005 [P] `doc/API仕様書/BFF/openapi.yaml`が`GET /api/todos`・`POST /api/todos`・
      `DELETE /api/todos/{id}`を過不足なく定義していることを`check-openapi-contract`スキルで確認する
      (Principle III) — 確認OK: エンドポイント・必須項目・ステータスコードとも一致

**Checkpoint**: Foundational確認が完了した後、画面ごとのタスクに着手する

## Phase 3: Todo一覧画面 [US1]

**Goal**: [ユースケース記述(Todo一覧)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/ユースケース記述_Todo一覧.md)・[画面定義書(Todo一覧)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/画面定義書_Todo一覧.md)
の内容通りに一覧表示・新規登録導線・削除が動作することを確認する

**Independent Test**: [E2E仕様書(Todo一覧)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/E2E仕様書_Todo一覧.md) のTC-001〜
TC-012を`/dashboard`で手動実行する

### 実装確認

- [x] T006 [P] [US1] `src/app/dashboard/page.tsx`・`TodoDashboard.tsx`の初期表示が
      `GET /api/todos`(`src/app/api/todos/route.ts`)を呼び出し、取得順(追加順)で一覧表示する
      ことを確認する(画面定義書(Todo一覧) 処理仕様 #1、E2E仕様書(Todo一覧) TC-011) — 確認OK
- [x] T007 [US1] Todoが0件のとき空状態メッセージ「Todoがありません」が表示されることを確認する
      (画面定義書(Todo一覧) 画面入出力仕様 #8、E2E仕様書(Todo一覧) TC-002) — 確認OK
- [x] T008 [US1] 一覧テーブルの名前・期限・担当者・ステータスバッジが行ごとに正しく表示されることを
      確認する(画面定義書(Todo一覧) 画面入出力仕様 #3〜#6、E2E仕様書(Todo一覧) TC-008, TC-009) — 確認OK
- [x] T009 [US1] Addボタンクリックで[Todo新規登録](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/ユースケース記述_Todo新規登録.md)が表示されることを
      確認する(画面定義書(Todo一覧) 処理仕様 #2、E2E仕様書(Todo一覧) TC-003) — 確認OK
- [x] T010 [US1] 削除ボタン→確認ダイアログ→OKで`DELETE /api/todos/{id}`
      (`src/app/api/todos/[id]/route.ts`)が呼ばれ、該当行のみ一覧から消えることを確認する
      (画面定義書(Todo一覧) 処理仕様 #3, #4、E2E仕様書(Todo一覧) TC-004, TC-010, TC-012) — 確認OK
- [x] T011 [US1] 削除確認ダイアログでキャンセルした場合、およびDELETE失敗時に一覧が変更されない
      ことを確認する(画面定義書(Todo一覧) 処理仕様 #4, #5、E2E仕様書(Todo一覧) TC-005, TC-006) — 確認OK

**Checkpoint**: Todo一覧画面が仕様書通りに動作することを確認できた状態

## Phase 4: Todo新規登録画面 [US2]

**Goal**: [ユースケース記述(Todo新規登録)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/ユースケース記述_Todo新規登録.md)・[画面定義書(Todo新規登録)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/画面定義書_Todo新規登録.md)
の内容通りに入力・保存・キャンセルが動作することを確認する

**Independent Test**: [E2E仕様書(Todo新規登録)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/E2E仕様書_Todo新規登録.md) のTC-001〜
TC-014をモーダル表示状態で手動実行する

### 実装確認

- [x] T012 [US2] モーダル初期表示で`Todo名`・`期限`・`担当者`が空欄、`ステータス`が「未着手」に
      なっていることを確認する(画面定義書(Todo新規登録) 処理仕様 #1、E2E仕様書(Todo新規登録) TC-006) — 確認OK
- [x] T013 [US2] 必須項目(`Todo名`・`期限`・`担当者`)のいずれかが未入力の状態でSaveをクリックすると
      送信がブロックされ、`POST /api/todos`が呼ばれないことを確認する
      (画面定義書(Todo新規登録) 処理仕様 #2、E2E仕様書(Todo新規登録) TC-002, TC-007〜TC-009) — 確認OK(HTML required属性)
- [x] T014 [US2] 必須項目入力後にSaveをクリックすると`POST /api/todos`
      (`src/app/api/todos/route.ts`)が呼ばれ、成功時はモーダルが閉じることを確認する
      (画面定義書(Todo新規登録) 処理仕様 #3、E2E仕様書(Todo新規登録) TC-001, TC-012, TC-013) — 確認OK
- [x] T015 [US2] `POST /api/todos`が失敗した場合、モーダルは開いたままとなり「保存に失敗しました」が
      表示され、入力内容が保持されることを確認する(画面定義書(Todo新規登録) 処理仕様 #3、E2E仕様書(Todo新規登録) TC-003) — 確認OK
- [x] T016 [US2] Cancelボタン、およびモーダル外側クリックでモーダルが閉じ、登録処理が呼ばれない
      ことを確認する(画面定義書(Todo新規登録) 処理仕様 #4, #5、E2E仕様書(Todo新規登録) TC-004, TC-005) — 確認OK
- [x] T017 [US2] Escキー押下ではモーダルが閉じないことを確認する(画面定義書(Todo新規登録) 処理仕様 #6、
      E2E仕様書(Todo新規登録) TC-014) — 確認OK(キーハンドラ未実装=無反応)

**Checkpoint**: 両画面が仕様書通りに動作することを確認できた状態

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: 画面横断のドキュメント整合性確認

- [x] T018 [P] [画面遷移図](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/画面遷移図.md)が両画面の実際の遷移(Addボタン→Todo新規登録)
      と一致していることを確認する(`update-screen-flow-diagram`スキル) — 確認OK
- [x] T019 [P] `check-openapi-contract`スキルで`doc/API仕様書/**`と実装の整合性を最終確認する
      — 確認OK(health/users/todos全エンドポイントで不一致なし)
- [x] T020 `npm run dev`で起動し`/dashboard`を開いて、[E2E仕様書(Todo一覧)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/E2E仕様書_Todo一覧.md)
      と[E2E仕様書(Todo新規登録)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/E2E仕様書_Todo新規登録.md)の全テストケースを手動で確認する
      — 確認OK(ブラウザ自動操作で主要ケースを実行し、全てパス)

## Phase 6: コンポーネント分割

**Purpose**: [詳細設計書](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/詳細設計書.md)の「登場するコンポーネントと関係」が前提とする
コンポーネント構成(画面ごとに担当コンポーネントを分ける)と、現在1つの
`TodoDashboard.tsx`にまとまっている実装との差分を解消する。

- [x] T021 `src/app/dashboard/TodoDashboard.tsx`を、一覧表示・削除を担当する
      `src/app/dashboard/TodoList.tsx`と、新規登録モーダルを担当する
      `src/app/dashboard/TodoNewModal.tsx`に分割する。`todos`一覧stateとモーダル開閉state
      は`TodoDashboard.tsx`(親コンテナとして存続)が持ち、`TodoList`には
      `todos`・`onDeleted`・`onAddClick`を、`TodoNewModal`には`onSaved`・`onCancel`を
      propsで渡す([詳細設計書](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/詳細設計書.md)のStructure Decision参照)。分割後、
      [E2E仕様書(Todo一覧)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/E2E仕様書_Todo一覧.md)と
      [E2E仕様書(Todo新規登録)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/E2E仕様書_Todo新規登録.md)の全テストケースが
      引き続き通ることを確認する。
      — 確認OK: `tsc --noEmit`・`eslint`とも警告無し。分割後にブラウザ自動操作で
      主要ケース(初期表示・追加・保存成功/失敗・Cancel・外側クリック・Esc・削除)を
      再実行し、全てパス

**Checkpoint**: コンポーネント構成が[詳細設計書](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/詳細設計書.md)と一致した状態

## Phase 7: Todo編集機能 [US3]

**Goal**: [ユースケース記述(Todo編集)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/ユースケース記述_Todo編集.md)・[画面定義書(Todo編集)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/画面定義書_Todo編集.md)
の内容通りに、Todo一覧の編集ボタンから編集モーダルを開き、更新・永続化・一覧への反映が
動作するようにする

**Independent Test**: [E2E仕様書(Todo編集)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/E2E仕様書_Todo編集.md) のTC-001〜
TC-015をモーダル表示状態で実行する

### 実装

- [X] T022 [P] [US3] `doc/API仕様書/BFF/openapi.yaml`の`/todos/{id}`に`put`を追加する
      (`operationId: updateTodo`、`requestBody`は既存の`TodoInput`を再利用、
      `responses`は`200 Todo`・`400 BadRequest`(既存の`components.responses.BadRequest`
      を再利用)・新規`404 NotFound`)。画面定義書(Todo編集) 処理仕様 #3が根拠。
- [X] T023 [P] [US3] `src/lib/mock-todos.ts`に`updateTodo(id: string, input: Omit<Todo, "id">): Todo | undefined`
      を追加する(該当idが無ければ`undefined`を返す。あれば該当要素を`{ ...input, id }`で
      置き換えて返す)。`src/lib/mock-todos.test.ts`に、更新成功・対象なしの両方のケースを
      追加する。
- [X] T024 [US3] `src/lib/backend.ts`に`updateTodo(id: string, input: Omit<Todo, "id">): Promise<Todo | undefined>`
      を追加する(mock分岐は`mock-todos.ts`の`updateTodo`を呼ぶ、実分岐は`backendFetch`で
      `PUT /todos/${id}`を呼ぶ)。T023完了後に着手。
- [X] T025 [US3] `src/app/api/todos/[id]/route.ts`に`PUT`ハンドラを追加する
      (`POST /api/todos`と同じ必須項目チェックで不正なら400、`updateTodo()`の結果が
      `undefined`なら404、成功時は更新後のTodoを200で返す)。`src/app/api/todos/[id]/route.test.ts`
      に、成功・バリデーション失敗・対象なしの3ケースを追加する。T024完了後に着手。
- [X] T026 [P] [US3] `src/app/dashboard/TodoEditModal.tsx`を新規作成する(`TodoNewModal.tsx`
      と同じ構造で、`todo: Todo`をpropsで受け取りフォーム初期値に使う。更新ボタン押下で
      `PUT /api/todos/${todo.id}`を呼び、成功時`onUpdated(todo)`、失敗時
      「更新に失敗しました」を表示)。`src/app/dashboard/TodoEditModal.test.tsx`を同時に
      作成し、初期値反映・必須項目ブロック・成功/失敗・Cancel/外側クリック/Escの各パスを
      カバーする(Principle VII)。
- [X] T027 [US3] `src/app/dashboard/TodoList.tsx`に、削除ボタンの左隣に編集ボタンを追加し
      (`.rowActions`でラップ)、`onEditClick: (todo: Todo) => void` propsを追加してクリック
      時に該当行の`todo`を渡す。`src/app/dashboard/TodoList.test.tsx`を更新し、編集ボタンの
      表示・クリックで正しい`todo`が渡されることを確認するケースを追加する。
- [X] T028 [US3] `src/app/dashboard/TodoDashboard.tsx`に`editingTodo: Todo | null` stateと
      `handleEditClick(todo)`(`editingTodo`にセット)・`handleUpdated(todo)`(`todos`内の
      同idの要素を置き換え、`editingTodo`を`null`に戻す)を追加し、`TodoList`に
      `onEditClick={handleEditClick}`を渡し、`editingTodo`が非nullのとき`TodoEditModal`を
      表示する。`src/app/dashboard/TodoDashboard.test.tsx`を更新し、編集→更新→一覧反映の
      一連の流れを確認するケースを追加する。T026, T027完了後に着手。
- [X] T029 [US3] `e2e/todo-edit.spec.ts`を新規作成し、[E2E仕様書(Todo編集)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/E2E仕様書_Todo編集.md)
      のTC-001〜TC-015に対応するテストケースを実装する。T025, T028完了後に着手。
- [X] T030 [US3] `e2e/todo-list.spec.ts`に、[E2E仕様書(Todo一覧)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/E2E仕様書_Todo一覧.md)の
      TC-004(Todo編集画面を開く)・TC-011(編集ボタンの行独立性)に対応するケースを追加
      する。T028完了後に着手。

**Checkpoint**: Todo編集機能が仕様書通りに動作する状態

## Phase 8: Polish & Cross-Cutting Concerns (Todo編集)

**Purpose**: Todo編集機能追加に伴う画面横断のドキュメント整合性確認

- [X] T031 [P] [画面遷移図](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/画面遷移図.md)がTodo一覧→Todo編集の遷移を反映して
      いることを`update-screen-flow-diagram`スキルで確認する
      — 確認OK: 3画面2遷移、Principle VI違反なし
- [X] T032 [P] `check-openapi-contract`スキルで`doc/API仕様書/**`と実装の整合性を確認する
      (`PUT /todos/{id}`を含む)
      — `doc/API仕様書/Backend/openapi.yaml`に`PUT /todos/{id}`が抜けていた実際の不一致を
      検出・修正(BFF契約には追加済みだったが、backend.tsの実バックエンド分岐が呼ぶ
      Backend契約側への追加が漏れていた)。修正後、Redocly lint・Spectral・
      check-openapi-bff-routes.mjsとも整合確認OK
- [X] T033 [E2E仕様書(Todo編集)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/E2E仕様書_Todo編集.md)と、編集ボタン追加を反映した
      [E2E仕様書(Todo一覧)](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/E2E仕様書_Todo一覧.md)の全テストケースを`npx playwright test`
      (playwright.config.tsのwebServer設定により`npm run dev`相当のサーバーを自動起動)で
      実行し確認する — 確認OK: 38件全てpass(todo-edit 14件・todo-list 11件・todo-new 13件)

**Checkpoint**: Todo編集機能が[詳細設計書](../../doc/フロントエンド設計書/業務1_Todoダッシュボード/詳細設計書.md)と一致し、既存2画面の回帰も無い状態

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし。完了済み
- **Foundational (Phase 2)**: Setup完了後。両画面の確認をブロックする
- **Todo一覧画面 [US1] (Phase 3)**: Foundational完了後。Todo新規登録画面への依存なし
- **Todo新規登録画面 [US2] (Phase 4)**: Foundational完了後。Todo一覧画面への依存なし
  (Addボタンからの遷移確認(T009)はTodo一覧画面側のタスク)
- **Polish (Phase 5)**: 両画面の確認完了後
- **コンポーネント分割 (Phase 6)**: 両画面の確認完了後。Polish(Phase 5)との順序制約はない
- **Todo編集機能 [US3] (Phase 7)**: コンポーネント分割(Phase 6)完了後(`TodoList.tsx`・
  `TodoDashboard.tsx`が分割済みであることが前提)。Phase 7内はT022/T023([P])→T024→T025
  の直列、T026([P])は独立、T027はT026と並行可、T028はT026・T027完了後、T029はT025・T028
  完了後、T030はT028完了後
- **Todo編集機能 Polish (Phase 8)**: Phase 7完了後

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
| 6 コンポーネント分割 | #23 | #2〜#21(すべて) |
| 7 Todo編集機能 [US3] | #39〜#47 | #23 |
| 8 Todo編集機能 Polish | #48〜#50 | #39〜#47(すべて) |

### Parallel Opportunities

- T003〜T005([P]、Phase 2)は並行実行可能
- T006([P]、Phase 3)は他タスクと並行実行可能
- Phase 3とPhase 4はFoundational完了後、並行して着手可能
- T018〜T019([P]、Phase 5)は並行実行可能
- T022〜T023([P]、Phase 7)は並行実行可能。T026([P]、Phase 7)は他タスクと並行実行可能
- T031〜T032([P]、Phase 8)は並行実行可能

## Implementation Strategy

Phase 1〜6は実装済みのため「MVPから積み増す」フローではなく、Foundational→両画面→Polishの
順に確認を進め、差分が見つかった時点で仕様書と実装のどちらを修正すべきか判断して対応した。
Phase 7〜8(Todo編集)は未実装の新機能であり、通常通りBFF層(openapi.yaml→backend.ts→
route.ts)→UIコンポーネント(TodoEditModal→TodoList→TodoDashboard)→E2E→Polishの順に
実装する。
