# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED:
  - アプリ全体に共通する技術スタック・依存関係・デプロイ先・テスト基盤・永続化方式・
    リポジトリレイアウト・共通制約は docs/architecture.md に既に記載されている。
    ここに重複して書かず、下の行の参照のみを残す。docs/architecture.md自体に
    変更が必要な技術判断が生じた場合は、この機能のplan.mdではなくdocs/architecture.md
    を直接更新すること。
  - このセクションに書くのは、この機能固有の情報のみ。他の機能と共通しない値だけを
    埋める。該当する固有情報が無いフィールドは行ごと省略する(空欄や「N/A」を残さない)。
-->

**共通のアーキテクチャ**: [docs/architecture.md](../../docs/architecture.md) を参照。

**Performance Goals**: [この機能固有の性能目標があれば記載。無ければ本行ごと省略]

**Constraints**: [docs/architecture.mdの制約に加えて、この機能固有の追加制約があれば記載。無ければ本行ごと省略]

**Scale/Scope**: [この機能固有の規模。例: 画面数、エンティティ数]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md               # This file (/speckit-plan command output)
├── screen-flow.md         # 画面遷移図(update-screen-flow-diagramスキルが管理。画面遷移が無い機能では省略)
├── screens/                # 画面ごとのspec.md/e2e-test-spec.md/checklists/(画面が無い機能では省略)
└── tasks.md               # Phase 2 output (/speckit-tasks command)
```

### Source Code (この機能が追加/変更するパスのみ)

<!--
  ACTION REQUIRED: docs/architecture.md のリポジトリレイアウトに既に載っている共通パス
  (src/lib/backend.ts, src/lib/mock-*.ts, openapi/** など)は再掲しない。この機能が
  新規に追加する、または変更する具体的なファイルパスのみを列挙する。
-->

```text
[この機能が追加/変更する具体的なファイルパス]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above; for shared/common paths, reference docs/architecture.md
instead of restating them]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
