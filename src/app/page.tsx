import type { Metadata } from "next";
import ArchitectureDiagram from "./ArchitectureDiagram";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "仕様駆動開発 × ハーネスエンジニアリング デモ",
  description:
    "Claude Code (Web版)・GitHub・Vercelを連携させ、仕様書作成から品質分析までを" +
    "ほぼ自動で回し、結果を可視化するデモアプリです。",
};

type ProcessStep = {
  phase: string;
  code?: string;
  description: string;
  harness: string;
};

const PROCESS_STEPS: ProcessStep[] = [
  {
    phase: "仕様書作成",
    code: "BD",
    description: "業務ごとにユースケース記述・画面定義書を作成する。",
    harness: "/speckit-specify",
  },
  {
    phase: "詳細設計",
    code: "PD",
    description: "画面定義書から詳細設計書・実装タスク(tasks.md)に落とし込む。",
    harness: "/speckit-plan・/speckit-tasks",
  },
  {
    phase: "実装",
    description: "Route Handler・Reactコンポーネントをタスク単位で実装する。",
    harness: "/speckit-implement",
  },
  {
    phase: "静的解析",
    description: "コードの複雑度・重複と、OpenAPI仕様書の規約準拠・実装との整合を機械検証する。",
    harness: "ESLint(複雑度/重複) + Spectral(OpenAPI規約) + 契約整合チェック",
  },
  {
    phase: "ユニットテスト",
    description: "Jestでロジック・コンポーネント単位の振る舞いを検証する。",
    harness: "カバレッジ閾値ゲート(statements/branches/functions/lines 95%)",
  },
  {
    phase: "E2E",
    description: "画面定義書から導出したシナリオをブラウザ上で検証する。",
    harness: "Playwright",
  },
  {
    phase: "品質分析",
    description: "テスト密度・カバレッジ・コード品質を業務単位のマトリクス表で可視化する。",
    harness: "/test-dashboard",
  },
];

const SLIDE_COUNT = 4;

export default function Home() {
  return (
    <div className={styles.deck}>
      <header className={styles.slide}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>Demo</p>
          <h1 className={styles.title}>仕様駆動開発 × ハーネスエンジニアリング</h1>
          <p className={styles.lead}>
            Claude Code (Web版)・GitHub・Vercelを連携させることで、「仕様書作成→詳細設計→
            実装→静的解析→ユニットテスト→E2E→品質分析」のサイクルをほぼ自動で回し、結果を
            可視化できる仕組みのデモです。工程ごとに機械的なチェック(ハーネス)が組み込まれて
            おり、違反があればCIが即座にブロックします。
          </p>
          <p className={styles.scrollHint}>スクロールして次へ ↓</p>
        </div>
        <span className={styles.slideNumber}>
          01<span className={styles.slideNumberTotal}> / {SLIDE_COUNT}</span>
        </span>
      </header>

      <section className={styles.slide} aria-labelledby="architecture-heading">
        <div className={styles.section}>
          <h2 id="architecture-heading" className={styles.sectionTitle}>
            仕組み
          </h2>
          <p className={styles.sectionLead}>
            開発者はClaude Code (Web版)に指示するだけで、GitHubへのcommit・push、CIによる
            自動検証、Vercelへのデプロイまでが繋がって進み、結果は品質ダッシュボードに可視化
            される。CIが赤の場合はClaude Codeが自律的に修正して再度pushする。
          </p>
          <ArchitectureDiagram />
        </div>
        <span className={styles.slideNumber}>
          02<span className={styles.slideNumberTotal}> / {SLIDE_COUNT}</span>
        </span>
      </section>

      <section className={styles.slide} aria-labelledby="process-heading">
        <div className={styles.section}>
          <h2 id="process-heading" className={styles.sectionTitle}>
            開発プロセスとハーネス
          </h2>
          <div className={styles.stepGrid} data-testid="process-steps">
            {PROCESS_STEPS.map((step, index) => (
              <div className={styles.stepCard} key={step.phase}>
                <div className={styles.stepCardTop}>
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <div className={styles.stepHeading}>
                    <p className={styles.stepPhase}>{step.phase}</p>
                    {step.code && <span className={styles.stepCode}>({step.code})</span>}
                  </div>
                </div>
                <p className={styles.stepDescription}>{step.description}</p>
                <span className={styles.stepHarness}>
                  <span className={styles.stepHarnessLabel}>ハーネス:</span>
                  {step.harness}
                </span>
              </div>
            ))}
          </div>
        </div>
        <span className={styles.slideNumber}>
          03<span className={styles.slideNumberTotal}> / {SLIDE_COUNT}</span>
        </span>
      </section>

      <section className={styles.slide} aria-labelledby="links-heading">
        <div className={styles.section}>
          <h2 id="links-heading" className={styles.sectionTitle}>
            実際に見る
          </h2>
          <div className={styles.ctaGroup}>
            <a className={styles.link} href="/dashboard">
              デモアプリ(Todoダッシュボード)を開く
            </a>
            <a className={`${styles.link} ${styles.linkSecondary}`} href="/test-dashboard">
              品質ダッシュボードを見る
            </a>
          </div>
          <a
            className={styles.repoLink}
            href="https://github.com/shimazakis0523/Nextjs-Sample"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHubリポジトリを見る(ソースコード・仕様書・ADRを公開中)
          </a>
        </div>
        <span className={styles.slideNumber}>
          04<span className={styles.slideNumberTotal}> / {SLIDE_COUNT}</span>
        </span>
      </section>
    </div>
  );
}
