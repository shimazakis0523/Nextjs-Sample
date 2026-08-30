# Quickstart: Todoダッシュボード

## 前提

- Node.jsとこのリポジトリの依存関係がインストール済みであること(`npm install`)。
- `BACKEND_API_URL`を設定しなければモックバックエンドで動作する。

## 起動

```bash
npm run dev
```

ブラウザで `/dashboard` を開く。

## 検証シナリオ

各画面の`test-spec.md`に定義されたテストケースに沿って手動確認する。

1. [Todo一覧の初期表示](./screens/todo-list/test-spec.md) — TC-001, TC-002, TC-007〜TC-009
2. [Todo新規登録](./screens/todo-new/test-spec.md) — TC-001〜TC-005
3. [Todoの削除](./screens/todo-list/test-spec.md) — TC-004〜TC-006

いずれも期待結果は各test-spec.mdの該当行、根拠となる仕様は対応する`spec.md`を参照。
