# ADR-0006: plan.mdは画面単位(screens/<screen>/plan.md)に置く

## ステータス

**Superseded by ADR-0007 (2026-08-30)**。実際に適用した結果、画面が状態を共有する
ケースでコンポーネント関係図が画面ごとに重複してしまう問題が判明し、plan.mdは
機能単位に戻された。Accepted当時の記録として残す。

Accepted (2026-08-30)。ADR-0005の決定事項1を覆す。

## コンテキスト

ADR-0005は「plan.mdを画面単位に分割するか」を検討し、当時は見送った。理由は2つ:

1. `001-todo-dashboard`のTodo一覧とTodo新規登録が、いずれも`TodoDashboard.tsx`という
   同一コンポーネントで実装されており、画面単位にファイルを分けても実装の実態(コン
   ポーネント境界)と一致しなかった。
2. `specs/<feature>/plan.md`という固定パスは、`speckit-plan`だけでなく`speckit-tasks`・
   `speckit-implement`・`speckit-analyze`・`speckit-converge`・`speckit-checklist`が
   前提にしており、画面単位分割にはこれらすべてのSkill定義の書き換えを要した。

今回、`TodoDashboard.tsx`を`TodoList.tsx`・`TodoNewModal.tsx`など画面ごとのコンポーネント
に分割する設計に変更することを決めた。これにより理由1が解消される。また実際にplan.mdの
内容を精査すると、Constitution Checkの各原則説明が実質的にconstitution.md自身の再掲に
なっており、feature単位の1ファイルに複数画面分の内容を詰め込むほど重複が増えていく
構造だと分かった — 画面ごとに1ファイルへ分割した方が、各ファイルが「その画面固有の
設計」だけを持つ形にできる。

## 決定

1. **`plan.md`は画面ごとに`specs/<feature>/screens/<screen-id>/plan.md`として置く**。
   画面を持たない機能(純粋なBFF内部変更等)は、従来通り`specs/<feature>/plan.md`を
   1つ持つ。
2. **画面単位のplan.mdのConstitution Checkは、原則の説明を再掲しない**。共通インフラ
   (`src/lib/backend.ts`のswap point、BFF-onlyアクセス、`globalThis`キャッシュの
   非永続化)によって画面を問わず自動的に満たされる原則(I・II・IV)は1行にまとめ、
   その画面固有の判断が必要な原則(III: この画面が呼ぶエンドポイント、V: この画面の
   スコープ外にした機能)だけを個別に記載する。
3. **`plan.md`の「Documentation (this feature)」ディレクトリツリー節は削除**する。
   どの機能のplan.mdにも同じ内容(plan.md/screen-flow.md/screens/tasks.mdの説明)が
   並ぶ定型文で、画面固有の情報を持たないため。
4. **`specs/<feature>/plan.md`(feature直下)は、画面がある機能では一切持たない**。
   当初は「`.specify/scripts/bash/check-prerequisites.sh`が`$FEATURE_DIR/plan.md`の
   存在を無条件にハードコードで要求している」ことを理由に、中身を持たないスタブとして
   残す案を採ったが、そのスタブ自体が「何のためにあるか分からないファイル」として
   同じ種類の混乱を招くと指摘された。そのため方針を変更し、
   `check-prerequisites.sh`・`setup-tasks.sh`・`setup-plan.sh`の3スクリプトを
   直接修正し、`$FEATURE_DIR/screens/*/plan.md`が1つ以上存在すれば
   `$FEATURE_DIR/plan.md`の不在を許容するようにした(スタブ生成自体をやめた)。
   下記「検討した代替案」も参照。
5. **`speckit-plan`/`speckit-tasks`/`speckit-implement`/`speckit-analyze`/
   `speckit-converge`/`speckit-checklist`の各Skill定義を、画面単位のplan.mdを読み書き
   するように更新**する。具体的には、`FEATURE_DIR/plan.md`を唯一のplan.mdとして扱う
   箇所を、「`FEATURE_DIR/screens/*/plan.md`が存在すればそれらを画面ごとのplan.mdと
   して扱う」という条件分岐に置き換える。

## 検討した代替案

当初は**spec-kit本体のスクリプト(`.specify/scripts/bash/`配下)を直接書き換える案**を
避け、「feature直下に中身のないスタブplan.mdを置く」方式を採った。理由は、これらの
スクリプトが`.specify/templates/`の`overrides/`層のようなプロジェクト固有カスタマイズの
置き場を持たない、spec-kit本体の更新(`specify update`等)で上書き・競合しうるコアスクリプト
だったため。

しかし実際に運用してみると、このスタブファイル自体が「何のためにあるか分からない
ファイル」として同種の混乱を招いた。スタブを維持するコスト(そのファイルの役割を
毎回説明する必要がある)は、スクリプトを直接書き換えるリスク(将来の`specify update`で
上書きされ得る)より大きいと判断し、方針を変更して
`check-prerequisites.sh`・`setup-tasks.sh`・`setup-plan.sh`を直接修正した。将来
spec-kit本体を更新する際は、この3スクリプトのplan.md存在チェック部分がこの変更を
保持しているか確認すること。

Skill定義(`.claude/skills/*/SKILL.md`)側の指示を変更する方針(決定5)は変更していない
— これらは元々このプロジェクトの管理下にあり、これまでも(例: research.md/
data-model.md/quickstart.mdを生成しない指示への変更)同じ方法でカスタマイズしてきた
ため。

## 影響

- `specs/001-todo-dashboard/plan.md`は削除し、実体は
  `specs/001-todo-dashboard/screens/todo-list/plan.md`と
  `specs/001-todo-dashboard/screens/todo-new/plan.md`に分かれる。
- `.specify/scripts/bash/check-prerequisites.sh`・`setup-tasks.sh`・
  `setup-plan.sh`はこのプロジェクト向けに直接修正済み(`screens/*/plan.md`が
  1つ以上あれば`$FEATURE_DIR/plan.md`の不在を許容)。spec-kit本体の更新時は
  この変更が保持されているか確認する。
- `TodoDashboard.tsx`を`TodoList.tsx`・`TodoNewModal.tsx`に分割するコード変更は、
  この計画変更の対象に含まれるが、plan.mdの執筆自体とは別の実装タスクとして
  `tasks.md`側で扱う。
- 今後、画面を持つ新規機能はすべて画面単位のplan.mdを持つ。`tasks.md`は従来通り
  feature単位1ファイルのまま(既にUS1/US2ラベルで画面ごとにグループ化されており、
  分割の実益がないため)。
