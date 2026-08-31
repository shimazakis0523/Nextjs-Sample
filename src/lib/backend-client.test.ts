/**
 * @jest-environment node
 */
const ORIGINAL_BACKEND_API_URL = process.env.BACKEND_API_URL;
const ORIGINAL_FETCH = global.fetch;

afterEach(() => {
  process.env.BACKEND_API_URL = ORIGINAL_BACKEND_API_URL;
  global.fetch = ORIGINAL_FETCH;
  jest.resetModules();
});

describe("backendFetch", () => {
  it("throws when BACKEND_API_URL is not set", async () => {
    delete process.env.BACKEND_API_URL;
    jest.resetModules();
    const { backendFetch } = await import("./backend-client");

    await expect(backendFetch("/todos")).rejects.toThrow("BACKEND_API_URL is not set");
  });

  it("fetches from BACKEND_API_URL + path and returns the parsed JSON body", async () => {
    process.env.BACKEND_API_URL = "https://backend.example.com";
    jest.resetModules();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ hello: "world" }),
    });
    const { backendFetch } = await import("./backend-client");

    const result = await backendFetch("/todos");

    expect(global.fetch).toHaveBeenCalledWith("https://backend.example.com/todos", undefined);
    expect(result).toEqual({ hello: "world" });
  });

  it("passes the init argument through to fetch", async () => {
    process.env.BACKEND_API_URL = "https://backend.example.com";
    jest.resetModules();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({}),
    });
    const { backendFetch } = await import("./backend-client");
    const init = { method: "POST", body: "{}" };

    await backendFetch("/todos", init);

    expect(global.fetch).toHaveBeenCalledWith("https://backend.example.com/todos", init);
  });

  it("returns undefined for a 204 response without parsing a body", async () => {
    process.env.BACKEND_API_URL = "https://backend.example.com";
    jest.resetModules();
    const json = jest.fn();
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 204, json });
    const { backendFetch } = await import("./backend-client");

    const result = await backendFetch("/todos/1", { method: "DELETE" });

    expect(result).toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  it("throws with the status and statusText when the response is not ok", async () => {
    process.env.BACKEND_API_URL = "https://backend.example.com";
    jest.resetModules();
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });
    const { backendFetch } = await import("./backend-client");

    await expect(backendFetch("/todos")).rejects.toThrow(
      "Backend request failed: 500 Internal Server Error"
    );
  });
});
