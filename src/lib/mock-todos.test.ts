/**
 * @jest-environment node
 */
import type { Todo } from "./mock-todos";

describe("mock-todos", () => {
  beforeEach(() => {
    jest.resetModules();
    delete (globalThis as { __mockTodos?: Todo[] }).__mockTodos;
  });

  function loadModule() {
    return import("./mock-todos");
  }

  it("listTodos returns the seeded todos initially", async () => {
    const { listTodos } = await loadModule();

    const todos = listTodos();

    expect(todos).toHaveLength(2);
    expect(todos[0]).toMatchObject({ title: "サンプルタスク", status: "未着手" });
    expect(todos[1]).toMatchObject({ title: "デザインレビュー", status: "進行中" });
  });

  it("addTodo appends a new todo with a generated id and returns it", async () => {
    const { listTodos, addTodo } = await loadModule();

    const created = addTodo({
      title: "新規タスク",
      dueDate: "2026-10-01",
      assignee: "テスト太郎",
      status: "完了",
    });

    expect(created.id).toBeTruthy();
    expect(created.title).toBe("新規タスク");

    const todos = listTodos();
    expect(todos).toHaveLength(3);
    expect(todos[2]).toEqual(created);
  });

  it("removeTodo removes only the matching todo by id", async () => {
    const { listTodos, removeTodo } = await loadModule();

    removeTodo("1");

    const todos = listTodos();
    expect(todos).toHaveLength(1);
    expect(todos.find((todo) => todo.id === "1")).toBeUndefined();
    expect(todos.find((todo) => todo.id === "2")).toBeDefined();
  });

  it("removeTodo is a no-op for an unknown id", async () => {
    const { listTodos, removeTodo } = await loadModule();

    removeTodo("does-not-exist");

    expect(listTodos()).toHaveLength(2);
  });

  it("persists additions across separate calls within the same process (globalThis cache)", async () => {
    const { addTodo } = await loadModule();
    addTodo({ title: "A", dueDate: "2026-10-01", assignee: "X", status: "未着手" });

    // Re-import without resetModules, simulating a second Route Handler
    // invocation reusing the same server process.
    const { listTodos: listTodosAgain } = await import("./mock-todos");

    expect(listTodosAgain()).toHaveLength(3);
  });
});
