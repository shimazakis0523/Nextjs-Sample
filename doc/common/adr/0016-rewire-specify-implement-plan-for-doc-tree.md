# ADR-0016: speckit-specify/speckit-plan/speckit-implementを新doc/構成に対応させる

## ステータス

Accepted (2026-08-31)

## コンテキスト

ADR-0013〜0015で`specs/`+`docs/`を`doc/`+`tracking/`の日本語構成に刷新したが、
そのとき実際に移行・修正したのは既存の業務1(Todoダッシュボード)の成果物と、
CIスクリプト・一部Skillのファイル名パターンのみだった。ユーザーから「モックアップ→
ユースケース記述 and 画面定義→詳細設計→実装という手順で、前段の工程の資料を参照して
成果物を作成する形に見直ししているか」という指摘があり、調査した結果、新規の業務・画面を
これから作成する場合の生成経路(`/speckit-specify` → `/speckit-plan` → `/speckit-implement`)
が実際には旧構成のまま放置されていたことが判明した:

- `.specify/templates/overrides/spec-template.md`が、ADR-0013以前の単一ファイル
  (`spec.md`)構成のまま更新されておらず、ユースケース記述/画面定義書の2ファイル分割
  (constitution.md Principle VI)に対応していなかった。
- `speckit-specify`のSKILL.mdが、旧`specs/<feature>/spec.md`前提の手順を保持したままで、
  `doc/フロントエンド設計書/<業務>/`や`tracking/<業務>/`を解決するロジックを持たなかった。
- `speckit-implement`のSKILL.mdが、`plan.md`・旧`FEATURE_DIR`配下の`checklists/`を読みに
  行く記述のまま残っていた。
- `speckit-plan`のSKILL.mdは`setup-plan.sh`のJSON出力(`IMPL_PLAN`等)をそのまま
  信頼する記述で、`.specify/feature.json`の新フィールドを見ていなかった。

これらのSkillが呼び出す`.specify/scripts/bash/setup-plan.sh`・
`check-prerequisites.sh`・`setup-tasks.sh`は汎用の共有インフラであり、ADR-0013の
時点で意図的に書き換え対象外としていた(深く汎用的な既存スクリプトで、`specs/`前提を
除去する改修はこのプロジェクト固有の`doc/`構成と一致させるより遥かに大きい変更になる
ため)。よってこれらのスクリプトは今回も書き換えない。

## 決定

各スクリプトの出力はそのまま使わず、「どの業務の実行か」を識別する手がかりとしてのみ
扱い、実際のパス解決は`.specify/feature.json`を優先して行う方式に統一する:

1. **`.specify/feature.json`を橋渡しに使う** — `speckit-specify`が業務・画面を確定した
   時点で`business_directory`・`tracking_directory`・`screen_id`・`screen_name`を
   `.specify/feature.json`に永続化する。`speckit-plan`・`speckit-implement`はこれらの
   フィールドがあれば直接使い、無い場合(このフィールドが導入される前に作られた既存の
   機能)のみ、ディレクトリ名によるフォールバック照合を行う。

2. **`spec-template.md`を2ファイルに分割** — 単一の`spec-template.md`を廃止し、
   `.specify/templates/overrides/usecase-template.md`(ユースケース記述用)と
   `screen-definition-template.md`(画面定義書用)を新設。constitution.md Principle VIの
   構成定義(ユースケース記述MUST/画面定義書MUSTの各要件)とそのまま対応する。

3. **`speckit-specify`を書き換え** — 業務ディレクトリ(新規/既存)の解決、
   `BUSINESS_DIR`/`SCREEN_NAME`/`SCREEN_ID`の決定、2テンプレートのコピーと執筆
   (`ユースケース記述_<画面名>.md`・`画面定義書_<画面名>.md`、番号無し=ADR-0015)、
   チェックリストの`tracking/<業務>/screens/<screen-id>/checklists/requirements.md`
   への出力、`.specify/feature.json`への新フィールド永続化までを行う手順に変更した。

4. **`speckit-plan`を修正** — `setup-plan.sh`の出力(`IMPL_PLAN`)を`詳細設計書_PATH`と
   して使わず、`.specify/feature.json`の`business_directory`(無ければ既存互換の名前
   照合)から`BUSINESS_DIR/詳細設計書.md`を解決するよう変更した。

5. **`speckit-implement`を修正** — `check-prerequisites.sh`のFEATURE_DIRを業務識別
   のみに使い、`TRACKING_DIR`/`BUSINESS_DIR`は`.specify/feature.json`優先で解決。
   `TASKS_FILE`は`TRACKING_DIR/tasks.md`、チェックリストは
   `TRACKING_DIR/screens/*/checklists/`、実装コンテキストは`TASKS_FILE`・
   `BUSINESS_DIR/詳細設計書.md`・関連する`ユースケース記述_*.md`/`画面定義書_*.md`から
   読む。`data-model.md`/`contracts/`等が存在しない旨も明記し、探しに行かないようにした。
   本文中に残っていた`plan.md`表記(Docker検出・技術別パターン見出し)も
   `詳細設計書.md`に修正した。

`speckit-tasks`・`speckit-analyze`・`speckit-converge`・`speckit-checklist`・
`speckit-clarify`・`speckit-taskstoissues`は今回のスコープ外とする(ADR-0013が
明記していたフォローアップ一覧の一部で、今回のユーザーからの指摘は
specify→plan→implementの生成経路に限定されていたため)。

## 影響

- `.specify/templates/overrides/spec-template.md`を削除し、代わりに
  `usecase-template.md`・`screen-definition-template.md`を新設した。
- `speckit-specify`・`speckit-plan`・`speckit-implement`の各SKILL.mdを、新しい
  `doc/`/`tracking/`構成を直接解決する内容に書き換えた。
- constitution.md Principle VIのテンプレート参照箇所を新テンプレート名に更新した
  (PATCH — 原則本文自体の変更ではない)。
- 今回の変更後に新規作成される業務・画面は、旧`specs/<feature>/`を経由せず新構成を
  直接生成するようになった。既存の業務1(Todoダッシュボード)の成果物はADR-0013〜0015で
  既に手動移行済みのため、影響を受けない。
- `speckit-tasks`等の残る6つのSkillは、旧`spec.md`/`plan.md`前提のまま残っており、
  引き続きフォローアップが必要(ADR-0013のスコープ外リストを踏襲)。
