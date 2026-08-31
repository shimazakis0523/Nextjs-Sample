import { render, screen } from "@testing-library/react";

jest.mock("node:fs", () => ({ readFileSync: jest.fn() }));

import { readFileSync } from "node:fs";
import TestDashboardPage from "./page";

const mockedReadFileSync = readFileSync as jest.Mock;

const testDensityFixture = {
  stepCount: 1000,
  kStep: 1,
  unit: { count: 19, density: 19 },
  e2e: { count: 22, density: 22 },
  total: { count: 41, density: 41 },
};

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
        testDensity: testDensityFixture,
      })
    );

    render(<TestDashboardPage />);

    expect(screen.getByText("テスト結果ダッシュボード")).toBeInTheDocument();
    expect(screen.getAllByText("業務1_Todoダッシュボード").length).toBeGreaterThan(0);
    expect(screen.getAllByText("19").length).toBeGreaterThan(0);
    expect(screen.getAllByText("22").length).toBeGreaterThan(0);
    expect(screen.getByText("テスト密度")).toBeInTheDocument();
    expect(screen.getByText("19.00")).toBeInTheDocument();
    expect(screen.getByText("41.00")).toBeInTheDocument();
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
        testDensity: testDensityFixture,
      })
    );

    render(<TestDashboardPage />);

    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
  });

  it("falls back to zero counts for a business missing from one side, and flags e2e failures", () => {
    mockedReadFileSync.mockReturnValue(
      JSON.stringify({
        generatedAt: "2026-08-31T00:00:00.000Z",
        unit: {
          overall: { total: 5, passed: 5, failed: 0 },
          byBusiness: { 業務A: { total: 5, passed: 5, failed: 0 } },
          coverage: {
            statements: { total: 10, covered: 10, skipped: 0, pct: 100 },
            branches: { total: 4, covered: 4, skipped: 0, pct: 100 },
            functions: { total: 4, covered: 4, skipped: 0, pct: 100 },
            lines: { total: 10, covered: 10, skipped: 0, pct: 100 },
          },
        },
        e2e: {
          overall: { total: 3, passed: 2, failed: 1 },
          byBusiness: { 業務B: { total: 3, passed: 2, failed: 1 } },
        },
        testDensity: testDensityFixture,
      })
    );

    render(<TestDashboardPage />);

    expect(screen.getByText("業務A")).toBeInTheDocument();
    expect(screen.getByText("業務B")).toBeInTheDocument();
  });
});
