import { backendFetch } from "./backend-client";
import { mockUsers, type User } from "./mock-data";

// Swap point between the mock backend and the real one. As long as
// BACKEND_API_URL is unset, Route Handlers get mock data with no other
// code changes; set it once the real backend exists to switch over.
const USE_MOCK_BACKEND = !process.env.BACKEND_API_URL;

export async function getUsers(): Promise<User[]> {
  if (USE_MOCK_BACKEND) {
    return mockUsers;
  }
  return backendFetch("/users");
}
