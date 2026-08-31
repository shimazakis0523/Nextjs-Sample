---
name: "speckit-plan"
description: "Execute the implementation planning workflow using the plan template to generate design artifacts."
argument-hint: "Optional guidance for the planning phase"
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "templates/commands/plan.md"
user-invocable: true
disable-model-invocation: false
---


## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before planning)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_plan` key
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- When constructing command invocations from hook command names, replace dots (`.`) with hyphens (`-`). For example, `speckit.git.commit` → `/speckit-git-commit`.
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```
  - **Mandatory hook** (`optional: false`):
    ```
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}

    Wait for the result of the hook command before proceeding to the Outline.
    ```
    After emitting the block above you MUST actually invoke the hook and wait for it to finish before continuing. Run it the same way you would run the command yourself in this agent/session (the invocation may differ from the literal `{command}` id shown above, e.g. a skills-mode agent runs it as `/skill:speckit-...` or `$speckit-...`). Emitting the block alone does not run the hook.
- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

## Outline

1. **Setup**: Run `.specify/scripts/bash/setup-plan.sh --json` from repo root and parse
   JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH. **Path note (ADR-0013)**: this
   script still resolves paths under the legacy `specs/<feature>/` layout — treat its
   output only as a way to identify which business/feature this run is for (the
   `<feature-dir-name>` segment), not as the literal output location. This project's
   design documents live under `doc/フロントエンド設計書/<業務>/`, not `specs/`; map
   `<feature-dir-name>` (e.g. `001-todo-dashboard`) to its `<業務>` directory (e.g.
   `業務1_Todoダッシュボード`) by matching existing directories under
   `doc/フロントエンド設計書/`, asking the user if no clear match exists. Set
   `詳細設計書_PATH` to `doc/フロントエンド設計書/<業務>/詳細設計書.md` — this is what
   step 3 actually reads/writes, not `IMPL_PLAN`. For single quotes in args like
   "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible:
   "I'm Groot").

2. **Load context**: Read every `doc/フロントエンド設計書/<業務>/ユースケース記述*.md`
   and `画面定義書*.md` for this business, plus `.specify/memory/constitution.md`. Load
   the IMPL_PLAN template (already copied) as the section structure to fill into
   `詳細設計書_PATH`. One 詳細設計書 covers the whole business — see
   `doc/common/adr/0007-revert-to-feature-level-plan-md.md` for why this project always
   plans at business/feature level, never per screen.

3. **Execute plan workflow**: 詳細設計書 holds exactly two sections (ADR-0008) — do
   not add Summary, Technical Context, Constitution Check, or Complexity Tracking:
   - Fill "登場するコンポーネントと関係". Scope is not limited to React
     components: it includes this feature's own BFF Route Handlers
     (`src/app/api/**`) too — a Route Handler is not done being planned just
     because its file path and a one-line comment appear in Project Structure;
     give it the same node + `###` subsection treatment as everything else,
     otherwise the BFF layer ends up with no actual design, only code. Include
     this section whenever any two of this feature's files have a relationship
     that isn't obvious from the file alone — a shared parent/state,
     props/callbacks between components, or a Client Component calling this
     feature's own Route Handler over HTTP. Start with a Mermaid `flowchart`
     (whole-picture overview first): label every edge with what kind of
     relationship it is, not just the value/endpoint — `"props: ..."`,
     `"callback: ..."`, `"fetch: METHOD /path"` — so the diagram is
     self-explanatory without a separate legend. Follow with one `###`
     subsection per involved file giving its role on the first line (never a
     bare file name with no explanation) followed by whatever detail the
     diagram can't show (props/state it holds, which API calls it makes, what
     it does and doesn't own — for a Route Handler, which `backend.ts`
     function(s) it calls and any validation it does or doesn't do). When a
     file's detail mentions calling a function that is not itself one of this
     feature's own new files (e.g. `getTodos()` from `src/lib/backend.ts`),
     name the file it comes from — otherwise it reads as an unexplained
     component of its own — and state whether that function itself is new or
     pre-existing (see the Project Structure note below on the AP方式設計書's
     "pattern vs. instance" distinction: a new entity's swap-point functions
     and mock file are this feature's own additions, not shared infra, even
     though they live in the shared `backend.ts` file). Omit this section
     entirely when every one of this feature's files is fully self-contained
     (no shared parent, state, or feature-internal HTTP call).
   - Fill Project Structure's Source Code section with only the paths this
     feature adds or changes — not paths already documented in
     `doc/common/AP方式設計書(フロントエンド編).md` /
     `doc/common/AP方式設計書(バックエンド編).md`'s repository layout as
     shared. The AP方式設計書 documents *patterns* (backend.ts hosting every
     entity's swap-point functions in one file; the `mock-<entity>.ts` naming
     convention), not specific instances of them: if this feature introduces
     a new entity, list the specific functions it adds to `backend.ts` (as a
     change to that existing file) and its specific `mock-<entity>.ts` file
     (as a new file) — do not wave them away as "common infra" just because
     the file name matches the pattern. Do not include a "Documentation
     (this feature)" file-tree section (identical boilerplate across every
     詳細設計書)
   - For every `src/app/**` component this feature adds or changes (any
     `.tsx` file whose name is not one of Next.js App Router's own special
     filenames — `page`, `layout`, `template`, `loading`, `error`,
     `global-error`, `not-found`, `default`), list its sibling
     `<Component>.test.tsx` immediately next to it in the same Source Code
     listing, even though the test file itself needs no separate design
     discussion. This is not optional detail: constitution.md Core Principle
     VII requires the test to exist, and `check-component-tests.sh` (the
     `component-test-coverage` CI job) fails the PR if a listed component
     ships without one. A 詳細設計書 that lists the component but not its
     test is incomplete.

## Mandatory Post-Execution Hooks

**You MUST complete this section before reporting completion to the user.**

Check if `.specify/extensions.yml` exists in the project root.
- If it does not exist, or no hooks are registered under `hooks.after_plan`, skip to the Completion Report.
- If it exists, read it and look for entries under the `hooks.after_plan` key.
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue to the Completion Report.
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- When constructing command invocations from hook command names, replace dots (`.`) with hyphens (`-`). For example, `speckit.git.commit` → `/speckit-git-commit`.
- For each executable hook, output the following based on its `optional` flag:
  - **Mandatory hook** (`optional: false`) — **You MUST emit `EXECUTE_COMMAND:` for each mandatory hook**:
    ```
    ## Extension Hooks

    **Automatic Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}
    ```
    After emitting the block above you MUST actually invoke the hook and wait for it to finish before continuing. Run it the same way you would run the command yourself in this agent/session (the invocation may differ from the literal `{command}` id shown above, e.g. a skills-mode agent runs it as `/skill:speckit-...` or `$speckit-...`). Emitting the block alone does not run the hook.
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```

## Completion Report

Command ends once 登場するコンポーネントと関係 (or its intentional omission) and
Project Structure are filled in. Report branch and 詳細設計書_PATH.

## Key rules

- Use absolute paths for filesystem operations; use project-relative paths for references in documentation
- This project's constitution forbids `research.md`, `data-model.md`,
  `quickstart.md`, and `contracts/` in business/feature directories under
  `doc/フロントエンド設計書/` (Principle III, Principle VI) — do not
  generate them under any phase. App-wide technical facts live in
  `doc/common/AP方式設計書(フロントエンド編).md` /
  `doc/common/AP方式設計書(バックエンド編).md` (reference them, don't
  restate them); this feature's data model is
  `doc/API仕様書/common/schemas/**`; this feature's endpoint contracts are
  `doc/API仕様書/BFF/openapi.yaml` and `doc/API仕様書/Backend/openapi.yaml`.
- One 詳細設計書 per business/feature, always — never split it per screen,
  even when the feature has multiple screens (ADR-0007; this reverses an
  earlier per-screen attempt documented in ADR-0006).
- 詳細設計書 MUST NOT contain a Summary, Technical Context, Constitution
  Check, or Complexity Tracking section — only 登場するコンポーネントと関係
  and Project Structure (ADR-0008). Do not regenerate these dropped
  sections even if an older 詳細設計書 on disk still has them; replace
  them, don't append alongside them.
- Every planned `src/app/**` component (excluding Next.js special filenames)
  MUST appear in Project Structure together with its `<Component>.test.tsx`
  sibling (constitution.md Core Principle VII, ADR-0011). Do not list a
  component without also listing its test file.

## Done When

- [ ] 詳細設計書 holds only 登場するコンポーネントと関係 (or is intentionally omitted) and Project Structure
- [ ] Every `src/app/**` component in Project Structure (excluding Next.js special filenames) has its sibling `<Component>.test.tsx` listed alongside it
- [ ] Extension hooks dispatched or skipped according to the rules in Mandatory Post-Execution Hooks above
- [ ] Completion reported to user with branch and 詳細設計書 path
