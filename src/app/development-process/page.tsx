import type { Metadata } from "next";
import Link from "next/link";
import styles from "./development-process.module.css";

const SCOPE_DIFF_ONLY = "PRの変更ファイルのみ";

export const metadata: Metadata = {
  title: "開発成果物の自動生成スキルとハーネス | 仕様駆動開発デモ",
  description:
    "このデモで使われている、成果物を生成するSkillと、成果物を検証してCIをブロックする" +
    "ハーネスの一覧・詳細説明ページです。",
};

type Skill = {
  name: string;
  category: "モックアップ" | "仕様書" | "設計" | "実装" | "整合性" | "ガバナンス";
  produces: string;
  when: string;
};

const SKILLS: Skill[] = [
  {
    name: "design",
    category: "モックアップ",
    produces: "マルチアートボードのUIモックアップ(Artifactとして公開)",
    when:
      "画面を持つ新機能で、仕様書を書き始める前に必ず実行する(ADR-0004)。" +
      "/speckit-specifyは合意済みモックアップが無いと仕様書生成を停止する。",
  },
  {
    name: "speckit-specify",
    category: "仕様書",
    produces: "ユースケース記述_<画面名>.md / 画面定義書_<画面名>.md",
    when: "合意したモックアップをもとに、業務ごとに新規作成・更新する。",
  },
  {
    name: "speckit-clarify",
    category: "仕様書",
    produces: "仕様書中の曖昧点への回答(既存の仕様書に反映)",
    when: "/speckit-plan の前に、要件があいまいなまま残っている場合。",
  },
  {
    name: "speckit-plan",
    category: "設計",
    produces: "詳細設計書.md(登場するコンポーネントと関係 / Project Structure)",
    when: "業務のユースケース記述・画面定義書が確定した後。",
  },
  {
    name: "speckit-tasks",
    category: "設計",
    produces: "tasks.md(依存関係順のタスク一覧)",
    when: "詳細設計書が確定した後。",
  },
  {
    name: "speckit-taskstoissues",
    category: "ガバナンス",
    produces: "GitHub Issue群(タスク↔Issue・フェーズ↔前提Issueの対応表)",
    when: "tasks.mdが確定した後、実装に着手する前。tasks.mdへの追加後は再実行する。",
  },
  {
    name: "speckit-implement",
    category: "実装",
    produces: "実装コード(src/app・src/lib)",
    when:
      "tasks.mdの各フェーズを実行する時。前提Issueがopenのままのフェーズは実装せず、" +
      "どのIssueが未クローズかを報告してスキップする。",
  },
  {
    name: "speckit-analyze",
    category: "整合性",
    produces: "仕様書・詳細設計書・tasks.md間の整合性分析レポート",
    when: "/speckit-tasks の後、/speckit-implement の前。",
  },
  {
    name: "speckit-checklist",
    category: "整合性",
    produces: "要件の充足を確認するカスタムチェックリスト",
    when: "必要に応じて任意のタイミングで。",
  },
  {
    name: "speckit-converge",
    category: "整合性",
    produces: "tasks.mdへの新規フェーズ(未実装分の洗い出し)",
    when: "リリース後の仕様変更・バグ修正で、既存のtasks.mdを再利用したい時。",
  },
  {
    name: "speckit-constitution",
    category: "ガバナンス",
    produces: "constitution.mdの更新(Core Principle・バージョン)",
    when: "ガバナンスルールを新設・変更する時。",
  },
  {
    name: "update-e2e-test-spec",
    category: "整合性",
    produces: "E2E仕様書_<画面名>.md(5つの技法から導出したテストケース)",
    when: "ユースケース記述・画面定義書の内容を追加・変更・削除した直後。",
  },
  {
    name: "update-screen-flow-diagram",
    category: "整合性",
    produces: "画面遷移図.md(Mermaid)",
    when: "画面定義書の処理仕様(遷移先を記述する行)を追加・変更・削除した直後。",
  },
  {
    name: "check-openapi-contract",
    category: "整合性",
    produces: "(生成物なし)OpenAPI YAMLと実装のフィールド単位の整合性レポート",
    when:
      "src/app/api/** や src/lib/backend.ts を変更し、API変更を完了とみなす前に手動で実行する。" +
      "CIには常駐しない — 実行を忘れると検出されない、検証専用のSkill。",
  },
];

type Harness = {
  name: string;
  mechanism: string;
  checks: string;
  scope: string;
  principle: string;
};

const HARNESSES: Harness[] = [
  {
    name: "spec-sync",
    mechanism: "check-spec-sync.sh",
    checks:
      "ユースケース記述・画面定義書の本文変更に、E2E仕様書・画面遷移図の追従漏れが" +
      "ないか",
    scope: SCOPE_DIFF_ONLY,
    principle: "Development Workflow",
  },
  {
    name: "openapi-routes",
    mechanism: "Redocly lint + check-openapi-bff-routes.mjs",
    checks: "OpenAPI YAMLの構文と、src/app/api/** の実装のパス・メソッド一致",
    scope: "全ファイル走査",
    principle: "Principle III",
  },
  {
    name: "openapi-style-guide",
    mechanism: "Spectral(.spectral.yaml)",
    checks: "OpenAPI YAMLがFuture Architect社OpenAPI規約の機械検証可能な範囲に準拠しているか",
    scope: "全ファイル走査",
    principle: "Principle XII",
  },
  {
    name: "detailed-design-doc",
    mechanism: "check-detailed-design-doc.mjs",
    checks: "詳細設計書.mdのセクション構成・図ファースト・各コンポーネントの役割記述",
    scope: "全詳細設計書を走査",
    principle: "Principle XIII",
  },
  {
    name: "frontend-nonfunctional-policy",
    mechanism: "check-frontend-nonfunctional-policy.mjs",
    checks:
      "AP方式設計書の非機能方針(対応ブラウザ・国際化対応・ダークモード状態保持・OGP)が" +
      "未決定のプレースホルダのままでないか",
    scope: "ドキュメント全体を走査",
    principle: "Principle XVII",
  },
  {
    name: "url-path-design",
    mechanism: "check-url-path-design.mjs",
    checks: "URLパスのkebab-case・動的パラメータのlowerCamelCase・操作動詞の禁止",
    scope: "全ルートを走査",
    principle: "Principle XIV",
  },
  {
    name: "component-naming",
    mechanism: "check-component-naming.mjs",
    checks: "コンポーネントファイル名がPascalCaseか",
    scope: "全コンポーネントを走査",
    principle: "Principle XVI",
  },
  {
    name: "a11y-test-coverage",
    mechanism: "check-a11y-test-coverage.sh + jest-axe",
    checks: "全画面ルート(page.tsx)にaxe-coreによるアクセシビリティ自動検証があるか",
    scope: "全画面ルートを走査",
    principle: "Principle XV",
  },
  {
    name: "component-test-coverage",
    mechanism: "check-component-tests.sh",
    checks: "変更・追加されたコンポーネントに対応するユニットテストがあるか",
    scope: SCOPE_DIFF_ONLY,
    principle: "Principle VII",
  },
  {
    name: "unit-test-coverage",
    mechanism: "Jestカバレッジ閾値(jest.config.ts)",
    checks: "statements/branches/functions/lines がいずれも95%以上か",
    scope: "全体のカバレッジ集計",
    principle: "Principle IX",
  },
  {
    name: "code-quality",
    mechanism: "ESLint(complexity, sonarjs, testing-library)",
    checks: "循環的複雑度・重複コード・テストが実装詳細でなくUIを検証しているか",
    scope: "全ファイルにlint実行",
    principle: "Principle XI / XVI",
  },
  {
    name: "governance-issue-reference",
    mechanism: "check-governance-issue-ref.sh",
    checks: "Skill・constitution.md・ADR・CIワークフロー/スクリプトの変更にGitHub Issue参照があるか",
    scope: SCOPE_DIFF_ONLY,
    principle: "Principle VIII",
  },
  {
    name: "unit-tests",
    mechanism: "Jest(test.yml)",
    checks: "全ユニット・コンポーネントテストが成功するか",
    scope: "テストスイート全体",
    principle: "Principle VII / IX / X",
  },
  {
    name: "e2e-tests",
    mechanism: "Playwright(test.yml)",
    checks: "画面定義書から導出したE2Eテストケースがブラウザ上で成功するか",
    scope: "e2e/**の全スペック",
    principle: "Development Workflow",
  },
];

export default function DevelopmentProcessPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <Link className={styles.backLink} href="/">
          ← トップページへ戻る
        </Link>
        <h1 className={styles.title}>開発成果物の自動生成スキルとハーネスの詳細</h1>
        <p className={styles.lead}>
          このデモの「仕様駆動開発 × ハーネスエンジニアリング」を支えているのは、
          成果物を<strong>生成する</strong>Skillと、成果物を<strong>検証してCIをブロックする</strong>
          ハーネスという、役割の異なる2種類の仕組みです。トップページの「開発プロセスと
          ハーネス」カードは工程ごとの対応関係を一目で示すダイジェストですが、このページでは
          実際に使われているSkill・ハーネスをそれぞれ一覧で詳しく説明します。
        </p>
      </header>

      <section className={styles.section} aria-labelledby="distinction-heading">
        <h2 id="distinction-heading" className={styles.sectionTitle}>
          生成とハーネスの違い
        </h2>
        <p className={styles.sectionLead}>
          過去にトップページ自身が、成果物を生成するSkill名(例:
          <code className={styles.code}>/speckit-specify</code>)を「ハーネス」欄に誤って
          表示していたことがあります(doc/common/adr/0023参照)。このプロジェクトが
          一貫して「ハーネス」と呼ぶのは、ESLint・Jestカバレッジ閾値・Spectral・
          <code className={styles.code}>check-*</code>系スクリプトのような、
          <strong>成果物を検証しCIをブロックする機構</strong>のみであり、成果物を生成する
          Skillそのものはハーネスに含みません。以下の2つの一覧はこの区別に沿っています。
        </p>
      </section>

      <section className={styles.section} aria-labelledby="skills-heading">
        <h2 id="skills-heading" className={styles.sectionTitle}>
          成果物を生成するSkill({SKILLS.length}件)
        </h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Skill</th>
                <th>分類</th>
                <th>生成する成果物</th>
                <th>いつ使うか</th>
              </tr>
            </thead>
            <tbody>
              {SKILLS.map((skill) => (
                <tr key={skill.name}>
                  <td>
                    <code className={styles.code}>{skill.name}</code>
                  </td>
                  <td>{skill.category}</td>
                  <td>{skill.produces}</td>
                  <td>{skill.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="harnesses-heading">
        <h2 id="harnesses-heading" className={styles.sectionTitle}>
          成果物を検証するハーネス({HARNESSES.length}件)
        </h2>
        <p className={styles.sectionLead}>
          すべて<code className={styles.code}>.github/workflows/spec-consistency.yml</code>
          または<code className={styles.code}>.github/workflows/test.yml</code>のCIジョブとして
          PRごとに実行され、違反があればマージ不可になります(閾値を緩めて回避するのではなく、
          実装側を直す運用)。「対象範囲」がPRの変更ファイルのみのハーネスは差分ベース、
          「全体を走査」のハーネスはPRでの変更有無によらずリポジトリ全体を対象にする、
          という2つのモデルがあります。
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ハーネス</th>
                <th>検証機構</th>
                <th>検証内容</th>
                <th>対象範囲</th>
                <th>根拠</th>
              </tr>
            </thead>
            <tbody>
              {HARNESSES.map((harness) => (
                <tr key={harness.name}>
                  <td>
                    <code className={styles.code}>{harness.name}</code>
                  </td>
                  <td>{harness.mechanism}</td>
                  <td>{harness.checks}</td>
                  <td>{harness.scope}</td>
                  <td>{harness.principle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="more-heading">
        <h2 id="more-heading" className={styles.sectionTitle}>
          さらに詳しく
        </h2>
        <p className={styles.sectionLead}>
          各Skill・ハーネスを追加した経緯や、意図的に対象外とした観点は
          <code className={styles.code}>doc/common/adr/</code>配下の各ADRと、
          対応する<code className={styles.code}>.specify/memory/constitution.md</code>
          のCore Principleに記録されています。品質の実測値は
          <code className={styles.code}>/test-dashboard</code>で確認できます。
        </p>
        <div className={styles.ctaGroup}>
          <a className={styles.link} href="/test-dashboard">
            品質ダッシュボードを見る
          </a>
          <Link className={`${styles.link} ${styles.linkSecondary}`} href="/">
            トップページへ戻る
          </Link>
        </div>
      </section>
    </div>
  );
}
