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

2. **Load context**: Read FEATURE_SPEC (and every `SPECS_DIR/screens/*/spec.md` when
   the feature has screens) and `.specify/memory/constitution.md`. Load IMPL_PLAN
   template (already copied). One `plan.md` covers the whole feature — see
   `docs/adr/0007-revert-to-feature-level-plan-md.md` for why this project always
   plans at feature level, never per screen.

3. **Execute plan workflow**: Follow the structure in IMPL_PLAN template to:
   - Fill "登場するコンポーネントと関係": if the feature's screens share a parent
     component, shared state, or pass props/callbacks between each other's
     components, list every involved file with a one-line role (role text first,
     never a bare file name) in a table, then a Mermaid `flowchart` showing solid
     arrows for props passed down and dashed arrows for callbacks fired back up.
     Omit this section entirely when every screen's component is fully
     self-contained (no shared parent or state).
   - Fill Technical Context: reference `docs/architecture.md` for app-wide facts
     (language/version, dependencies, target platform, storage mechanism,
     repository layout) instead of restating them; fill in only this feature's
     own Performance Goals/Constraints/Scale/Scope (mark unknowns as "NEEDS
     CLARIFICATION"), omitting any field with no feature-specific value
   - Fill Constitution Check: collapse principles already guaranteed by the shared
     infra in `docs/architecture.md` (I, II, IV) into one summary line — do not
     restate what constitution.md already says about them. Elaborate only
     principles with this feature's own substance (III: which endpoints each
     screen's component calls; V: what this feature's spec leaves out)
   - Evaluate gates (ERROR if violations unjustified)
   - Fill Project Structure's Source Code section with only the paths this
     feature adds or changes — not paths already documented in
     `docs/architecture.md`'s repository layout, and do not include a
     "Documentation (this feature)" file-tree section (dropped from the
     template — identical boilerplate across every plan.md)
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

Command ends once Technical Context, Constitution Check, and Project Structure are
filled in and the gate passes. Report branch, IMPL_PLAN path, and Constitution Check
result.

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
- One `plan.md` per feature, always — never split it per screen, even when the
  feature has multiple screens (ADR-0007; this reverses an earlier per-screen
  attempt documented in ADR-0006).

## Done When

- [ ] plan.md filled in (Technical Context, Constitution Check, Project Structure) and the gate passes
- [ ] Extension hooks dispatched or skipped according to the rules in Mandatory Post-Execution Hooks above
- [ ] Completion reported to user with branch, plan path, and Constitution Check result
