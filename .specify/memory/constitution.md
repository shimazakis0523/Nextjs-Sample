<!--
Sync Impact Report
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
shape documented in `openapi/backend/openapi.yaml`.
Rationale: callers (Route Handlers, Server Components) never know or care
which branch is live; pointing `BACKEND_API_URL` at a real backend must
require zero changes to any caller.

### III. Contract-First APIs (OpenAPI)
Every public BFF endpoint MUST be documented in `openapi/bff/openapi.yaml`;
every call `backend.ts` makes to `BACKEND_API_URL` MUST be documented in
`openapi/backend/openapi.yaml`. Shared shapes (Todo, User, Error, ...) live
in `openapi/common/schemas/**` and are `$ref`'d from both, not duplicated.
A change to an endpoint's path, method, request/response fields, or status
codes MUST update the corresponding YAML in the same change. Run the
`check-openapi-contract` skill before treating an API change as complete.
Rationale: the YAML is the source of truth a future real-backend
implementer builds against, and drift between contract and code defeats
the point of having a contract at all.

Feature directories MUST NOT include a `contracts/` or similar directory.
A feature's endpoint names and methods belong in its `spec.md` 処理仕様 table
(where each row states the triggering operation and its endpoint), and the
detailed contract (request/response shape, status codes, error behavior)
lives exclusively in `openapi/bff/openapi.yaml` and `openapi/backend/openapi.yaml`.
A separate `contracts/` directory adds nothing except a duplicate pointer to
those same YAML files, creating maintenance overhead with zero information gain.

### IV. Serverless-Safe State
Code MUST assume Route Handlers do not share memory across requests in
production (Vercel is serverless — see `docs/architecture.md` caveats).
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

### VI. Spec Documents State Requirements, Not Process
`spec.md` files under `specs/**` MUST be written in Japanese, and MUST
include a table of contents. One screen — including a modal or any other
UI with its own layout and flow, even without an independent URL — gets
exactly one `screens/<screen-id>/spec.md`, titled after the business
action it performs (e.g. "Todo新規登録"), not after "screen" (not
"Todoダッシュボード画面"). A feature directory's top-level `spec.md` is
limited to the screen list; it MUST NOT duplicate per-screen detail and
MUST NOT define an entity/data model — the data model is a server-side
concern already captured in `openapi/common/schemas/**`, and a screen's
own field-level constraints belong in that screen's own 画面入出力仕様
table instead.

A screen's `spec.md` MUST be organized as exactly two parts:

- **ユースケース定義** (use-case definitions): one or more ユースケース
  記述, each with アクター, 事前条件, 基本フロー, 代替/例外フロー, and
  事後条件. A screen's `spec.md` MUST NOT use agile user-story framing
  (prioritization, independent-test notes) or Given/When/Then acceptance
  scenarios — a user story and a screen specification are different
  things.
- **画面定義** (screen definition), split into:
  - **画面入出力仕様**: every element rendered on the screen — inputs,
    static or conditionally-shown text, badges, buttons, dialogs, all of
    it, not just input fields. One row per element. An element's
    look-and-feel and constraints MUST live entirely inside that
    element's own row; MUST NOT be described in prose outside the table.
  - **処理仕様**: one row per trigger (initial display, or a screen
    operation). The 初期表示 (initial display) row MUST be first; other
    rows SHOULD follow the on-screen order of the controls they respond
    to. This table MUST stay scoped to frontend-observable behavior: when
    a row calls a BFF endpoint, it MUST name that endpoint (method + path,
    e.g. `POST /api/todos`) — that's a contract fact both sides need, not
    an internal detail — but MUST NOT restate that endpoint's own request/
    response shape, status codes, or backend-internal behavior (database
    writes, persistence); those stay solely in `openapi/bff/openapi.yaml`,
    cited by reference. A row states only how success/failure branch from
    the screen's own point of view.

`.specify/templates/overrides/spec-template.md` holds this structure so
`/speckit-specify` produces it by default; edit that file, not this
constitution, to adjust the template itself.

A `spec.md` MUST state only what its own screen or feature does. It MUST
NOT reference how or when it was authored (e.g. "written retroactively"),
project-management facts (branch names, when a tool was adopted), or the
current state of unrelated, not-yet-built features or infrastructure
(e.g. that login doesn't exist yet, that no real backend is connected).
A `spec.md`'s own header MUST NOT include a cross-reference to its parent
feature directory (its file path already shows that) or a document
status/workflow field (e.g. "Draft") — document lifecycle is tracked by
the PR/review process, not written into the design content itself.
A screen's `spec.md` MUST NOT state which screen(s) launch it (its entry
point) — any screen can be launched from any screen, now or in a future
change, so recording an entry point bakes in a dependency that doesn't
reflect reality. A screen's `spec.md` MUST state its own outbound
navigation instead: each of its own buttons/links, as a row in 画面入出力
仕様, and where it leads, as a row in 処理仕様. `checklists/requirements.md`
is exempt from all of the above: it is a quality-detection harness, not a
requirements document, and may reference tooling, process, or anything
else needed to reliably catch and correct spec defects.

Feature directories MUST NOT include `research.md`, `quickstart.md`, or
`data-model.md`. These files create redundancy and confusion:
- **research.md**: Project-wide architectural decisions belong in
  `constitution.md` and `docs/adr/`, not repeated per-feature.
  Feature-specific background (market research, user interviews) is rare
  enough that contextual notes in spec.md itself suffice.
- **quickstart.md**: Implementation onboarding is the responsibility of
  code comments and the implementer's familiarity with constitution.md;
  repeating per-feature is maintenance overhead.
- **data-model.md**: The data model is a server-side concern defined in
  `openapi/common/schemas/**` and referenced from contract YAML; it does
  not belong in a frontend spec.

A screen's `spec.md` header MAY cite a `**モックアップ**` field naming the
Artifact URL of the mockup (produced by the `design` skill) that its
ユースケース定義/画面入出力仕様 were authored from — see Development
Workflow below for when a mockup is required. This is the one exception
to the no-header-cross-reference rule above, and it works differently
from the `openapi/bff/openapi.yaml` citation in 処理仕様: that citation
defers to a contract that MUST stay in sync with the spec, so the spec
never restates it, whereas the mockup is a snapshot of the visual
agreement at authoring time — 画面入出力仕様/処理仕様 MUST still be fully
self-contained (never "see mockup for details"), spec.md is authoritative
over the mockup once they diverge, and the mockup is not required to be
kept current after spec.md changes.
Rationale: a spec is handed to an implementer expecting it to describe
exactly what to build, in the shape a screen designer actually needs —
item-level detail and event-by-event behavior — not a backlog artifact
(user stories exist to sequence incremental delivery, not to state what a
screen does) and not process commentary or another feature's status
(noise at best, and as happened when "no login yet" read as this feature
requiring no login, mistaken for actual requirements). A data model
belongs with the API contract that defines it, not repeated into every
screen that happens to display it. Splitting large features into one file
per screen, each with its own table of contents, keeps every file
reviewable instead of growing into one sprawling document.

## Technology & Deployment Constraints

See `docs/architecture.md` for the concrete current tech stack, dependency
list, and repository layout; this section states binding constraints, not
an inventory.

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
  ADR-0004 in `docs/adr/`.
- App-wide technical facts (language/version, primary dependencies,
  target platform, project type, storage mechanism, repository layout)
  that hold for every feature MUST be documented once in
  `docs/architecture.md`, not repeated in any `plan.md`. `plan.md`'s
  Project Structure MUST list only the paths that plan's own scope adds
  or changes, not paths `docs/architecture.md` already documents. See
  ADR-0005 in `docs/adr/`.
- A feature MUST have exactly one `plan.md`, at `specs/<feature>/plan.md`
  — always at feature level, never split per screen, even when the
  feature has multiple screens (ADR-0007, superseding ADR-0006's
  per-screen split). `plan.md` holds exactly two sections:
  **登場するコンポーネントと関係** (a Mermaid diagram of how props/callbacks
  flow between components, shown first as the whole-picture overview,
  followed by one subsection per involved file giving its role on the
  first line — never a bare file name with no explanation — plus
  whatever detail the diagram itself can't show; required when the
  feature's screens share a parent component or state, omitted when
  every screen's component is fully self-contained)
  and **Project Structure** (the Source Code paths this feature adds or
  changes, and a Structure Decision). `plan.md` MUST NOT include a
  Summary, Technical Context, Constitution Check, Complexity Tracking,
  or "Documentation (this feature)" file-tree section — applied to
  `001-todo-dashboard`, each of these either duplicated the
  component-relationship section or restated constitution.md without
  adding information. See ADR-0008 in `docs/adr/`.
- Use `/speckit-clarify` when requirements are ambiguous, before
  `/speckit-plan`.
- Run `/speckit-analyze` after `/speckit-tasks` and before
  `/speckit-implement` to catch drift between spec, plan, and tasks.
- Any task that touches `src/app/api/**` or `src/lib/backend.ts` MUST
  include updating the relevant `openapi/**/*.yaml` as part of the task
  itself, not as a follow-up.
- Adding, changing, or removing a 処理仕様 row that states a screen's own
  outbound navigation (Principle VI) MUST be followed by running the
  `update-screen-flow-diagram` skill to regenerate the corresponding
  `specs/<feature-directory>/screen-flow.md` before the change is
  considered complete.
- Adding, changing, or removing a screen's ユースケース定義, 画面入出力
  仕様, or 処理仕様 MUST be followed by running the `update-e2e-test-spec`
  skill to regenerate that screen's `e2e-test-spec.md` (its "仕様から導出した
  テストケース" section only — "追加のテスト観点" is preserved) before the
  change is considered complete.
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
skill to confirm no contract drift was introduced.

**Version**: 2.8.1 | **Ratified**: 2026-08-29 | **Last Amended**: 2026-08-30
