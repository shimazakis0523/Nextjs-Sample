<!--
Sync Impact Report
- Version change: 1.0.1 → 1.1.0 (MINOR — new principle added)
- Modified principles: n/a
- Added sections: Core Principles > VI. Spec Documents State Requirements,
  Not Process — codifies rules established while writing
  specs/001-todo-dashboard/**: spec.md in Japanese; one screen (modal
  included) per screens/<id>/spec.md, feature-level spec.md limited to
  screen list + shared entities/assumptions; spec.md states only its own
  screen/feature's requirements, no authoring-process or other-feature/
  infrastructure-status commentary; checklists/requirements.md is exempt
  as a quality-detection harness.
- Removed sections: n/a
- Deferred TODOs: none
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
`spec.md` files under `specs/**` MUST be written in Japanese. One screen —
including a modal or any other UI with its own layout and flow, even
without an independent URL — gets exactly one `screens/<screen-id>/spec.md`.
A feature directory's top-level `spec.md` is limited to the screen list,
cross-screen entities, and cross-screen assumptions; it MUST NOT duplicate
per-screen requirement detail. A `spec.md` MUST state only what its own
screen or feature does. It MUST NOT reference how or when it was authored
(e.g. "written retroactively"), project-management facts (branch names,
when a tool was adopted), or the current state of unrelated, not-yet-built
features or infrastructure (e.g. that login doesn't exist yet, that no
real backend is connected) — if a fact isn't one of this screen's own
requirements, it doesn't belong in this screen's spec. `checklists/
requirements.md` is exempt from this: it is a quality-detection harness,
not a requirements document, and may reference tooling, process, or
anything else needed to reliably catch and correct spec defects.
Rationale: a spec is handed to an implementer expecting it to describe
only what to build; process commentary and other features' status are
noise at best and, as happened when "no login yet" read as this feature
requiring no login, get mistaken for actual requirements. Splitting large
features into one file per screen keeps each file reviewable instead of
growing into one sprawling document.

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

**Version**: 1.1.0 | **Ratified**: 2026-08-29 | **Last Amended**: 2026-08-29
