import { render, screen, within } from "@testing-library/react";
import Home from "./page";

describe("Home (top page)", () => {
  it("renders the demo overview heading and lead copy", () => {
    render(<Home />);

    const heading = screen.getByRole("heading", {
      level: 1,
      name: "仕様駆動開発 × ハーネスエンジニアリング",
    });
    expect(heading).toBeInTheDocument();
    expect(heading.closest("header")).toHaveTextContent(/Claude Code \(Web版\)/);
  });

  it("renders every development process step with its harness", () => {
    render(<Home />);
    const processSteps = within(screen.getByTestId("process-steps"));

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
      expect(processSteps.getByText(step.phase)).toBeInTheDocument();
      expect(processSteps.getByText(step.harness)).toBeInTheDocument();
      if (step.code) {
        expect(processSteps.getByText(step.code)).toBeInTheDocument();
      }
    });
  });

  it("renders the architecture diagram describing how the pieces connect", () => {
    render(<Home />);

    expect(screen.getByRole("img", { name: /Claude Code Web版/ })).toBeInTheDocument();
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

  it("renders a button-styled link to the public GitHub repository that opens in a new tab", () => {
    render(<Home />);

    const repoLink = screen.getByRole("link", { name: "GitHubリポジトリ" });
    expect(repoLink).toHaveAttribute("href", "https://github.com/shimazakis0523/Nextjs-Sample");
    expect(repoLink).toHaveAttribute("target", "_blank");
    expect(repoLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
