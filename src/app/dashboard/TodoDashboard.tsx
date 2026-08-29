"use client";

import { useState, type FormEvent } from "react";
import type { Todo, TodoStatus } from "@/lib/backend";
import styles from "./dashboard.module.css";

const STATUSES: TodoStatus[] = ["未着手", "進行中", "完了", "保留"];

const STATUS_CLASS: Record<TodoStatus, string> = {
  未着手: styles.statusTodo,
  進行中: styles.statusInProgress,
  完了: styles.statusDone,
  保留: styles.statusOnHold,
};

type FormState = {
  title: string;
  dueDate: string;
  assignee: string;
  status: TodoStatus;
};

const EMPTY_FORM: FormState = {
  title: "",
  dueDate: "",
  assignee: "",
  status: "未着手",
};

export default function TodoDashboard({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState(initialTodos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openModal() {
    setForm(EMPTY_FORM);
    setError(null);
    setIsModalOpen(true);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("保存に失敗しました");
      }

      const todo: Todo = await response.json();
      setTodos((prev) => [...prev, todo]);
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("このTodoを削除しますか？")) {
      return;
    }

    const response = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (response.ok) {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Todoダッシュボード</h1>
        <button type="button" className={styles.addButton} onClick={openModal}>
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

      {isModalOpen && (
        <div className={styles.overlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <h2>Todoを追加</h2>
            <form onSubmit={handleSave}>
              <label className={styles.field}>
                Todo名
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </label>
              <label className={styles.field}>
                期限
                <input
                  type="date"
                  required
                  value={form.dueDate}
                  onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                />
              </label>
              <label className={styles.field}>
                担当者
                <input
                  type="text"
                  required
                  value={form.assignee}
                  onChange={(event) => setForm({ ...form, assignee: event.target.value })}
                />
              </label>
              <label className={styles.field}>
                ステータス
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value as TodoStatus })
                  }
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
