import { render, screen } from "@testing-library/react";

jest.mock("node:fs", () => ({ readFileSync: jest.fn() }));

import { readFileSync } from "node:fs";
import TestDashboardPage from "./page";

const mockedReadFileSync = readFileSync as jest.Mock;

describe("TestDashboardPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows a setup message when dashboard-data/summary.json does not exist", () => {
    mockedReadFileSync.mockImplementation(() => {
      throw new Error("ENOENT: no such file or directory");
    });

    render(<TestDashboardPage />);

    expect(screen.getByText(/summary\.json/)).toBeInTheDocument();
    expect(screen.getByText(/npm run dashboard:data/)).toBeInTheDocument();
  });

  it("renders the summary numbers when summary.json exists", () => {
    mockedReadFileSync.mockReturnValue(
      JSON.stringify({
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
      })
    );

    render(<TestDashboardPage />);

    expect(screen.getByText("テスト結果ダッシュボード")).toBeInTheDocument();
    expect(screen.getAllByText("業務1_Todoダッシュボード").length).toBeGreaterThan(0);
    expect(screen.getAllByText("19").length).toBeGreaterThan(0);
    expect(screen.getAllByText("22").length).toBeGreaterThan(0);
  });

  it("shows failed counts distinctly when a suite has failures", () => {
    mockedReadFileSync.mockReturnValue(
      JSON.stringify({
        generatedAt: "2026-08-31T00:00:00.000Z",
        unit: {
          overall: { total: 5, passed: 4, failed: 1 },
          byBusiness: { 業務1_Todoダッシュボード: { total: 5, passed: 4, failed: 1 } },
          coverage: {
            statements: { total: 10, covered: 5, skipped: 0, pct: 50 },
            branches: { total: 4, covered: 2, skipped: 0, pct: 50 },
            functions: { total: 4, covered: 2, skipped: 0, pct: 50 },
            lines: { total: 10, covered: 5, skipped: 0, pct: 50 },
          },
        },
        e2e: {
          overall: { total: 0, passed: 0, failed: 0 },
          byBusiness: {},
        },
      })
    );

    render(<TestDashboardPage />);

    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
  });
});
