import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import DevelopmentProcessPage from "./page";

describe("DevelopmentProcessPage", () => {
  it("renders the title and the generation-vs-harness distinction", () => {
    render(<DevelopmentProcessPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "開発成果物の自動生成スキルとハーネスの詳細" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "生成とハーネスの違い" })).toBeInTheDocument();
  });

  it("lists every Skill with its produced artifact", () => {
    render(<DevelopmentProcessPage />);
    const skillsTable = within(screen.getByRole("region", { name: /成果物を生成するSkill/ }));

    expect(skillsTable.getByText("design")).toBeInTheDocument();
    expect(skillsTable.getByText("speckit-specify")).toBeInTheDocument();
    expect(skillsTable.getByText("speckit-implement")).toBeInTheDocument();
    expect(skillsTable.getByText(/ユースケース記述_<画面名>\.md/)).toBeInTheDocument();
  });

  it("lists every harness with its check target and CI scope", () => {
    render(<DevelopmentProcessPage />);
    const harnessTable = within(screen.getByRole("region", { name: /成果物を検証するハーネス/ }));

    expect(harnessTable.getByText("url-path-design")).toBeInTheDocument();
    expect(harnessTable.getByText("a11y-test-coverage")).toBeInTheDocument();
    expect(harnessTable.getByText("Principle XVII")).toBeInTheDocument();
  });

  it("renders links back to the top page and to the quality dashboard", () => {
    render(<DevelopmentProcessPage />);

    expect(screen.getByRole("link", { name: "← トップページへ戻る" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "品質ダッシュボードを見る" })).toHaveAttribute(
      "href",
      "/test-dashboard"
    );
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<DevelopmentProcessPage />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
