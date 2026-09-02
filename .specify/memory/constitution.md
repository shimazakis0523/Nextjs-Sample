<!--
Sync Impact Report
- Version change: 2.20.0 → 2.21.0 (MINOR — new Core Principle XVIII: Defect
  Discovery Ledger and Lateral Check)
- Modified sections: New Core Principle XVIII added after Principle XVII.
- Rationale: the user asked for a mechanism to record bugs discovered
  mid-development (during new-harness introductions or human review) and to
  visualize, across all such discoveries, whether a lateral check for the
  same root cause elsewhere was performed and how the discoveries cluster
  by root-cause category — "途中で発見したバグを記録し、類似バグの横並び
  チェック結果や原因分析起点の品質点検の結果を可視化する仕組みを作れない
  ですか?" This project had already been doing this informally every time a
  new harness surfaced a real pre-existing defect (ADR-0011, 0019, 0021,
  0022, 0023, 0024) and once more from `check-openapi-contract` during the
  Todo edit feature; the request was to make the practice itself durable
  and visible rather than scattered across ADR prose. `doc/common/
  品質不具合台帳.md` was created (retroactively populated as BUG-001 through
  BUG-009 from those ADRs, plus a new BUG-010 found while building this very
  feature — see below), with controlled-vocabulary 発見区分/原因分類/横展開
  fields kept separate from free-text narrative fields so they aggregate
  mechanically. `scripts/generate-defect-log-data.mjs` parses the ledger
  into `dashboard-data/defect-log.json`, and `/test-dashboard` gained a
  「品質不具合分析」section visualizing counts by category, by discovery
  kind, and by lateral-check status, plus the full entry list. Building this
  surfaced a genuine latent bug in `.github/workflows/test-dashboard.yml`:
  its `paths-ignore: ["dashboard-data/**"]` would silently skip the whole
  workflow for a push touching only the hand-maintained
  `dashboard-data/business-map.json`, never triggering regeneration — never
  observed in practice only because all 3 historical changes to that file
  happened to land alongside other non-ignored files. Fixed by narrowing
  `paths-ignore` to the two generated JSON paths, and recorded as BUG-010,
  itself demonstrating the lateral-check practice this principle formalizes
  (checked every other workflow file for the same pattern; none matched).
  Like Principle VI's mockup-agreement gate and its 2026-09-01 GitHub-Issue
  addendum, this is a soft/process gate (Skill-procedure and constitution
  text, not a CI check) because "was a real defect actually found" needs
  human judgment a script cannot reliably automate. See ADR-0025 in
  `doc/common/adr/`.
- Version change: 2.19.0 → 2.20.0 (MINOR — materially expands the mockup-first
  Development Workflow rule (Principle VI / ADR-0004): a screen-bearing
  feature's GitHub Issue MUST now be created before or alongside mockup
  creation, not deferred to `/speckit-taskstoissues`)
- Modified sections: Development Workflow's mockup-first bullet gains the
  Issue-creation requirement; `.claude/skills/speckit-specify/SKILL.md`
  step 0 updated to check for/create the tracking Issue before the mockup
  check.
- Rationale: while adding a Todo editing feature's mockup to `/mockup`, the
  user asked "イシュー切ってるか?" (have you cut an Issue?) and, once told
  none was required yet under the existing rules, said an Issue should be
  cut for mockup creation itself and that this should be written into the
  rules rather than decided ad hoc. Until now, GitHub Issues for a
  screen-bearing feature were only created at the `/speckit-taskstoissues`
  stage — well after the mockup, spec, and plan already existed — leaving
  the very first artifact of the pipeline untracked. See the 2026-09-01
  addendum to ADR-0004 in `doc/common/adr/`.
- Version change: 2.18.0 → 2.19.0 (MINOR — four new Core Principles XIV-XVII,
  adopting the relevant subset of Future Architect's "Webフロントエンド開発
  ガイドライン": XIV URL Path Design Conformance (check-url-path-design.mjs),
  XV Automated Accessibility Test Coverage (jest-axe + check-a11y-test-
  coverage.sh), XVI Component & Test Authoring Lint Conventions
  (eslint-plugin-testing-library + check-component-naming.mjs), XVII
  Frontend Non-Functional Policy Documented (check-frontend-nonfunctional-
  policy.mjs gating AP方式設計書(フロントエンド編).md's decisions on
  対応ブラウザ/サポートバージョン・国際化対応・ダークモードの状態保持・OGP))
- Modified sections: Four new Core Principles XIV-XVII added after Principle
  XIII. New `doc/common/AP方式設計書(フロントエンド編).md` 非機能方針 section.
  New non-normative `doc/common/フロントエンド設計ガイド.md`, referenced but
  not enforced.
- Rationale: the user shared Future Architect's Web Frontend Guideline (the
  same publisher as ADR-0022's OpenAPI guideline, a different document) and
  asked which sections should be excluded as inapplicable given the already-
  adopted Next.js/BFF architecture, before deciding what to build. Reading
  all 22 sections and sorting them into four buckets — sections to exclude
  entirely (hosting/rendering/routing framework-selection frameworks,
  authentication, PWA, the CORS-dev-server workaround the BFF pattern
  already makes moot), harness candidates, items needing a one-time policy
  decision recorded in a document rather than a per-feature choice, and
  items needing human judgment too nuanced for a binary rule — the user
  then directed each bucket's disposition: build harnesses for the
  candidates (C), gate progression on the architecture document recording
  the policy items' decisions rather than deciding their values unilaterally
  (D), and write an advisory (non-enforced) guide for the nuanced items (E),
  rather than silently picking values for the excluded/deferred items.
  Building the accessibility-coverage harness (Principle XV) immediately
  surfaced a real violation — an empty `<th aria-label="操作">` action-column
  header in both `TodoList.tsx` and its mockup counterpart, which axe-core's
  `empty-table-header` rule flags because an ARIA label alone isn't visible
  text to all assistive technology — fixed with a visually-hidden `<span>`
  rather than loosening the new gate to pass. Enabling
  `eslint-plugin-testing-library`'s recommended rule set (Principle XVI)
  likewise surfaced two real testing-detail violations (a `waitFor` +
  `getByText` pattern instead of `findByText`, and `.closest("section")`
  DOM traversal instead of an ARIA `region` role query) and one further
  disappearance-check violation once the first fix removed an unused
  import — all fixed in the test files themselves, consistent with this
  project's practice of fixing what a new gate finds instead of exempting
  it. See ADR-0024 in `doc/common/adr/`.
- Version change: 2.17.0 → 2.18.0 (MINOR — new Core Principle XIII,
  Detailed Design Document Structural Conformance: every
  詳細設計書.md must have exactly the required section structure
  (optional 概要, then 登場するコンポーネントと関係, then Project
  Structure) with the diagram-first/role-stated-per-file rules already
  in Development Workflow, enforced by a new `detailed-design-doc` CI
  job; also corrects the pre-existing Development Workflow rule that
  詳細設計書 holds "exactly two sections" to formally allow 概要 as an
  optional third)
- Modified sections: New Core Principle XIII added after Principle XII;
  the 詳細設計書 section-count rule under Development Workflow amended to
  allow an optional 概要 section.
- Rationale: the user pointed out that the landing page's "ハーネス"
  (harness) labels on several process steps actually named the authoring
  skill that produces an artifact (`/speckit-specify`, `design skill`,
  `/speckit-implement`) rather than the mechanism that checks that
  artifact and blocks on failure — confirming the user's understanding of
  "harness" (a check/gate, not a generator) was correct and the labels
  were wrong. Fixing the labels meant identifying each step's REAL
  harness; 静的解析/ユニットテスト/E2E already had one, but 詳細設計書
  (PD) had none — every 詳細設計書 could silently drift from its required
  structure. Building `check-detailed-design-doc.mjs` to close that gap
  then surfaced a second, independent problem: the existing "exactly two
  sections" rule would have failed the one 詳細設計書 already in the
  repository, which has a third (概要) holding the business's screen
  roster — content neither of the other two sections has anywhere to
  state, and not a restatement of anything else, so it was a real gap in
  the RULE rather than a violation in the document. 概要 was formalized
  as an allowed (and, for multi-screen businesses, required) section
  instead of being deleted. See ADR-0023 in `doc/common/adr/`.
- Version change: 2.16.0 → 2.17.0 (MINOR — new Core Principle XII, OpenAPI
  Style Guide Conformance: doc/API仕様書/{BFF,Backend}/openapi.yaml must
  conform to a Spectral ruleset implementing the version-agnostic subset
  of Future Architect's "OpenAPI Specification 3.0.3規約", enforced at 0
  errors by a new `openapi-style-guide` CI job)
- Modified sections: New Core Principle XII added after Principle XI.
- Rationale: the user shared the full Japanese-language standard document
  and asked to add a harness checking OpenAPI spec conformance to it.
  Three decisions were made via clarifying questions: keep OpenAPI 3.1
  and apply only version-agnostic rules (not downgrade to 3.0.3); use
  Spectral (the standard document itself names it as the verification
  tool, over extending the existing Redocly lint); fix the current
  openapi.yaml files' real non-conformances first, then add an
  immediately-blocking CI gate (not visualize-only). Implementing the
  17-rule Spectral ruleset (`.spectral.yaml`) surfaced genuine violations
  in both `doc/API仕様書/{BFF,Backend}/openapi.yaml` — missing tags,
  missing per-operation descriptions, missing server descriptions, and
  an inlined (not componentized) 4xx response in the BFF contract — all
  fixed with content checked against actual behavior (e.g. `deleteTodo`'s
  idempotent-204 claim verified against `mock-todos.ts`) rather than
  loosening the ruleset. Four standard-document rules were deliberately
  excluded (route-level `security`, since the project has no
  authentication; pure YAML formatting; default-value/`maxLength`
  backward-compatibility, which needs historical diffing a single-snapshot
  lint can't do; `components.parameters` naming prefixes, since no shared
  parameters exist yet) — consistent with this project's practice of
  fixing what a new gate finds rather than exempting it, while not faking
  enforcement of what can't genuinely be checked. See ADR-0022 in
  `doc/common/adr/`.
- Version change: 2.15.0 → 2.16.0 (MINOR — new Core Principle XI, Static
  Code Quality Gate: eslint.config.mjs must enable complexity/duplication
  quality rules, enforced at 0 errors/0 warnings by a new `code-quality`
  CI job, and visualized on /test-dashboard)
- Modified sections: New Core Principle XI added after Principle X.
- Rationale: the user asked to introduce static code analysis/linter
  quality checks with visualization. Added `complexity`/`max-depth`/
  `max-params` (ESLint core) and `sonarjs/cognitive-complexity`/
  `sonarjs/no-duplicate-string`/`sonarjs/no-identical-functions`
  (eslint-plugin-sonarjs) rather than the plugin's full 279-rule
  recommended set (too noisy for a first introduction), scoped off
  `no-duplicate-string` for test files where repeated literal test data is
  normal style. Enabling the rules immediately surfaced two real
  complexity violations in `.github/scripts/check-openapi-bff-routes.mjs`,
  fixed by extracting a shared helper (which itself briefly tripped
  `max-params` until parameterized with an options object instead of
  positional callbacks) rather than loosening the gate — consistent with
  this project's standing practice of fixing what a new quality gate
  finds instead of exempting it. `dashboard-data/business-map.json`'s
  `unitPathPrefixes` (already reused for the test-density-by-business
  breakdown on /test-dashboard) doubled as the per-business code-quality
  breakdown key with no further changes needed. See ADR-0021 in
  `doc/common/adr/`.
- Version change: 2.14.0 → 2.15.0 (MINOR — new Core Principle X, Unit Test
  Case Design Technique: unit test cases must be derivable from named
  techniques documented in a new
  `doc/common/ユニットテスト作成ガイドライン.md`)
- Modified sections: New Core Principle X added after Principle IX.
- Rationale: the user shared their organization's UT guideline for a
  different (Java/PHP, API/SharedService/Admin/Batch) system and asked for
  transferable insights, then asked to extract the good essence into this
  project's own unit-test authoring guidance. The source document's
  C2-based equivalence partitioning (with a worked branch-coverage
  recipe), 2-point boundary value analysis, a validation-pattern-to-
  test-case mapping table, and a rich error-guessing catalog were directly
  transferable; adapted into `doc/common/ユニットテスト作成ガイドライン.md`
  with this project's own file-type scope (React components, Route
  Handlers, `src/lib/**`) and worked examples from its own test suite.
  Two gaps identified in the source document — no decision-table technique
  for non-independent conditions, no state-transition testing as a named
  technique — were the same gaps ADR-0018 had already found and fixed for
  this project's own E2E test design, so both were folded into the new
  guideline rather than repeated. See ADR-0020 in `doc/common/adr/`.
- Version change: 2.13.0 → 2.14.0 (MINOR — new Core Principle IX, Coverage
  Threshold Gate: `jest.config.ts` MUST carry a `coverageThreshold` that
  actually fails the build on a real regression, mechanically enforced by
  a new `unit-test-coverage` CI job)
- Modified sections:
  - New Core Principle IX (Coverage Threshold Gate) added after Principle
    VIII.
- Rationale: the user asked for an evaluation of whether test-case
  implementation was adequate, based on a coverage-report screenshot
  showing `src/app/api/todos` and `src/lib` (backend.ts/backend-client.ts)
  at or near 0%. Investigation confirmed this was a real gap, not
  acceptable boilerplate: `src/app/api/todos/route.ts`'s POST validation is
  documented in 詳細設計書.md as the authoritative check (the client-side
  one is UX-only, not a substitute), and `backend.ts`/`backend-client.ts`
  are the mock/real backend swap point (Principle II) — both shipped with
  zero unit tests. Principle VII (component existence of a test file)
  cannot catch this class of gap: it doesn't apply to non-component files
  at all, and doesn't check what a test actually exercises. Fixed by
  writing the missing tests (route handlers, backend.ts's two branches,
  backend-client.ts's error handling, and the new test-dashboard page's
  fallback branch — raising overall coverage from ~46%/37% statements/
  branches to ~90%/92%) and adding a mechanically-enforced coverage floor
  so a future regression of this kind fails CI instead of waiting for a
  human to notice. See ADR-0019 in `doc/common/adr/`.
- Version change: 2.12.0 → 2.13.0 (MINOR — new MUST requirement: every
  E2E仕様書 test case derived by `update-e2e-test-spec` must be traceable
  to one of five named black-box test design techniques, and 境界値分析
  now covers both bounds, not just the upper one)
- Modified sections: Development Workflow (Spec-Driven) — the
  `update-e2e-test-spec` bullet now names the five techniques
  (ユースケーステスト, 同値分割, 境界値分析, 条件/分岐テスト including
  デシジョンテーブルテスト, 状態遷移テスト) the derived section MUST use.
- Rationale: the user asked whether E2E test viewpoints follow general
  software test-case-design techniques, and whether the rule states the
  techniques explicitly. Investigation found the skill's rules matched
  recognized techniques in substance but named only "境界値" once, and
  only for a character-length upper bound — 同値分割, デシジョンテーブル
  テスト, and 状態遷移テスト were applied in spirit (e.g. required-field
  checks, enum-value checks, a save button's disabled-during-save state)
  without ever being named or defined as techniques, so there was no way
  to audit coverage against a known technique catalog and no lower-bound
  or "limit-1" boundary cases were ever generated. Fixed by naming all
  five techniques in both this constitution and `update-e2e-test-spec`'s
  SKILL.md, extending 境界値分析 to the lower bound when one is specified,
  making デシジョンテーブルテスト explicit for multi-condition branches,
  and adding 状態遷移テスト as its own derivation category instead of
  relying on it being incidentally caught by an unrelated rule. See
  ADR-0018 in `doc/common/adr/`.
- Version change: 2.11.2 → 2.12.0 (MINOR — new MUST requirement: every
  `props`/`callback` edge label in 詳細設計書's 登場するコンポーネントと
  関係 diagram must state the field-level type signature, not just the
  name)
- Modified sections: Development Workflow (Spec-Driven) — the
  登場するコンポーネントと関係 bullet now requires edge labels to carry
  type signatures (e.g. `"props: todos: Todo[]"`), reusing a shared
  `doc/API仕様書/common/schemas/**` entity name where one exists instead
  of re-listing its fields.
- Rationale: the user inspected `詳細設計書_業務1_Todoダッシュボード` and
  found its diagram labelled edges by name only (`"props: initialTodos"`,
  `"props: todos, onDeleted, onAddClick"`, `"props: onSaved, onCancel"`)
  with no type information anywhere in the document — the actual `Todo`
  shape (id/title/dueDate/assignee/status) and callback signatures
  (`(id: string) => void`, `(todo: Todo) => void`) were only discoverable
  by reading `TodoList.tsx`/`TodoDashboard.tsx` directly. This defeats the
  point of designing before implementing: an implementer had to guess or
  reverse-engineer the contract from code that may not exist yet for a new
  feature. See ADR-0017 in `doc/common/adr/`.
- Version change: 2.11.1 → 2.11.2 (PATCH — no Core Principle text changed;
  the Principle VI template citation now names
  `usecase-template.md`/`screen-definition-template.md`, which is what it
  already pointed at conceptually)
- Modified sections: Principle VI's template-file citation only (the
  principle's own MUST/MUST NOT requirements for ユースケース記述/画面定義書
  did not change — the templates already matched them; only the citation's
  file names were stale).
- Rationale: after ADR-0013's restructuring, `.specify/templates/overrides/
  spec-template.md` (the old single-file `spec.md` template) was never
  replaced, and `speckit-specify`/`speckit-plan`/`speckit-implement` still
  assumed the pre-ADR-0013 `specs/<feature>/spec.md`/`plan.md` layout for
  any *new* business/screen — only the existing Todo dashboard docs had
  been manually migrated. The user asked directly whether the
  mockup→ユースケース記述/画面定義→詳細設計→実装 generation pipeline
  actually references prior-stage artifacts under the new structure; it
  did not. Fixed by splitting spec-template.md into
  usecase-template.md/screen-definition-template.md, and rewiring the
  three Skills to resolve `doc/`/`tracking/` paths via
  `.specify/feature.json`'s `business_directory`/`tracking_directory`/
  `screen_id`/`screen_name` fields (added as a bridge, since the shared
  `setup-plan.sh`/`check-prerequisites.sh`/`setup-tasks.sh` scripts remain
  deliberately unmodified per ADR-0013's documented scope-out). See
  ADR-0016 in `doc/common/adr/`.
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

`.specify/templates/overrides/usecase-template.md` and
`.specify/templates/overrides/screen-definition-template.md` hold this
structure so `/speckit-specify` produces both files by default; edit
those files, not this constitution, to adjust the templates themselves.

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

### IX. Coverage Threshold Gate

Principle VII guarantees every component *has* a test; it says nothing
about whether that test — or any other file's test — actually exercises
its logic. `jest.config.ts`'s `coverageThreshold` (global statements/
branches/functions/lines floors) MUST stay set to a value that fails the
build on a real regression, not one so low it never fires; the
`unit-test-coverage` job in the "Spec consistency" GitHub Actions workflow
runs `npm run test:coverage` on every PR against `main` and fails when
Jest's own threshold check fails. Lowering the threshold to make a
low-coverage change pass MUST NOT be done without also documenting why in
the PR (a change that legitimately can't be unit-tested, e.g. requires a
live external service) — silently loosening the gate defeats its purpose.
Rationale: `src/app/api/todos/route.ts`'s POST handler — the BFF's own
authoritative validation logic, explicitly documented in
`詳細設計書.md` as not substitutable by the client-side check — and
`src/lib/backend.ts`/`backend-client.ts` (the mock/real backend swap point,
Principle II) shipped with zero unit tests and sat undetected until a
human inspected the coverage report by eye. Principle VII's existence
check does not catch this class of gap: a component can have a
`<Component>.test.tsx` that exists and still leave most of its branches
unexercised, and a non-component file (a Route Handler, a `src/lib/**`
module) has no colocated-test requirement at all. A coverage-percentage
floor, mechanically enforced, catches both. See ADR-0019 in
`doc/common/adr/`.

### X. Unit Test Case Design Technique

Principles VII and IX are mechanically enforced (a test file exists; the
suite hits a coverage floor); neither can check whether the cases inside a
test file were derived systematically or just happen to hit lines by
accident. Unit test cases MUST be derivable from
`doc/common/ユニットテスト作成ガイドライン.md`'s named techniques —
equivalence partitioning (including the compound-condition branch-coverage
recipe), decision tables for conditions that are not actually independent,
boundary value analysis, an explicit input-validation-pattern-to-test-case
mapping, error guessing (including double-submission/repeated-action
cases, not just bad input values), and state transition testing for any
component with more than one display state — not unstated ad-hoc
judgment. Each test case's description MUST read in a way that lets a
reviewer identify which technique produced it, so review can check
technique coverage against the guideline's catalog instead of trusting
prose alone. This does not require retrofitting technique-derivation
descriptions onto every pre-existing test; it applies going forward.
Rationale: the user shared their organization's own UT (unit test)
guideline for a different (Java/PHP) system and asked what was
transferable. That document's C2-based equivalence partitioning, boundary
value analysis, and rich error-guessing catalog were directly applicable;
its lack of an explicit decision-table technique for non-independent
conditions and its lack of state-transition testing as a named technique
were the same gaps this project had already found and fixed for E2E test
design (ADR-0018) — the same blind spots recur across stacks because
they're about test-design method, not language or framework. See
ADR-0020 in `doc/common/adr/`.

### XI. Static Code Quality Gate

`eslint.config.mjs` MUST enable, in addition to `eslint-config-next`'s
correctness rules, a static code-quality rule set targeting cyclomatic
complexity (`complexity`), nesting depth (`max-depth`), parameter count
(`max-params`), cognitive complexity (`sonarjs/cognitive-complexity`),
duplicated string literals (`sonarjs/no-duplicate-string`, scoped off for
`**/*.test.{ts,tsx}` and `e2e/**/*.spec.ts` where repeated literal test
data is normal style, not a smell), and duplicated functions
(`sonarjs/no-identical-functions`). The `code-quality` job in the "Spec
consistency" GitHub Actions workflow runs `npm run lint:ci`
(`eslint --max-warnings 0`) on every PR against `main` and MUST pass with
zero errors and zero warnings — lowering a threshold or disabling a rule
to make a violation pass MUST NOT be done without fixing the underlying
code first, or documenting in the PR why the specific instance is a false
positive (a project convention already established for ESLint's own
`eslint-disable` pragma comments). Results MUST also be visualized:
`scripts/generate-test-dashboard-data.mjs` aggregates `npm run lint:json`
output into `dashboard-data/summary.json`'s `codeQuality` field
(overall/by-business/by-rule error and warning counts), rendered on
`/test-dashboard` — a CI gate that only fails silently in logs doesn't let
anyone see where quality is trending without re-running it locally.
Rationale: the user asked to introduce static code analysis/linter-based
quality checks with visualization. Enabling the rule set surfaced two real
complexity violations in `.github/scripts/check-openapi-bff-routes.mjs`'s
`main` function (cyclomatic complexity 13, cognitive complexity 23) from
two near-identical spec-vs-impl / impl-vs-spec comparison loops; fixed by
extracting a shared `collectMismatches` helper parameterized by a
`messages` object (not five positional parameters, which would have
tripped `max-params` itself) — the same duplication the rule was designed
to catch. See ADR-0021 in `doc/common/adr/`.

### XII. OpenAPI Style Guide Conformance

`doc/API仕様書/BFF/openapi.yaml` and `doc/API仕様書/Backend/openapi.yaml`
MUST conform to the version-agnostic subset of Future Architect's
"OpenAPI Specification 3.0.3規約" implemented as a `.spectral.yaml`
ruleset: `info`/`servers[]` descriptions present; a non-empty root
`tags[]` with lowercase space-separated names and descriptions; every
operation carries exactly one tag, a `description` distinct from its
`summary`, and a camelCase `operationId`; no `options` method; no
`requestBody` on GET/DELETE and no query parameters on POST/PUT/PATCH;
snake_case query parameter names and PascalCase-hyphenated header names;
no `traceparent` header; 2xx responses defined inline and 4xx/5xx
responses componentized via `$ref` to `components.responses` (never the
reverse); UpperCamelCase names for `components.responses` and
`components.schemas`; no multi-type or `null`-type schemas; no
`allOf`/`anyOf`/`oneOf`. The `openapi-style-guide` job in the "Spec
consistency" GitHub Actions workflow runs `npm run openapi:lint:spectral`
on every PR against `main` and MUST pass with zero errors. Rules that
cannot be mechanically or meaningfully enforced given this project's
actual state — route-level `security` (the project has no authentication
to describe), pure YAML formatting conventions, default-value/`maxLength`
backward-compatibility (requires historical diffing, not a single-snapshot
lint), and `components.parameters` naming prefixes (no shared parameters
exist yet) — are intentionally excluded rather than faked or
half-enforced; see ADR-0022 for the full list and reasoning.
Rationale: the user shared the standard document and asked for a harness
checking conformance to it. The project runs OpenAPI 3.1 while the
standard targets 3.0.3, so version-specific constructs were left out
rather than downgrading the spec; Spectral was chosen over extending the
existing Redocly lint because the standard document itself names Spectral
as its verification tool. Implementing the ruleset immediately surfaced
real non-conformances in both existing `openapi.yaml` files (missing
tags, missing operation descriptions, missing server descriptions, and an
inlined 4xx response in the BFF contract) — all fixed with content
verified against actual mock behavior (e.g. `deleteTodo`'s idempotent
204 claim was checked against `mock-todos.ts`'s `removeTodo`) rather than
loosening the ruleset to pass. See ADR-0022 in `doc/common/adr/`.

### XIII. Detailed Design Document Structural Conformance

Every `doc/フロントエンド設計書/<業務>/詳細設計書.md` MUST have exactly the
section structure described under Development Workflow above — an
optional 概要 followed by 登場するコンポーネントと関係 then Project
Structure, in that order, with no other `##` heading (in particular none
of the retired spec-kit sections: Summary, Technical Context,
Constitution Check, Complexity Tracking, "Documentation (this
feature)"). When 登場するコンポーネントと関係 is not omitted, its Mermaid
diagram MUST appear before any per-file `### ` subsection (diagram
first, detail second), and every such subsection MUST state the file's
role on the first line after its heading (never a bare heading with no
body). The `detailed-design-doc` job in the "Spec consistency" GitHub
Actions workflow runs `node .github/scripts/check-detailed-design-doc.mjs`
(checking every 詳細設計書.md found under
`doc/フロントエンド設計書/**`, not only ones a PR touches — the same
model as the `openapi-routes` job) on every PR against `main` and MUST
pass with zero violations. Whether a component-relationship diagram's
edges actually match the real props/callback/fetch relationships, and
whether edge labels state field-level type signatures, are NOT
mechanically checked — free-form Mermaid syntax and natural-language
role descriptions need semantic understanding a text-processing script
cannot reliably provide without a high false-positive rate; these stay
human-reviewed. See ADR-0023 for the full scope and exclusions.
Rationale: while fixing landing-page copy that mislabeled several
process steps' "ハーネス" (harness) as the authoring skill that produces
an artifact rather than the mechanism that checks and blocks it, 詳細設計書
(PD) turned out to have no such mechanism at all — every other
CI-blocking step already had one, but a business's 詳細設計書 could drift
from its required structure with nothing to catch it. Building the
checker surfaced a second, independent gap: the existing rule said
"exactly two sections", but the one 詳細設計書 already in the repository
(and evidently accepted as correct at the time) had a third, 概要,
holding the business-level screen roster neither of the other two
sections has anywhere to state — a real omission in the rule, not a
violation in the document, so the rule was corrected to formally allow
概要 rather than deleting content that was actually pulling its weight.
See ADR-0023 in `doc/common/adr/`.

### XIV. URL Path Design Conformance

Every route-producing directory under `src/app/**` (page routes and BFF API
routes alike — both are Next.js App Router-managed URL paths) MUST use
kebab-case for static path segments, lowerCamelCase for dynamic segment
parameters (`[paramName]`, not `[ParamName]`/`[param_name]`), and MUST NOT
use an operation verb (`search`, `get`, `delete`, `fetch`, `list`, `update`,
`create`, `remove`) as a segment name — a resource-centric noun MUST be used
instead. `check-url-path-design.mjs` (the `url-path-design` job in the
"Spec consistency" GitHub Actions workflow) enforces this on every PR,
scanning every route-producing directory found under `src/app`, not only
ones a PR touches (the same model as `openapi-routes`/`detailed-design-doc`).
Deliberately excluded: enforcing that a resource name is plural (requires a
dictionary and produces false positives on already-plural or irregular
nouns) and query-parameter naming/usage conventions (requires semantic
understanding of what a parameter represents, not a syntactic check) — see
ADR-0024 for the full scope and reasoning.
Rationale: the user asked which sections of Future Architect's Web Frontend
Guideline should become mechanical checks. URL path design was judged the
strongest candidate in the "URLパス設計" section — concrete, reliably
checkable without semantic understanding, and this project's existing
routes already conformed once checked. See ADR-0024 in `doc/common/adr/`.

### XV. Automated Accessibility Test Coverage

Every screen root (`src/app/**/page.tsx`) MUST have a colocated
`jest-axe` assertion (`expect(await axe(container)).toHaveNoViolations()`)
in its `page.test.tsx`, run as part of the existing Jest suite (`jest.setup.ts`
registers the `toHaveNoViolations` matcher globally). `check-a11y-test-
coverage.sh` (the `a11y-test-coverage` job in the "Spec consistency" GitHub
Actions workflow) enforces that this assertion exists for every screen root
on every PR, scanning all of `src/app/**/page.tsx`, not only ones a PR
touches. This mechanism catches missing coverage and any violation reachable
from the existing render call; it does not add end-to-end or interaction-
state coverage beyond what the colocated test already renders. Deliberately
excluded: a duplicate Playwright/E2E-level axe-core check — component-level
Testing Library coverage already exercises every screen's static markup, and
a second, largely redundant check at the E2E layer wasn't judged worth its
added run time for this project's size — see ADR-0024.
Rationale: the user asked to turn the Web Frontend Guideline's automated
accessibility testing recommendation (axe-core combined with component/E2E
tests) into a harness. Building the checker and wiring `jest-axe` into every
screen's test immediately surfaced a real violation — `TodoList.tsx` and its
mockup counterpart both had an action-column `<th aria-label="操作"></th>`
that axe-core's `empty-table-header` rule flags, since an `aria-label` alone
is not visible text to every assistive technology combination — fixed with a
visually-hidden `<span>`, not by loosening the gate. See ADR-0024 in
`doc/common/adr/`.

### XVI. Component & Test Authoring Lint Conventions

`eslint.config.mjs` MUST enable `eslint-plugin-testing-library`'s
`flat/react` recommended rule set, scoped to `**/*.test.{ts,tsx}`, which
mechanically enforces the Web Frontend Guideline's testing-trophy principle
that a test verifies user-observable behavior rather than implementation
details (e.g. `no-node-access` forbids reaching into the DOM directly instead
of using Testing Library's own queries; `prefer-find-by`/`no-wait-for-side-
effects` forbid a manual `waitFor` poll where a purpose-built async query
already exists). `check-component-naming.mjs` (the `component-naming` job in
the "Spec consistency" GitHub Actions workflow) additionally enforces that
every component file under `src/app/**` (using the same special-filename
exclusion as Principle VII) is named in PascalCase. The `code-quality` job
already enforces the ESLint rules on every PR (`npm run lint:ci`);
`component-naming` runs independently on every PR, scanning all of
`src/app/**`, not only ones a PR touches. Deliberately excluded: a dedicated
camelCase check for props/callback names — TypeScript/JSX syntax already
makes a non-camelCase prop name so far outside idiomatic React usage that a
dedicated rule would add negligible value over what the language already
makes the path of least resistance — see ADR-0024.
Rationale: the user asked to turn the Web Frontend Guideline's component-
naming conventions and testing-trophy principle into harnesses. Enabling
`eslint-plugin-testing-library`'s recommended rules immediately surfaced two
real violations (a `waitFor` + `getByText` pattern where `findByText` was
the purpose-built alternative, and `.closest("section")` DOM traversal
instead of an ARIA `region`-role query) plus a knock-on disappearance-check
violation once the first fix's now-unused `waitFor` import was removed —
all fixed in the test files themselves, not exempted. See ADR-0024 in
`doc/common/adr/`.

### XVII. Frontend Non-Functional Policy Documented

`doc/common/AP方式設計書(フロントエンド編).md`'s 非機能方針 section MUST
record an explicit, non-placeholder decision for each of: 対応ブラウザ/
サポートバージョン, 国際化対応, ダークモードの状態保持, OGP — project-wide
policy questions the Web Frontend Guideline raises that need a one-time
human decision, not a per-feature one, and that no per-feature design
document has anywhere to state. `check-frontend-nonfunctional-policy.mjs`
(the `frontend-nonfunctional-policy` job in the "Spec consistency" GitHub
Actions workflow) enforces this on every PR, failing when a required
`### ` section is missing, empty, or still holds a placeholder marker
(未定/TBD/検討中/TODO). This is a document-acceptance gate on whether a
decision has been recorded, not a check of whether the recorded decision's
value is itself correct — it functions as an acceptance criterion for
proceeding to detailed design/implementation, the same role Principle VI's
mockup-agreement gate (ADR-0004) plays earlier in the pipeline, but
expressed as a PR-blocking CI check (the same model as `openapi-routes`/
`detailed-design-doc`) rather than a skill-level halt, since these are
project-wide facts checked against a single document on every PR rather
than a per-feature artifact requiring human sign-off before generation.
Rationale: the user asked that these Web Frontend Guideline items — each
needing a policy decision no harness should make unilaterally — become an
architecture-document acceptance criterion rather than either a hard rule
or a silent gap. The initially-recorded decisions (modern evergreen browsers
via `browserslist`; no i18n; OS-only dark mode with no manual toggle; no
OGP) and their rationale are in ADR-0024, not repeated here since this
principle governs the presence of a decision, not its content. See
ADR-0024 in `doc/common/adr/`.

### XVIII. Defect Discovery Ledger and Lateral Check

When introducing a new harness (a lint rule, coverage gate, or other
automated check) or performing a human review, discovering an actual defect
in already-implemented code or documentation — not a newly-introduced
regression, but something wrong that was already there — MUST be recorded
in `doc/common/品質不具合台帳.md` and a lateral check performed (searching
the rest of the codebase for the same root cause elsewhere) before the fix
is considered complete. Each entry records 発見日, 発見区分 and 原因分類
(both controlled-vocabulary fields drawn from the legends at the top of the
ledger, kept separate from free-text explanation so they aggregate
mechanically), 対象ファイル, 修正内容, 横展開 (実施/対象外/未実施 plus what
was checked), and 根拠 (a link to the ADR or commit that made the fix).
`npm run defect-log:data` (`scripts/generate-defect-log-data.mjs`) parses
the ledger into `dashboard-data/defect-log.json`, which `/test-dashboard`'s
「品質不具合分析」section visualizes as counts by 原因分類, by 発見区分,
and by 横展開 status, alongside the full entry list. Like Principle VI's
mockup-agreement gate (ADR-0004), this is a soft/process gate — a Skill
procedure and this constitution's text, not a CI check — because whether a
given finding is genuinely a pre-existing defect (versus a design choice, a
newly-introduced bug, or a non-issue) needs human judgment no script can
reliably automate. Rationale: this project had already been doing this
informally every time a new harness surfaced a real defect (ADR-0011, 0019,
0021, 0022, 0023, 0024); the user asked that the practice be made durable
and visible instead of scattered across ADR prose, so future defects
accumulate into one place that shows whether the same root cause recurs and
whether it was checked for elsewhere. See ADR-0025 in `doc/common/adr/`.

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
  to features with no screen (e.g. a purely internal BFF change). A
  screen-bearing feature MUST also have a GitHub Issue created for it
  before or alongside mockup creation — not deferred to
  `/speckit-taskstoissues`, which only creates task-level Issues much
  later once the spec/plan/tasks already exist. The Issue is referenced
  in the commit/PR that adds the mockup, never in the ユースケース記述
  header (Principle VI's one header exception is `**モックアップ**` only).
  See ADR-0004 in `doc/common/adr/`.
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
  split). 詳細設計書 holds exactly two required sections, optionally
  preceded by a third: an OPTIONAL **概要** (business-level overview —
  what the business does, plus a table of its screens: screen ID, screen
  name, URL, and links to that screen's ユースケース記述/画面定義書;
  required once a business has two or more screens, since neither of the
  other two sections has anywhere to state that roster; omitted for a
  single-screen business where there is nothing to enumerate — see
  ADR-0023), **登場するコンポーネントと関係** (scoped to every file this
  business adds or changes that has a
  non-obvious relationship to another — not React components only: this
  business's own BFF Route Handlers under `src/app/api/**` MUST get the
  same treatment, since a file path and a one-line comment in Project
  Structure is not a design for that layer. A Mermaid diagram of how
  these files relate — props/callbacks between components, or a Client
  Component's fetch call to this business's own Route Handler — comes
  first as the whole-picture overview, with every edge labelled by what
  kind of relationship it is (e.g. `"props: ..."`, `"callback: ..."`,
  `"fetch: METHOD /path"`) so the diagram needs no separate legend. A
  `props`/`callback` edge label MUST also state the field-level type
  signature, not just the name(s) — e.g. `"props: todos: Todo[]"`,
  `"callback: onSaved(todo: Todo) => void"` — never a bare
  `"props: todos"`. When the type is an entity already defined in
  `doc/API仕様書/common/schemas/**` (e.g. `Todo`), name that type directly
  instead of re-enumerating its fields; only spell out a field list inline
  when the shape has no such shared definition (e.g. a local, UI-only
  type). Omitting the type leaves the implementer to infer the shape from
  existing code instead of the design document — the same "read the code
  to find out" gap Component Test Coverage (Principle VII) closed for
  tests, now closed here for props/callback contracts. Followed by one
  subsection per involved file giving its role on the
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
- `doc/common/フロントエンド設計ガイド.md` records design considerations that
  were deliberately NOT turned into a Principle or CI gate (CSS class naming
  convention choice, validation message wording, screen-to-screen parameter
  passing method, static-analysis rollout philosophy) — it is advisory only,
  not enforced by CI or reviewed as a MUST/MUST NOT; consult it when a
  relevant design decision comes up, but its non-conformance is never a PR
  blocker. See ADR-0024 in `doc/common/adr/`.
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
  considered complete. Test cases in that section MUST each be traceable
  either to one of five named black-box test design techniques —
  ユースケーステスト, 同値分割, 境界値分析, 条件/分岐テスト(including
  デシジョンテーブルテスト for a row whose outcome depends on a
  combination of independent conditions), and 状態遷移テスト for any
  element with more than one display state — or, for a 画面入出力仕様 row
  that fits none of those techniques (a fixed heading, a table column
  rendering its bound data, a per-row action affecting only its own row),
  to plain technique-free display verification against that row's stated
  content; never to unstated ad-hoc judgment. Every generated test case
  states which of these it came from. `update-e2e-test-spec`'s SKILL.md
  documents exactly how each technique maps to ユースケース記述/画面定義書
  content and where its boundaries are (e.g. 境界値分析 covers both the
  upper and lower bound when both are specified, not only the upper one).
  Combination/exploratory testing beyond this stays human judgment,
  recorded only in 追加のテスト観点, never in the derived section. See
  ADR-0018 in `doc/common/adr/`.
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

**Version**: 2.21.0 | **Ratified**: 2026-08-29 | **Last Amended**: 2026-09-02
