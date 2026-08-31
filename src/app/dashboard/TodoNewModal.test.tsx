import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { Todo } from "@/lib/backend";
import TodoNewModal from "./TodoNewModal";

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText("Todo名"), { target: { value: "新規タスク" } });
  fireEvent.change(screen.getByLabelText("期限"), { target: { value: "2026-12-01" } });
  fireEvent.change(screen.getByLabelText("担当者"), { target: { value: "担当太郎" } });
}

describe("TodoNewModal", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("renders with empty fields and 未着手 as the default status", () => {
    render(<TodoNewModal onSaved={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByText("Todoを追加")).toBeInTheDocument();
    expect(screen.getByLabelText("Todo名")).toHaveValue("");
    expect(screen.getByLabelText("期限")).toHaveValue("");
    expect(screen.getByLabelText("担当者")).toHaveValue("");
    expect(screen.getByLabelText("ステータス")).toHaveValue("未着手");
  });

  it("reflects a status selection change and submits it on save", async () => {
    const createdTodo: Todo = {
      id: "4",
      title: "新規タスク",
      dueDate: "2026-12-01",
      assignee: "担当太郎",
      status: "完了",
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => createdTodo,
    });
    render(<TodoNewModal onSaved={jest.fn()} onCancel={jest.fn()} />);

    fillRequiredFields();
    fireEvent.change(screen.getByLabelText("ステータス"), { target: { value: "完了" } });
    expect(screen.getByLabelText("ステータス")).toHaveValue("完了");

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(requestInit.body)).toMatchObject({ status: "完了" });
  });

  it("calls onSaved with the created todo on successful save", async () => {
    const createdTodo: Todo = {
      id: "3",
      title: "新規タスク",
      dueDate: "2026-12-01",
      assignee: "担当太郎",
      status: "未着手",
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => createdTodo,
    });
    const onSaved = jest.fn();
    render(<TodoNewModal onSaved={onSaved} onCancel={jest.fn()} />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(createdTodo));
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/todos",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("shows the fallback message when fetch rejects with a non-Error value", async () => {
    (global.fetch as jest.Mock).mockRejectedValue("network down");
    render(<TodoNewModal onSaved={jest.fn()} onCancel={jest.fn()} />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await screen.findByText("保存に失敗しました");
  });

  it("shows a failure message and keeps input when the save request fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    const onSaved = jest.fn();
    render(<TodoNewModal onSaved={onSaved} onCancel={jest.fn()} />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await screen.findByText("保存に失敗しました");
    expect(onSaved).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Todo名")).toHaveValue("新規タスク");
  });

  it("re-enables Cancel/Save after a failed save", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    render(<TodoNewModal onSaved={jest.fn()} onCancel={jest.fn()} />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await screen.findByText("保存に失敗しました");
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
  });

  it("calls onCancel and not fetch when the Cancel button is clicked", () => {
    const onCancel = jest.fn();
    render(<TodoNewModal onSaved={jest.fn()} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
