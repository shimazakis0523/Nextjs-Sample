---
name: "speckit-specify"
description: "Create or update the feature specification from a natural language feature description."
argument-hint: "Describe the feature you want to specify"
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "templates/commands/specify.md"
user-invocable: true
disable-model-invocation: false
---


## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before specification)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_specify` key
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

The text the user typed after `/speckit-specify` in the triggering message **is** the feature description. Assume you always have it available in this conversation even if `$ARGUMENTS` appears literally below. Do not ask the user to repeat it unless they provided an empty command.

0. **Mockup precondition (project convention — screen-bearing features only, see
   `doc/common/adr/0004-mockup-first-requirements.md`)**: if the feature description involves one or
   more screens (any UI a person looks at or interacts with — a page, a modal, a dialog), this
   step is **MANDATORY** and MUST run before step 1. It does not apply to features with no UI
   surface at all (e.g. a pure backend/BFF-internal change with nothing a person looks at).
   - **Check for a tracking GitHub Issue first**: a screen-bearing feature MUST have a GitHub
     Issue created for it before, or at the same time as, mockup creation — do not defer this to
     `speckit-taskstoissues` as with the rest of the pipeline (that stage only creates
     task-level Issues much later, once the spec/plan/tasks already exist). If the user's message
     doesn't name/link an existing Issue and none was created earlier in this conversation,
     create one now (a concise title plus a short body summarizing the requested feature) before
     producing the mockup. Record its number as `TRACKING_ISSUE`; reference it in the commit/PR
     that adds the mockup (commit message or PR body, the same mechanism Principle VIII already
     uses) — do NOT add it to the ユースケース記述 header, which Principle VI restricts to the
     `**モックアップ**` field as its one exception to excluding project-management metadata.
   - Check whether an agreed-upon mockup already exists for this feature: either the user's
     message names/links a mockup Artifact (from the `design` skill), or one was produced and
     agreed on earlier in this same conversation.
   - **If no agreed mockup exists**: do **NOT** proceed to step 1. Stop, explain that this
     project starts screen-bearing features from a mockup (visual design + outward functionality
     agreed on before the ユースケース記述/画面定義書 are written, to avoid the ambiguity of describing a screen in prose
     alone), and invoke the `design` skill to produce one from the feature description. Wait for
     the user to confirm the mockup is agreed before continuing — do not assume agreement just
     because a draft was produced.
   - **If an agreed mockup exists**: record its Artifact URL as `MOCKUP_URL` for use in step 7,
     and continue to step 1.

1. **Generate a concise short name** (2-4 words) for the feature:
   - Analyze the feature description and extract the most meaningful keywords
   - Create a 2-4 word short name that captures the essence of the feature
   - Use action-noun format when possible (e.g., "add-user-auth", "fix-payment-bug")
   - Preserve technical terms and acronyms (OAuth2, API, JWT, etc.)
   - Keep it concise but descriptive enough to understand the feature at a glance
   - Examples:
     - "I want to add user authentication" → "user-auth"
     - "Implement OAuth2 integration for the API" → "oauth2-api-integration"
     - "Create a dashboard for analytics" → "analytics-dashboard"
     - "Fix payment processing timeout bug" → "fix-payment-timeout"

2. **Branch creation** (optional, via hook):

   If a `before_specify` hook ran successfully in the Pre-Execution Checks above, it will have created/switched to a git branch and output JSON containing `BRANCH_NAME` and `FEATURE_NUM`. Note these values for reference, but the branch name does **not** dictate the spec directory name.

   If the user explicitly provided `GIT_BRANCH_NAME`, pass it through to the hook so the branch script uses the exact value as the branch name (bypassing all prefix/suffix generation).

3. **Resolve the business directory and this screen's two files** (project convention —
   this project's design documents live under `doc/フロントエンド設計書/<業務>/`, not
   `specs/`; see `doc/common/adr/0013-japanese-doc-tree-restructure.md` and
   `doc/common/adr/0014-tracking-dir-for-tasks-and-checklists.md`):

   **a. Determine new business vs. existing business**: Glob `doc/フロントエンド設計書/*/`
   to list existing businesses. If the feature description clearly names or continues an
   existing business (or one was already established earlier in this conversation), reuse
   it. Otherwise ask the user: "これは新しい業務ですか、それとも既存の業務(一覧: ...)に
   画面を追加しますか？" — do not guess silently when it's ambiguous, since picking the
   wrong business directory scatters a screen's docs from its siblings.

   **b. Resolve BUSINESS_DIR**:
   - **New business**: `N` = next available integer after scanning existing
     `doc/フロントエンド設計書/業務<N>_*/` directories. `BUSINESS_DIR` =
     `doc/フロントエンド設計書/業務<N>_<short-name>` (short-name from step 1, unless the
     user's description gives a clearer business-level name — a business name should
     describe the business, not necessarily this first screen).
   - **Existing business**: `BUSINESS_DIR` = the matched existing directory, as-is.

   **c. Resolve this screen's identity**: `SCREEN_NAME` = the business action this screen
   performs (e.g. "Todo一覧", "Todo新規登録" — never a generic "画面" suffix, per
   constitution.md Principle VI). `SCREEN_ID` = a kebab-case slug of it (e.g. `todo-list`).

   **d. Create files and directories**:
   - `mkdir -p BUSINESS_DIR` and `mkdir -p tracking/<業務>/screens/<SCREEN_ID>/checklists`
     (create `tracking/<業務>/` alongside `BUSINESS_DIR` the first time a business is
     created; both share the same `<業務>` directory name).
   - Resolve `usecase-template` and `screen-definition-template` through the Spec Kit
     preset/template resolution stack (equivalent to `specify preset resolve
     usecase-template` / `screen-definition-template`).
   - Copy `usecase-template` to `BUSINESS_DIR/ユースケース記述_<SCREEN_NAME>.md` as
     `USECASE_FILE`, and `screen-definition-template` to
     `BUSINESS_DIR/画面定義書_<SCREEN_NAME>.md` as `SCREEN_DEF_FILE`. No numeric prefix on
     either filename (ADR-0015) — the screen name alone disambiguates within the business.
   - Persist to `.specify/feature.json`:
     ```json
     {
       "business_directory": "<resolved BUSINESS_DIR>",
       "tracking_directory": "tracking/<業務>",
       "screen_id": "<SCREEN_ID>",
       "screen_name": "<SCREEN_NAME>"
     }
     ```
     This lets downstream commands (`/speckit-plan`, `/speckit-tasks`, etc.) locate the
     business directory directly instead of re-deriving it.

   **IMPORTANT**:
   - You must only create one screen (one pair of files) per `/speckit-specify` invocation.
   - The business directory name and the git branch name are independent.
   - The files and directories are always created by this command, never by the hook.

4. Load the resolved `usecase-template` and `screen-definition-template` files to
   understand required sections.

5. **IF EXISTS**: Load `.specify/memory/constitution.md` for project principles and governance constraints.

6. Follow this execution flow:
    1. Parse user description from arguments
       If empty: ERROR "No feature description provided"
    2. Extract key concepts from description
       Identify: actors, actions, screen elements, constraints
    3. For unclear aspects:
       - Make informed guesses based on context and industry standards
       - Only mark with [NEEDS CLARIFICATION: specific question] if:
         - The choice significantly impacts screen scope or user experience
         - Multiple reasonable interpretations exist with different implications
         - No reasonable default exists
       - **LIMIT: Maximum 3 [NEEDS CLARIFICATION] markers total**
       - Prioritize clarifications by impact: scope > security/privacy > user experience > technical details
    4. Fill ユースケース記述 (one or more UC-NN entries: アクター, 事前条件, 基本フロー,
       代替/例外フロー, 事後条件)
       If no clear use case: ERROR "Cannot determine use cases for this screen"
    5. Fill 画面入出力仕様 (one row per on-screen element — every input, static/conditional
       text, badge, button, dialog) and 処理仕様 (one row per trigger, 初期表示 first)
       Every element MUST be testable/verifiable from these two tables alone
    6. Identify Key Entities (if data involved) — note them for the API contract
       (`doc/API仕様書/common/schemas/**`), do NOT add a data-model section to either file
    7. Return: SUCCESS (both files ready for planning)

7. Write **both** files:
   - `USECASE_FILE` using the `usecase-template` structure, filled with this screen's
     ユースケース記述 content.
   - `SCREEN_DEF_FILE` using the `screen-definition-template` structure, filled with this
     screen's 画面入出力仕様 and 処理仕様 content.
   Replace placeholders with concrete details derived from the feature description while
   preserving section order and headings in each file. If step 0 recorded a `MOCKUP_URL`,
   populate `USECASE_FILE`'s `**モックアップ**` header field with it (per
   `usecase-template`'s guidance on that field); omit the field entirely if this feature
   has no screens. Each file's `**関連**` header field MUST link to the other.

8. **Specification Quality Validation**: After writing both files, validate them against quality criteria:

   a. **Create Spec Quality Checklist**: Generate a checklist file at
      `tracking/<業務>/screens/<SCREEN_ID>/checklists/requirements.md` using the checklist
      template structure with these validation items:

      ```markdown
      # 仕様品質チェックリスト: [SCREEN_NAME]

      **目的**: 設計(`/speckit-plan`)に進む前に、仕様の完全性と品質を検証する
      **作成日**: [DATE]
      **対象**: [ユースケース記述(SCREEN_NAME)](../../../../doc/フロントエンド設計書/<業務>/ユースケース記述_<SCREEN_NAME>.md)・[画面定義書(SCREEN_NAME)](../../../../doc/フロントエンド設計書/<業務>/画面定義書_<SCREEN_NAME>.md)

      ## 内容の品質

      - [ ] 実装詳細(言語・フレームワーク・API仕様等)が含まれていない
      - [ ] タイトルが業務行為の名前になっている(「〜画面」という画面名になっていない)
      - [ ] ユーザーストーリー形式(優先度・独立テスト可否等)を使っていない

      ## ユースケース記述の品質

      - [ ] [要確認]マーカーが残っていない
      - [ ] 各ユースケースに基本フロー・代替/例外フローが定義されている
      - [ ] スコープの境界が明確である

      ## 画面定義の品質

      - [ ] 画面入出力仕様に、画面上の全要素(入力・出力・ボタン)が列挙されている
      - [ ] 入出力区分と種別が別の列になっている
      - [ ] 項目単位の見た目・制約が、各項目の行の中に記載されている
      - [ ] 処理仕様の1行目が初期表示になっている
      - [ ] 処理仕様がフロントエンドの範囲に閉じている(API/DBの内部仕様に踏み込んでいない)

      ## 備考

      - 未完了の項目がある場合は、`/speckit-clarify`または`/speckit-plan`に進む前に
        ユースケース記述・画面定義書を修正すること
      ```

   b. **Run Validation Check**: Review both files against each checklist item:
      - For each item, determine if it passes or fails
      - Document specific issues found (quote relevant sections)

   c. **Handle Validation Results**:

      - **If all items pass**: Mark checklist complete and proceed to the Mandatory Post-Execution Hooks section

      - **If items fail (excluding [NEEDS CLARIFICATION])**:
        1. List the failing items and specific issues
        2. Update the relevant file(s) to address each issue
        3. Re-run validation until all items pass (max 3 iterations)
        4. If still failing after 3 iterations, document remaining issues in checklist notes and warn user

      - **If [NEEDS CLARIFICATION] markers remain**:
        1. Extract all [NEEDS CLARIFICATION: ...] markers from either file
        2. **LIMIT CHECK**: If more than 3 markers exist, keep only the 3 most critical (by scope/security/UX impact) and make informed guesses for the rest
        3. For each clarification needed (max 3), present options to user in this format:

           ```markdown
           ## Question [N]: [Topic]

           **Context**: [Quote relevant section]

           **What we need to know**: [Specific question from NEEDS CLARIFICATION marker]

           **Suggested Answers**:

           | Option | Answer | Implications |
           |--------|--------|--------------|
           | A      | [First suggested answer] | [What this means for the screen] |
           | B      | [Second suggested answer] | [What this means for the screen] |
           | C      | [Third suggested answer] | [What this means for the screen] |
           | Custom | Provide your own answer | [Explain how to provide custom input] |

           **Your choice**: _[Wait for user response]_
           ```

        4. **CRITICAL - Table Formatting**: Ensure markdown tables are properly formatted:
           - Use consistent spacing with pipes aligned
           - Each cell should have spaces around content: `| Content |` not `|Content|`
           - Header separator must have at least 3 dashes: `|--------|`
           - Test that the table renders correctly in markdown preview
        5. Number questions sequentially (Q1, Q2, Q3 - max 3 total)
        6. Present all questions together before waiting for responses
        7. Wait for user to respond with their choices for all questions (e.g., "Q1: A, Q2: Custom - [details], Q3: B")
        8. Update the relevant file by replacing each [NEEDS CLARIFICATION] marker with the user's selected or provided answer
        9. Re-run validation after all clarifications are resolved

   d. **Update Checklist**: After each validation iteration, update the checklist file with current pass/fail status

## Mandatory Post-Execution Hooks

**You MUST complete this section before reporting completion to the user.**

Check if `.specify/extensions.yml` exists in the project root.
- If it does not exist, or no hooks are registered under `hooks.after_specify`, skip to the Completion Report.
- If it exists, read it and look for entries under the `hooks.after_specify` key.
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

Report completion to the user with:
- `BUSINESS_DIR` — the business directory path
- `USECASE_FILE` and `SCREEN_DEF_FILE` — the two file paths written
- Checklist results summary
- Readiness for the next phase (`/speckit-clarify` or `/speckit-plan`)

**NOTE:** Branch creation is handled by the `before_specify` hook (git extension). The business directory and the two screen files are always created by this core command.

## Quick Guidelines

- Focus on **WHAT** users need and **WHY**.
- Avoid HOW to implement (no tech stack, APIs, code structure).
- Written for business stakeholders, not developers.
- DO NOT create any checklists that are embedded in the spec. That will be a separate command.

### Section Requirements

- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation

When creating this spec from a user prompt:

1. **Make informed guesses**: Use context, industry standards, and common patterns to fill gaps
2. **Document assumptions**: Record reasonable defaults in the Assumptions section
3. **Limit clarifications**: Maximum 3 [NEEDS CLARIFICATION] markers - use only for critical decisions that:
   - Significantly impact feature scope or user experience
   - Have multiple reasonable interpretations with different implications
   - Lack any reasonable default
4. **Prioritize clarifications**: scope > security/privacy > user experience > technical details
5. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
6. **Common areas needing clarification** (only if no reasonable default exists):
   - Feature scope and boundaries (include/exclude specific use cases)
   - User types and permissions (if multiple conflicting interpretations possible)
   - Security/compliance requirements (when legally/financially significant)

**Examples of reasonable defaults** (don't ask about these):

- Data retention: Industry-standard practices for the domain
- Performance targets: Standard web/mobile app expectations unless specified
- Error handling: User-friendly messages with appropriate fallbacks
- Authentication method: Standard session-based or OAuth2 for web apps
- Integration patterns: Use project-appropriate patterns (REST/GraphQL for web services, function calls for libraries, CLI args for tools, etc.)

## Done When

- [ ] Both `USECASE_FILE` and `SCREEN_DEF_FILE` written and validated against quality checklist
- [ ] Extension hooks dispatched or skipped according to the rules in Mandatory Post-Execution Hooks above
- [ ] Completion reported to user with business directory, both file paths, and checklist results
