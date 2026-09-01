import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { Todo } from "@/lib/backend";
import TodoEditModal from "./TodoEditModal";

const TARGET_TODO: Todo = {
  id: "1",
  title: "サンプルタスク",
  dueDate: "2026-09-05",
  assignee: "山田太郎",
  status: "未着手",
};

describe("TodoEditModal", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("renders prefilled with the target todo's current values", () => {
    render(<TodoEditModal todo={TARGET_TODO} onUpdated={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByText("Todoを編集")).toBeInTheDocument();
    expect(screen.getByLabelText("Todo名")).toHaveValue("サンプルタスク");
    expect(screen.getByLabelText("期限")).toHaveValue("2026-09-05");
    expect(screen.getByLabelText("担当者")).toHaveValue("山田太郎");
    expect(screen.getByLabelText("ステータス")).toHaveValue("未着手");
  });

  it("submits the edited fields via PUT /api/todos/{id}", async () => {
    const updatedTodo: Todo = { ...TARGET_TODO, title: "更新後タスク", status: "完了" };
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => updatedTodo });
    render(<TodoEditModal todo={TARGET_TODO} onUpdated={jest.fn()} onCancel={jest.fn()} />);

    fireEvent.change(screen.getByLabelText("Todo名"), { target: { value: "更新後タスク" } });
    fireEvent.change(screen.getByLabelText("ステータス"), { target: { value: "完了" } });
    fireEvent.click(screen.getByRole("button", { name: "更新" }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/todos/1",
      expect.objectContaining({ method: "PUT" })
    );
    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(requestInit.body)).toEqual({
      title: "更新後タスク",
      dueDate: "2026-09-05",
      assignee: "山田太郎",
      status: "完了",
    });
  });

  it("calls onUpdated with the updated todo on successful update", async () => {
    const updatedTodo: Todo = { ...TARGET_TODO, title: "更新後タスク" };
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => updatedTodo });
    const onUpdated = jest.fn();
    render(<TodoEditModal todo={TARGET_TODO} onUpdated={onUpdated} onCancel={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "更新" }));

    await waitFor(() => expect(onUpdated).toHaveBeenCalledWith(updatedTodo));
  });

  it("blocks submission when a required field is cleared", () => {
    render(<TodoEditModal todo={TARGET_TODO} onUpdated={jest.fn()} onCancel={jest.fn()} />);

    fireEvent.change(screen.getByLabelText("Todo名"), { target: { value: "" } });
    expect(screen.getByLabelText("Todo名")).toBeInvalid();
  });

  it("shows a failure message and keeps input when the update request fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    const onUpdated = jest.fn();
    render(<TodoEditModal todo={TARGET_TODO} onUpdated={onUpdated} onCancel={jest.fn()} />);

    fireEvent.change(screen.getByLabelText("Todo名"), { target: { value: "編集中タスク" } });
    fireEvent.click(screen.getByRole("button", { name: "更新" }));

    await screen.findByText("更新に失敗しました");
    expect(onUpdated).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Todo名")).toHaveValue("編集中タスク");
  });

  it("re-enables Cancel/更新 after a failed update", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    render(<TodoEditModal todo={TARGET_TODO} onUpdated={jest.fn()} onCancel={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "更新" }));

    await screen.findByText("更新に失敗しました");
    expect(screen.getByRole("button", { name: "更新" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
  });

  it("calls onCancel and not fetch when the Cancel button is clicked", () => {
    const onCancel = jest.fn();
    render(<TodoEditModal todo={TARGET_TODO} onUpdated={jest.fn()} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
