# Feature Specification: Todo Dashboard

**Feature Branch**: `001-todo-dashboard` (spec directory; documented retroactively on the
existing working branch `claude/nextjs-blank-bff-project-qvd8tc` — this feature was already
built before Spec Kit was introduced)

**Created**: 2026-08-29

**Status**: Draft (retroactive — describes an already-implemented feature)

**Input**: User description: "ログイン不要で誰でも使える、Todoの一覧表示・追加・削除ができる
ダッシュボード画面を作りたい。Todo情報はTodo名・期限・担当者・ステータスのみ。追加は『+ Add』
ボタンからモーダルでSaveする形。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View the todo list (Priority: P1)

Any visitor opens the dashboard and sees every current todo, with its name, due date,
assignee, and status.

**Why this priority**: Without a visible list, there is nothing to act on — this is the
minimum viable slice of the feature.

**Independent Test**: Open the dashboard with no prior setup. If todos already exist, they
are listed with all four fields. If none exist, a clear "no todos" message is shown instead
of an empty table.

**Acceptance Scenarios**:

1. **Given** one or more todos exist, **When** a visitor opens the dashboard, **Then** each
   todo's name, due date, assignee, and status are displayed, in the order the todos were
   added (oldest first) — see FR-003.
2. **Given** no todos exist, **When** a visitor opens the dashboard, **Then** the text
   "Todoがありません" is shown instead of an empty table.

---

### User Story 2 - Add a todo (Priority: P2)

A visitor adds a new todo by opening a form, filling in its details, and saving it, and sees
it appear in the list immediately.

**Why this priority**: The list is only useful if visitors can add to it; this is the second
most critical capability after viewing.

**Independent Test**: From the dashboard, trigger the add action, fill in all required
fields, and save. The new todo appears in the list without reloading the page. Can be tested
independently of deletion.

**Acceptance Scenarios**:

1. **Given** the dashboard is open, **When** a visitor clicks the "+ Add" button, **Then** a
   modal titled "Todoを追加" opens, containing the fields defined in FR-010, and the
   `Todo名` input has whatever value is typed into it (form starts empty).
2. **Given** the add modal is open with all required fields filled, **When** the visitor
   clicks "Save", **Then** the todo is created, the modal closes, and the new todo appears at
   the end of the list.
3. **Given** the add modal is open, **When** the visitor clicks "Cancel" or clicks outside the
   modal (on the dimmed background), **Then** the modal closes and no todo is created. The
   Escape key does NOT close the modal — Cancel or clicking outside are the only ways.
4. **Given** the add modal is open, **When** the visitor tries to submit with `Todo名`,
   `期限`, or `担当者` empty, **Then** the browser's native required-field validation blocks
   submission and shows its own built-in message; the request is never sent — see FR-011.
5. **Given** the add modal is open and submission is attempted, **When** the server rejects
   the request or the network request fails for any reason, **Then** the fixed text
   "保存に失敗しました" is shown inside the modal, and the visitor's entered values remain in
   the form. This message text does not vary by cause — the same text is shown whether the
   server rejected the data or the network request failed outright.

---

### User Story 3 - Delete a todo (Priority: P3)

A visitor removes a todo they no longer need, after confirming the action.

**Why this priority**: Useful for keeping the list current, but the feature is usable without
it (view and add already deliver value), so it is the lowest-priority independent slice.

**Independent Test**: With at least one todo in the list, trigger its delete action, confirm,
and verify it is gone from the list.

**Acceptance Scenarios**:

1. **Given** a todo exists in the list, **When** a visitor clicks its "削除" button, **Then**
   a confirmation dialog with the text "このTodoを削除しますか？" appears.
2. **Given** the confirmation dialog is shown, **When** the visitor confirms (OK), **Then**
   the todo is removed from the list immediately.
3. **Given** the confirmation dialog is shown, **When** the visitor dismisses it (Cancel),
   **Then** the todo remains in the list, unchanged.
4. **Given** the delete request fails (server or network error), **When** this happens after
   the visitor confirmed, **Then** the todo remains in the list and no error message is
   shown — the failed delete simply appears to do nothing.

### Edge Cases

- Zero todos: the text "Todoがありません" is shown, spanning the full table width, instead of
  an empty table (User Story 1).
- Missing required field on add: blocked client-side by the browser before any request is
  sent (User Story 2, Scenario 4).
- Add/delete request failure: see User Story 2 Scenario 5 and User Story 3 Scenario 4.
- Delete confirmation dismissed: no change (User Story 3, Scenario 3).
- Todos added or deleted in a previous visit may be missing on a later visit — an accepted
  limitation of the current data stage (see Assumptions), not something this feature governs.

## Requirements *(mandatory)*

### Functional Requirements — List Display

- **FR-001**: System MUST display a table with exactly these columns, in this order:
  `Todo名`, `期限`, `担当者`, `ステータス`, and an unlabeled action column containing each
  row's delete control.
- **FR-002**: Each row MUST show, for one todo: its name, its due date, its assignee, and a
  status badge showing the status text.
- **FR-003**: Todos MUST be listed in the order they were added, oldest first. No other sort
  (e.g. by due date or status) is offered.
- **FR-004**: When there are zero todos, the System MUST show the text "Todoがありません" in
  place of the table rows.
- **FR-005**: The System MUST NOT provide sorting, filtering, or search controls for the
  list.
- **FR-006**: The System MUST NOT provide any way to edit an existing todo's fields — only
  add and delete are supported.

### Functional Requirements — Add Todo

- **FR-007**: The System MUST provide a button labeled "+ Add" that opens the add-todo modal.
- **FR-008**: The add modal MUST be titled "Todoを追加".
- **FR-009**: Opening the add modal MUST start with all fields empty and Status defaulted to
  "未着手".
- **FR-010**: The add modal MUST contain exactly these fields, top to bottom, each with the
  constraints below:

  | # | Label | Input type | Required | Allowed values / format | Length limit |
  |---|-------|-----------|----------|--------------------------|--------------|
  | 1 | Todo名 (title) | free-text | Yes | any text | none |
  | 2 | 期限 (dueDate) | date picker | Yes | any calendar date, including past dates | n/a |
  | 3 | 担当者 (assignee) | free-text | Yes | any text | none |
  | 4 | ステータス (status) | dropdown | Yes (has default) | exactly one of: 未着手, 進行中, 完了, 保留, in that order | n/a |

  `Todo名` and `担当者` accept text of any length — there is no maximum character count.
  `期限` accepts any calendar date, including dates in the past.

- **FR-011**: If a required field (`Todo名`, `期限`, `担当者`) is left empty, the System MUST
  prevent the form from being submitted (via the browser's native required-field validation,
  before any network request is made).
- **FR-012**: The add modal MUST provide two explicit ways to close it without saving: a
  button labeled "Cancel", and clicking the dimmed area outside the modal. The Cancel/Save
  buttons are labeled in English; the rest of the screen is in Japanese — this mixed labeling
  is the confirmed requirement, not a placeholder.
- **FR-013**: While a save is in progress, the Save button MUST show the text "Saving..." and
  both the Cancel and Save buttons MUST be disabled until the request finishes.
- **FR-014**: On successful save, the System MUST close the modal and add the new todo to the
  end of the list without a full page reload.
- **FR-015**: On save failure (validation rejected by the server, or a network error), the
  System MUST keep the modal open, MUST show the fixed text "保存に失敗しました" inside the
  modal, and MUST NOT clear the fields the visitor had entered.

### Functional Requirements — Delete Todo

- **FR-016**: Each row MUST have a button labeled "削除" that starts deletion of that row's
  todo.
- **FR-017**: Clicking "削除" MUST show a confirmation dialog with the exact text
  "このTodoを削除しますか？" before anything is deleted.
- **FR-018**: If the visitor confirms, the System MUST remove the todo from the list
  immediately; if the visitor cancels the dialog, the todo MUST remain unchanged.
- **FR-019**: If the delete request fails after confirmation, the System MUST leave the todo
  in the list. No failure message is shown to the visitor in this case.

### Key Entities

- **Todo**: A task tracked on the dashboard. Attributes: name (`Todo名`), due date
  (`期限`), assignee (`担当者`, a free-text name of the person responsible), and status
  (`ステータス`, one of the four fixed values in FR-010). The dashboard has a single shared
  list — todos are not scoped per user or per team.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor sees the full current list of todos, in the defined order (FR-003),
  as soon as the dashboard page finishes loading, with no separate loading step required.
- **SC-002**: A visitor can add a new todo and see it appear at the end of the list in under
  15 seconds, without leaving the dashboard page.
- **SC-003**: A visitor can delete a todo, confirm the action via the exact confirmation text
  in FR-017, and see it removed from the list in under 10 seconds.
- **SC-004**: 100% of add attempts missing a required field are blocked before a request is
  sent, and never silently create an incomplete todo.
- **SC-005**: 0% of single delete-button clicks result in a deletion without the visitor
  seeing and confirming the FR-017 dialog first.

## Assumptions

- Deletion is immediate and permanent once confirmed; there is no undo or recovery step.
- The four status values (未着手/進行中/完了/保留) and their display order are fixed for this
  version and not user-customizable.
- Todos added or deleted may not reliably persist across every future visit until this
  feature is connected to a permanent backend. This is an accepted limitation of the current
  data stage, not something this feature is required to fix.
