import { render, screen, within } from "@testing-library/react";
import MockupPage from "./page";

describe("MockupPage", () => {
  it("renders the Todo一覧 mockup with every status badge", () => {
    render(<MockupPage />);
    const listSection = within(screen.getByRole("heading", { name: "Todo一覧" }).closest("section")!);

    expect(listSection.getByText("サンプルタスク")).toBeInTheDocument();
    expect(listSection.getByText("未着手")).toBeInTheDocument();
    expect(listSection.getByText("進行中")).toBeInTheDocument();
    expect(listSection.getByText("完了")).toBeInTheDocument();
    expect(listSection.getByText("保留")).toBeInTheDocument();
  });

  it("renders the Todo新規登録 mockup with every form field, disabled", () => {
    render(<MockupPage />);
    const modalSection = within(
      screen.getByRole("heading", { name: "Todo新規登録(モーダル)" }).closest("section")!
    );

    expect(modalSection.getByText("Todoを追加")).toBeInTheDocument();
    expect(modalSection.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(modalSection.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(modalSection.getByRole("combobox")).toBeDisabled();
  });
});
