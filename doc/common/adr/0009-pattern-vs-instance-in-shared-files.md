# ADR-0009: docs/architecture.mdが記載する「共通」はパターンであり、個別の中身ではない

## ステータス

Accepted (2026-08-30)

## コンテキスト

`specs/001-todo-dashboard/plan.md`のProject Structureは、これまで次のように書かれて
いた。

> 共通インフラ(`src/lib/backend.ts`・`backend-client.ts`・`mock-*.ts`・`openapi/**`)は
> `docs/architecture.md`のリポジトリレイアウトを参照。以下はこの機能固有のパスのみ。

これは誤りだった。実際に`git log`で確認すると:

```
$ git log --diff-filter=A --format="%H %ad %s" --date=short -- src/lib/mock-todos.ts
74a83c8... 2026-08-29 Add Todo dashboard with in-memory mock backend
```

`src/lib/mock-todos.ts`は`001-todo-dashboard`を実装したコミットそのもので新規作成
されていた。`src/lib/backend.ts`内の`getTodos`/`createTodo`/`deleteTodo`も同じコミット
で追加されていた(`backend.ts`というファイル自体は、Usersに対する`getUsers`実装時から
既に存在した)。

つまり「共通インフラだから省略してよい」という扱いは、`backend.ts`・`mock-*.ts`という
**ファイル名のパターン**を見て、その中の**個別の関数・個別のファイル**まで共通だと
誤認したために起きた。`docs/architecture.md`のリポジトリレイアウトが記載しているのは
「backend.tsという1ファイルに全エンティティのswap point関数が集約される」「エンティティ
ごとに`mock-<entity>.ts`を作る」という**構成パターン**であって、`getTodos`という
**具体的な関数**や`mock-todos.ts`という**具体的なファイル**がそれ自体すでに存在する
という意味ではない。むしろこれらは、Todoというエンティティを最初に導入した機能
(`001-todo-dashboard`)自身が作った、その機能の成果物である。

## 決定

1. `docs/architecture.md`のリポジトリレイアウトに、パターンと個別の中身を区別する
   注意書きを追加する。`backend.ts`・`mock-*.ts`という記載は構成パターンの説明であり、
   個別の関数・個別のファイルはそれを導入した機能の`plan.md`にMUSTで記載する。
2. `specs/001-todo-dashboard/plan.md`のProject Structureを修正し、
   `src/lib/mock-todos.ts`(新規)と、`src/lib/backend.ts`への
   `getTodos`/`createTodo`/`deleteTodo`追加(変更)を明記する。
3. `plan-template.md`・`speckit-plan`スキルに同じ区別のガイダンスを追加し、今後の
   機能が同じ誤りを繰り返さないようにする。
4. constitution.mdの該当ルールは変更しない(「app-wideな事実はdocs/architecture.mdに
   1回だけ書く」というルール自体は正しかった)。ただし誤解を防ぐため、パターンと
   個別の中身の区別を明記する形で文言を補強する。

## 影響

- 今後、新しいエンティティを導入する機能は、`backend.ts`への追加関数と新規の
  `mock-<entity>.ts`を、自分自身の`plan.md`のProject Structureに必ず記載する。
- `docs/architecture.md`は引き続き「事実の一覧」であり続けるが、パターンと個別事例の
  境界が明示されたことで、今回のような誤読を防ぐ。
