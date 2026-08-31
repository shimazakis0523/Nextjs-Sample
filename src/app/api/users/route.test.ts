/**
 * @jest-environment node
 */
import { GET } from "./route";
import * as backend from "@/lib/backend";
import type { User } from "@/lib/mock-data";

jest.mock("@/lib/backend");

const mockedBackend = jest.mocked(backend);

describe("GET /api/users", () => {
  it("returns the users from getUsers", async () => {
    const users: User[] = [{ id: 1, name: "Taro Yamada", email: "taro@example.com" }];
    mockedBackend.getUsers.mockResolvedValue(users);

    const response = await GET();

    expect(await response.json()).toEqual(users);
  });
});
