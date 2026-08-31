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

// Next.jsの開発サーバーがモジュールをリロードしてもリストが初期化されない(毎リクエスト
// initialTodosに戻らない)よう、globalThisに保持している。あくまで実バックエンドの
// ストレージの代わりに過ぎない: サーバーレスデプロイ(Vercel等)では各リクエストが
// メモリを共有しない別インスタンスに振られることがあるため、本番環境ではここへの
// 書き込みが永続化・他リクエストへの反映を保証されない。BACKEND_API_URLを設定すると
// backend.tsはこのモジュールをimportしなくなり、上記の制約は関係なくなる。
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
