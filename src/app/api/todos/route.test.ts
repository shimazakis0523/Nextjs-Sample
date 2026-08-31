/**
 * @jest-environment node
 */
import { GET, POST } from "./route";
import * as backend from "@/lib/backend";
import type { Todo } from "@/lib/backend";

jest.mock("@/lib/backend");

const mockedBackend = jest.mocked(backend);

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/todos", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("GET /api/todos", () => {
  it("returns the todos from getTodos", async () => {
    const todos: Todo[] = [
      { id: "1", title: "サンプル", dueDate: "2026-01-01", assignee: "X", status: "未着手" },
    ];
    mockedBackend.getTodos.mockResolvedValue(todos);

    const response = await GET();

    expect(await response.json()).toEqual(todos);
  });
});

describe("POST /api/todos", () => {
  const validBody = {
    title: "新規タスク",
    dueDate: "2026-12-01",
    assignee: "担当太郎",
    status: "未着手",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("creates a todo and returns 201 for valid input", async () => {
    const created: Todo = { id: "1", ...validBody, status: "未着手" };
    mockedBackend.createTodo.mockResolvedValue(created);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(created);
    expect(mockedBackend.createTodo).toHaveBeenCalledWith(validBody);
  });

  it.each([
    ["title is missing", { ...validBody, title: undefined }],
    ["title is blank", { ...validBody, title: "  " }],
    ["dueDate is missing", { ...validBody, dueDate: undefined }],
    ["assignee is missing", { ...validBody, assignee: undefined }],
    ["status is missing", { ...validBody, status: undefined }],
    ["status is not one of the 4 valid values", { ...validBody, status: "不正な値" }],
  ])("returns 400 without calling createTodo when %s", async (_label, body) => {
    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mockedBackend.createTodo).not.toHaveBeenCalled();
  });

  it("returns 400 without calling createTodo when the JSON body is null", async () => {
    const response = await POST(makeRequest(null));

    expect(response.status).toBe(400);
    expect(mockedBackend.createTodo).not.toHaveBeenCalled();
  });
});
