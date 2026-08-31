import { NextResponse } from "next/server";
import { getUsers } from "@/lib/backend";

// BFFのエンドポイント。現在はモックデータを返すが、BACKEND_API_URLを設定すれば
// ここを変更することなく実バックエンドへのプロキシに切り替わる。
export async function GET() {
  const users = await getUsers();
  return NextResponse.json(users);
}
