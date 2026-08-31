# ADR-0012: ガバナンス関連ファイルの変更にIssue参照をCIで必須化する

## ステータス

Accepted (2026-08-30)

## コンテキスト

`001-todo-dashboard`のタスク(T001-T021)は、`tasks.md`のIssue対応表 → `speckit-taskstoissues`
によるIssue化 → `speckit-implement`の着手条件チェック(ADR-0002)という正規のパイプラインを
通り、GitHub Issue(#2-#23)ベースで追跡されていた。

一方、その後のテスト導入・CI gate関連の作業(Jest/Playwright導入、
`check-component-tests.sh`とcomponent-test-coverage CI job、constitution.md
Core Principle VII、ADR-0011、`speckit-plan`/`speckit-tasks`/`speckit-implement`
スキルの更新)は、`tasks.md`への追記も`speckit-tasks`の実行も一切せず、チャットでの
「導入します」「追加して」「スキルを修正」という指示に対して直接実装された。結果として、
これらの変更に対応するGitHub Issueは一つも作られなかった。

ADR-0002は決定当時からこの抜け道を認識していた:

> この仕組みは`speckit-implement`を経由しない変更(直接のコード編集など)には効かない。
> 完全な強制力が必要になった場合は選択肢2(PRマージゲート)を追加で検討する。

今回、まさにこの「speckit-implementを経由しない変更」が発生し、懸念が現実になった。

## 決定

1. **Core Principle VIII (Governance Change Traceability) を新設**。
   `.claude/skills/**`・`.specify/memory/constitution.md`・`doc/common/adr/**`・
   `.github/workflows/**`・`.github/scripts/**` のいずれかを変更するPRは、
   PR本文またはコミットメッセージに`#<Issue番号>`形式の参照を最低1件持たなければ
   ならない。`tasks.md`のIssue対応表や`speckit-tasks`/`speckit-taskstoissues`の
   実行を前提としない、PR単位の存在チェックとする(ADR-0002のタスク**順序**ゲートとは
   別の、Issueの**存在**そのものを強制するゲート)。
2. **`.github/scripts/check-governance-issue-ref.sh`を新設**し、PRで変更された
   ファイルが上記パスに該当する場合、PR本文(`PR_BODY`環境変数経由)+コミット
   メッセージ全体から`#[0-9]+`パターンを検索する。見つからなければCIを失敗させる。
3. `governance-issue-reference`ジョブとして「Spec consistency」ワークフローに
   追加した。PR本文はGitHub Actionsの`env:`経由で渡し、シェルへの直接埋め込みに
   よるコマンドインジェクションを避けた。

## 検討した選択肢

- **`speckit-tasks`/`speckit-taskstoissues`の実行を必須化する運用ルールのみ**:
  ドキュメントに書くだけでは、まさに今回と同じように「スキルを経由しない変更」で
  素通りする。ADR-0002と同じ理由で却下。
- **`speckit-implement`側でのチェック強化**: ADR-0002の選択肢3と同じ弱点(スキルを
  経由しない変更には効かない)を持つため、今回のギャップには対応できない。
- **PRマージゲート(CI、採用)**: `speckit-*`のどのスキルを経由したかに関わらず、
  PRが実際にmainへマージされる時点で機械的に検査できる。ADR-0002が「将来的に
  スキルを経由しない変更経路が増えるようであれば追加で検討する」としていた選択肢2を、
  今回のスコープ(ガバナンス関連ファイル限定)で採用した形。

## スコープ外にしたもの

- `src/**`など通常の実装ファイルの変更は対象外。まずは「仕組み自体」の変更という、
  最もガバナンス崩壊の影響が大きい範囲から始める。将来的に必要になれば、
  ADR-0011のcomponent-test-coverageと同様に対象を広げるかは別途ADRで判断する。
- Issue参照の**内容**(そのIssueが実際にこの変更を説明しているか)までは検証しない。
  `#<番号>`という形式の存在のみを機械的に確認する。内容の妥当性はレビューに委ねる。

## 影響

- 今後、Skill・constitution.md・ADR・CIワークフロー/スクリプトを変更するPRに
  Issue参照が無いと、`governance-issue-reference`ジョブでCIが失敗する。
- constitution.mdは2.9.0 → 2.10.0(MINOR、新しいCore Principleの追加)。
- このADR自身の変更は、Issue [#25](https://github.com/shimazakis0523/Nextjs-Sample/issues/25)
  を参照している(新ルールを最初から満たす例)。
