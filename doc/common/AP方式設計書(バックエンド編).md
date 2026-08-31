# AP方式設計書(バックエンド編)

このアプリのBFF(Backend For Frontend)層に共通する技術スタック・構成・制約の、現時点の
事実を記載する。個々の業務の詳細設計書はこれを参照し、重複して記載しない(業務固有の
内容のみを詳細設計書に書く)。設計判断の背景・理由は`doc/common/constitution.md`と
`doc/common/adr/`を参照すること — このファイル自体は「なぜ」を説明せず、現在の構成を
記録するだけの事実集である。

フロントエンド側の構成は[AP方式設計書(フロントエンド編)](./AP方式設計書(フロントエンド編).md)
を参照。

## 主要依存

- `next`, `react`, `react-dom`。OpenAPI関連ツールとして`@redocly/cli`(lint/bundle)、
  `openapi-typescript`(型生成)、`@stoplight/prism-cli`(実バックエンドのモックサーバ)。

## BFFの構成: mock/実バックエンドのswap point

```text
src/app/api/**  (BFF Route Handler)
  │  必ず src/lib/backend.ts の関数(getTodos等)経由で呼ぶ
  ▼
src/lib/backend.ts  (swap point。BACKEND_API_URLの有無で分岐。Principle II)
  ├─ 未設定時 → src/lib/mock-*.ts (globalThisキャッシュのインメモリモック)
  └─ 設定時   → src/lib/backend-client.ts → BACKEND_API_URL (実バックエンド)
```

- Route Handler・Server Componentsは`mock-*.ts`や`backend-client.ts`を直接importせず、
  必ず`backend.ts`の関数を経由する。
- この構成により、実バックエンド接続への切り替えは`backend.ts`一箇所の変更で完結する。

## データ永続化

- モック時: `globalThis`にキャッシュしたインメモリ配列(`src/lib/mock-*.ts`)。
  サーバーレス環境での永続化は保証しない。
- 実バックエンド接続時: `BACKEND_API_URL`が指す外部サービスに委譲し、このアプリ
  自身は永続化層を持たない。

## リポジトリレイアウト(バックエンド関連)

```text
src/lib/
├── backend.ts               # mock/実バックエンドのswap point (Principle II)
├── backend-client.ts        # 実バックエンド呼び出し (backendFetch)
└── mock-*.ts                 # モック時のインメモリストレージ

doc/API仕様書/
├── BFF/openapi.yaml            # このアプリの/api/**契約
├── Backend/openapi.yaml        # BACKEND_API_URL契約
└── common/schemas/             # 両方から$refする共有スキーマ
```

**注意: ここに書かれているのは「パターン」であり「個別の中身」ではない。** `backend.ts`が
swap pointという1ファイルに集約される構成、`mock-<entity>.ts`という命名規則は全業務で
共通の事実だが、`backend.ts`内の個別の関数(`getTodos`/`createTodo`/`deleteTodo`等)や、
個別の`mock-todos.ts`のような具体的ファイルは、そのエンティティを導入した業務自身の
成果物である。例えば`getTodos`/`createTodo`/`deleteTodo`と`mock-todos.ts`は
Todoダッシュボード業務を実装したコミットで追加されたものであり、他の業務が新しい
エンティティを導入するときも同様に「既存の`backend.ts`に関数を追加する」「新しい
`mock-<entity>.ts`を追加する」という変更が発生する。これらは「共通インフラだから業務の
詳細設計書への記載を省略してよいもの」ではなく、その業務の詳細設計書のProject
Structureに MUST で記載する(新規追加なら追加、既存ファイルへの追記なら変更、として
明記する)。

## 制約

- Route Handlerはリクエスト間でメモリを共有しない前提で実装する(Principle IV)。
