const BACKEND_API_URL = process.env.BACKEND_API_URL;

// Thin wrapper for calls from Route Handlers / Server Components to the
// upstream backend. Only import this from server-side code (API routes,
// Server Components, Server Actions) — BACKEND_API_URL is not exposed to
// the browser.
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
