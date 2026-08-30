# ADR-0002: sub-issueの順序をIssue状態でゲートする

## ステータス

Accepted (2026-08-30)

## コンテキスト

ADR-0001で機能単位の親Issue + タスク単位のsub-issueという構造を採用したが、この構造自体には
着手順序を強制する仕組みがない。検討した結果、以下が判明した。

- sub-issueの並び順は表示上のものに過ぎず、後続タスクを先に着手・クローズすることを妨げない。
- GitHubネイティブの「Issue dependencies (blocked by / blocking)」機能は存在するが、
  (1) 現在利用可能なGitHub MCPツールには書き込み手段が無く、(2) GitHub本体の挙動としても
  blockされたIssueのクローズを物理的に止めるものではなく警告表示に留まる。
- PRのマージをゲートする方式(CIでblocking issueのclose状態を検査し、ブランチ保護のrequired
  status checkにする)は実現可能だが、Issue dependenciesの書き込み経路が無い現状ではこれも
  别途カスタム実装が要る。

### 検討した選択肢

1. **ドキュメント記載のみ(現状)**: `tasks.md`の「Phase Dependencies」に依存関係を書くだけ。
   - 欠点: 誰か(Claudeセッション含む)がこれを読んで守るかどうかに依存する。強制力ゼロ。
2. **PRマージゲート(CI)**: PRがcloseするIssueの依存Issueが全てclosedかをCIで検査し、
   ブランチ保護のrequired status checkにする。
   - 利点: 人間・Claude問わず、誰が作業してもマージ時点で機械的に強制される。
   - 欠点: GitHub Issue dependenciesへの書き込み手段が無いため、依存関係をどこか別の
     機械可読な場所(tasks.mdなど)に持つ必要があり、CIスクリプトもその形式に依存する追加実装が要る。
     着手前ではなく完了(マージ)時点のゲートになるため、着手そのものは防げない。
3. **タスク実行スキル(`speckit-implement`)内での着手条件チェック(採用)**: タスクを実施する
   スキル自身が、着手前にGitHub Issue状態を確認し、前提Issueが全てclosedでなければそのタスクを
   実施しない。
   - 利点: 着手そのものをその場で止められる(選択肢2は事後着手済みへの後追い検知)。
     tasks.mdに前提Issue表を持たせるだけで実装でき、追加のCIインフラが不要。
   - 欠点: `speckit-implement`を経由せずに(スキルを使わず直接コードを書く、または別の
     エージェント/人間が)タスクを実施した場合は素通りする。GitHubのIssue状態そのものを
     見て判断するため「Claudeセッションの記憶に依存しない」という目的は満たすが、
     「スキルの実行自体」への依存は残る。

## 決定

選択肢3を採用する。`tasks.md`に「GitHub Issues」タスク↔Issue対応表と「着手条件(Issue単位)」
フェーズ↔前提Issue表を追加し、`speckit-implement`スキルに、あるフェーズのタスクを実施する前に
その前提IssueがすべてGitHub上でclosedであることを確認し、closedでなければそのフェーズを
実施しない(スキップし、未closeのIssueを報告する)手順を追加した。

タスク完了時は、tasks.mdの`[X]`更新と同時に対応するGitHub Issueもclose するよう
`speckit-implement`に指示し、ゲートが参照するIssue状態とtasks.mdの記述が乖離しないようにする。

選択肢2(PRマージゲート)は、より強い強制力を持つため、将来的にスキルを経由しない変更経路
(直接のcode edit、他エージェント)が増えるようであれば追加で検討する。

## 影響

- タスクの着手順序は、tasks.mdの「Phase Dependencies」というプロース(散文)を覚えているか
  どうかではなく、GitHub Issueのopen/closed状態という客観的な外部状態に基づいて判定される。
- `speckit-taskstoissues`でIssue化した後は、必ずtasks.mdに対応表を書き戻す運用が必要になる
  (今回`speckit-taskstoissues`スキル自体はこの書き戻しをまだ自動化していないため、当面は
  都度手動で追記する)。
- この仕組みは`speckit-implement`を経由しない変更(直接のコード編集など)には効かない。
  完全な強制力が必要になった場合は選択肢2(PRマージゲート)を追加で検討する。
