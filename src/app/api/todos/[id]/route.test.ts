/**
 * @jest-environment node
 */
import { DELETE } from "./route";
import * as backend from "@/lib/backend";

jest.mock("@/lib/backend");

const mockedBackend = jest.mocked(backend);

describe("DELETE /api/todos/[id]", () => {
  it("calls deleteTodo with the id from params and returns 204", async () => {
    mockedBackend.deleteTodo.mockResolvedValue(undefined);

    const response = await DELETE(new Request("http://localhost/api/todos/1"), {
      params: Promise.resolve({ id: "1" }),
    });

    expect(mockedBackend.deleteTodo).toHaveBeenCalledWith("1");
    expect(response.status).toBe(204);
  });
});
