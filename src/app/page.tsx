import type { Metadata } from "next";
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

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Demo</p>
        <h1 className={styles.title}>仕様駆動開発 × ハーネスエンジニアリング</h1>
        <p className={styles.lead}>
          Claude Code (Web版)・GitHub・Vercelを連携させることで、「仕様書作成→詳細設計→実装
          →静的解析→ユニットテスト→E2E→品質分析」のサイクルをほぼ自動で回し、結果を可視化
          できる仕組みのデモです。工程ごとに機械的なチェック(ハーネス)が組み込まれており、
          違反があればCIが即座にブロックします。
        </p>
      </header>

      <section className={styles.section} aria-labelledby="process-heading">
        <h2 id="process-heading" className={styles.sectionTitle}>
          開発プロセスとハーネス
        </h2>
        <ol className={styles.steps}>
          {PROCESS_STEPS.map((step, index) => (
            <li key={step.phase}>
              {index > 0 && <div className={styles.stepConnector}>↓</div>}
              <div className={styles.step}>
                <div className={styles.stepNumber}>{index + 1}</div>
                <div className={styles.stepBody}>
                  <div className={styles.stepHeading}>
                    <p className={styles.stepPhase}>{step.phase}</p>
                    {step.code && <span className={styles.stepCode}>({step.code})</span>}
                  </div>
                  <p className={styles.stepDescription}>{step.description}</p>
                  <span className={styles.stepHarness}>
                    <span className={styles.stepHarnessLabel}>ハーネス:</span>
                    {step.harness}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="links-heading">
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
      </section>
    </div>
  );
}
