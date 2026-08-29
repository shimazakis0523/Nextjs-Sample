import { getTodos } from "@/lib/backend";
import TodoDashboard from "./TodoDashboard";

export default async function DashboardPage() {
  const todos = await getTodos();

  return <TodoDashboard initialTodos={todos} />;
}
