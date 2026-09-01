import { NextResponse } from "next/server";
import { deleteTodo, updateTodo, type TodoStatus } from "@/lib/backend";

const VALID_STATUSES: TodoStatus[] = ["未着手", "進行中", "完了", "保留"];

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/todos/[id]">
) {
  const { id } = await ctx.params;
  await deleteTodo(id);
  return new NextResponse(null, { status: 204 });
}

export async function PUT(request: Request, ctx: RouteContext<"/api/todos/[id]">) {
  const { id } = await ctx.params;
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

  const updated = await updateTodo(id, { title, dueDate, assignee, status });
  if (!updated) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}
