import { NextResponse } from "next/server";
import { deleteTodo } from "@/lib/backend";

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/todos/[id]">
) {
  const { id } = await ctx.params;
  await deleteTodo(id);
  return new NextResponse(null, { status: 204 });
}
