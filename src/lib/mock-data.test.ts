/**
 * @jest-environment node
 */
import { mockUsers } from "./mock-data";

describe("mock-data", () => {
  it("provides seeded users with id/name/email", () => {
    expect(mockUsers.length).toBeGreaterThan(0);
    for (const user of mockUsers) {
      expect(typeof user.id).toBe("number");
      expect(typeof user.name).toBe("string");
      expect(typeof user.email).toBe("string");
    }
  });
});
