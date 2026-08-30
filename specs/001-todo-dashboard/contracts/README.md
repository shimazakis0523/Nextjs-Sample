# Contracts: Todoダッシュボード

この機能が公開・依存するインターフェース契約は、既存のOpenAPI定義をそのまま参照する
(Principle III: 契約はopenapi/配下が唯一の情報源。ここに複製しない)。

- ブラウザ→このアプリの契約: [openapi/bff/openapi.yaml](../../../openapi/bff/openapi.yaml)
  - `GET /api/todos`, `POST /api/todos`, `DELETE /api/todos/{id}`
- このアプリ→実バックエンドの契約(`BACKEND_API_URL`設定時): [openapi/backend/openapi.yaml](../../../openapi/backend/openapi.yaml)

各エンドポイントの詳細(リクエスト/レスポンス形、ステータスコード)は上記YAMLを参照すること。
