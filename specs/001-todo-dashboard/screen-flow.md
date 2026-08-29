# 画面遷移図: Todoダッシュボード

**対象機能**: `001-todo-dashboard`

**最終更新**: 2026-08-29

このドキュメントは、`screens/*/spec.md` 内の各画面が自ら記述する遷移先(機能要件)から
生成したものであり、手作業で遷移元情報を追記する場所ではない。画面ごとの詳細仕様は各
`screens/<画面ID>/spec.md` を参照すること。

```mermaid
flowchart LR
    todo-list["Todo一覧画面<br/>/dashboard"]
    todo-new["Todo新規登録画面<br/>(モーダル)"]

    todo-list -- "+ Add" --> todo-new
```

## 遷移一覧

| 元画面 | 操作 | 先画面 | 根拠 |
|---|---|---|---|
| `todo-list` | 「+ Add」ボタンをクリック | `todo-new` | [todo-list/spec.md FR-006](screens/todo-list/spec.md) |
