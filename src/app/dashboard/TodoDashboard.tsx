"use client";

import { useState } from "react";
import type { Todo } from "@/lib/backend";
import TodoList from "./TodoList";
import TodoNewModal from "./TodoNewModal";
import TodoEditModal from "./TodoEditModal";
import styles from "./dashboard.module.css";

export default function TodoDashboard({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState(initialTodos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  function handleDeleted(id: string) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  function handleSaved(todo: Todo) {
    setTodos((prev) => [...prev, todo]);
    setIsModalOpen(false);
  }

  function handleUpdated(todo: Todo) {
    setTodos((prev) => prev.map((current) => (current.id === todo.id ? todo : current)));
    setEditingTodo(null);
  }

  return (
    <div className={styles.page}>
      <TodoList
        todos={todos}
        onDeleted={handleDeleted}
        onEditClick={setEditingTodo}
        onAddClick={() => setIsModalOpen(true)}
      />
      {isModalOpen && (
        <TodoNewModal onSaved={handleSaved} onCancel={() => setIsModalOpen(false)} />
      )}
      {editingTodo && (
        <TodoEditModal
          todo={editingTodo}
          onUpdated={handleUpdated}
          onCancel={() => setEditingTodo(null)}
        />
      )}
    </div>
  );
}
