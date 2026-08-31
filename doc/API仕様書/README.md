# API仕様書(OpenAPI契約)

このアプリが関わる2つのAPI契約を、YAMLで管理する。ソースオブトゥルースは
このディレクトリのYAMLのみで、生成物（型定義・バンドル済みYAML）はコミット
対象外（`.gitignore`参照）。都度コマンドで再生成する。

```
doc/API仕様書/
├── common/schemas/     # Todo / User / Error の共通スキーマ定義
├── BFF/openapi.yaml     # Next.js BFFが公開するAPI契約（フロントエンド向け）
│                         # 実装: src/app/api/**
└── Backend/openapi.yaml # 実バックエンドとの契約（upstream API）
                          # 呼び出し元: src/lib/backend.ts（BACKEND_API_URL設定時）
```

`BFF`と`Backend`はどちらも `common/schemas/**` を `$ref` で参照して、
Todo/Userの形の二重管理を避けている。

## 現状との関係

**このYAMLは仕様書であり、今のアプリの実行時の挙動を自動的に変えるものでは
ない。** `src/lib/mock-todos.ts` / `src/lib/mock-data.ts` は今まで通り
手書きのモックとして動く。ここで用意しているのは以下のツール群:

- **型生成**: YAMLからTypeScriptの型を生成できる（`src/types/api/*.d.ts`）。
  実際にアプリのコードをこの生成型に切り替えるかは別判断。
- **モックサーバー生成**: `Backend/openapi.yaml` から
  [Prism](https://stoplight.io/open-source/prism) でスタンドアロンの
  HTTPモックサーバーを起動できる。`BACKEND_API_URL` をこのモックサーバーの
  URLに向ければ、`mock-todos.ts` の代わりにこちらを使う運用に切り替えられる
  （ただしその切り替えはまだ行っていない）。

## コマンド

```bash
npm run openapi:lint            # 仕様の妥当性チェック
npm run openapi:types           # bff / backend 両方の型を src/types/api/ に生成
npm run openapi:bundle:backend  # Backend/openapi.yaml を1ファイルにバンドル
npm run openapi:mock:backend    # backend契約からPrismモックサーバーを起動 (http://127.0.0.1:4010)
```
