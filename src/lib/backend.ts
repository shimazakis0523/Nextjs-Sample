import { backendFetch } from "./backend-client";
import { mockUsers, type User } from "./mock-data";
import { addTodo, listTodos, removeTodo, type Todo, type TodoStatus } from "./mock-todos";

// モックバックエンドと実バックエンドの切り替え地点。BACKEND_API_URLが未設定である限り、
// Route Handlerは他のコード変更なしにモックデータを取得する。実バックエンドができたら
// これを設定するだけで切り替わる。
const USE_MOCK_BACKEND = !process.env.BACKEND_API_URL;

export type { Todo, TodoStatus };

export async function getUsers(): Promise<User[]> {
  if (USE_MOCK_BACKEND) {
    return mockUsers;
  }
  return backendFetch("/users");
}

export async function getTodos(): Promise<Todo[]> {
  if (USE_MOCK_BACKEND) {
    return listTodos();
  }
  return backendFetch("/todos");
}

export async function createTodo(input: Omit<Todo, "id">): Promise<Todo> {
  if (USE_MOCK_BACKEND) {
    return addTodo(input);
  }
  return backendFetch("/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function deleteTodo(id: string): Promise<void> {
  if (USE_MOCK_BACKEND) {
    removeTodo(id);
    return;
  }
  await backendFetch(`/todos/${id}`, { method: "DELETE" });
}
