# ADR-0022: OpenAPI規約(フューチャー株式会社 OpenAPI Specification 3.0.3規約)準拠チェックの導入とCIゲート

## ステータス

Accepted (2026-08-31)

## コンテキスト

ユーザーからフューチャー株式会社「OpenAPI Specification 3.0.3規約」の全文が
共有され、この規約に即したOpenAPI仕様書のチェックをハーネスとして追加したい
という依頼があった。確認したところ、方針は以下の通り:

1. **OpenAPIバージョン**: このプロジェクトは`openapi: 3.1.0`を使用しており、
   規約は3.0.3を前提としている。3.0.3へのダウングレードはせず、3.1のまま、
   バージョンに依存せず適用可能なルールのみを適用する。
2. **ツール**: 規約文書自体がSpectralを検証ツールとして参照しているため、
   既存の`@redocly/cli`(構造的な妥当性検証)を拡張するのではなく、
   `@stoplight/spectral-cli`を新規導入してスタイルルールを実装する。
3. **展開方針**: 現在の`doc/API仕様書/**/openapi.yaml`を規約に適合するよう
   修正してから、CIで即時ブロックするゲートを追加する(可視化のみ先行では
   なく、他のガバナンスゲートと同じ「まず直す、次に強制する」の手順)。

## 決定

### 1. 既存openapi.yamlの実際の違反を修正

ルール実装前に、`doc/API仕様書/BFF/openapi.yaml`と
`doc/API仕様書/Backend/openapi.yaml`を規約と突き合わせ、以下の実際の
不適合を修正した(閾値を緩めたり例外を作ったりするのではなく、内容を直接
修正):

- `servers[].description`が未設定 → 両ファイルに追加。
- ルートの`tags`が未定義、各operationに`tags`が無い → 両ファイルに
  `health`(BFFのみ)/`user`/`todo`タグを追加し、各operationに1つずつ付与。
- 各operationに`summary`はあるが`description`(振る舞いの詳細)が無い →
  実装(`src/lib/mock-todos.ts`等)を確認した上で、事実に基づく説明を追加。
  特に`deleteTodo`は`removeTodo`の実装(`findIndex`が`-1`でも例外を投げず
  no-opで終わる)を確認した上で、BFF側にのみ「対象が存在しない場合も204を
  返す(冪等)」と明記した。Backend側はモックの実装詳細であり実バックエンド
  の契約として保証されたものではないため、この一文は付けなかった。
- BFFの`POST /todos`の`400`レスポンスがインライン定義だった(規約:
  4xx/5xxは`components.responses`に定義して`$ref`で参照する) →
  `components.responses.BadRequest`を新設し`$ref`で参照する形に修正。

### 2. Spectralルールセット(`.spectral.yaml`)

`extends: [[spectral:oas, off]]`で組み込みルールを全て無効化し、規約から
抜粋した独自ルールのみを定義する。実装したルール:

- `info.title`/`info.description`/`info.version`必須
- `servers[].description`必須
- ルートの`tags`が1つ以上、各`tags[]`に`description`必須、
  `tags[].name`は小文字・半角スペース区切り
- 各operationの`tags`は1つだけ、`description`必須、`operationId`は
  キャメルケース
- `options`メソッドの追記禁止(CORS用のoptionsは原則不要)
- GET/DELETEに`requestBody`を持たせない、POST/PUT/PATCHにクエリパラメータ
  を持たせない
- クエリパラメータ名はスネークケース、ヘッダ名はパスカルケース
  (ハイフン区切り)、`traceparent`ヘッダの使用禁止
- 2xxレスポンスは個別定義(`$ref`禁止)、4xx/5xxレスポンスは
  `components.responses`への`$ref`必須(componentize禁止/必須の両方向)
- `components.responses`/`components.schemas`の名称はアッパーキャメルケース
- `type`に配列(複数型)や`null`を指定しない、`allOf`/`anyOf`/`oneOf`の
  使用禁止

**意図的に対象外としたルール**(規約には存在するが実装しない):

- **security(ルートレベルの認証定義必須)**: このプロジェクトのAPIには
  認証機構が無い。強制すると実態にないセキュリティ定義を捏造することになる
  ため対象外とした。将来認証を導入する際に改めて検討する。
- **YAML記法(フロースタイル配列・クォート省略・改行末尾等)**: 既存ファイル
  は既に規約に自然に沿っており、テキストレベルの書式ルールをSpectralの
  カスタム関数として実装するコストに見合わないため、優先度を下げて対象外
  とした。
- **デフォルト値/`maxLength`の後方互換性(公開後に変更してはならない)**:
  単一時点のスナップショットに対するlintでは検証できない(過去バージョンと
  の差分比較が必要)ため対象外とした。
- **`components.parameters`のQuery/Header/Cookieプレフィックス命名**:
  現状このプロジェクトには`components.parameters`で共通定義された
  パラメータが1つも無く、検証対象が存在しないため対象外とした。
  `components.parameters`が導入された時点で追加を検討する。

### 3. Spectral設定上の注意点(実装中に発見)

- `extends: [[spectral:oas, off]]`で組み込みルールを丸ごと無効化している
  場合、個別の組み込みルール名を`: off`で参照すると
  `Cannot extend non-existing rule`エラーになる(そのルール自体が
  存在しないため)。個別に無効化する必要はなく、`extends`の`off`だけで
  十分。
- Spectralはデフォルトで`$ref`を解決してから`given`のJSONPathを評価する
  ため、「このフィールドが`$ref`を持つかどうか」を検証するルールは
  `resolved: false`を指定しないと、解決済みの参照先オブジェクトを見て
  しまい「`$ref`が無い」という誤検知になる
  (`error-response-must-be-componentized`/
  `success-response-must-not-be-componentized`で発生、修正済み)。

### 4. サンドボックス検証

`.spectral.yaml`の全17ルールに対し、各ルールを1つずつ意図的に破る
`bad-openapi.yaml`を一時ディレクトリに作成し、
`spectral lint --ruleset .spectral.yaml`を実行。17件全ての違反が
期待通り検出されることを確認した上で、実ファイル
(`doc/API仕様書/{BFF,Backend}/openapi.yaml`)がエラー0件でパスする
ことも確認した。

### 5. CIゲート

`.github/workflows/spec-consistency.yml`に`openapi-style-guide`
ジョブを追加し、`npm run openapi:lint:spectral`
(`spectral lint`を両openapi.yamlに対して実行)をPRごとに実行する。
エラーが1件でもあればブロックする。

## 影響

- `package.json`に`@stoplight/spectral-cli`を追加(既存の
  `@stoplight/prism-cli`由来の脆弱性とは無関係、新規追加による脆弱性なし)。
  `openapi:lint:spectral`スクリプトを追加。
- `.spectral.yaml`を新規作成。
- `doc/API仕様書/BFF/openapi.yaml`・`doc/API仕様書/Backend/openapi.yaml`
  を規約準拠に修正(tags・description・servers.description追加、BFFの
  400レスポンスをcomponents化)。
- `.github/workflows/spec-consistency.yml`に`openapi-style-guide`
  ジョブを追加。
- constitution.mdにCore Principle XII
  (OpenAPI Style Guide Conformance)を追加(v2.17.0)。
