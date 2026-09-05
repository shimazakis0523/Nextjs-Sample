import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";

jest.mock("node:fs", () => ({ readFileSync: jest.fn() }));

import { readFileSync } from "node:fs";
import DefectLogPage from "./page";

const mockedReadFileSync = readFileSync as jest.Mock;

function mockDefectLog(defectLog?: unknown) {
  mockedReadFileSync.mockImplementation(() => {
    if (defectLog === undefined) throw new Error("ENOENT: no such file or directory");
    return JSON.stringify(defectLog);
  });
}

const SAMPLE_DEFECT_LOG = {
  generatedAt: "2026-09-05T00:00:00.000Z",
  entries: [
    {
      id: "BUG-003",
      title: "jest.config.tsに`@/*`パスエイリアスのmoduleNameMapperが無かった",
      discoveredAt: "2026-08-31",
      type: "プログラムバグ",
      discoveryKind: "既存ハーネス実行中の副次的発見",
      discoveryDetail: "実行時importを初めて書いたときに発覚",
      categories: ["設定不備"],
      files: ["jest.config.ts"],
      fix: "moduleNameMapperを追加",
      lateralCheck: { status: "対象外", detail: "設定ファイル1箇所のみが原因" },
      reference: "[ADR-0019](./adr/0019-coverage-threshold-gate.md)",
    },
  ],
  summary: {
    total: 1,
    byType: { プログラムバグ: 1 },
    byCategory: { 設定不備: 1 },
    byDiscoveryKind: { "既存ハーネス実行中の副次的発見": 1 },
    byLateralCheckStatus: { 対象外: 1 },
  },
};

describe("DefectLogPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows a setup message when defect-log.json does not exist", () => {
    mockDefectLog(undefined);

    render(<DefectLogPage />);

    expect(screen.getByText(/defect-log\.json/)).toBeInTheDocument();
    expect(screen.getByText(/npm run defect-log:data/)).toBeInTheDocument();
  });

  it("renders a link back to the test dashboard", () => {
    mockDefectLog(undefined);

    render(<DefectLogPage />);

    expect(
      screen.getByRole("link", { name: "← テスト結果ダッシュボードに戻る" })
    ).toHaveAttribute("href", "/test-dashboard");
  });

  it("renders the defect log summary and entries when defect-log.json exists", () => {
    mockDefectLog(SAMPLE_DEFECT_LOG);

    render(<DefectLogPage />);

    expect(screen.getByText("品質不具合台帳")).toBeInTheDocument();
    expect(screen.getByText("合計 1 件")).toBeInTheDocument();
    expect(screen.getByText("BUG-003")).toBeInTheDocument();
    expect(
      screen.getByText("jest.config.tsに`@/*`パスエイリアスのmoduleNameMapperが無かった")
    ).toBeInTheDocument();
    expect(screen.getAllByText("プログラムバグ").length).toBeGreaterThan(0);
    expect(screen.getAllByText("設定不備").length).toBeGreaterThan(0);
    expect(screen.getAllByText("既存ハーネス実行中の副次的発見").length).toBeGreaterThan(0);
    expect(screen.getAllByText("対象外").length).toBeGreaterThan(0);
    expect(screen.getByText("ADR-0019")).toBeInTheDocument();
  });

  it("has no automatically detectable accessibility violations", async () => {
    mockDefectLog(SAMPLE_DEFECT_LOG);

    const { container } = render(<DefectLogPage />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
