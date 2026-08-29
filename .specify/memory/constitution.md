<!--
Sync Impact Report
- Version change: (none) → 1.0.0 (initial ratification)
- Modified principles: n/a (first version)
- Added sections: Core Principles (I–V), Technology & Deployment Constraints,
  Development Workflow (Spec-Driven), Governance
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

## Technology & Deployment Constraints

- Frontend + BFF: Next.js App Router, deployed to Vercel (serverless).
- No database in this app. Data is either mocked in-app (Principle II) or
  served by a real backend reached via `BACKEND_API_URL`.
- No authentication yet. Features MUST remain usable without login until a
  future amendment adds an auth principle — do not gate features behind
  ad-hoc, unspecified auth checks.

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

**Version**: 1.0.0 | **Ratified**: 2026-08-29 | **Last Amended**: 2026-08-29
