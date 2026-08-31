import styles from "./ArchitectureDiagram.module.css";

type DiagramNode = {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  variant: "dev" | "claude" | "github" | "vercel" | "dashboard";
};

type DiagramArrow = {
  id: string;
  path: string;
  label: string;
  labelX: number;
  labelY: number;
  dashed?: boolean;
};

const NODES: DiagramNode[] = [
  {
    id: "dev",
    title: "開発者",
    description: "スマホ・ブラウザ\nから指示するだけ",
    x: 20,
    y: 45,
    width: 150,
    height: 120,
    variant: "dev",
  },
  {
    id: "claude",
    title: "Claude Code (Web版)",
    description: "対話で指示 → 仕様理解 →\n実装 → lint/test実行",
    x: 190,
    y: 45,
    width: 220,
    height: 120,
    variant: "claude",
  },
  {
    id: "github",
    title: "GitHub",
    description: "Pull Request → Actions で\n静的解析・UT・E2E・OpenAPI規約を実行",
    x: 430,
    y: 45,
    width: 220,
    height: 120,
    variant: "github",
  },
  {
    id: "vercel",
    title: "Vercel",
    description: "PRごとにプレビュー、\nmainマージで本番デプロイ",
    x: 670,
    y: 45,
    width: 220,
    height: 120,
    variant: "vercel",
  },
  {
    id: "dashboard",
    title: "/test-dashboard",
    description: "テスト密度・カバレッジ・\nコード品質を可視化",
    x: 430,
    y: 250,
    width: 220,
    height: 90,
    variant: "dashboard",
  },
];

// 横方向のarrowラベルはbox行(y=45〜165)の外、上の余白(y=25)に置く。box行の
// 内側に置くとforeignObjectのbox(labelより後に描画される=上に重なる)に隠れて
// 読めなくなるため。
const ARROWS: DiagramArrow[] = [
  {
    id: "dev-claude",
    path: "M 170 105 L 190 105",
    label: "指示",
    labelX: 180,
    labelY: 25,
  },
  {
    id: "claude-github",
    path: "M 410 105 L 430 105",
    label: "commit & push",
    labelX: 420,
    labelY: 25,
  },
  {
    id: "github-vercel",
    path: "M 650 105 L 670 105",
    label: "CIグリーン",
    labelX: 660,
    labelY: 25,
  },
  {
    id: "github-dashboard",
    path: "M 540 165 L 540 250",
    label: "結果を可視化",
    labelX: 565,
    labelY: 210,
  },
  {
    id: "github-claude-feedback",
    path: "M 430 165 C 390 220, 340 220, 300 165",
    label: "CI赤なら自動修正して再push",
    labelX: 365,
    labelY: 232,
    dashed: true,
  },
];

// idはこのファイル内のMOBILE_MAIN_FLOW/MOBILE_BRANCHESが持つ固定値のみを渡すため、
// 該当なしは起こり得ない(非nullアサーションで十分)。
function findNode(id: string): DiagramNode {
  return NODES.find((n) => n.id === id)!;
}

function findArrowLabel(id: string): string {
  return ARROWS.find((a) => a.id === id)!.label;
}

// スマホ幅ではSVG版(固定900px、横スクロール必須)は文字が小さくなりすぎて
// 読みにくいため、同じNODES/ARROWSデータから作る縦積みのテキスト版に
// CSSで出し分ける(ArchitectureDiagram.module.cssのメディアクエリ参照)。
const MOBILE_MAIN_FLOW = [
  { nodeId: "dev", arrowIdFromPrev: null },
  { nodeId: "claude", arrowIdFromPrev: "dev-claude" },
  { nodeId: "github", arrowIdFromPrev: "claude-github" },
] as const;

const MOBILE_BRANCHES = [
  { nodeId: "vercel", arrowId: "github-vercel" },
  { nodeId: "dashboard", arrowId: "github-dashboard" },
] as const;

function MobileNodeCard({ node }: { node: DiagramNode }) {
  return (
    <div className={`${styles.mobileNode} ${styles[`box_${node.variant}`]}`}>
      <p className={styles.boxTitle}>{node.title}</p>
      <p className={styles.boxDescription}>
        {node.description.split("\n").map((line, i, lines) => (
          <span key={line}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    </div>
  );
}

const DIAGRAM_LABEL =
  "開発者がClaude Code Web版に指示すると、GitHubへcommit・pushされ、GitHub ActionsがCIを実行し、" +
  "成功するとVercelにデプロイされ、結果は品質ダッシュボードに可視化される。CIが赤の場合はClaude " +
  "Codeが自動修正して再度pushする。";

export default function ArchitectureDiagram() {
  return (
    <div className={styles.wrap} role="img" aria-label={DIAGRAM_LABEL}>
      <div className={styles.svgOnly} data-testid="architecture-svg" aria-hidden="true">
        <svg className={styles.svg} viewBox="0 0 900 360" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 Z" className={styles.arrowhead} />
            </marker>
          </defs>

          {ARROWS.map((arrow) => (
            <g key={arrow.id}>
              <path
                d={arrow.path}
                className={arrow.dashed ? styles.arrowDashed : styles.arrow}
                markerEnd="url(#arrowhead)"
              />
              <text x={arrow.labelX} y={arrow.labelY} className={styles.arrowLabel}>
                {arrow.label}
              </text>
            </g>
          ))}

          {NODES.map((node) => (
            <foreignObject
              key={node.id}
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
            >
              <div className={`${styles.box} ${styles[`box_${node.variant}`]}`}>
                <p className={styles.boxTitle}>{node.title}</p>
                <p className={styles.boxDescription}>
                  {node.description.split("\n").map((line, i, lines) => (
                    <span key={line}>
                      {line}
                      {i < lines.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
            </foreignObject>
          ))}
        </svg>
      </div>

      <div className={styles.mobileOnly} data-testid="architecture-mobile" aria-hidden="true">
        {MOBILE_MAIN_FLOW.map(({ nodeId, arrowIdFromPrev }) => (
          <div key={nodeId}>
            {arrowIdFromPrev && (
              <p className={styles.mobileArrow}>↓ {findArrowLabel(arrowIdFromPrev)}</p>
            )}
            <MobileNodeCard node={findNode(nodeId)} />
          </div>
        ))}

        <div className={styles.mobileBranchGroup}>
          {MOBILE_BRANCHES.map(({ nodeId, arrowId }) => (
            <div key={nodeId} className={styles.mobileBranchItem}>
              <p className={styles.mobileArrow}>↓ {findArrowLabel(arrowId)}</p>
              <MobileNodeCard node={findNode(nodeId)} />
            </div>
          ))}
        </div>

        <p className={styles.mobileFeedback}>
          ⟲ {findArrowLabel("github-claude-feedback")}(Claude Codeへ戻る)
        </p>
      </div>
    </div>
  );
}
