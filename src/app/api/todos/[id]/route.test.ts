/**
 * @jest-environment node
 */
import { DELETE, PUT } from "./route";
import * as backend from "@/lib/backend";
import type { Todo } from "@/lib/backend";

jest.mock("@/lib/backend");

const mockedBackend = jest.mocked(backend);

describe("DELETE /api/todos/[id]", () => {
  it("calls deleteTodo with the id from params and returns 204", async () => {
    mockedBackend.deleteTodo.mockResolvedValue(undefined);

    const response = await DELETE(new Request("http://localhost/api/todos/1"), {
      params: Promise.resolve({ id: "1" }),
    });

    expect(mockedBackend.deleteTodo).toHaveBeenCalledWith("1");
    expect(response.status).toBe(204);
  });
});

describe("PUT /api/todos/[id]", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  function putRequest(body: unknown) {
    return new Request("http://localhost/api/todos/1", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  it("calls updateTodo with the id and body, returning the updated todo with 200", async () => {
    const updated: Todo = {
      id: "1",
      title: "更新後",
      dueDate: "2026-11-01",
      assignee: "更新太郎",
      status: "完了",
    };
    mockedBackend.updateTodo.mockResolvedValue(updated);

    const response = await PUT(
      putRequest({ title: "更新後", dueDate: "2026-11-01", assignee: "更新太郎", status: "完了" }),
      { params: Promise.resolve({ id: "1" }) }
    );

    expect(mockedBackend.updateTodo).toHaveBeenCalledWith("1", {
      title: "更新後",
      dueDate: "2026-11-01",
      assignee: "更新太郎",
      status: "完了",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(updated);
  });

  it("returns 400 without calling updateTodo when a required field is missing", async () => {
    const response = await PUT(
      putRequest({ title: "", dueDate: "2026-11-01", assignee: "更新太郎", status: "完了" }),
      { params: Promise.resolve({ id: "1" }) }
    );

    expect(mockedBackend.updateTodo).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
  });

  it("returns 400 without calling updateTodo when status is not a valid value", async () => {
    const response = await PUT(
      putRequest({ title: "T", dueDate: "2026-11-01", assignee: "A", status: "invalid" }),
      { params: Promise.resolve({ id: "1" }) }
    );

    expect(mockedBackend.updateTodo).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
  });

  it("returns 404 when updateTodo finds no matching todo", async () => {
    mockedBackend.updateTodo.mockResolvedValue(undefined);

    const response = await PUT(
      putRequest({ title: "T", dueDate: "2026-11-01", assignee: "A", status: "完了" }),
      { params: Promise.resolve({ id: "does-not-exist" }) }
    );

    expect(response.status).toBe(404);
  });
});
