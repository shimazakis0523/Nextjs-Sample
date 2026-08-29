import { NextResponse } from "next/server";
import { createTodo, getTodos, type TodoStatus } from "@/lib/backend";

const VALID_STATUSES: TodoStatus[] = ["未着手", "進行中", "完了", "保留"];

export async function GET() {
  const todos = await getTodos();
  return NextResponse.json(todos);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, dueDate, assignee, status } = body ?? {};

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof dueDate !== "string" ||
    !dueDate.trim() ||
    typeof assignee !== "string" ||
    !assignee.trim() ||
    !VALID_STATUSES.includes(status)
  ) {
    return NextResponse.json(
      { error: "title, dueDate, assignee, status are required" },
      { status: 400 }
    );
  }

  const todo = await createTodo({ title, dueDate, assignee, status });
  return NextResponse.json(todo, { status: 201 });
}
