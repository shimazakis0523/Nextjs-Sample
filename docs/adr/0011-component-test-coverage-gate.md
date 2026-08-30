# ADR-0011: コンポーネントのユニットテストをCIで機械的に強制する

## ステータス

Accepted (2026-08-30)

## コンテキスト

T021(`TodoDashboard.tsx`を`TodoList.tsx`・`TodoNewModal.tsx`に分割する実装)を完了
させた時点で、3つのコンポーネントのうちどれにもユニットテストが無かった。理由は
`tasks.md`のT021タスク自体が「分割後、e2e-test-specの全テストケースが引き続き通る
ことを確認する」というE2Eの再確認のみを求めており、ユニットテストの新規作成を要求
していなかったため。実装者(Claude)はタスクの記述に忠実に従った結果、E2E確認は行った
がユニットテストは書かなかった。この抜けは後から人間によるレビューで指摘されて
初めて発覚した。

これは、このプロジェクトがこれまで別の場面で学んだのと同じ種類の問題である:
「Skillの指示文に頼るだけでは、いつか必ず抜ける」。実際に`check-spec-sync.sh`
(spec.mdの変更にe2e-test-spec.md/screen-flow.mdの追従が伴っているかをCIで機械的に
検査する)や、GitHub Issueベースのタスク順序ゲート(`speckit-implement`の着手条件
チェック)は、まさに「Skillの指示を信頼するのではなく、機械的に検証する」という
方針で作られている。コンポーネントのテストカバレッジも同じ扱いにすべきである。

## 決定

1. **Core Principle VII (Component Test Coverage) を新設**。`src/app/**`配下の
   コンポーネント(Next.js App Router自身の特殊ファイル名を除く)は、同じ変更の中で
   対応する`<Component>.test.tsx`を持たなければならない。
2. **`.github/scripts/check-component-tests.sh`を新設**し、PRで変更された
   `src/app/**/*.tsx`のうち、対応する`.test.tsx`が存在しないものがあればCIを失敗
   させる。`check-spec-sync.sh`と同じ設計(base_refとの差分を見る、失敗時に対象
   ファイルを具体的に列挙する)を踏襲した。
3. `component-test-coverage`ジョブとして「Spec consistency」ワークフローに追加した
   (spec.mdの追従チェックと同種の「書き忘れを検出する」ゲートという位置づけのため、
   別ワークフローに分けず既存のものに合流させた)。
4. `speckit-plan`/`speckit-tasks`/`speckit-implement`のSkill定義も、コンポーネント
   のテストを「別タスクとして省略可能なもの」ではなく「実装タスクの一部」として
   扱うよう更新した。

## スコープ外にしたもの

- **`src/lib/**`(非コンポーネントのロジック)のユニットテスト**は、今回は機械的な
  強制の対象にしていない。`backend.ts`・`backend-client.ts`・`mock-data.ts`など、
  現時点でテストが無いファイルが複数あり、これらを即座に必須化するとCIが今の
  リポジトリ状態に対して失敗してしまう(遡及的な大量のテスト追加を要求すること
  になる)。`mock-todos.ts`のようにテストがあるものが標準になるよう、今後
  段階的に対応する。
- **Route Handler(`src/app/api/**/route.ts`)のユニットテスト**も同様の理由で
  スコープ外。BFF層の契約は`check-openapi-contract`スキルとE2Eテストで別途カバー
  されている。
- 上記2つを含めた全面的なテストカバレッジ強制は、必要になった時点で改めて
  ADRを起こして決定する。

## 影響

- 今後、`src/app/**`配下の新規/変更コンポーネントにテストを書き忘れると、PRの
  CIが`component-test-coverage`ジョブで失敗する。
- constitution.mdは2.8.3 → 2.9.0(MINOR、新しいCore Principleの追加)。
