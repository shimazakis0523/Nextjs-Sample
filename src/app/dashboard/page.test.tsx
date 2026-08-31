import { render, screen } from "@testing-library/react";
import * as backend from "@/lib/backend";
import type { Todo } from "@/lib/backend";
import DashboardPage from "./page";

jest.mock("@/lib/backend");
jest.mock("./TodoDashboard", () => {
  return function MockTodoDashboard({ initialTodos }: { initialTodos: Todo[] }) {
    return <div data-testid="todo-dashboard">{initialTodos.length} todos</div>;
  };
});

const mockedBackend = jest.mocked(backend);

describe("DashboardPage", () => {
  it("passes the todos from getTodos to TodoDashboard as initialTodos", async () => {
    const todos: Todo[] = [
      { id: "1", title: "サンプル", dueDate: "2026-01-01", assignee: "X", status: "未着手" },
    ];
    mockedBackend.getTodos.mockResolvedValue(todos);

    const ui = await DashboardPage();
    render(ui);

    expect(await screen.findByTestId("todo-dashboard")).toHaveTextContent("1 todos");
  });
});
