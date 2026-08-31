/**
 * @jest-environment node
 */
import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns status ok", async () => {
    const response = await GET();

    expect(await response.json()).toEqual({ status: "ok" });
  });
});
