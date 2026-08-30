export type User = {
  id: number;
  name: string;
  email: string;
};

// 実バックエンドのレスポンス形状を仮置きしたプレースホルダーデータ。
// 実バックエンドのAPIが確定したら実際のフィールドに置き換えること。
export const mockUsers: User[] = [
  { id: 1, name: "Taro Yamada", email: "taro@example.com" },
  { id: 2, name: "Hanako Suzuki", email: "hanako@example.com" },
  { id: 3, name: "Jiro Sato", email: "jiro@example.com" },
];
