import { NextResponse } from "next/server";

// Sample BFF endpoint. Route Handlers under `src/app/api/**` run only on the
// server, so this is where calls to backend services / secrets should live —
// the browser never talks to the backend directly.
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
