# ADR-0008: plan.mdは「登場するコンポーネントと関係」と「Project Structure」の2章のみ

## ステータス

Accepted (2026-08-30)

## コンテキスト

ADR-0005〜0007を経て、`plan.md`は「Summary」「Technical Context」「Constitution
Check」「Project Structure」「Complexity Tracking」の5章構成になっていた。
`001-todo-dashboard`で実際に使ってみると、実用上役に立っていたのは
「登場するコンポーネントと関係」(ADR-0006/0007で追加)と「Project Structure」だけ
だった。

- **Summary**: 「登場するコンポーネントと関係」と内容が重複していた(どのファイルが
  何をするかを、図と表で説明した直後に、同じ内容をもう一度文章で書き直していた)。
- **Technical Context**: `docs/architecture.md`への参照1行と、多くの場合「特筆すべき
  性能目標なし」のような空に近い内容しか残らなかった。
- **Constitution Check**: 各原則がどう満たされるかを書く欄だが、実質的に
  `constitution.md`の各原則の内容をこの機能に当てはめて言い直しているだけで、新しい
  情報を生んでいなかった。
- **Complexity Tracking**: 違反が無ければ常に空欄(このプロジェクトでは違反が発生した
  実績がない)。

## 決定

`plan.md`は次の2章のみで構成する。

1. **登場するコンポーネントと関係**: ファイルと役割の対応表、および(複数の画面が
   コンポーネントや状態を共有する場合のみ)Mermaidの関係図。
2. **Project Structure**: この機能が追加/変更する具体的なファイルパス
   (Source Code)と、その配置・関係についてのStructure Decision。

Branch/Date/Spec等のヘッダー行と、`docs/architecture.md`への参照(共通アーキテクチャの
リポジトリレイアウトを重複させないため)はProject Structure内に残すが、独立した章
(Summary、Technical Context、Constitution Check、Complexity Tracking)としては
設けない。

## 影響

- 原則の遵守確認(Constitution Check)は`plan.md`の中では行わなくなる。違反の有無は
  実装レビュー・`check-openapi-contract`スキル・コードレビューで引き続き担保する。
  原則違反を機能単位で正当化・記録する必要が生じた場合(Complexity Trackingが本来
  想定していたケース)は、都度`docs/adr/`に個別のADRを起こす。
- `specs/001-todo-dashboard/plan.md`は本ADRの構成に合わせて書き直し済み。
- `.specify/templates/overrides/plan-template.md`と`speckit-plan`スキルの指示を
  この2章構成に更新した。
