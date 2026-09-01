import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import Home from "./page";

describe("Home (top page)", () => {
  it("renders the demo overview heading and lead copy", () => {
    render(<Home />);

    const heading = screen.getByRole("heading", {
      level: 1,
      name: "仕様駆動開発 × ハーネスエンジニアリング",
    });
    expect(heading).toBeInTheDocument();
    expect(screen.getByRole("banner")).toHaveTextContent(/Claude Code \(Web版\)/);
  });

  it("renders every development process step with its harness", () => {
    render(<Home />);
    const processSteps = within(screen.getByTestId("process-steps"));

    const steps = [
      {
        phase: "UIモックアップ合意",
        harness: "/speckit-specify step 0の合意確認(未合意なら仕様書生成を停止。ADR-0004)",
      },
      {
        phase: "仕様書作成",
        code: "(BD)",
        harness: "check-spec-sync.sh(E2E仕様書・画面遷移図の追従漏れを検出)",
      },
      {
        phase: "詳細設計",
        code: "(PD)",
        harness: "check-detailed-design-doc.mjs(セクション構成・図ファーストを検証)",
      },
      { phase: "実装", harness: "check-component-tests.sh(コンポーネント変更にテスト未追加を検出)" },
      {
        phase: "静的解析",
        harness:
          "ESLint(複雑度/重複/testing-library) + Spectral(OpenAPI規約) + 契約整合チェック + " +
          "URLパス設計/命名規則チェック",
      },
      {
        phase: "ユニットテスト",
        harness: "カバレッジ閾値ゲート(statements/branches/functions/lines 95%) + jest-axe",
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

  it("renders a button-styled link to the UI mockup page", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: "UIモックアップを見る" })).toHaveAttribute(
      "href",
      "/mockup"
    );
  });

  it("renders links to the development-process detail page from both the process section and the CTA group", () => {
    render(<Home />);

    expect(
      screen.getByRole("link", { name: "各SkillとハーネスをすべてSkill単位・ハーネス単位で詳しく見る →" })
    ).toHaveAttribute("href", "/development-process");
    expect(screen.getByRole("link", { name: "Skill・ハーネスの詳細を見る" })).toHaveAttribute(
      "href",
      "/development-process"
    );
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<Home />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
