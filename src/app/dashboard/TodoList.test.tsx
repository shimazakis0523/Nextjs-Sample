import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { Todo } from "@/lib/backend";
import TodoList from "./TodoList";

const todos: Todo[] = [
  { id: "1", title: "タスクA", dueDate: "2026-10-01", assignee: "山田", status: "未着手" },
  { id: "2", title: "タスクB", dueDate: "2026-10-02", assignee: "鈴木", status: "進行中" },
];

describe("TodoList", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders each todo's title/dueDate/assignee/status", () => {
    render(<TodoList todos={todos} onDeleted={jest.fn()} onAddClick={jest.fn()} />);

    expect(screen.getByText("タスクA")).toBeInTheDocument();
    expect(screen.getByText("2026-10-01")).toBeInTheDocument();
    expect(screen.getByText("山田")).toBeInTheDocument();
    expect(screen.getByText("未着手")).toBeInTheDocument();
  });

  it("shows the empty-state message when there are no todos", () => {
    render(<TodoList todos={[]} onDeleted={jest.fn()} onAddClick={jest.fn()} />);

    expect(screen.getByText("Todoがありません")).toBeInTheDocument();
  });

  it("calls onAddClick when the Add button is clicked", () => {
    const onAddClick = jest.fn();
    render(<TodoList todos={todos} onDeleted={jest.fn()} onAddClick={onAddClick} />);

    fireEvent.click(screen.getByRole("button", { name: "+ Add" }));

    expect(onAddClick).toHaveBeenCalledTimes(1);
  });

  it("calls DELETE and onDeleted for the clicked row when the user confirms", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    const onDeleted = jest.fn();
    render(<TodoList todos={todos} onDeleted={onDeleted} onAddClick={jest.fn()} />);

    fireEvent.click(screen.getAllByRole("button", { name: "削除" })[0]);

    await waitFor(() => expect(onDeleted).toHaveBeenCalledWith("1"));
    expect(global.fetch).toHaveBeenCalledWith("/api/todos/1", { method: "DELETE" });
  });

  it("does not call DELETE or onDeleted when the user cancels the confirm dialog", () => {
    jest.spyOn(window, "confirm").mockReturnValue(false);
    const onDeleted = jest.fn();
    render(<TodoList todos={todos} onDeleted={onDeleted} onAddClick={jest.fn()} />);

    fireEvent.click(screen.getAllByRole("button", { name: "削除" })[0]);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it("does not call onDeleted when the DELETE request fails", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    const onDeleted = jest.fn();
    render(<TodoList todos={todos} onDeleted={onDeleted} onAddClick={jest.fn()} />);

    fireEvent.click(screen.getAllByRole("button", { name: "削除" })[0]);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
