# ADR-0005: アプリ全体の技術コンテキストはdocs/architecture.mdに集約する

## ステータス

Accepted (2026-08-30)

## コンテキスト

`/speckit-plan`が生成する`plan.md`のTechnical Contextセクション(Language/Version、
Primary Dependencies、Storage、Testing、Target Platform、Project Type、Constraints等)
は、spec-kit本来の想定では機能ごとに変わりうる値を書く欄である。

しかしこのプロジェクトはNext.js App Router単一プロジェクトであり、frontendとBFFが
同居する構成・使用ライブラリ・デプロイ先・永続化方式(モック/実バックエンド切り替え)・
リポジトリレイアウトは、機能によらずアプリ全体で共通である。実際に`001-todo-dashboard`の
`plan.md`を見ると、Technical Contextのほぼ全項目が「この機能固有」ではなく「このアプリ
なら常にこう」という内容で埋まっており、次に作る機能の`plan.md`でも同じ内容をほぼ
そのまま複製することになる。

これは以前検討した「research.md/quickstart.md/data-model.md/contracts/を機能ディレクトリに
置かない」という判断(constitution.md Principle III・VI参照)と同じ種類の問題である:
アプリ全体で不変な情報を機能単位のドキュメントに複製すると、更新漏れとメンテナンス
コストが増えるだけで情報量は増えない。

### 検討した論点

1. **plan.mdを画面単位に分割するか**: 画面ごとに実装方式を書く案も検討したが、この
   プロジェクトでは1機能内の複数画面が同一コンポーネント・同一Route Handlerで実装される
   ことがあり(例: `001-todo-dashboard`のTodo一覧とTodo新規登録は共に`TodoDashboard.tsx`
   が担当)、画面単位への分割は実装の実態と合わない。加えてplan.mdはspeckit-plan/tasks/
   implement/analyze/converge/checklistの各skillが`specs/<feature>/plan.md`という
   固定パスを前提に参照しており、画面単位への分割はこれらすべてのskillの書き換えを
   要する大規模な変更になる。今回はアプリ全体の共通部分をdocs/へ抽出するに留め、
   plan.mdはfeature単位のまま残す。
2. **既存のconstitution.md「Technology & Deployment Constraints」セクションと役割が
   重複しないか**: constitution.mdのそのセクションは原則レベルの制約(「DBを持たない」
   「認証はまだ無い」等、MUST/MUST NOTと理由を伴う)を記す場であり、正確なバージョン
   番号や具体的なディレクトリツリーのような「現在の事実」を書く場ではない。事実の
   一覧を記す専用ファイル(docs/architecture.md)を分けることで、依存ライブラリの
   バージョンアップのような日常的な更新のたびにconstitution.mdの改定(バージョン
   バンプ)を要求せずに済む。

## 決定

1. **`docs/architecture.md`を新設**し、アプリ全体に共通する技術スタック・データ永続化
   方式・テスト基盤・リポジトリレイアウト・共通制約の「現時点の事実」を記載する。
   このファイルは理由(なぜその技術を選んだか)を説明しない — 理由は引き続き
   `constitution.md`と`docs/adr/`が担う。
2. **`plan.md`のTechnical Contextは、この機能固有の情報のみを書く**。アプリ全体で
   共通な項目(Language/Version、Primary Dependencies、Target Platform、Project Type、
   Storageの仕組み、Testingの仕組み)は`docs/architecture.md`への参照一行に置き換え、
   繰り返さない。Performance Goals・Scale/Scope・この機能固有の追加Constraintsのみが
   plan.md側に残る。該当する固有情報が無いフィールドは行ごと省略する。
3. **`plan.md`のProject Structure(Source Code)も、この機能が追加/変更したパスのみ**
   を書く。`docs/architecture.md`のリポジトリレイアウトに既に載っている共通パス
   (`src/lib/backend.ts`等)は再掲しない。
4. **`.specify/templates/overrides/plan-template.md`を新設**し、上記の構成を
   `/speckit-plan`のデフォルト出力にする。あわせて、既にconstitution.mdで禁止されている
   `research.md`/`data-model.md`/`quickstart.md`/`contracts/`をこのテンプレートの
   Documentation一覧からも除外する。
5. **`speckit-plan`skillからPhase 0(research.md生成)・Phase 1(data-model.md/contracts/
   quickstart.md生成)の手順を削除**し、代わりにdocs/architecture.mdを参照する指示と、
   禁止ファイルを生成しない旨の明記に置き換える。これは今回新たに追加した制約では
   なく、既存のconstitution.mdの禁止事項とskillの実際の動作を一致させる修正である。

## 影響

- 新しい機能の`plan.md`は、アプリ全体の技術スタックを毎回書き写す必要がなくなり、
  その機能固有の情報(Performance Goals、Scale/Scope等)だけに集中できる。
- `docs/architecture.md`は今後、技術スタックや依存ライブラリの変更(バージョンアップ、
  新規ツール導入等)があるたびに更新する。これはconstitution.mdの改定(明示的な
  ユーザー承認とバージョンバンプを要する)とは異なり、通常のコード変更と同じ扱いで
  更新してよい。
- 既存の`specs/001-todo-dashboard/plan.md`は本ADRの構成に合わせて書き直し済み。
  `tasks.md`冒頭のPrerequisitesにあった、既に削除済みの`research.md`/`data-model.md`/
  `contracts/`への参照も併せて修正した。
- `speckit-plan`skillの変更は、`.specify/templates/plan-template.md`(spec-kit本体の
  素のテンプレート)自体を書き換えるものではなく、既存の`spec-template.md`と同じ
  「`overrides/`ディレクトリで上書きする」方式に従っている。spec-kit本体の
  アップデート時にも、このプロジェクト固有のカスタマイズは`overrides/`層として
  独立して残る。
