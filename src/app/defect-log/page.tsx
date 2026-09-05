import { readFileSync } from "node:fs";
import path from "node:path";
import styles from "./defect-log.module.css";

type DefectEntry = {
  id: string;
  title: string;
  discoveredAt: string;
  type: string;
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
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    byDiscoveryKind: Record<string, number>;
    byLateralCheckStatus: Record<string, number>;
  };
};

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

export default function DefectLogPage() {
  const defectLog = loadDefectLog();

  return (
    <div className={styles.page}>
      <h1>品質不具合台帳</h1>
      <p>
        新規ハーネス・Lintルールの導入や人によるレビューが、既に実装済みのコード/文書に
        実際に見つけた不具合の記録(<code>doc/common/品質不具合台帳.md</code>、
        constitution.md Core Principle XVIII)。対象は<strong>プログラムバグ</strong>
        (実装済みコードが仕様通りに動作しない)または<strong>設計書のエラー</strong>
        (仕様書・契約文書等の誤り・欠落)のいずれかに限る。原因分類・発見区分は、同じ
        原因の不具合を今後どのハーネスで防げばよいかを俯瞰するための分類。横展開は、
        見つかった不具合と同じ原因が他の箇所にも無いか確認したかどうかを示す。
      </p>
      <a className={styles.backLink} href="/test-dashboard">
        ← テスト結果ダッシュボードに戻る
      </a>

      {!defectLog || defectLog.entries.length === 0 ? (
        <p>
          dashboard-data/defect-log.json がまだありません。
          <code>npm run defect-log:data</code> を実行してください(通常はCIが実行して
          コミットします)。
        </p>
      ) : (
        <section className={styles.section}>
          <p className={styles.generatedAt}>合計 {defectLog.summary.total} 件</p>
          <div className={styles.defectSummaryGrid}>
            <CountTable caption="種別別" counts={defectLog.summary.byType} />
            <CountTable caption="原因分類別" counts={defectLog.summary.byCategory} />
            <CountTable caption="発見区分別" counts={defectLog.summary.byDiscoveryKind} />
            <CountTable caption="横展開の実施状況" counts={defectLog.summary.byLateralCheckStatus} />
          </div>

          <h2>一覧</h2>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>発見日</th>
                  <th>概要</th>
                  <th>種別</th>
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
                    <td>{entry.type}</td>
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
        </section>
      )}
    </div>
  );
}
