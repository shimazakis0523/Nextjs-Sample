/**
 * @jest-environment node
 */
import type { Todo } from "./mock-todos";

jest.mock("./backend-client");
jest.mock("./mock-data", () => ({
  mockUsers: [{ id: 1, name: "Mock User", email: "mock@example.com" }],
}));
jest.mock("./mock-todos", () => ({
  listTodos: jest.fn(),
  addTodo: jest.fn(),
  removeTodo: jest.fn(),
}));

const ORIGINAL_BACKEND_API_URL = process.env.BACKEND_API_URL;

afterEach(() => {
  process.env.BACKEND_API_URL = ORIGINAL_BACKEND_API_URL;
  jest.resetModules();
  jest.clearAllMocks();
});

describe("when BACKEND_API_URL is not set (mock backend)", () => {
  beforeEach(() => {
    delete process.env.BACKEND_API_URL;
    jest.resetModules();
  });

  it("getUsers returns mockUsers without calling backendFetch", async () => {
    const { getUsers } = await import("./backend");
    const { mockUsers } = await import("./mock-data");
    const { backendFetch } = await import("./backend-client");

    await expect(getUsers()).resolves.toBe(mockUsers);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it("getTodos delegates to listTodos without calling backendFetch", async () => {
    const { getTodos } = await import("./backend");
    const { listTodos } = await import("./mock-todos");
    const { backendFetch } = await import("./backend-client");
    const todos: Todo[] = [];
    (listTodos as jest.Mock).mockReturnValue(todos);

    await expect(getTodos()).resolves.toBe(todos);
    expect(listTodos).toHaveBeenCalledTimes(1);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it("createTodo delegates to addTodo without calling backendFetch", async () => {
    const { createTodo } = await import("./backend");
    const { addTodo } = await import("./mock-todos");
    const { backendFetch } = await import("./backend-client");
    const input = { title: "T", dueDate: "2026-01-01", assignee: "A", status: "未着手" as const };
    const created: Todo = { id: "1", ...input };
    (addTodo as jest.Mock).mockReturnValue(created);

    await expect(createTodo(input)).resolves.toBe(created);
    expect(addTodo).toHaveBeenCalledWith(input);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it("deleteTodo delegates to removeTodo without calling backendFetch", async () => {
    const { deleteTodo } = await import("./backend");
    const { removeTodo } = await import("./mock-todos");
    const { backendFetch } = await import("./backend-client");

    await deleteTodo("1");

    expect(removeTodo).toHaveBeenCalledWith("1");
    expect(backendFetch).not.toHaveBeenCalled();
  });
});

describe("when BACKEND_API_URL is set (real backend)", () => {
  beforeEach(() => {
    process.env.BACKEND_API_URL = "https://backend.example.com";
    jest.resetModules();
  });

  it("getUsers delegates to backendFetch('/users')", async () => {
    const { getUsers } = await import("./backend");
    const { backendFetch } = await import("./backend-client");
    const realUsers = [{ id: 1, name: "Real User", email: "real@example.com" }];
    (backendFetch as jest.Mock).mockResolvedValue(realUsers);
    const { listTodos } = await import("./mock-todos");

    await expect(getUsers()).resolves.toEqual(realUsers);
    expect(backendFetch).toHaveBeenCalledWith("/users");
    expect(listTodos).not.toHaveBeenCalled();
  });

  it("getTodos delegates to backendFetch('/todos')", async () => {
    const { getTodos } = await import("./backend");
    const { backendFetch } = await import("./backend-client");
    (backendFetch as jest.Mock).mockResolvedValue([]);

    await getTodos();

    expect(backendFetch).toHaveBeenCalledWith("/todos");
  });

  it("createTodo delegates to backendFetch with a POST request", async () => {
    const { createTodo } = await import("./backend");
    const { backendFetch } = await import("./backend-client");
    const input = { title: "T", dueDate: "2026-01-01", assignee: "A", status: "未着手" as const };
    const created: Todo = { id: "1", ...input };
    (backendFetch as jest.Mock).mockResolvedValue(created);

    await expect(createTodo(input)).resolves.toEqual(created);
    expect(backendFetch).toHaveBeenCalledWith("/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  });

  it("deleteTodo delegates to backendFetch with a DELETE request", async () => {
    const { deleteTodo } = await import("./backend");
    const { backendFetch } = await import("./backend-client");
    (backendFetch as jest.Mock).mockResolvedValue(undefined);

    await deleteTodo("1");

    expect(backendFetch).toHaveBeenCalledWith("/todos/1", { method: "DELETE" });
  });
});
