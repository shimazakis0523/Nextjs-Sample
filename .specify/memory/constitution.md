<!--
Sync Impact Report
- Version change: 2.11.0 → 2.11.1 (PATCH — no Core Principle text changed;
  `specs/<feature>/tasks.md` and `specs/<feature>/screens/*/checklists/`
  (the process/tracking artifacts ADR-0013 had left in `specs/`) move to
  `tracking/<業務>/`, and the now-empty `specs/` directory is removed)
- Modified sections: none (no live principle or workflow text referenced
  `specs/` as tasks.md's path; this is a file-location-only follow-up).
- Rationale: after ADR-0013 moved every actual design document out of
  `specs/**` into `doc/**`, `specs/` held only two kinds of non-spec
  process artifacts, which reads as a contradiction of the directory's own
  name — flagged by the user as confusing. `tracking/<業務>/` is a neutral
  English name (GitHub Issue numbers and task IDs like T001 are inherently
  English-facing) that doesn't reuse `specs/`. Moving the checklist files
  also surfaced and fixed a pre-existing relative-link depth bug (one `../`
  short) in their references to the design documents. See ADR-0014 in
  `doc/common/adr/`.
- Version change: 2.10.0 → 2.11.0 (MINOR — document architecture overhaul:
  Japanese document names throughout, and the `specs/**` + `docs/**` split
  replaced by a single `doc/` tree; `spec.md`/`plan.md` as such are
  retired)
- Modified sections:
  - Principle II, III: `openapi/**` paths → `doc/API仕様書/**`.
  - Principle IV: `docs/architecture.md` → `doc/common/AP方式設計書(バック
    エンド編).md`.
  - Principle VI (redefined): a screen's ユースケース定義 and 画面定義 are
    now two separate files (「ユースケース記述」・「画面定義書」), not two
    sections of one `spec.md`. `spec.md` as a filename/concept is retired.
  - Principle VIII: governance-relevant paths updated
    (`docs/adr/**` → `doc/common/adr/**`).
  - Technology & Deployment Constraints, Development Workflow, Governance:
    all `docs/architecture.md`/`docs/adr/`/`specs/<feature>/plan.md`/
    `specs/<feature>/screen-flow.md`/`e2e-test-spec.md` references updated
    to the new `doc/` tree paths and Japanese document names.
  - New: `doc/common/`, `doc/フロントエンド設計書/<業務>/`,
    `doc/API仕様書/` tree. `openapi/**` moved to `doc/API仕様書/**`;
    `docs/architecture.md` split into `doc/common/AP方式設計書(フロント
    エンド編).md` and `doc/common/AP方式設計書(バックエンド編).md`;
    `docs/adr/**` moved to `doc/common/adr/**`; a screen's `spec.md` split
    into `ユースケース記述*.md` + `画面定義書*.md`; `plan.md` renamed
    `詳細設計書.md`; `screen-flow.md` renamed `画面遷移図.md`;
    `e2e-test-spec.md` renamed `E2E仕様書*.md`.
  - `specs/<feature>/tasks.md` and `specs/<feature>/screens/*/checklists/`
    stay at their current location (process/tracking artifacts, not design
    documents) — only their internal cross-references were updated to the
    new `doc/` paths.
  - `.github/scripts/check-spec-sync.sh`, `check-openapi-bff-routes.mjs`,
    `check-governance-issue-ref.sh` and the `speckit-*`/`update-e2e-test-
    spec`/`update-screen-flow-diagram`/`check-openapi-contract` skills
    updated for the new paths and file names.
- Rationale: this is a Japanese company; English document names and an
  artifact split across `specs/` (spec.md/plan.md/tasks.md) and `docs/`
  (architecture.md/adr/) reads as foreign convention rather than this
  org's own document set. Consolidating into one `doc/` tree with
  Japanese names the org already uses for this kind of artifact (AP方式
  設計書, 画面定義書, 詳細設計書, ユースケース記述, E2E仕様書, API仕様書)
  removes both frictions in one change, explicitly requested by the user.
  See ADR-0013 in `doc/common/adr/`.
- Version change: 2.9.0 → 2.10.0 (MINOR — new Core Principle VIII,
  Governance Change Traceability: a PR changing governance-relevant files
  (Skills, this constitution, ADRs, CI workflows/scripts) MUST reference a
  GitHub Issue, mechanically enforced by a new CI job)
- Modified sections:
  - New Core Principle VIII (Governance Change Traceability) added after
    Principle VII.
  - New `.github/scripts/check-governance-issue-ref.sh` and a new
    `governance-issue-reference` job in the "Spec consistency" workflow.
- Rationale: the Jest/Playwright test-tooling introduction and the
  Component Test Coverage gate itself (Principle VII, ADR-0011) were
  implemented directly in response to conversational requests, bypassing
  `speckit-tasks`/`speckit-taskstoissues` entirely — no GitHub Issue was
  ever created for that work, unlike `001-todo-dashboard`'s T001-T021
  which went through the full Issue-tracked pipeline (ADR-0002). ADR-0002
  had already flagged this exact gap: "この仕組みはspeckit-implementを
  経由しない変更には効かない" (this mechanism has no effect on changes
  that bypass speckit-implement). This principle closes that gap with a
  PR-level check that doesn't depend on tasks.md or any particular skill
  being run. See ADR-0012 in docs/adr/.
- Version change: 2.8.3 → 2.9.0 (MINOR — new Core Principle VII,
  Component Test Coverage: every src/app/**/*.tsx component MUST have a
  colocated unit test, added in the same change, mechanically enforced
  by a new CI job)
- Modified sections:
  - New Core Principle VII (Component Test Coverage) added after
    Principle VI.
  - New `.github/scripts/check-component-tests.sh` and a new
    `component-test-coverage` job in the "Spec consistency" workflow.
  - `speckit-plan`/`speckit-tasks`/`speckit-implement` updated to write
    or require component tests as part of the same task that adds/
    changes a component, not a separate, skippable follow-up.
- Rationale: applied to `001-todo-dashboard`, the T021 component split
  (TodoList.tsx/TodoNewModal.tsx/TodoDashboard.tsx) shipped with zero
  unit tests — the task description only asked for E2E re-verification,
  and nothing mechanically checked for missing unit coverage until a
  human caught it after the fact. Matching this project's existing
  preference for deterministic gates over relying on an instruction
  being remembered (the same reasoning behind check-spec-sync.sh and
  the Issue-based task-order gate), test coverage for components is now
  enforced by CI, not just documented as an expectation. See ADR-0011
  in docs/adr/.
- Version change: 2.8.2 → 2.8.3 (PATCH — 登場するコンポーネントと関係's
  scope explicitly includes this feature's own BFF Route Handlers, not
  React components only; diagram edges MUST be labelled by relationship
  kind so no separate legend is needed)
- Modified sections:
  - Development Workflow (Spec-Driven): the 登場するコンポーネントと関係
    bullet now says the section's scope is "every file this feature adds
    or changes with a non-obvious relationship," names Route Handlers
    explicitly, and requires labelled edges (`"props: ..."`,
    `"callback: ..."`, `"fetch: METHOD /path"`) instead of a legend.
  - `.specify/templates/overrides/plan-template.md` and `speckit-plan`
    updated with the same scope and labelling guidance.
  - `specs/001-todo-dashboard/plan.md` corrected: added `route.ts` and
    `[id]/route.ts` as diagram nodes with their own detail subsections
    (previously only a file path + one-line comment in Project
    Structure — no actual design for the BFF layer), and replaced the
    solid/dashed-arrow legend with relationship-labelled edges.
- Rationale: the component-relationship section had been read as
  React-components-only, leaving this feature's two Route Handlers with
  no design of their own — a file path and a one-line comment is not an
  implementation plan. The diagram already labelled edges with prop/
  callback names; adding the relationship kind to each label removes
  the need for a reader to remember what solid vs. dashed means. See
  ADR-0010 in docs/adr/.
- Version change: 2.8.1 → 2.8.2 (PATCH — clarifies, does not change, the
  existing "docs/architecture.md documents app-wide facts" rule: it
  documents shared *patterns*, not every specific instance of them. A
  feature introducing a new entity's backend.ts functions and
  mock-<entity>.ts file MUST list them in its own Project Structure,
  not omit them as "common infra" by pattern-matching the file name.)
- Modified sections:
  - Development Workflow (Spec-Driven): the "App-wide technical facts"
    bullet gains the pattern-vs-instance distinction above and
    references ADR-0009.
  - `docs/architecture.md`'s repository layout gains a clarifying note
    with the same distinction.
  - `.specify/templates/overrides/plan-template.md` and `speckit-plan`
    updated with the same guidance.
  - `specs/001-todo-dashboard/plan.md` corrected: `src/lib/mock-todos.ts`
    (new) and the `getTodos`/`createTodo`/`deleteTodo` functions added
    to `src/lib/backend.ts` (change) were previously omitted as "common
    infra, see docs/architecture.md" — both were in fact introduced by
    this feature's own implementation commit.
- Rationale: applied to 001-todo-dashboard, `git log` showed
  `mock-todos.ts` and the three Todo-specific `backend.ts` functions
  were added in the same commit that implemented the Todo dashboard
  feature itself — not pre-existing infrastructure. plan.md's Project
  Structure had been silently omitting them because they share a file
  name/pattern with docs/architecture.md's generic description, which
  hid this feature's own touch-points instead of documenting them. See
  ADR-0009 in docs/adr/.
- Version change: 2.8.0 → 2.8.1 (PATCH — reorders 登場するコンポーネント
  と関係's content, same two-section scope as 2.8.0: the Mermaid diagram
  now comes first as a whole-picture overview, followed by a `###`
  subsection per component giving its role plus detail the diagram
  can't show, replacing the flat role table that used to precede the
  diagram)
- Version change: 2.7.0 → 2.8.0 (MINOR — plan.md trimmed to exactly two
  sections, 登場するコンポーネントと関係 and Project Structure; Summary,
  Technical Context, Constitution Check, and Complexity Tracking are
  dropped entirely, not just trimmed of duplication)
- Modified sections:
  - Development Workflow (Spec-Driven): the plan.md bullet now states
    plan.md holds exactly two sections and enumerates what's excluded.
    The "App-wide technical facts" bullet no longer mentions Technical
    Context (that section no longer exists) — the docs/architecture.md
    reference now lives in Project Structure only.
  - `.specify/templates/overrides/plan-template.md` and `speckit-plan`
    updated to fill only the two remaining sections.
  - `specs/001-todo-dashboard/plan.md` trimmed to match.
- Rationale: applied in practice, Summary duplicated the
  component-relationship section's own explanation of what each file
  does; Technical Context shrank to a single docs/architecture.md
  reference line plus mostly-empty Performance Goals/Scale/Scope;
  Constitution Check re-derived what constitution.md's principles
  already state without adding information; Complexity Tracking has
  never once held content in this project (no violation has occurred).
  Dropping them keeps plan.md to what has actually proven useful, at the
  cost of no longer running a per-feature constitution-compliance gate
  inside plan.md itself — compliance is still checked by
  check-openapi-contract and code review, and a principle violation
  needing justification still gets its own ADR. See ADR-0008 in
  docs/adr/.
- Version change: 2.6.1 → 2.7.0 (MINOR — reverts the per-screen plan.md
  split from 2.6.0/2.6.1 back to one plan.md per feature, always. Same
  scale of change as the split itself, in the opposite direction.)
- Modified sections:
  - Development Workflow (Spec-Driven): the plan.md bullet no longer
    branches on whether a feature has screens. It is always exactly one
    `plan.md` per feature, at `specs/<feature>/plan.md`. The
    screen-specific wording (screens/<screen-id>/plan.md, feature-root
    plan.md not existing) is removed.
  - `.specify/templates/overrides/plan-template.md` reverted to
    feature-level Input (the feature's spec.md, not a screen's), but
    keeps two improvements discovered during the per-screen experiment:
    a "登場するコンポーネントと関係" component-relationship table +
    Mermaid diagram section (now naturally one copy per feature, not
    duplicated per screen), and the dropped "Documentation (this
    feature)" file-tree section (identical boilerplate regardless of
    granularity).
  - `speckit-plan`/`speckit-tasks`/`speckit-implement`/`speckit-analyze`/
    `speckit-converge`/`speckit-checklist` reverted to assuming a single
    feature-root `plan.md`; `speckit-plan` keeps the instruction to fill
    the component-relationship diagram when the feature's screens share
    state or components.
  - `.specify/scripts/bash/check-prerequisites.sh`, `setup-tasks.sh`, and
    `setup-plan.sh` reverted to their unconditional feature-root
    `plan.md` requirement (the ADR-0006/2.6.1 patch accepting
    `screens/*/plan.md` is removed along with the feature it supported).
- Rationale: applied to `001-todo-dashboard`, per-screen plan.md produced
  two files that both needed the same component-relationship diagram
  (todo-list and todo-new share a state-holding parent component),
  duplicating it rather than eliminating redundancy. The one design
  decision that mattered most (who owns the shared `todos` state) is a
  feature-level fact, not a screen-level one, and splitting it across
  files hid the whole picture instead of clarifying it. Reverting to a
  single, unconditional rule (always plan at feature level) is simpler
  to follow than a conditional one (screen-level when independent,
  feature-level when shared) and avoids re-litigating which case applies
  each time a new feature is planned. See ADR-0007 in `docs/adr/`, which
  supersedes ADR-0006.
-->

# Nextjs Sample (BFF) Constitution

## Core Principles

### I. BFF-Only Backend Access
The browser MUST only ever call this app's own `/api/**` Route Handlers
(`src/app/api/**`); it MUST NOT call an external backend directly. All
communication with the real backend goes through `src/lib/backend.ts`.
Route Handlers and Server Components MUST NOT import mock storage
(`src/lib/mock-*.ts`) or `src/lib/backend-client.ts` directly — only
`backend.ts`'s exported functions (e.g. `getTodos`, `createTodo`).
Rationale: a single call-through point is what makes swapping the mock for
a real backend a one-file change instead of a hunt across the codebase, and
keeps upstream URLs/credentials out of client-reachable code.

### II. Mock/Real Backend Swap Point
`src/lib/backend.ts` decides mock vs. real backend purely on whether
`BACKEND_API_URL` is set. Every function it exports follows the same
shape: a mock branch backed by `src/lib/mock-*.ts`, and a real branch that
calls `backendFetch()` from `backend-client.ts`. Mock data MUST match the
shape documented in `doc/API仕様書/Backend/openapi.yaml`.
Rationale: callers (Route Handlers, Server Components) never know or care
which branch is live; pointing `BACKEND_API_URL` at a real backend must
require zero changes to any caller.

### III. Contract-First APIs (OpenAPI)
Every public BFF endpoint MUST be documented in
`doc/API仕様書/BFF/openapi.yaml`; every call `backend.ts` makes to
`BACKEND_API_URL` MUST be documented in `doc/API仕様書/Backend/openapi.yaml`.
Shared shapes (Todo, User, Error, ...) live in
`doc/API仕様書/common/schemas/**` and are `$ref`'d from both, not
duplicated. A change to an endpoint's path, method, request/response
fields, or status codes MUST update the corresponding YAML in the same
change. Run the `check-openapi-contract` skill before treating an API
change as complete.
Rationale: the YAML is the source of truth a future real-backend
implementer builds against, and drift between contract and code defeats
the point of having a contract at all.

Feature directories MUST NOT include a `contracts/` or similar directory.
A feature's endpoint names and methods belong in its 画面定義書's 処理仕様
table (where each row states the triggering operation and its endpoint),
and the detailed contract (request/response shape, status codes, error
behavior) lives exclusively in `doc/API仕様書/BFF/openapi.yaml` and
`doc/API仕様書/Backend/openapi.yaml`. A separate `contracts/` directory
adds nothing except a duplicate pointer to those same YAML files, creating
maintenance overhead with zero information gain.

### IV. Serverless-Safe State
Code MUST assume Route Handlers do not share memory across requests in
production (Vercel is serverless — see
`doc/common/AP方式設計書(バックエンド編).md` caveats).
In-memory, `globalThis`-cached
mocks are acceptable for local development and demos only, and MUST NOT be
presented as durable storage. Real persistence needs are satisfied by
pointing `BACKEND_API_URL` at a real backend, not by adding a database to
this Next.js app itself.
Rationale: matches Next.js's own documented BFF deployment caveat, and
keeps this app's responsibility scoped to "frontend + BFF," not data
ownership.

### V. Minimal, Scoped Implementation
Implement only what was requested: no speculative abstractions, no unused
feature flags, no defensive handling for cases the app's own guarantees
already rule out. Comments explain non-obvious "why" only — never restate
what the code already says.
Rationale: this is a small sample/learning project; every added layer of
indirection has to earn its place by making something easier to change,
not harder to read.

### VI. Design Documents State Requirements, Not Process
This project's screen-level design documents live under
`doc/フロントエンド設計書/<業務>/` and MUST be written in Japanese. One
screen — including a modal or any other UI with its own layout and flow,
even without an independent URL — gets exactly one **ユースケース記述**
document and exactly one **画面定義書** document (two separate files, not
sections of one file), each titled after the business action the screen
performs (e.g. "Todo新規登録"), not after "screen" (not "Todoダッシュ
ボード画面"). A business (業務)'s **詳細設計書** (one per business,
`doc/フロントエンド設計書/<業務>/詳細設計書.md`) is limited to the
component-relationship design and an overview/screen list; it MUST NOT
duplicate per-screen detail and MUST NOT define an entity/data model — the
data model is a server-side concern already captured in
`doc/API仕様書/common/schemas/**`, and a screen's own field-level
constraints belong in that screen's own 画面定義書's 画面入出力仕様 table
instead.

**ユースケース記述** MUST contain one or more ユースケース記述 entries,
each with アクター, 事前条件, 基本フロー, 代替/例外フロー, and 事後条件.
It MUST NOT use agile user-story framing (prioritization, independent-test
notes) or Given/When/Then acceptance scenarios — a user story and a screen
specification are different things.

**画面定義書** MUST be split into:
- **画面入出力仕様**: every element rendered on the screen — inputs,
  static or conditionally-shown text, badges, buttons, dialogs, all of
  it, not just input fields. One row per element. An element's
  look-and-feel and constraints MUST live entirely inside that element's
  own row; MUST NOT be described in prose outside the table.
- **処理仕様**: one row per trigger (initial display, or a screen
  operation). The 初期表示 (initial display) row MUST be first; other
  rows SHOULD follow the on-screen order of the controls they respond to.
  This table MUST stay scoped to frontend-observable behavior: when a row
  calls a BFF endpoint, it MUST name that endpoint (method + path, e.g.
  `POST /api/todos`) — that's a contract fact both sides need, not an
  internal detail — but MUST NOT restate that endpoint's own request/
  response shape, status codes, or backend-internal behavior (database
  writes, persistence); those stay solely in
  `doc/API仕様書/BFF/openapi.yaml`, cited by reference. A row states only
  how success/failure branch from the screen's own point of view.

`.specify/templates/overrides/spec-template.md` holds this structure so
`/speckit-specify` produces both files by default; edit that file, not
this constitution, to adjust the template itself.

A ユースケース記述/画面定義書 MUST state only what its own screen does. It
MUST NOT reference how or when it was authored (e.g. "written
retroactively"), project-management facts (branch names, when a tool was
adopted), or the current state of unrelated, not-yet-built features or
infrastructure (e.g. that login doesn't exist yet, that no real backend
is connected). Its own header MUST NOT include a cross-reference to its
parent business directory (its file path already shows that) or a
document status/workflow field (e.g. "Draft") — document lifecycle is
tracked by the PR/review process, not written into the design content
itself. A screen's design documents MUST NOT state which screen(s) launch
it (its entry point) — any screen can be launched from any screen, now or
in a future change, so recording an entry point bakes in a dependency
that doesn't reflect reality. A screen MUST state its own outbound
navigation instead: each of its own buttons/links, as a row in 画面入出力
仕様, and where it leads, as a row in 処理仕様. `checklists/requirements.md`
is exempt from all of the above: it is a quality-detection harness, not a
requirements document, and may reference tooling, process, or anything
else needed to reliably catch and correct defects in these documents.

Business (業務) directories under `doc/フロントエンド設計書/` MUST NOT
include `research.md`, `quickstart.md`, or `data-model.md`. These files
create redundancy and confusion:
- **research.md**: Project-wide architectural decisions belong in
  `constitution.md` and `doc/common/adr/`, not repeated per-business.
  Business-specific background (market research, user interviews) is rare
  enough that contextual notes in the design documents themselves
  suffice.
- **quickstart.md**: Implementation onboarding is the responsibility of
  code comments and the implementer's familiarity with constitution.md;
  repeating per-business is maintenance overhead.
- **data-model.md**: The data model is a server-side concern defined in
  `doc/API仕様書/common/schemas/**` and referenced from contract YAML; it
  does not belong in a frontend design document.

A screen's ユースケース記述 header MAY cite a `**モックアップ**` field
naming the Artifact URL of the mockup (produced by the `design` skill)
that its content was authored from — see Development Workflow below for
when a mockup is required. This is the one exception to the
no-header-cross-reference rule above, and it works differently from the
`doc/API仕様書/BFF/openapi.yaml` citation in 処理仕様: that citation
defers to a contract that MUST stay in sync with the design documents, so
they never restate it, whereas the mockup is a snapshot of the visual
agreement at authoring time — 画面入出力仕様/処理仕様 MUST still be fully
self-contained (never "see mockup for details"), the design documents are
authoritative over the mockup once they diverge, and the mockup is not
required to be kept current after they change.
Rationale: a screen's design documents are handed to an implementer
expecting them to describe exactly what to build, in the shape a screen
designer actually needs — item-level detail and event-by-event behavior —
not a backlog artifact (user stories exist to sequence incremental
delivery, not to state what a screen does) and not process commentary or
another feature's status (noise at best, and as happened when "no login
yet" read as this feature requiring no login, mistaken for actual
requirements). A data model belongs with the API contract that defines
it, not repeated into every screen that happens to display it. Splitting
a screen's use cases from its screen definition — and splitting a large
business into one such pair of files per screen — keeps every file
reviewable instead of growing into one sprawling document, and matches
this organization's own naming for this kind of artifact
(ユースケース記述, 画面定義書).

### VII. Component Test Coverage

Every React component this project authors under `src/app/**` (any `.tsx`
file whose name is not one of Next.js App Router's own special filenames —
`page`, `layout`, `template`, `loading`, `error`, `global-error`,
`not-found`, `default`, which are framework entry points, not this
project's own components) MUST have a colocated unit test
(`<Component>.test.tsx`, Jest + `@testing-library/react`) covering its own
props/callback contract and its success/failure paths. The test MUST be
added or updated in the same change that adds or changes the component —
not deferred to a follow-up task.
`.github/scripts/check-component-tests.sh` (the `component-test-coverage`
job in the "Spec consistency" GitHub Actions workflow) enforces this on
every PR against `main`: a changed component file with no matching test
file fails CI.
Rationale: a skill instruction alone already failed to catch this once —
`TodoList.tsx`/`TodoNewModal.tsx`/`TodoDashboard.tsx` (the component split
from Principle-driven `plan.md` design) shipped with zero unit tests,
found only after the fact, because the task that created them asked only
for E2E re-verification and nothing mechanically checked for missing unit
coverage. A deterministic CI gate, not reliance on remembering, is what
guarantees this doesn't recur. See ADR-0011 in `doc/common/adr/`.

### VIII. Governance Change Traceability

A PR that changes any governance-relevant file — anything under
`.claude/skills/**`, this constitution (`.specify/memory/constitution.md`),
any ADR under `doc/common/adr/**`, or `.github/workflows/**`/
`.github/scripts/**` — MUST reference a GitHub Issue (`#<number>`) in its
PR body or in at least one of its commit messages, even when the change
wasn't produced by `/speckit-tasks` + `/speckit-taskstoissues` (e.g. an
ad-hoc process/tooling change made directly in conversation). This does
not require the tasks.md-based Issue-order gate machinery described in the
Governance section below (ADR-0002) — only that an Issue exists and is
referenced, so the change is traceable to a documented reason.
`.github/scripts/check-governance-issue-ref.sh` (the
`governance-issue-reference` job in the "Spec consistency" GitHub Actions
workflow) enforces this on every PR against `main`.
Rationale: the GitHub Issue-based task-order gate (see Governance section
below, ADR-0002) only fires when `/speckit-implement` runs against a
`tasks.md` that already carries Issue mapping tables — it has no effect on
work that never goes through that pipeline at all. That is exactly what
happened when Jest/Playwright tooling and the Component Test Coverage gate
itself (Principle VII, ADR-0011) were implemented directly from
conversational requests, without ever creating a GitHub Issue. See
ADR-0012 in `doc/common/adr/`.

## Technology & Deployment Constraints

See `doc/common/AP方式設計書(フロントエンド編).md` and
`doc/common/AP方式設計書(バックエンド編).md` for the concrete current tech
stack, dependency list, and repository layout; this section states
binding constraints, not an inventory.

- Frontend + BFF: Next.js App Router, deployed to Vercel (serverless).
- No database in this app. Data is either mocked in-app (Principle II) or
  served by a real backend reached via `BACKEND_API_URL`.
- Authentication is not yet part of this project's infrastructure. Do not
  add feature-specific or ad-hoc login/session checks to work around that —
  when authentication is introduced, it MUST be its own amendment applied
  consistently across features, not bolted onto one feature at a time.

## Development Workflow (Spec-Driven)

- New features go through `/speckit-specify` → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement`, not straight from conversation
  to code.
- A new feature that introduces one or more screens MUST start from an
  agreed mockup (the `design` skill), before `/speckit-specify` runs —
  agreeing on visual design and outward functionality as a mockup first
  removes the ambiguity of describing a screen in natural-language prose
  alone. `/speckit-specify` MUST check for an agreed mockup and halt,
  directing to the `design` skill, if none exists. This does not apply
  to features with no screen (e.g. a purely internal BFF change). See
  ADR-0004 in `doc/common/adr/`.
- App-wide technical facts (language/version, primary dependencies,
  target platform, project type, storage mechanism, repository layout)
  that hold for every feature MUST be documented once in
  `doc/common/AP方式設計書(フロントエンド編).md` /
  `doc/common/AP方式設計書(バックエンド編).md`, not repeated in any
  詳細設計書. A 詳細設計書's Project Structure MUST list only the paths
  that business's own scope adds or changes, not paths the AP方式設計書
  documents as shared across every feature. The AP方式設計書 documenting
  a *pattern* (e.g. `backend.ts` hosting every entity's swap-point
  functions in one file, or the `mock-<entity>.ts` naming convention)
  does NOT make a specific instance of that pattern shared: a feature
  introducing a new entity MUST list the specific functions it adds to
  `backend.ts` (as a change) and its specific `mock-<entity>.ts` file (as
  an addition) in its own Project Structure, not omit them as "common
  infra" merely because they live in or resemble an already-documented
  shared file. See ADR-0005 and ADR-0009 in `doc/common/adr/`.
- A business MUST have exactly one 詳細設計書, at
  `doc/フロントエンド設計書/<業務>/詳細設計書.md` — always at
  business/feature level, never split per screen, even when the business
  has multiple screens (ADR-0007, superseding ADR-0006's per-screen
  split). 詳細設計書 holds exactly two sections: **登場するコンポーネント
  と関係** (scoped to every file this business adds or changes that has a
  non-obvious relationship to another — not React components only: this
  business's own BFF Route Handlers under `src/app/api/**` MUST get the
  same treatment, since a file path and a one-line comment in Project
  Structure is not a design for that layer. A Mermaid diagram of how
  these files relate — props/callbacks between components, or a Client
  Component's fetch call to this business's own Route Handler — comes
  first as the whole-picture overview, with every edge labelled by what
  kind of relationship it is (e.g. `"props: ..."`, `"callback: ..."`,
  `"fetch: METHOD /path"`) so the diagram needs no separate legend.
  Followed by one subsection per involved file giving its role on the
  first line — never a bare file name with no explanation — plus
  whatever detail the diagram itself can't show. Required when any two of
  this business's files have such a relationship; omitted only when every
  file is fully self-contained) and **Project Structure** (the Source
  Code paths this business adds or changes, and a Structure Decision).
  詳細設計書 MUST NOT include a Summary, Technical Context, Constitution
  Check, Complexity Tracking, or "Documentation (this feature)" file-tree
  section — applied to Todoダッシュボード, each of these either
  duplicated the component-relationship section or restated
  constitution.md without adding information. See ADR-0008 and ADR-0010
  in `doc/common/adr/`.
- Use `/speckit-clarify` when requirements are ambiguous, before
  `/speckit-plan`.
- Run `/speckit-analyze` after `/speckit-tasks` and before
  `/speckit-implement` to catch drift between the design documents,
  詳細設計書, and tasks.
- Any task that touches `src/app/api/**` or `src/lib/backend.ts` MUST
  include updating the relevant `doc/API仕様書/**/*.yaml` as part of the
  task itself, not as a follow-up.
- Adding, changing, or removing a 処理仕様 row that states a screen's own
  outbound navigation (Principle VI) MUST be followed by running the
  `update-screen-flow-diagram` skill to regenerate the corresponding
  `doc/フロントエンド設計書/<業務>/画面遷移図.md` before the change is
  considered complete.
- Adding, changing, or removing a screen's ユースケース記述 or 画面定義書
  content MUST be followed by running the `update-e2e-test-spec` skill to
  regenerate that screen's E2E仕様書 (its "仕様から導出したテストケース"
  section only — "追加のテスト観点" is preserved) before the change is
  considered complete.
- When a feature's `tasks.md` carries the GitHub Issues mapping tables
  produced by `speckit-taskstoissues` (task↔Issue, phase↔prerequisite-
  Issue), `speckit-implement` MUST check the prerequisite Issues'
  GitHub state (open/closed) before implementing a phase's tasks, and
  MUST skip that phase — reporting which Issue(s) are still open —
  instead of implementing it when a prerequisite Issue isn't closed.
  Task order is enforced by GitHub Issue state, not by a session
  remembering the Phase Dependencies described in prose.
- A feature is never considered permanently "done": a later spec change
  or bug fix goes through `/speckit-converge` to append a new
  `## Phase N: Convergence` section to `tasks.md`, then
  `/speckit-taskstoissues` (run again — it only creates Issues for the
  new tasks) MUST register the newly appended phase in the GitHub
  Issues mapping tables before `/speckit-implement` runs it. A phase
  absent from those tables is treated by `/speckit-implement`'s gate as
  blocked (fail closed), never as having no prerequisites.

## Governance

This constitution supersedes ad-hoc conversational decisions: where it
conflicts with an earlier undocumented choice, this document wins unless
formally amended.

Amendments: propose the change, get explicit user approval, then update
via `/speckit-constitution`. Version bumps follow semantic versioning —
MAJOR for removing or redefining a principle, MINOR for adding or
materially expanding one, PATCH for wording/clarification only.

Compliance review: before `/speckit-implement` runs tasks touching
`src/app/api/**` or `src/lib/backend.ts`, run the `check-openapi-contract`
skill to confirm no contract drift was introduced. Before marking a task
that adds or changes a component under `src/app/**` as complete, confirm
its `<Component>.test.tsx` exists and `npm test` passes (Principle VII).
Before opening a PR that changes any Skill, this constitution, an ADR, or
a CI workflow/script — including one made directly in conversation, not
through `/speckit-tasks` — create or reuse a GitHub Issue for the change
and reference it in the PR body or a commit message (Principle VIII).

**Version**: 2.11.1 | **Ratified**: 2026-08-29 | **Last Amended**: 2026-08-31
