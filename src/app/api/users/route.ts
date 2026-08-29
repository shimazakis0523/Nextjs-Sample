import { NextResponse } from "next/server";
import { getUsers } from "@/lib/backend";

// BFF endpoint. Serves mock data today; once BACKEND_API_URL is set this
// starts proxying the real backend without any change here.
export async function GET() {
  const users = await getUsers();
  return NextResponse.json(users);
}
