# ADR-0013: `specs/`+`docs/`の分散をやめ、日本語名の`doc/`ツリーに統合する

## ステータス

Accepted (2026-08-31)

## コンテキスト

このプロジェクトはspec-kitのテンプレート構成をそのまま踏襲し、`specs/<feature>/spec.md`・
`plan.md`・`tasks.md`と、`docs/architecture.md`・`docs/adr/`という2つのディレクトリに
成果物が分散していた。ファイル名・見出しは英語のspec-kit由来の用語(`spec.md`、
`plan.md`、"Implementation Plan"等)が中心だった。

このプロジェクトは日本企業向けであり、ユーザーから「ドキュメント名を日本語化したい」
「specとdocsで分散するのはいまいち」という明確な指摘があった。ユーザーが提示した目標
構成は、SIer的な設計書体系(AP方式設計書・画面定義書・詳細設計書・ユースケース記述・
E2E仕様書・API仕様書)に、フロントエンド/バックエンドという分類軸を組み合わせたもの。

## 決定

1. `specs/**`と`docs/**`を廃止し、`doc/`一本のツリーに統合する:
   ```
   doc/
   ├── common/
   │   ├── AP方式設計書(フロントエンド編).md   ← docs/architecture.mdを分割
   │   ├── AP方式設計書(バックエンド編).md
   │   └── adr/                                  ← docs/adr/を移動(ファイル名は維持)
   ├── フロントエンド設計書/
   │   └── <業務>/                               ← specs/<feature>/を移動・分割
   │       ├── 画面遷移図.md                     ← screen-flow.md
   │       ├── ユースケース記述<N>_<画面名>.md   ← screens/*/spec.mdのユースケース定義部分
   │       ├── 画面定義書<N>_<画面名>.md         ← screens/*/spec.mdの画面定義部分
   │       ├── E2E仕様書<N>_<画面名>.md          ← screens/*/e2e-test-spec.md
   │       └── 詳細設計書.md                     ← plan.md(+ 機能概要spec.mdの内容を統合)
   └── API仕様書/
       ├── BFF/openapi.yaml                       ← openapi/bff/openapi.yaml
       ├── Backend/openapi.yaml                   ← openapi/backend/openapi.yaml
       ├── common/schemas/                        ← openapi/common/schemas/
       └── README.md
   ```
2. **`tasks.md`と`screens/*/checklists/requirements.md`は`specs/<feature>/`に残す**。
   これらはGitHub Issueベースのタスク順序ゲート(ADR-0002)・spec品質チェックという
   *プロセス/追跡用の成果物*であり、業務が読む「設計書」ではないため、日本語設計書
   ツリーの対象外とした。内部の相互参照リンクのみ新パスに更新した。
3. `openapi/**`は実体のYAMLファイルとして`doc/API仕様書/**`配下に物理的に移動する
   (別ドキュメントとして複製するのではなく、単一のソースオブトゥルースを維持する)。
   `redocly.yaml`・`package.json`のopenapiスクリプト・`.gitignore`・
   `check-openapi-bff-routes.mjs`・`check-openapi-contract`スキルを新パスに追従させた。
4. 1つの画面の`spec.md`(ユースケース定義+画面定義の2部構成)は、**ユースケース記述**と
   **画面定義書**という2つの独立したファイルに分割する。内容は変更せず、ファイルを
   分けただけ(セクションの中身はそのまま移動)。
5. constitution.md Core Principle VIをこの新構成に合わせて再定義し(v2.10.0 →
   v2.11.0、MINOR)、`speckit-*`・`update-e2e-test-spec`・`update-screen-flow-diagram`・
   `check-openapi-contract`の各Skillと`check-spec-sync.sh`・
   `check-governance-issue-ref.sh`・`check-openapi-bff-routes.mjs`のCIスクリプトを
   新パス・新ファイル名に追従させた。

## 検討した選択肢

- **openapi/をdoc/配下に移動せず、doc/API仕様書/を別ドキュメントとして新設する案**:
  却下。実体のYAML(ビルドツールが読む)と別に「文書」を用意すると、二重管理になり
  必ずどちらかが古くなる。このプロジェクトがこれまで一貫して避けてきた「ドキュメントの
  ドリフト」をわざわざ作ることになるため、物理的に移動する案を採用した。
- **spec.mdを分割せず、ユースケース記述と画面定義書を1ファイルのまま日本語ファイル名に
  改名するだけの案**: 却下。ユーザーが提示した目標構成が明確に2ファイルへの分割を示して
  いたため、指示通り分割した。
- **tasks.mdも含めて全て日本語ツリーに統合する案**: 却下。tasks.mdはGitHub Issue状態と
  対応表で結びついた運用上のトラッキング成果物であり、ユーザーへの確認で「現状維持」の
  回答を得た。

## 影響

- `specs/001-todo-dashboard/`には`tasks.md`と`screens/*/checklists/`のみが残る。
- `speckit-plan`/`speckit-specify`などのSkillが生成するファイルパス・名前が全面的に
  変わる。既存のSkill定義・CIスクリプトはすべて新パスに追従済み。
- constitution.mdは2.10.0 → 2.11.0(MINOR、Principle VIの再定義 + 全面的なパス更新)。
- 過去のADR(0001〜0012)本文中の`specs/`・`docs/`パス言及は、当時の決定を記録した
  歴史的記述として原則そのまま残した(constitution.mdのSync Impact Reportの過去エントリ
  を書き換えない、というこのプロジェクトの既存の方針に合わせている)。ただし
  ADR-0012のCIゲート対象パスの記述のみ、現在も有効な仕様であるため新パスに修正した。
