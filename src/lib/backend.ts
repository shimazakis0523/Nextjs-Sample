import { backendFetch } from "./backend-client";
import { mockUsers, type User } from "./mock-data";
import { addTodo, listTodos, removeTodo, type Todo, type TodoStatus } from "./mock-todos";

// Swap point between the mock backend and the real one. As long as
// BACKEND_API_URL is unset, Route Handlers get mock data with no other
// code changes; set it once the real backend exists to switch over.
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
