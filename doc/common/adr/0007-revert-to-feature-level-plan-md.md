# ADR-0007: plan.mdを機能単位に戻す(ADR-0006を上書き)

## ステータス

Accepted (2026-08-30)。ADR-0006を上書きする。

## コンテキスト

ADR-0006は、`TodoDashboard.tsx`を画面ごとのコンポーネント(`TodoList.tsx`・
`TodoNewModal.tsx`)に分割する計画に合わせて、`plan.md`を画面単位
(`screens/<screen>/plan.md`)に分割した。

実際に`001-todo-dashboard`へ適用した結果、次の問題が明らかになった。

1. **一番大事な設計判断が画面単位ではなかった**。`todos`一覧stateを誰が持つか
   (`TodoDashboard.tsx`という親コンポーネント)は、`todo-list`・`todo-new`
   どちらか一方の画面の話ではなく、機能全体の設計判断である。これを画面単位の
   ファイルに書こうとすると、結局両方のファイルに同じ内容(コンポーネント関係の
   説明・図)を書かざるを得なかった。
2. **図の重複**。画面ごとのコンポーネント関係を分かりやすくするために追加した
   Mermaid図と役割表は、`screens/todo-list/plan.md`と`screens/todo-new/plan.md`の
   ほぼ全内容が重複した。これはこのプロジェクトがここまで一貫して排除してきた
   「重複するだけで情報量が増えない」ドキュメントと同じ問題である。
3. **条件分岐ルールの複雑さ**。「画面が独立していれば画面単位、状態を共有していれば
   機能単位」という条件分岐は、機能を作るたびに「今回はどちらに当てはまるか」を
   都度判断させることになり、単純な固定ルールに比べて認知コストが高い。

## 決定

1. **`plan.md`は常に機能単位**とする(`specs/<feature>/plan.md`)。画面数によらず、
   例外や条件分岐を設けない。ADR-0006の「画面単位に分割する」決定を撤回する。
2. ADR-0006で導入した内容のうち、**画面単位である必要のなかった改善点は機能単位で
   引き続き採用**する:
   - 「登場するコンポーネントと関係」節(役割表 + Mermaid図)。機能単位1ファイルに
     まとめることで、今回問題になった重複が起きない。
   - Constitution Checkから原則の説明の繰り返しを削る書き方(共通インフラで
     自動的に満たされる原則は1行にまとめ、機能固有の判断が要る原則だけ詳述)。
   - 「Documentation (this feature)」という定型ディレクトリツリー節の削除(画面単位
     でも機能単位でも、どの機能のplan.mdにも同じ内容が並ぶだけで情報量がない)。
3. `.specify/scripts/bash/check-prerequisites.sh`・`setup-tasks.sh`・
   `setup-plan.sh`にADR-0006で加えた「`screens/*/plan.md`があれば
   feature直下のplan.mdが無くてもよい」というパッチは削除し、元の
   「`$FEATURE_DIR/plan.md`が無条件に必須」という動作に戻す。
4. `speckit-plan`/`speckit-tasks`/`speckit-implement`/`speckit-analyze`/
   `speckit-converge`/`speckit-checklist`の各Skill定義から、画面単位分割に対応する
   ために加えた条件分岐をすべて削除し、「`plan.md`は`FEATURE_DIR`直下に1つ」という
   単純な前提に戻す。ただし`speckit-plan`には、画面がコンポーネントや状態を共有する
   場合にコンポーネント関係図を埋める指示は残す(決定2参照)。

## 影響

- `specs/001-todo-dashboard/screens/todo-list/plan.md`と
  `specs/001-todo-dashboard/screens/todo-new/plan.md`は削除し、内容を統合して
  `specs/001-todo-dashboard/plan.md`に書き戻す。コンポーネント関係図・役割表は
  1つに統合され、重複が解消される。
- 今後、画面を持つ新規機能も画面数によらず`plan.md`は1つだけになる。「画面単位か
  機能単位か」を都度判断する必要がなくなる。
- ADR-0006は撤回されるが、記録としては残す(なぜ画面単位を試し、なぜ戻したかの
  経緯を残すため)。
