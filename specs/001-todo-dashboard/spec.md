# Feature Specification: Todo Dashboard

**Feature Branch**: `001-todo-dashboard` (spec directory; documented retroactively on the
existing working branch `claude/nextjs-blank-bff-project-qvd8tc` — this feature was already
built before Spec Kit was introduced)

**Created**: 2026-08-29

**Status**: Draft (retroactive — describes an already-implemented feature; see plan.md for
how the existing implementation maps to these requirements)

**Input**: User description: "ログイン不要で誰でも使える、Todoの一覧表示・追加・削除ができる
ダッシュボード画面を作りたい。Todo情報はTodo名・期限・担当者・ステータスのみ。追加は『+ Add』
ボタンからモーダルでSaveする形。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View the todo list (Priority: P1)

Any visitor opens the dashboard and sees every current todo, with its name, due date,
assignee, and status, without needing to sign in.

**Why this priority**: Without a visible list, there is nothing to act on — this is the
minimum viable slice of the feature.

**Independent Test**: Open the dashboard with no prior setup. If todos already exist, they
are listed with all four fields. If none exist, a clear "no todos" message is shown instead
of an empty table.

**Acceptance Scenarios**:

1. **Given** one or more todos exist, **When** a visitor opens the dashboard, **Then** each
   todo's name, due date, assignee, and status are displayed.
2. **Given** no todos exist, **When** a visitor opens the dashboard, **Then** a message
   indicating there are no todos is shown instead of an empty table.

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

1. **Given** the dashboard is open, **When** a visitor starts adding a todo and provides a
   name, due date, assignee, and one of the four allowed statuses, **Then** saving adds the
   todo to the list and closes the add form.
2. **Given** the add form is open, **When** a visitor cancels instead of saving, **Then** no
   todo is created and the form closes.
3. **Given** the add form is open, **When** a visitor tries to save without one or more
   required fields, **Then** the todo is not created and the visitor sees why.
4. **Given** the add form is open, **When** saving fails for any reason, **Then** the visitor
   sees an error message and their entered data is not lost.

---

### User Story 3 - Delete a todo (Priority: P3)

A visitor removes a todo they no longer need, after confirming the action.

**Why this priority**: Useful for keeping the list current, but the feature is usable without
it (view and add already deliver value), so it is the lowest-priority independent slice.

**Independent Test**: With at least one todo in the list, trigger its delete action, confirm,
and verify it is gone from the list.

**Acceptance Scenarios**:

1. **Given** a todo exists in the list, **When** a visitor triggers delete and confirms,
   **Then** the todo is removed from the list.
2. **Given** a todo exists in the list, **When** a visitor triggers delete and does not
   confirm, **Then** the todo remains unchanged.

### Edge Cases

- What happens when the list has zero todos? A "no todos" message is shown instead of an
  empty table (covered by User Story 1).
- What happens when a required field is missing on add? The todo is rejected and the visitor
  is told why, without losing what they already typed (covered by User Story 2).
- What happens when a delete is triggered but not confirmed? The todo is left untouched
  (covered by User Story 3).
- What happens if todos added or deleted in a previous visit are missing on a later visit?
  This is an accepted limitation of the current data stage, not a defect — see Assumptions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow any visitor to view the current list of todos without
  requiring login or any authentication.
- **FR-002**: System MUST display, for each todo, its name, due date, assignee, and status.
- **FR-003**: System MUST show a message indicating there are no todos when the list is
  empty, instead of an empty table.
- **FR-004**: System MUST let a visitor open an add-todo form from the dashboard.
- **FR-005**: The add form MUST require a name, due date, assignee, and status before it can
  be submitted.
- **FR-006**: The status field MUST only accept one of exactly four values: 未着手 (not
  started), 進行中 (in progress), 完了 (done), 保留 (on hold).
- **FR-007**: Submitting the add form successfully MUST close the form and immediately show
  the new todo in the list.
- **FR-008**: If submitting the add form fails, System MUST show an error message within the
  form, MUST NOT lose the visitor's entered data, and MUST NOT add the todo to the list.
- **FR-009**: The add form MUST offer a way to cancel and close without creating a todo.
- **FR-010**: System MUST let a visitor delete any todo from the list.
- **FR-011**: Before deleting, System MUST ask the visitor to confirm the action.
- **FR-012**: If the visitor confirms, System MUST remove the todo from the list immediately;
  if the visitor cancels, the todo MUST remain unchanged.

### Key Entities

- **Todo**: A task tracked on the dashboard. Attributes: name, due date, assignee (a
  free-text name of the person responsible), and status (one of the four fixed values above).
  Not owned by or scoped to any particular user — visible to and editable by anyone who can
  reach the dashboard.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor sees the full current list of todos as soon as the dashboard page
  finishes loading, with no separate loading step required.
- **SC-002**: A visitor can add a new todo and see it appear in the list in under 15 seconds,
  without leaving the dashboard page.
- **SC-003**: A visitor can delete a todo, confirm the action, and see it removed from the
  list in under 10 seconds.
- **SC-004**: 100% of add attempts missing a required field are rejected with a visible
  reason, and never silently create an incomplete todo.
- **SC-005**: 0% of single delete-button clicks result in a deletion without an explicit
  confirmation step.

## Assumptions

- No authentication or authorization exists yet; anyone who can reach the dashboard can view,
  add, and delete any todo. This is an accepted temporary state until a login feature is
  added in a future feature.
- There is a single, shared todo list — todos are not scoped per user or per team.
- Deletion is immediate and permanent once confirmed; there is no undo or recovery step.
- The four status values (未着手/進行中/完了/保留) are fixed for this version and not
  user-customizable.
- Todos added or deleted may not reliably persist across every future visit until this
  feature is connected to a permanent backend. This is an accepted limitation of the current
  data stage, not something this feature is required to fix.
