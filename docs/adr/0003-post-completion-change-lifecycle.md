# ADR-0003: 完成後の仕様変更・バグ修正のライフサイクル

## ステータス

Accepted (2026-08-30)

## コンテキスト

ADR-0002で`speckit-implement`にIssueベースの着手条件ゲートを追加したが、これは
「`tasks.md`を一度`speckit-taskstoissues`でIssue化し、そのまま最後まで実装する」という
一回限りのライフサイクルしか想定していなかった。

実際には、機能が一度完成した後も仕様変更やバグ修正が発生し続ける。Spec Kitには
`/speckit-converge`という、完成後にspec.md/plan.md/tasks.mdとの差分(未実装・バグを含む)を
検知して`tasks.md`に新しい`## Phase N: Convergence`セクションとして追記するスキルが
既にあり、これが仕様変更・バグ修正の受け皿になる。

しかし、この既存の流れには2つの欠落があった。

1. `speckit-taskstoissues`は新規タスクのGitHub Issueを作成するだけで、ADR-0002で
   `tasks.md`に追加した「GitHub Issues」対応表(task↔Issue、phase↔前提Issue)には
   一切触れない。そのため、Convergenceで追記された新フェーズは対応表に行が無いまま
   Issue化されてしまう。
2. `speckit-implement`のゲートは「対応表に行が無いフェーズ」の扱いを明確に定義していな
   かった。曖昧な書き方のままだと、行が無い=前提条件チェック対象外(素通り/fail-open)と
   誤読されかねず、それではADR-0002で作ったゲートの意味が無くなる。

## 決定

以下の3点を変更した。

1. **`speckit-taskstoissues`に対応表メンテナンス手順を追加**: このプロジェクト固有の
   規約として、Issue作成後に`tasks.md`の「GitHub Issues」対応表へ新規タスクの行を追記し、
   新しく追記されたフェーズについては「着手条件(Issue単位)」表にも行を追加する。
   前提Issueは、タスクの記述や`/speckit-converge`が付けた`source-ref`から特定の依存が
   読み取れない限り、**そのフェーズより前に存在した全てのIssue**をデフォルトの前提とする
   (保守的だが単純なデフォルト。バグ修正1件のためだけに機能全体の完了を待つのは過剰にも
   見えるが、対応表がゲートの唯一の判断材料である以上、誤って狭すぎる前提を設定するより
   安全側に倒す)。
2. **`speckit-implement`のゲートをfail-closedに明確化**: 対応表(2つの表そのもの)が
   存在するにもかかわらず、特定のフェーズ/タスクの行が無い場合は「前提条件チェック対象外」
   ではなく「対応表の登録漏れによりブロック」として扱い、実施しない。対応表が丸ごと
   存在しない(Issue化されたことが一度も無い機能)場合のみ、ゲート自体をスキップする。
3. **`speckit-converge`のハンドオフ手順に誘導を追加**: Convergenceでタスクが追記された
   場合、対応表を持つ機能では`/speckit-implement`の前に必ず`/speckit-taskstoissues`を
   再実行するよう案内する。Convergence自体は「tasks.mdの新フェーズ追記以外は一切書き換え
   ない」という既存の契約(APPEND-ONLY)を守ったままにし、対応表の更新責務は
   `speckit-taskstoissues`側に置く。

## 影響

- 機能の完成は一回限りのゴールではなく、`/speckit-converge`により何度でも新しい
  Convergenceフェーズが追記されうる継続的なライフサイクルとして扱われる。
- 仕様変更・バグ修正のたびに `/speckit-converge` → `/speckit-taskstoissues` →
  `/speckit-implement` という順序を踏む必要がある。この順序自体はプロセスとして文書化
  されているだけで(過去に議論した「ルールを書いただけでは強制にならない」問題と同型)、
  実際に強制されるのは「対応表に登録されていなければ実施しない」という
  `speckit-implement`側のfail-closedな振る舞いのみである。
- `speckit-taskstoissues`の対応表メンテナンス手順は、このプロジェクトの`tasks.md`が
  「GitHub Issues」セクションを持つ場合にのみ発動する条件付き手順とし、この規約を
  採用していない他プロジェクト/機能には影響しない。
