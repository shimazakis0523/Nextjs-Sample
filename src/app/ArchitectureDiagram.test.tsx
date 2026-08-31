import { render, screen, within } from "@testing-library/react";
import ArchitectureDiagram from "./ArchitectureDiagram";

describe("ArchitectureDiagram", () => {
  it("renders an accessible image describing the Claude Code / GitHub / Vercel loop", () => {
    render(<ArchitectureDiagram />);

    const diagram = screen.getByRole("img");
    expect(diagram.getAttribute("aria-label")).toMatch(/Claude Code Web版/);
    expect(diagram.getAttribute("aria-label")).toMatch(/GitHub/);
    expect(diagram.getAttribute("aria-label")).toMatch(/Vercel/);
  });

  describe("desktop SVG version", () => {
    it("renders every node's title and multi-line description", () => {
      render(<ArchitectureDiagram />);
      const svgVersion = within(screen.getByTestId("architecture-svg"));

      expect(svgVersion.getByText("開発者")).toBeInTheDocument();
      expect(svgVersion.getByText("Claude Code (Web版)")).toBeInTheDocument();
      expect(svgVersion.getByText("GitHub")).toBeInTheDocument();
      expect(svgVersion.getByText("Vercel")).toBeInTheDocument();
      expect(svgVersion.getByText("/test-dashboard")).toBeInTheDocument();

      expect(svgVersion.getByText("スマホ・ブラウザ")).toBeInTheDocument();
      expect(svgVersion.getByText(/から指示するだけ/)).toBeInTheDocument();
    });

    it("renders every arrow label including the feedback loop", () => {
      render(<ArchitectureDiagram />);
      const svgVersion = within(screen.getByTestId("architecture-svg"));

      expect(svgVersion.getByText("指示")).toBeInTheDocument();
      expect(svgVersion.getByText("commit & push")).toBeInTheDocument();
      expect(svgVersion.getByText("CIグリーン")).toBeInTheDocument();
      expect(svgVersion.getByText("結果を可視化")).toBeInTheDocument();
      expect(svgVersion.getByText("CI赤なら自動修正して再push")).toBeInTheDocument();
    });
  });

  describe("mobile stacked version", () => {
    it("renders the same nodes in flow order, followed by the two GitHub branches", () => {
      render(<ArchitectureDiagram />);
      const mobileVersion = within(screen.getByTestId("architecture-mobile"));

      expect(mobileVersion.getByText("開発者")).toBeInTheDocument();
      expect(mobileVersion.getByText("Claude Code (Web版)")).toBeInTheDocument();
      expect(mobileVersion.getByText("GitHub")).toBeInTheDocument();
      expect(mobileVersion.getByText("Vercel")).toBeInTheDocument();
      expect(mobileVersion.getByText("/test-dashboard")).toBeInTheDocument();
    });

    it("renders arrow labels between nodes and the feedback note", () => {
      render(<ArchitectureDiagram />);
      const mobileVersion = within(screen.getByTestId("architecture-mobile"));

      expect(mobileVersion.getByText("↓ 指示")).toBeInTheDocument();
      expect(mobileVersion.getByText("↓ commit & push")).toBeInTheDocument();
      expect(mobileVersion.getByText("↓ CIグリーン")).toBeInTheDocument();
      expect(mobileVersion.getByText("↓ 結果を可視化")).toBeInTheDocument();
      expect(mobileVersion.getByText(/CI赤なら自動修正して再push/)).toBeInTheDocument();
    });
  });
});
