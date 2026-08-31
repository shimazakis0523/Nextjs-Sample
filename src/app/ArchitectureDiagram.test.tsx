import { render, screen } from "@testing-library/react";
import ArchitectureDiagram from "./ArchitectureDiagram";

describe("ArchitectureDiagram", () => {
  it("renders an accessible image describing the Claude Code / GitHub / Vercel loop", () => {
    render(<ArchitectureDiagram />);

    const diagram = screen.getByRole("img");
    expect(diagram.getAttribute("aria-label")).toMatch(/Claude Code Web版/);
    expect(diagram.getAttribute("aria-label")).toMatch(/GitHub/);
    expect(diagram.getAttribute("aria-label")).toMatch(/Vercel/);
  });

  it("renders every node's title and multi-line description", () => {
    render(<ArchitectureDiagram />);

    expect(screen.getByText("開発者")).toBeInTheDocument();
    expect(screen.getByText("Claude Code (Web版)")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("Vercel")).toBeInTheDocument();
    expect(screen.getByText("/test-dashboard")).toBeInTheDocument();

    expect(screen.getByText("スマホ・ブラウザ")).toBeInTheDocument();
    expect(screen.getByText(/から指示するだけ/)).toBeInTheDocument();
  });

  it("renders every arrow label including the feedback loop", () => {
    render(<ArchitectureDiagram />);

    expect(screen.getByText("指示")).toBeInTheDocument();
    expect(screen.getByText("commit & push")).toBeInTheDocument();
    expect(screen.getByText("CIグリーン")).toBeInTheDocument();
    expect(screen.getByText("結果を可視化")).toBeInTheDocument();
    expect(screen.getByText("CI赤なら自動修正して再push")).toBeInTheDocument();
  });
});
