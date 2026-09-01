import { render, screen, fireEvent, waitForElementToBeRemoved } from "@testing-library/react";
import type { Todo } from "@/lib/backend";
import TodoDashboard from "./TodoDashboard";

const initialTodos: Todo[] = [
  { id: "1", title: "タスクA", dueDate: "2026-10-01", assignee: "山田", status: "未着手" },
];

describe("TodoDashboard", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("removes a todo from the list when TodoList reports a successful delete", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(<TodoDashboard initialTodos={initialTodos} />);

    fireEvent.click(screen.getByRole("button", { name: "削除" }));

    expect(await screen.findByText("Todoがありません")).toBeInTheDocument();
  });

  it("opens the modal on Add click, and adds the saved todo to the list on success", async () => {
    const createdTodo: Todo = {
      id: "2",
      title: "新規タスク",
      dueDate: "2026-12-01",
      assignee: "担当太郎",
      status: "未着手",
    };
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => createdTodo });
    render(<TodoDashboard initialTodos={initialTodos} />);

    fireEvent.click(screen.getByRole("button", { name: "+ Add" }));
    expect(screen.getByText("Todoを追加")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Todo名"), { target: { value: "新規タスク" } });
    fireEvent.change(screen.getByLabelText("期限"), { target: { value: "2026-12-01" } });
    fireEvent.change(screen.getByLabelText("担当者"), { target: { value: "担当太郎" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitForElementToBeRemoved(() => screen.queryByText("Todoを追加"));
    expect(screen.getByText("新規タスク")).toBeInTheDocument();
    expect(screen.getByText("タスクA")).toBeInTheDocument();
  });

  it("closes the modal without changing the list when Cancel is clicked", () => {
    render(<TodoDashboard initialTodos={initialTodos} />);

    fireEvent.click(screen.getByRole("button", { name: "+ Add" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByText("Todoを追加")).not.toBeInTheDocument();
    expect(screen.getByText("タスクA")).toBeInTheDocument();
  });
});
