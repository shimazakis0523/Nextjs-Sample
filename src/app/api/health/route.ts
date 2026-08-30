import { NextResponse } from "next/server";

// サンプルのBFFエンドポイント。`src/app/api/**`配下のRoute Handlerはサーバー側でのみ
// 実行されるため、バックエンドサービスの呼び出しやシークレットの扱いはここに置く —
// ブラウザが直接バックエンドと通信することはない。
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
