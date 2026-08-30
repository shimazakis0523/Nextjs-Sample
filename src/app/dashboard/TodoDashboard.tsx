"use client";

import { useState } from "react";
import type { Todo } from "@/lib/backend";
import TodoList from "./TodoList";
import TodoNewModal from "./TodoNewModal";
import styles from "./dashboard.module.css";

export default function TodoDashboard({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState(initialTodos);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleDeleted(id: string) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  function handleSaved(todo: Todo) {
    setTodos((prev) => [...prev, todo]);
    setIsModalOpen(false);
  }

  return (
    <div className={styles.page}>
      <TodoList todos={todos} onDeleted={handleDeleted} onAddClick={() => setIsModalOpen(true)} />
      {isModalOpen && (
        <TodoNewModal onSaved={handleSaved} onCancel={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
