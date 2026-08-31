"use client";

import type { Todo, TodoStatus } from "@/lib/backend";
import styles from "./dashboard.module.css";

const STATUS_CLASS: Record<TodoStatus, string> = {
  未着手: styles.statusTodo,
  進行中: styles.statusInProgress,
  完了: styles.statusDone,
  保留: styles.statusOnHold,
};

type TodoListProps = {
  todos: Todo[];
  onDeleted: (id: string) => void;
  onAddClick: () => void;
};

export default function TodoList({ todos, onDeleted, onAddClick }: TodoListProps) {
  async function handleDelete(id: string) {
    if (!window.confirm("このTodoを削除しますか？")) {
      return;
    }

    const response = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (response.ok) {
      onDeleted(id);
    }
  }

  return (
    <>
      <div className={styles.header}>
        <h1>Todoダッシュボード</h1>
        <button type="button" className={styles.addButton} onClick={onAddClick}>
          + Add
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Todo名</th>
            <th>期限</th>
            <th>担当者</th>
            <th>ステータス</th>
            <th aria-label="操作"></th>
          </tr>
        </thead>
        <tbody>
          {todos.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles.empty}>
                Todoがありません
              </td>
            </tr>
          ) : (
            todos.map((todo) => (
              <tr key={todo.id}>
                <td>{todo.title}</td>
                <td>{todo.dueDate}</td>
                <td>{todo.assignee}</td>
                <td>
                  <span className={`${styles.statusBadge} ${STATUS_CLASS[todo.status]}`}>
                    {todo.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => handleDelete(todo.id)}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
