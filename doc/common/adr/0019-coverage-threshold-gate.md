# ADR-0019: カバレッジ閾値ゲートの導入と、未テストだったBFF/swap point層のテスト追加

## ステータス

Accepted (2026-08-31)

## コンテキスト

ユーザーが`/test-dashboard`のカバレッジレポート(ディレクトリ単位の内訳)を見て、
「必ずしもカバレッジが低い=悪ではないが、あまりにも少ない」箇所がないか評価してほしいと
依頼した。実際のコードを確認した結果、以下が判明した:

- `src/app/api/todos/route.ts`のPOSTハンドラ(必須項目チェック・ステータスenumチェック)
  が0%だった。この検証ロジックは`詳細設計書.md`が「クライアント側の同じチェックは
  UXのための先行チェックであり、route.ts側の検証を代替するものではない」と明記している、
  この画面の**権威側**の実装である。E2Eテストはブラウザ側のHTML5 `required`属性による
  ブロックで止まるため、実際にはこのif文を一度も通っていなかった。
- `src/lib/backend.ts`(Principle II: Mock/Real Backend Swap Point)・
  `src/lib/backend-client.ts`(実バックエンド呼び出し時のエラーハンドリング)も0%だった。
  `BACKEND_API_URL`が未設定の現状では実害が無いが、実バックエンドに切り替えた瞬間に
  ノーガードで踏み込むことになる。
- `src/app/api/users`は業務1_Todoダッシュボードのどの設計書にも登場しない、
  どの業務にも属さないエンドポイントだった(テスト以前に、業務としての整理が漏れている)。

これらはPrinciple VII(Component Test Coverage)では検出できない種類のギャップである。
Principle VIIは「`src/app/**/*.tsx`のコンポーネントに対応するテストファイルが存在する
か」だけを機械的にチェックするが、(1)Route Handler(`.ts`)や`src/lib/**`は対象外、
(2)テストファイルが存在してもその中身が実際にどこまで分岐を通しているかは見ていない。
今回のギャップはまさにこの盲点に該当していた。

## 決定

1. **不足していたテストを追加する**:
   - `src/app/api/todos/route.test.ts`(GET・POSTの必須項目/ステータスenumバリデーション)
   - `src/app/api/todos/[id]/route.test.ts`(DELETE)
   - `src/app/api/users/route.test.ts`・`src/app/api/health/route.test.ts`
   - `src/lib/backend.test.ts`(モック/実バックエンドの両分岐)・
     `src/lib/backend-client.test.ts`(成功/204/エラー/URL未設定の各分岐)
   - `src/app/test-dashboard/page.test.tsx`(summary.json有無の分岐。page.tsxはPrinciple
     VIIの対象外だが、今回の趣旨に照らして自主的に追加した)

2. **カバレッジ閾値ゲートを新設する(constitution.md Core Principle IX)**:
   `jest.config.ts`に`coverageThreshold`(global: statements/lines 80%、functions 80%、
   branches 75%)を設定し、`.github/workflows/spec-consistency.yml`に
   `unit-test-coverage`ジョブ(`npm run test:coverage`を実行するだけ。Jest自身が閾値未達で
   非ゼロ終了する)を追加してPRごとに強制する。100%を求めない理由: `page.tsx`・
   `layout.tsx`のような分岐の無い宣言的なNext.js特殊ファイルまで含めた全体平均のため、
   それらが増えるだけで自然に下がる。現在の実測値(90〜92%)から余裕を持たせつつ、
   実質的な退行は検知できる水準とした。

3. **`jest.config.ts`に`@/*`パスエイリアスのmoduleNameMapperを追加**(副次的に発見・
   修正したバグ): 既存のテストは全て`import type`(型のみ、実行時に消える)経由でしか
   `@/lib/backend`をimportしていなかったため気づかれていなかったが、今回追加した
   `jest.mock("@/lib/backend")`のような実行時のimportで初めて「`@/*`がJestのモジュール
   解決に登録されていない」ことが判明した。`next/jest`の自動検出に頼らず明示的に
   `moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" }`を設定した。

## 影響

- ユニットテストのカバレッジがstatements/lines 46%→90%、branches 37%→92%に改善した
  (テスト数19→46件)。
- `src/app/api/users`が未整理であること自体はこのADRのスコープ外として残す(業務として
  整理するか削除するかはユーザーの別途の判断が必要)。
- 今後、CIが初めてユニットテスト(`npm test`相当)を実際に実行するようになった
  (`unit-test-coverage`ジョブ経由)。従来の`spec-consistency.yml`は仕様書同期・OpenAPI
  整合性・コンポーネントテストの存在チェック・ガバナンスIssue参照のみで、テストスイート
  自体をCIで実行するジョブが1つも無かった。
