import { readFileSync } from "node:fs";
import path from "node:path";
import styles from "./test-dashboard.module.css";

type Counts = { total: number; passed: number; failed: number };

type CoverageMetric = { total: number; covered: number; skipped: number; pct: number };

type Summary = {
  generatedAt: string;
  unit: {
    overall: Counts;
    byBusiness: Record<string, Counts>;
    coverage: {
      statements: CoverageMetric;
      branches: CoverageMetric;
      functions: CoverageMetric;
      lines: CoverageMetric;
    };
  };
  e2e: {
    overall: Counts;
    byBusiness: Record<string, Counts>;
  };
  testDensity: {
    overall: DensityRow;
    byBusiness: Record<string, DensityRow>;
  };
  codeQuality: {
    overall: QualityCounts;
    byBusiness: Record<string, QualityCounts>;
    byRule: Record<string, QualityCounts>;
  };
};

type DensityRow = {
  stepCount: number;
  kStep: number;
  unit: { count: number; density: number };
  e2e: { count: number; density: number };
  total: { count: number; density: number };
};

type QualityCounts = { errorCount: number; warningCount: number };

function loadSummary(): Summary | null {
  try {
    const filePath = path.join(process.cwd(), "dashboard-data", "summary.json");
    return JSON.parse(readFileSync(filePath, "utf8")) as Summary;
  } catch {
    return null;
  }
}

function CountsRow({ label, counts }: { label: string; counts: Counts }) {
  return (
    <tr>
      <td>{label}</td>
      <td>{counts.total}</td>
      <td className={styles.passed}>{counts.passed}</td>
      <td className={counts.failed > 0 ? styles.failed : undefined}>{counts.failed}</td>
    </tr>
  );
}

function CoverageBar({ label, metric }: { label: string; metric: CoverageMetric }) {
  return (
    <div className={styles.coverageItem}>
      <div className={styles.coverageHeader}>
        <span>{label}</span>
        <span>
          {metric.pct.toFixed(2)}%({metric.covered}/{metric.total})
        </span>
      </div>
      <div className={styles.coverageTrack}>
        <div className={styles.coverageFill} style={{ width: `${metric.pct}%` }} />
      </div>
    </div>
  );
}

export default function TestDashboardPage() {
  const summary = loadSummary();

  if (!summary) {
    return (
      <div className={styles.page}>
        <h1>テスト結果ダッシュボード</h1>
        <p>
          dashboard-data/summary.json がまだありません。<code>npm run dashboard:data</code>{" "}
          を実行してください(通常はCIが実行してコミットします)。
        </p>
      </div>
    );
  }

  const { unit, e2e, testDensity, codeQuality } = summary;
  const businesses = Array.from(
    new Set([...Object.keys(unit.byBusiness), ...Object.keys(e2e.byBusiness)])
  );

  return (
    <div className={styles.page}>
      <h1>テスト結果ダッシュボード</h1>
      <p className={styles.generatedAt}>
        最終更新: {new Date(summary.generatedAt).toLocaleString("ja-JP")}
      </p>

      <section className={styles.section}>
        <h2>全体サマリ</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>種別</th>
              <th>実施件数</th>
              <th>合格</th>
              <th>不合格</th>
            </tr>
          </thead>
          <tbody>
            <CountsRow label="ユニットテスト" counts={unit.overall} />
            <CountsRow label="E2Eテスト" counts={e2e.overall} />
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>業務単位の内訳</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>業務</th>
              <th colSpan={3}>ユニットテスト</th>
              <th colSpan={3}>E2Eテスト</th>
            </tr>
            <tr>
              <th></th>
              <th>件数</th>
              <th>合格</th>
              <th>不合格</th>
              <th>件数</th>
              <th>合格</th>
              <th>不合格</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((business) => {
              const u = unit.byBusiness[business] ?? { total: 0, passed: 0, failed: 0 };
              const e = e2e.byBusiness[business] ?? { total: 0, passed: 0, failed: 0 };
              return (
                <tr key={business}>
                  <td>{business}</td>
                  <td>{u.total}</td>
                  <td className={styles.passed}>{u.passed}</td>
                  <td className={u.failed > 0 ? styles.failed : undefined}>{u.failed}</td>
                  <td>{e.total}</td>
                  <td className={styles.passed}>{e.passed}</td>
                  <td className={e.failed > 0 ? styles.failed : undefined}>{e.failed}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>テスト密度</h2>
        <p className={styles.generatedAt}>
          テスト密度 = テスト件数 ÷ step数(Ks)。stepは実行可能ステップ(src/app・src/lib配下、
          コメント・空行を除く)。全体: {testDensity.overall.stepCount} step(
          {testDensity.overall.kStep.toFixed(3)} KStep)
        </p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>業務</th>
              <th>step数</th>
              <th colSpan={2}>ユニット</th>
              <th colSpan={2}>E2E</th>
              <th colSpan={2}>合計</th>
            </tr>
            <tr>
              <th></th>
              <th>(KStep)</th>
              <th>件数</th>
              <th>密度</th>
              <th>件数</th>
              <th>密度</th>
              <th>件数</th>
              <th>密度</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(testDensity.byBusiness).map(([business, row]) => (
              <tr key={business}>
                <td>{business}</td>
                <td>{row.kStep.toFixed(3)}</td>
                <td>{row.unit.count}</td>
                <td>{row.unit.density.toFixed(2)}</td>
                <td>{row.e2e.count}</td>
                <td>{row.e2e.density.toFixed(2)}</td>
                <td>{row.total.count}</td>
                <td>{row.total.density.toFixed(2)}</td>
              </tr>
            ))}
            <tr className={styles.densityTotalRow}>
              <td>全体</td>
              <td>{testDensity.overall.kStep.toFixed(3)}</td>
              <td>{testDensity.overall.unit.count}</td>
              <td>{testDensity.overall.unit.density.toFixed(2)}</td>
              <td>{testDensity.overall.e2e.count}</td>
              <td>{testDensity.overall.e2e.density.toFixed(2)}</td>
              <td>{testDensity.overall.total.count}</td>
              <td>{testDensity.overall.total.density.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>コード品質(静的解析)</h2>
        <p className={styles.generatedAt}>
          ESLint(サイクロマティック複雑度・認知的複雑度・重複コード等の品質ルール、
          constitution.md Core Principle XI)による検出件数。PRではエラー・警告0件が必須。
        </p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>種別</th>
              <th>エラー</th>
              <th>警告</th>
            </tr>
          </thead>
          <tbody>
            <tr className={styles.densityTotalRow}>
              <td>全体</td>
              <td className={codeQuality.overall.errorCount > 0 ? styles.failed : undefined}>
                {codeQuality.overall.errorCount}
              </td>
              <td>{codeQuality.overall.warningCount}</td>
            </tr>
          </tbody>
        </table>

        <h3>業務単位の内訳</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>業務</th>
              <th>エラー</th>
              <th>警告</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(codeQuality.byBusiness).map(([business, counts]) => (
              <tr key={business}>
                <td>{business}</td>
                <td className={counts.errorCount > 0 ? styles.failed : undefined}>
                  {counts.errorCount}
                </td>
                <td>{counts.warningCount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {Object.keys(codeQuality.byRule).length > 0 && (
          <>
            <h3>ルール別の内訳</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ルール</th>
                  <th>エラー</th>
                  <th>警告</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(codeQuality.byRule)
                  .sort(
                    ([, a], [, b]) =>
                      b.errorCount + b.warningCount - (a.errorCount + a.warningCount)
                  )
                  .map(([ruleId, counts]) => (
                    <tr key={ruleId}>
                      <td>{ruleId}</td>
                      <td className={counts.errorCount > 0 ? styles.failed : undefined}>
                        {counts.errorCount}
                      </td>
                      <td>{counts.warningCount}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      <section className={styles.section}>
        <h2>品質不具合分析</h2>
        <p className={styles.generatedAt}>
          新規ハーネス・Lintルールの導入や人によるレビューが、既に実装済みのコード/文書に
          実際に見つけた不具合(プログラムバグまたは設計書のエラー)の記録
          (<code>doc/common/品質不具合台帳.md</code>、constitution.md Core Principle
          XVIII)。一覧が増えると見通しが悪くなるため、専用ページに分けている。
        </p>
        <a href="/defect-log">品質不具合台帳を見る →</a>
      </section>

      <section className={styles.section}>
        <h2>ユニットテストカバレッジ</h2>
        <div className={styles.coverageGrid}>
          <CoverageBar label="Statements" metric={unit.coverage.statements} />
          <CoverageBar label="Branches" metric={unit.coverage.branches} />
          <CoverageBar label="Functions" metric={unit.coverage.functions} />
          <CoverageBar label="Lines" metric={unit.coverage.lines} />
        </div>
        <p>
          <a href="/coverage-report/index.html" target="_blank" rel="noopener noreferrer">
            ファイル単位の詳細レポートを別タブで開く
          </a>
        </p>
        <iframe
          className={styles.coverageFrame}
          src="/coverage-report/index.html"
          title="ユニットテストカバレッジ詳細レポート"
        />
      </section>
    </div>
  );
}
