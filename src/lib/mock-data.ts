export type User = {
  id: number;
  name: string;
  email: string;
};

// Placeholder data standing in for the real backend's response shape.
// Replace with actual fields once the real backend's API is known.
export const mockUsers: User[] = [
  { id: 1, name: "Taro Yamada", email: "taro@example.com" },
  { id: 2, name: "Hanako Suzuki", email: "hanako@example.com" },
  { id: 3, name: "Jiro Sato", email: "jiro@example.com" },
];
