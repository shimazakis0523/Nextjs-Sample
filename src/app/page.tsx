import type { Metadata } from "next";
import ArchitectureDiagram from "./ArchitectureDiagram";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "仕様駆動開発 × ハーネスエンジニアリング デモ",
  description:
    "Claude Code (Web版)・GitHub・Vercelを連携させ、UIモックアップ合意から品質分析までを" +
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
    phase: "UIモックアップ合意",
    description:
      "画面を持つ機能は、design skillで作成したモックアップでユーザとプロダクトの" +
      "要件・見た目を先に合意してから仕様書作成に進む。",
    harness: "/speckit-specify step 0の合意確認(未合意なら仕様書生成を停止。ADR-0004)",
  },
  {
    phase: "仕様書作成",
    code: "BD",
    description: "合意したモックアップをもとに、業務ごとにユースケース記述・画面定義書を作成する。",
    harness: "check-spec-sync.sh(E2E仕様書・画面遷移図の追従漏れを検出)",
  },
  {
    phase: "詳細設計",
    code: "PD",
    description: "画面定義書から詳細設計書・実装タスク(tasks.md)に落とし込む。",
    harness: "check-detailed-design-doc.mjs(セクション構成・図ファーストを検証)",
  },
  {
    phase: "実装",
    description: "Route Handler・Reactコンポーネントをタスク単位で実装する。",
    harness: "check-component-tests.sh(コンポーネント変更にテスト未追加を検出)",
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
            Claude Code (Web版)・GitHub・Vercelを連携させることで、「UIモックアップ合意→
            仕様書作成→詳細設計→実装→静的解析→ユニットテスト→E2E→品質分析」のサイクルを
            ほぼ自動で回し、結果を可視化できる仕組みのデモです。工程ごとに機械的なチェック
            (ハーネス)が組み込まれており、違反があればCIが即座にブロックします。
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
            <a className={`${styles.link} ${styles.linkSecondary}`} href="/mockup">
              UIモックアップを見る
            </a>
            <a
              className={`${styles.link} ${styles.linkSecondary}`}
              href="https://github.com/shimazakis0523/Nextjs-Sample"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                className={styles.githubIcon}
                viewBox="0 0 16 16"
                width="18"
                height="18"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                     0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                     -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
                     .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
                     -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0
                     1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82
                     1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
                     0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8
                     c0-4.42-3.58-8-8-8Z"
                />
              </svg>
              GitHubリポジトリ
            </a>
          </div>
        </div>
        <span className={styles.slideNumber}>
          04<span className={styles.slideNumberTotal}> / {SLIDE_COUNT}</span>
        </span>
      </section>
    </div>
  );
}
