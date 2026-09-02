import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";

jest.mock("node:fs", () => ({ readFileSync: jest.fn() }));

import { readFileSync } from "node:fs";
import TestDashboardPage from "./page";

const mockedReadFileSync = readFileSync as jest.Mock;

const densityRow = (unitCount: number, e2eCount: number) => ({
  stepCount: 1000,
  kStep: 1,
  unit: { count: unitCount, density: unitCount },
  e2e: { count: e2eCount, density: e2eCount },
  total: { count: unitCount + e2eCount, density: unitCount + e2eCount },
});

// summary.json / defect-log.json のどちらを読んでいるかをファイルパス引数で判別し、
// それぞれ別の内容を返す(loadSummary/loadDefectLogは同じreadFileSyncを別々の
// パスで呼ぶため、単一のmockReturnValueでは両方に同じ内容が返ってしまう)。
function mockFs({
  summary,
  defectLog,
}: {
  summary?: unknown;
  defectLog?: unknown;
}) {
  mockedReadFileSync.mockImplementation((filePath: string) => {
    if (filePath.toString().includes("defect-log.json")) {
      if (defectLog === undefined) throw new Error("ENOENT: no such file or directory");
      return JSON.stringify(defectLog);
    }
    if (summary === undefined) throw new Error("ENOENT: no such file or directory");
    return JSON.stringify(summary);
  });
}

const SAMPLE_SUMMARY = {
  generatedAt: "2026-08-31T00:00:00.000Z",
  unit: {
    overall: { total: 19, passed: 19, failed: 0 },
    byBusiness: { 業務1_Todoダッシュボード: { total: 19, passed: 19, failed: 0 } },
    coverage: {
      statements: { total: 100, covered: 90, skipped: 0, pct: 90 },
      branches: { total: 20, covered: 15, skipped: 0, pct: 75 },
      functions: { total: 30, covered: 28, skipped: 0, pct: 93.33 },
      lines: { total: 100, covered: 90, skipped: 0, pct: 90 },
    },
  },
  e2e: {
    overall: { total: 22, passed: 22, failed: 0 },
    byBusiness: { 業務1_Todoダッシュボード: { total: 22, passed: 22, failed: 0 } },
  },
  testDensity: {
    overall: densityRow(19, 22),
    byBusiness: { 業務1_Todoダッシュボード: densityRow(19, 22) },
  },
  codeQuality: {
    overall: { errorCount: 1, warningCount: 2 },
    byBusiness: { 業務1_Todoダッシュボード: { errorCount: 1, warningCount: 2 } },
    byRule: {
      "sonarjs/no-duplicate-string": { errorCount: 0, warningCount: 2 },
      complexity: { errorCount: 1, warningCount: 0 },
    },
  },
};

const SAMPLE_DEFECT_LOG = {
  generatedAt: "2026-09-01T00:00:00.000Z",
  entries: [
    {
      id: "BUG-001",
      title: "TodoList.tsx等の分割後、ユニットテストが無かった",
      discoveredAt: "2026-08-30",
      discoveryKind: "人によるレビュー・指摘",
      discoveryDetail: "人によるコードレビュー",
      categories: ["タスク定義の不備"],
      files: ["src/app/dashboard/TodoList.tsx"],
      fix: "ユニットテストを追加",
      lateralCheck: { status: "実施", detail: "他に未テストのコンポーネントなし" },
      reference: "[ADR-0011](./adr/0011-component-test-coverage-gate.md)",
    },
  ],
  summary: {
    total: 1,
    byCategory: { タスク定義の不備: 1 },
    byDiscoveryKind: { "人によるレビュー・指摘": 1 },
    byLateralCheckStatus: { 実施: 1 },
  },
};

describe("TestDashboardPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows a setup message when dashboard-data/summary.json does not exist", () => {
    mockFs({});

    render(<TestDashboardPage />);

    expect(screen.getByText(/summary\.json/)).toBeInTheDocument();
    expect(screen.getByText(/npm run dashboard:data/)).toBeInTheDocument();
  });

  it("renders the summary numbers when summary.json exists", () => {
    mockFs({ summary: SAMPLE_SUMMARY });

    render(<TestDashboardPage />);

    expect(screen.getByText("テスト結果ダッシュボード")).toBeInTheDocument();
    expect(screen.getAllByText("業務1_Todoダッシュボード").length).toBeGreaterThan(0);
    expect(screen.getAllByText("19").length).toBeGreaterThan(0);
    expect(screen.getAllByText("22").length).toBeGreaterThan(0);
    expect(screen.getByText("テスト密度")).toBeInTheDocument();
    expect(screen.getAllByText("全体").length).toBeGreaterThan(0);
    expect(screen.getAllByText("19.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("41.00").length).toBeGreaterThan(0);
    expect(screen.getByText("コード品質(静的解析)")).toBeInTheDocument();
    expect(screen.getByText("ルール別の内訳")).toBeInTheDocument();
    expect(screen.getByText("sonarjs/no-duplicate-string")).toBeInTheDocument();
  });

  it("shows failed counts distinctly when a suite has failures", () => {
    mockFs({
      summary: {
        ...SAMPLE_SUMMARY,
        unit: {
          ...SAMPLE_SUMMARY.unit,
          overall: { total: 5, passed: 4, failed: 1 },
          byBusiness: { 業務1_Todoダッシュボード: { total: 5, passed: 4, failed: 1 } },
        },
        e2e: { overall: { total: 0, passed: 0, failed: 0 }, byBusiness: {} },
        testDensity: {
          overall: densityRow(5, 0),
          byBusiness: { 業務1_Todoダッシュボード: densityRow(5, 0) },
        },
        codeQuality: {
          overall: { errorCount: 1, warningCount: 0 },
          byBusiness: { 業務1_Todoダッシュボード: { errorCount: 1, warningCount: 0 } },
          byRule: {},
        },
      },
    });

    render(<TestDashboardPage />);

    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
    expect(screen.queryByText("ルール別の内訳")).not.toBeInTheDocument();
  });

  it("falls back to zero counts for a business missing from one side, and flags e2e failures", () => {
    mockFs({
      summary: {
        ...SAMPLE_SUMMARY,
        unit: {
          ...SAMPLE_SUMMARY.unit,
          overall: { total: 5, passed: 5, failed: 0 },
          byBusiness: { 業務A: { total: 5, passed: 5, failed: 0 } },
        },
        e2e: { overall: { total: 3, passed: 2, failed: 1 }, byBusiness: { 業務B: { total: 3, passed: 2, failed: 1 } } },
        testDensity: {
          overall: densityRow(5, 3),
          byBusiness: { 業務A: densityRow(5, 0), 業務B: densityRow(0, 3) },
        },
        codeQuality: {
          overall: { errorCount: 0, warningCount: 0 },
          byBusiness: {
            業務A: { errorCount: 0, warningCount: 0 },
            業務B: { errorCount: 0, warningCount: 0 },
          },
          byRule: {},
        },
      },
    });

    render(<TestDashboardPage />);

    expect(screen.getAllByText("業務A").length).toBeGreaterThan(0);
    expect(screen.getAllByText("業務B").length).toBeGreaterThan(0);
  });

  it("shows a setup message for the defect log when defect-log.json does not exist", () => {
    mockFs({ summary: SAMPLE_SUMMARY });

    render(<TestDashboardPage />);

    expect(screen.getByText(/defect-log\.json/)).toBeInTheDocument();
    expect(screen.getByText(/npm run defect-log:data/)).toBeInTheDocument();
  });

  it("renders the defect log summary and entries when defect-log.json exists", () => {
    mockFs({ summary: SAMPLE_SUMMARY, defectLog: SAMPLE_DEFECT_LOG });

    render(<TestDashboardPage />);

    expect(screen.getByText("品質不具合分析")).toBeInTheDocument();
    expect(screen.getByText("合計 1 件")).toBeInTheDocument();
    expect(screen.getByText("BUG-001")).toBeInTheDocument();
    expect(screen.getByText("TodoList.tsx等の分割後、ユニットテストが無かった")).toBeInTheDocument();
    expect(screen.getAllByText("タスク定義の不備").length).toBeGreaterThan(0);
    expect(screen.getAllByText("人によるレビュー・指摘").length).toBeGreaterThan(0);
    expect(screen.getAllByText("実施").length).toBeGreaterThan(0);
    expect(screen.getByText("ADR-0011")).toBeInTheDocument();
  });

  it("has no automatically detectable accessibility violations", async () => {
    mockFs({});

    const { container } = render(<TestDashboardPage />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
