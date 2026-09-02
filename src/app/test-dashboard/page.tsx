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

type DefectEntry = {
  id: string;
  title: string;
  discoveredAt: string;
  discoveryKind: string;
  discoveryDetail: string;
  categories: string[];
  files: string[];
  fix: string;
  lateralCheck: { status: string; detail: string };
  reference: string;
};

type DefectLog = {
  generatedAt: string;
  entries: DefectEntry[];
  summary: {
    total: number;
    byCategory: Record<string, number>;
    byDiscoveryKind: Record<string, number>;
    byLateralCheckStatus: Record<string, number>;
  };
};

function loadSummary(): Summary | null {
  try {
    const filePath = path.join(process.cwd(), "dashboard-data", "summary.json");
    return JSON.parse(readFileSync(filePath, "utf8")) as Summary;
  } catch {
    return null;
  }
}

function loadDefectLog(): DefectLog | null {
  try {
    const filePath = path.join(process.cwd(), "dashboard-data", "defect-log.json");
    return JSON.parse(readFileSync(filePath, "utf8")) as DefectLog;
  } catch {
    return null;
  }
}

// "[ADR-0011](./adr/0011-...)" のようなMarkdownリンク記法から表示用テキストのみを
// 取り出す(このダッシュボードはdoc/配下のMarkdownを配信していないため、実際の
// リンクにはしない)。マッチしない場合は原文をそのまま表示する。
function formatReference(reference: string): string {
  const match = reference.match(/^\[(.+?)\]\(.+?\)$/);
  return match ? match[1] : reference;
}

function CountTable({
  caption,
  counts,
}: {
  caption: string;
  counts: Record<string, number>;
}) {
  const entries = Object.entries(counts).sort(([, a], [, b]) => b - a);
  return (
    <table className={styles.table}>
      <caption className={styles.tableCaption}>{caption}</caption>
      <thead>
        <tr>
          <th>項目</th>
          <th>件数</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([key, count]) => (
          <tr key={key}>
            <td>{key}</td>
            <td>{count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
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
  const defectLog = loadDefectLog();

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

      <section className={styles.section} id="defect-log">
        <h2>品質不具合分析</h2>
        <p className={styles.generatedAt}>
          新規ハーネス・Lintルールの導入や人によるレビューが、既に実装済みのコード/文書に
          実際に見つけた不具合の記録(<code>doc/common/品質不具合台帳.md</code>、
          constitution.md Core Principle XVIII)。原因分類・発見区分は、同じ原因の不具合を
          今後どのハーネスで防げばよいかを俯瞰するための分類。横展開は、見つかった不具合と
          同じ原因が他の箇所にも無いか確認したかどうかを示す。
        </p>
        {!defectLog || defectLog.entries.length === 0 ? (
          <p>
            dashboard-data/defect-log.json がまだありません。
            <code>npm run defect-log:data</code> を実行してください(通常はCIが実行して
            コミットします)。
          </p>
        ) : (
          <>
            <p className={styles.generatedAt}>合計 {defectLog.summary.total} 件</p>
            <div className={styles.defectSummaryGrid}>
              <CountTable caption="原因分類別" counts={defectLog.summary.byCategory} />
              <CountTable caption="発見区分別" counts={defectLog.summary.byDiscoveryKind} />
              <CountTable caption="横展開の実施状況" counts={defectLog.summary.byLateralCheckStatus} />
            </div>

            <h3>一覧</h3>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>発見日</th>
                    <th>概要</th>
                    <th>原因分類</th>
                    <th>発見区分</th>
                    <th>横展開</th>
                    <th>根拠</th>
                  </tr>
                </thead>
                <tbody>
                  {defectLog.entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.id}</td>
                      <td>{entry.discoveredAt}</td>
                      <td className={styles.defectTitle}>{entry.title}</td>
                      <td>{entry.categories.join(" / ")}</td>
                      <td>{entry.discoveryKind}</td>
                      <td
                        className={
                          entry.lateralCheck.status === "未実施" ? styles.failed : styles.passed
                        }
                      >
                        {entry.lateralCheck.status}
                      </td>
                      <td>{formatReference(entry.reference)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
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
