# Research: Todoダッシュボード

**Input**: [plan.md](./plan.md) Technical Context

Technical Contextに「NEEDS CLARIFICATION」は無し(既存実装に基づく)。以下は主要な技術判断の記録。

## モック/実バックエンドの切り替え方式

- **Decision**: `src/lib/backend.ts`が`BACKEND_API_URL`環境変数の有無だけで分岐する単一のswap point
  を持つ。
- **Rationale**: 呼び出し側(Route Handler)がどちらの経路かを意識しなくてよくなり、実バックエンド接続時の
  変更を`backend.ts`一つに限定できる(Principle II)。
- **Alternatives considered**: 各Route Handlerで個別に分岐する方式は、分岐ロジックが複数箇所に散らばり
  実バックエンド接続時の変更漏れリスクが高いため採用しなかった。

## モック時のデータ保持方式

- **Decision**: `globalThis`にキャッシュしたインメモリ配列(`mock-todos.ts`)。
- **Rationale**: Next.jsの開発サーバーがモジュールを再読み込みしても一覧がリセットされないようにする
  ための最小限の工夫。本番のサーバーレス環境での永続化を意図したものではないことをコード内コメントで
  明記している(Principle IV)。
- **Alternatives considered**: ファイルやDBへの永続化は、実バックエンドが担うべき責務であり、この
  アプリ自身が持つべきではないため採用しなかった(Technology & Deployment Constraints)。

## API契約の記述方式

- **Decision**: `openapi/bff/openapi.yaml`(このアプリの`/api/**`)と`openapi/backend/openapi.yaml`
  (`BACKEND_API_URL`への呼び出し)を分離し、共有スキーマは`openapi/common/schemas/**`に集約して
  両方から`$ref`する。
- **Rationale**: フロントが呼ぶ契約とこのアプリが実バックエンドに求める契約は別物であり、混在させると
  「このアプリの`/api/todos`のリクエスト形」と「実バックエンドの`/todos`のリクエスト形」の区別が
  つかなくなる。
- **Alternatives considered**: 単一のopenapi.yamlに両方をまとめる方式は、上記の混同を招くため
  採用しなかった。
