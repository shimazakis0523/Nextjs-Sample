import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home (top page)", () => {
  it("renders links to the Todo dashboard and the test dashboard", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: "Todoダッシュボードを開く" })).toHaveAttribute(
      "href",
      "/dashboard"
    );
    expect(
      screen.getByRole("link", { name: "テスト結果ダッシュボードを見る" })
    ).toHaveAttribute("href", "/test-dashboard");
  });
});
