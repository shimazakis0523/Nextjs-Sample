# Data Model: Todoダッシュボード

Todoエンティティの正式な定義(フィールド・型・制約)は [openapi/common/schemas/Todo.yaml](../../openapi/common/schemas/Todo.yaml)
にある。ここで再定義しない(Principle VI: データモデルはAPI契約側が唯一の情報源)。

## この機能におけるTodoの扱い

- **モック実装**(`src/lib/mock-todos.ts`)は`Todo.yaml`と同じ形の型を`Todo`として定義し、
  `globalThis`上のインメモリ配列として保持する。永続化はしない(Principle IV、research.md参照)。
- **状態遷移**: Todoに状態遷移ルールはない。`status`フィールドは4値
  (`未着手`/`進行中`/`完了`/`保留`)のいずれかを保持するだけで、値ごとの遷移制約は無い
  (どの値からどの値へも変更可能)。
- **関連エンティティ**: `User`(`openapi/common/schemas/User.yaml`)は`getUsers()`で参照可能だが、
  この機能(Todo一覧・新規登録・削除)の画面はいずれも`assignee`を自由入力テキストとして扱っており、
  `User`との参照関係は持たない。
