import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import MockupPage from "./page";

describe("MockupPage", () => {
  it("renders the Todo一覧 mockup with every status badge and an edit button left of delete", () => {
    render(<MockupPage />);
    const listSection = within(screen.getByRole("region", { name: "Todo一覧" }));

    expect(listSection.getByText("サンプルタスク")).toBeInTheDocument();
    expect(listSection.getByText("未着手")).toBeInTheDocument();
    expect(listSection.getByText("進行中")).toBeInTheDocument();
    expect(listSection.getByText("完了")).toBeInTheDocument();
    expect(listSection.getByText("保留")).toBeInTheDocument();

    const [firstRowActions] = listSection.getAllByRole("button", { name: "編集" });
    expect(firstRowActions).toBeInTheDocument();
    const rowButtons = listSection
      .getAllByRole("row")
      .find((row) => within(row).queryByText("サンプルタスク"));
    expect(rowButtons).toBeDefined();
    const buttonsInRow = within(rowButtons as HTMLElement).getAllByRole("button");
    expect(buttonsInRow.map((button) => button.textContent)).toEqual(["編集", "削除"]);
  });

  it("renders the Todo新規登録 mockup with every form field, disabled", () => {
    render(<MockupPage />);
    const modalSection = within(screen.getByRole("region", { name: "Todo新規登録(モーダル)" }));

    expect(modalSection.getByText("Todoを追加")).toBeInTheDocument();
    expect(modalSection.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(modalSection.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(modalSection.getByRole("combobox")).toBeDisabled();
  });

  it("renders the Todo編集 mockup prefilled with the target todo's current values, disabled", () => {
    render(<MockupPage />);
    const modalSection = within(screen.getByRole("region", { name: "Todo編集(モーダル)" }));

    expect(modalSection.getByText("Todoを編集")).toBeInTheDocument();
    expect(modalSection.getByDisplayValue("サンプルタスク")).toHaveAttribute("readonly");
    expect(modalSection.getByDisplayValue("2026-09-05")).toHaveAttribute("readonly");
    expect(modalSection.getByDisplayValue("山田太郎")).toHaveAttribute("readonly");
    expect(modalSection.getByRole("combobox")).toBeDisabled();
    expect(modalSection.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(modalSection.getByRole("button", { name: "更新" })).toBeDisabled();
  });

  it("has no automatically detectable accessibility violations", async () => {
    const { container } = render(<MockupPage />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
