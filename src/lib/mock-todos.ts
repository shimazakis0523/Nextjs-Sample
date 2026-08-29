export type TodoStatus = "未着手" | "進行中" | "完了" | "保留";

export type Todo = {
  id: string;
  title: string;
  dueDate: string;
  assignee: string;
  status: TodoStatus;
};

const initialTodos: Todo[] = [
  { id: "1", title: "サンプルタスク", dueDate: "2026-09-05", assignee: "山田太郎", status: "未着手" },
  { id: "2", title: "デザインレビュー", dueDate: "2026-09-10", assignee: "鈴木花子", status: "進行中" },
];

// Kept on globalThis so the list survives Next.js dev-server module reloads
// instead of resetting to initialTodos on every request. This is only a
// stand-in for the real backend's storage: on a serverless deployment
// (e.g. Vercel) each request can land on a different instance with its own
// memory, so writes here are not guaranteed to persist or be visible across
// requests in production. Once BACKEND_API_URL is set, backend.ts stops
// importing this module and none of that applies.
const globalStore = globalThis as unknown as { __mockTodos?: Todo[] };
globalStore.__mockTodos ??= [...initialTodos];

function todos(): Todo[] {
  return globalStore.__mockTodos!;
}

export function listTodos(): Todo[] {
  return todos();
}

export function addTodo(input: Omit<Todo, "id">): Todo {
  const todo: Todo = { ...input, id: crypto.randomUUID() };
  todos().push(todo);
  return todo;
}

export function removeTodo(id: string): void {
  const list = todos();
  const index = list.findIndex((todo) => todo.id === id);
  if (index !== -1) {
    list.splice(index, 1);
  }
}
