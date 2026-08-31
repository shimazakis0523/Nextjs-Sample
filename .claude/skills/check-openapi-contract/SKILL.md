---
name: check-openapi-contract
description: |
  doc/API仕様書/配下のOpenAPI契約(YAML)と、実際のNext.js実装(src/app/api/**のRoute Handler、
  src/lib/backend.ts、src/lib/backend-client.ts、src/lib/mock-todos.ts、src/lib/mock-data.ts)
  との整合性を検査する。エンドポイントのパス・HTTPメソッド・リクエスト/レスポンスの
  フィールド名・必須項目・型・enum値・ステータスコードが、YAML側と実装側で一致しているかを
  確認し、不一致があれば具体的に報告する。

  「OpenAPIと実装がずれてないか確認して」「YAMLの契約と実装の整合性チェックして」
  「契約通りに実装されているか確認して」「スキーマと実装に差分がないか見て」のように
  言われたら必ずこのSkillを使う。また、doc/API仕様書/配下のYAML、または src/app/api/**、
  src/lib/backend.ts、src/lib/mock-todos.ts などを変更した直後に「ちゃんと直せてるか確認して」
  「壊れてないか見て」と言われた場合も、この整合性チェックが関係している可能性が高いので
  積極的にこのSkillを使うこと。
---

## このSkillの位置づけ

このプロジェクトでは `doc/API仕様書/BFF/openapi.yaml`（フロントエンドが呼ぶBFF API契約）と
`doc/API仕様書/Backend/openapi.yaml`（実バックエンドとの契約。BACKEND_API_URL未設定時は
`src/lib/mock-todos.ts` / `src/lib/mock-data.ts` がこの契約と同じ形を返すモックとして
振る舞う想定）を、実装とは別のYAMLファイルとして手で管理している。

YAMLは実装を自動生成しているわけでも、実装に強制力を持つわけでもない、ただの文書なので、
どちらか片方だけを直すと静かにズレていく。このSkillはそのズレを見つけて報告するためのもの。
**自動修正はしない**。YAML側と実装側のどちらを正とするかはユーザーが判断するので、見つけた
差分を事実として報告することに徹すること。

## 手順

### 1. 対象ファイルを洗い出す

決め打ちのファイルリストを鵜呑みにせず、必ず実際に存在するファイルを確認すること
(ファイルは増減しうる)。

- YAML側: `doc/API仕様書/BFF/openapi.yaml`, `doc/API仕様書/Backend/openapi.yaml`,
  `doc/API仕様書/common/schemas/*.yaml` をGlobで確認して読む。
- 実装側: `src/app/api/**/route.ts` をGlobで確認して読む。加えて
  `src/lib/backend.ts`, `src/lib/backend-client.ts`, `src/lib/mock-todos.ts`,
  `src/lib/mock-data.ts` を読む。

YAML内の `$ref`（例: `"../common/schemas/Todo.yaml#/Todo"`）は、参照先ファイルの
該当キーの中身にその場で読み替えて解釈すること。

### 2. BFF契約 ⇔ Route Handler を突き合わせる

`doc/API仕様書/BFF/openapi.yaml` の各 path + method について:

- 対応する `src/app/api/**/route.ts` の export（`GET`/`POST`/`DELETE`など）が存在するか。
  逆に、実装側にあってYAMLに書かれていないpublicなエンドポイント/メソッドがないか
  （公開APIなので文書化漏れは問題）。
- リクエストボディの必須フィールド（YAMLの `required`）と、Route Handler内の
  バリデーションロジック（例: `if (!title || ...)` のような分岐）が要求している
  必須フィールドが一致するか。
- レスポンスのフィールド名・型・enum値が、実装が実際に返しているオブジェクトの形と
  一致するか。
- ステータスコード（200/201/204/400など）が、YAMLの `responses` の定義と、実装が
  `NextResponse.json(..., { status })` や `new NextResponse(null, { status })` で
  返している値とで一致するか。

### 3. Backend契約 ⇔ backend.ts / モック実装 を突き合わせる

`doc/API仕様書/Backend/openapi.yaml` の各 path + method について:

- `backend.ts` が `backendFetch()` に渡している path（例: `"/todos"`,
  `` `/todos/${id}` ``）が、YAMLの path と一致するか。
- `backendFetch()` に渡しているHTTPメソッド・リクエストボディが、YAMLの定義と
  一致するか。
- モック実装（`mock-todos.ts`, `mock-data.ts`）が返すオブジェクトの形
  （フィールド名・型）が、YAMLのスキーマ（共通スキーマ経由）と一致するか。
  モックは「実バックエンドの代役」なので、ここがズレていると、モックで動作確認できても
  実際にBACKEND_API_URLを実バックエンドに向けた瞬間に壊れる。ここは特に注意して見ること。
- enumの値（例: TodoStatusの「未着手」「進行中」「完了」「保留」）が、YAMLの `enum` と
  実装側の型定義とで完全に一致するか（順序は問わないが、値の過不足がないか）。

### 4. 結果を報告する

一致している項目を逐一列挙する必要はない。「一致していました」で済ませてよい。

不一致が見つかった場合は、1件ごとに以下の形式で報告する:

- **対象**: どのエンドポイント/フィールドの話か
- **YAML側**: ファイルパスと該当箇所の内容
- **実装側**: ファイルパスと該当箇所の内容
- **差分**: 何がどうズレているかを一文で

最後に簡潔なサマリを付ける（例:「4エンドポイントを確認し、不一致1件を検出」
「すべて一致していました」）。
