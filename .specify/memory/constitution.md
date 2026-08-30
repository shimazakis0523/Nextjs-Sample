<!--
Sync Impact Report
- Version change: 2.0.2 → 2.1.0 (MINOR — Development Workflow section
  materially expanded)
- Modified sections: Development Workflow (Spec-Driven) gains a bullet
  requiring the new `update-test-spec` skill to run (regenerating a
  screen's test-spec.md) whenever its ユースケース定義/画面入出力仕様/
  処理仕様 changes — mirrors the existing update-screen-flow-diagram
  rule. test-spec.md is an E2E-test-case document derived from a
  screen's spec.md (never from source code or used for unit tests —
  unit tests belong with plan.md's internal design, which spec.md
  deliberately doesn't define); it has a generated section (仕様から
  導出したテストケース, owned by the skill) and a preserved section
  (追加のテスト観点, human-owned, never overwritten).
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

### IV. Serverless-Safe State
Code MUST assume Route Handlers do not share memory across requests in
production (Vercel is serverless — see
`openapi/README.md` / `README.md` caveats). In-memory, `globalThis`-cached
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
  仕様, or 処理仕様 MUST be followed by running the `update-test-spec`
  skill to regenerate that screen's `test-spec.md` (its "仕様から導出した
  テストケース" section only — "追加のテスト観点" is preserved) before the
  change is considered complete.

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

**Version**: 2.1.0 | **Ratified**: 2026-08-29 | **Last Amended**: 2026-08-29
