import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home (top page)", () => {
  it("renders the demo overview heading and lead copy", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "仕様駆動開発 × ハーネスエンジニアリング" })
    ).toBeInTheDocument();
    expect(screen.getByText(/Claude Code \(Web版\)/)).toBeInTheDocument();
  });

  it("renders every development process step with its harness", () => {
    render(<Home />);

    const steps = [
      { phase: "仕様書作成", code: "(BD)", harness: "/speckit-specify" },
      { phase: "詳細設計", code: "(PD)", harness: "/speckit-plan・/speckit-tasks" },
      { phase: "実装", harness: "/speckit-implement" },
      {
        phase: "静的解析",
        harness: "ESLint(複雑度/重複) + Spectral(OpenAPI規約) + 契約整合チェック",
      },
      {
        phase: "ユニットテスト",
        harness: "カバレッジ閾値ゲート(statements/branches/functions/lines 95%)",
      },
      { phase: "E2E", harness: "Playwright" },
      { phase: "品質分析", harness: "/test-dashboard" },
    ];

    steps.forEach((step) => {
      expect(screen.getByText(step.phase)).toBeInTheDocument();
      expect(screen.getByText(step.harness)).toBeInTheDocument();
      if (step.code) {
        expect(screen.getByText(step.code)).toBeInTheDocument();
      }
    });
  });

  it("renders links to the demo app and the quality dashboard", () => {
    render(<Home />);

    expect(
      screen.getByRole("link", { name: "デモアプリ(Todoダッシュボード)を開く" })
    ).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "品質ダッシュボードを見る" })).toHaveAttribute(
      "href",
      "/test-dashboard"
    );
  });
});
