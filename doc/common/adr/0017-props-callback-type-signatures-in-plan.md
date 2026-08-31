# ADR-0017: 詳細設計書のprops/callbackラベルに型を必須化する

## ステータス

Accepted (2026-08-31)

## コンテキスト

ユーザーが`詳細設計書_業務1_Todoダッシュボード.md`の「登場するコンポーネントと関係」の
Mermaid図を確認したところ、各エッジのラベルが`"props: initialTodos"`・
`"props: todos, onDeleted, onAddClick"`・`"callback: onDeleted(id)"`のように
プロパティ・コールバックの**名前のみ**で構成されており、それぞれの型・フィールド構成が
一切書かれていないことを指摘した。

実際の実装(`TodoList.tsx`・`TodoDashboard.tsx`)では`todos: Todo[]`・
`onDeleted: (id: string) => void`・`onSaved: (todo: Todo) => void`のように
型が明確に定義されているが、これは実装コードを読んで初めてわかることであり、
設計書だけを見て実装しようとすると、実装者は型を推測(想像)するしかない。これは
このプロジェクトが「モックアップ→ユースケース記述/画面定義→詳細設計→実装」という
順で前段の成果物を参照しながら実装する、という設計思想(スペック駆動開発)に反する
ギャップである。ADR-0011がコンポーネントの単体テスト漏れについて指摘した
「実装を見て初めてわかる」という同種の構造的な問題が、propsの型についても
起きていた。

## 決定

`登場するコンポーネントと関係`のMermaid図における`props`/`callback`エッジラベルに、
フィールドレベルの型シグネチャの記載を必須とする:

- `"props: todos: Todo[]"`のように、名前だけでなく型まで書く。
  `"props: todos"`のような名前のみの記載は禁止。
- `"callback: onSaved(todo: Todo) => void"`のように、コールバックは引数の型と
  戻り値の型まで書く。
- 型が`doc/API仕様書/common/schemas/**`に既に定義されているエンティティ
  (例: `Todo`)であれば、そのエンティティ名をそのまま使い、フィールドを
  再列挙しない(エンティティ定義の二重管理を避ける)。
- 共有スキーマ定義が存在しないローカル専用の型(UIだけで完結するstate等)のみ、
  その場でフィールドを書き下す。

`.specify/templates/overrides/plan-template.md`のMermaidサンプルと
`speckit-plan`のSKILL.mdをこの要件に合わせて更新し、constitution.mdの
Development Workflow(Spec-Driven)にMUST要件として追記した(v2.12.0、MINOR
— 既存の要件を明確化しただけでなく、新しい適合基準を課すため)。

## 影響

- 既存の`詳細設計書_業務1_Todoダッシュボード.md`のMermaid図・各コンポーネントの
  詳細を、実装コード(`TodoList.tsx`等)に基づいて型情報を補って修正した。
- 今後`/speckit-plan`で新規に生成される詳細設計書は、最初から型付きのラベルで
  出力される。
- 型を書く分、Mermaid図のラベルはやや長くなるが、実装者が型を推測する必要が
  なくなる方が優先度が高いと判断した。
