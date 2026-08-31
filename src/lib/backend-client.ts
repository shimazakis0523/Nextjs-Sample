const BACKEND_API_URL = process.env.BACKEND_API_URL;

// Route Handler / Server Componentから上流バックエンドを呼び出すための薄いラッパー。
// サーバー側コード(APIルート・Server Component・Server Action)からのみimportすること —
// BACKEND_API_URLはブラウザには公開されない。
export async function backendFetch(path: string, init?: RequestInit) {
  if (!BACKEND_API_URL) {
    throw new Error("BACKEND_API_URL is not set");
  }

  const response = await fetch(`${BACKEND_API_URL}${path}`, init);

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
}
