"use client";

import { useState, type FormEvent } from "react";
import type { Todo, TodoStatus } from "@/lib/backend";
import styles from "./dashboard.module.css";

const STATUSES: TodoStatus[] = ["未着手", "進行中", "完了", "保留"];

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

type TodoNewModalProps = {
  onSaved: (todo: Todo) => void;
  onCancel: () => void;
};

export default function TodoNewModal({ onSaved, onCancel }: TodoNewModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      onSaved(todo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
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
            <button type="button" onClick={onCancel} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
