# ADR-0010: 「登場するコンポーネントと関係」はBFF層も対象。矢印は凡例なしで読める形にする

## ステータス

Accepted (2026-08-30)

## コンテキスト

`specs/001-todo-dashboard/plan.md`の「登場するコンポーネントと関係」は、これまで
Reactコンポーネント(`page.tsx`・`TodoDashboard.tsx`・`TodoList.tsx`・`TodoNewModal.tsx`)
だけを対象にしていた。BFFのRoute Handler(`src/app/api/todos/route.ts`・
`src/app/api/todos/[id]/route.ts`)は、Project Structureのコードブロックに
ファイルパスと1行コメント(`# GET /api/todos, POST /api/todos`)があるだけで、
図にもなく、役割やbackend.ts関数の呼び出しを説明する節も無かった。

これは「BFF層を定義しないまま、実装計画が無い状態でBFF層を作ることになるのではないか」
という指摘の通りで、Reactコンポーネントには`### `見出しで役割・props/state・呼び出す
APIまで書いているのに、BFF層だけ1行コメントで済ませているのは扱いが不釣り合いだった。

また、図の実線/破線の意味(props/callback)は、図の下に「実線 = ... 破線 = ...」という
凡例文で説明していた。これは、矢印自体にラベル(`todos, onDeleted, onAddClick`等)は
付けているにもかかわらず、その関係が何の種類か(props渡しなのかcallbackなのか)は
凡例を読まないと分からない、という中途半端な状態だった。

## 決定

1. **「登場するコンポーネントと関係」のスコープをReactコンポーネントに限定しない**。
   この機能が新規に書く/変更する全ファイルのうち、他のファイルと「自明でない関係」
   (親子関係・状態共有・props/callback・機能内でのHTTP呼び出し)を持つものはすべて
   対象とする。BFFのRoute Handlerも、他のコンポーネントと同じ扱いで図のノード + 詳細
   サブセクション(役割・呼び出す`backend.ts`関数・バリデーションの有無)を持つ。
2. **矢印のラベルに関係の種類を埋め込み、凡例を廃止する**。`"props: todos, onDeleted"`
   `"callback: onDeleted(id)"` `"fetch: DELETE /api/todos/{id}"`のように、矢印ラベル
   自体に「これは何の関係か」を書く。読み手が実線/破線の意味を覚えている前提を作らない。

## 影響

- `specs/001-todo-dashboard/plan.md`に`route.ts`・`[id]/route.ts`の詳細サブセクション
  を追加し、図にも2ノード追加した。
- `plan-template.md`・`speckit-plan`スキルに同じスコープ・ラベリングのガイダンスを
  追加した。
- constitution.mdの該当箇所を更新(PATCH — 既存セクションの適用範囲と書式の明確化で、
  新しい章や新しい必須項目を追加するものではない)。
