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

1. **Setup**: Run `.specify/scripts/bash/setup-plan.sh --json` from repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Resolve per-screen scope** (Constitution Development Workflow, ADR-0006): check
   whether `SPECS_DIR/screens/` exists.
   - **No `screens/` directory**: this feature has no screens. Treat `IMPL_PLAN`
     (`SPECS_DIR/plan.md`) as the one plan.md for this feature, exactly as the script
     resolved it, and proceed with steps 3-4 below using that path.
   - **`screens/` exists**: this feature's plan.md is per-screen, not
     `IMPL_PLAN`. Determine the target screen from `$ARGUMENTS` (a screen id or name);
     if not stated and more than one screen lacks a plan.md, list the screens under
     `SPECS_DIR/screens/*/spec.md` and ask which one. The target file is
     `SPECS_DIR/screens/<screen-id>/plan.md` — ignore `IMPL_PLAN` entirely (do not
     create, read, or write `SPECS_DIR/plan.md`; `setup-plan.sh` already skips it for
     a feature with `screens/`, and `check-prerequisites.sh`/`setup-tasks.sh` accept
     `screens/*/plan.md` in its place — see ADR-0006). If the target screen's plan.md
     doesn't exist yet, create it from the `plan-template` (resolve via
     `resolve_template_content` semantics, i.e. the same override stack `setup-plan.sh`
     uses — read `.specify/templates/overrides/plan-template.md` directly since it
     always exists as a project override).

3. **Load context**: Read the relevant screen's `spec.md` (or `FEATURE_SPEC` for a
   screen-less feature) and `.specify/memory/constitution.md`.

4. **Execute plan workflow**: Follow the structure in the plan template to:
   - Fill "登場するコンポーネントと関係" (per-screen plan.md only): if this screen's
     component shares a parent, state, or props/callbacks with another screen's
     component, list every involved file with a one-line role (role text first,
     never a bare file name) in a table, then a Mermaid `flowchart` showing solid
     arrows for props passed down and dashed arrows for callbacks fired back up.
     Mark this screen's own component with "★このplan.mdの対象". Omit this section
     entirely when the screen's component is fully self-contained.
   - Fill Technical Context: reference `docs/architecture.md` for app-wide facts
     (language/version, dependencies, target platform, storage mechanism,
     repository layout) instead of restating them; fill in only this plan's
     own Performance Goals/Constraints/Scale/Scope (mark unknowns as "NEEDS
     CLARIFICATION"), omitting any field with no specific value
   - Fill Constitution Check: for a per-screen plan.md, collapse principles already
     guaranteed by the shared infra in `docs/architecture.md` (I, II, IV) into one
     summary line — do not restate what constitution.md already says about them.
     Elaborate only principles with this screen's own substance (III: which
     endpoints this screen's component calls; V: what this screen's spec leaves out)
   - Evaluate gates (ERROR if violations unjustified)
   - Fill Component Design (per-screen plan.md) or Project Structure's Source Code
     section (screen-less feature's plan.md) with only the paths this plan's own
     scope adds or changes — not paths already documented in
     `docs/architecture.md`'s repository layout, and do not include a "Documentation
     (this feature)" file-tree section (dropped from the template — identical
     boilerplate across every plan.md)
   - Re-evaluate Constitution Check post-design

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

Command ends once Technical Context, Constitution Check, and Component Design (or
Project Structure, for a screen-less feature) are filled in and the gate passes.
Report branch, the actual plan.md path written (the per-screen path when
`screens/` exists, not `IMPL_PLAN`), and Constitution Check result.

## Key rules

- Use absolute paths for filesystem operations; use project-relative paths for references in documentation
- ERROR on gate failures or unresolved clarifications
- This project's constitution forbids `research.md`, `data-model.md`,
  `quickstart.md`, and `contracts/` in feature directories (Principle III,
  Principle VI) — do not generate them under any phase. App-wide technical
  facts live in `docs/architecture.md` (reference it, don't restate it);
  this feature's data model is `openapi/common/schemas/**`; this feature's
  endpoint contracts are `openapi/bff/openapi.yaml` and
  `openapi/backend/openapi.yaml`. If Technical Context has unresolved
  NEEDS CLARIFICATION items, resolve them inline (ask the user or make a
  documented assumption) rather than deferring to a research.md file.
- When `screens/` exists, `SPECS_DIR/plan.md` MUST NOT exist at all — never
  create, read, or write it. The plan.md to fill in is always
  `SPECS_DIR/screens/<screen-id>/plan.md` (ADR-0006).

## Done When

- [ ] The correct plan.md (per-screen when `screens/` exists, otherwise the
      feature-root plan.md) is filled in (Technical Context, Constitution Check,
      Component Design/Project Structure) and the gate passes
- [ ] Extension hooks dispatched or skipped according to the rules in Mandatory Post-Execution Hooks above
- [ ] Completion reported to user with branch, the plan.md path actually written, and Constitution Check result
