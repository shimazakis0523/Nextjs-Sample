import { test, expect } from "@playwright/test";
import { addTodoViaUI, clearAllTodos, rowByTitle } from "./helpers";

// Covers specs/001-todo-dashboard/screens/todo-list/e2e-test-spec.md.
// Tests run sequentially (playwright.config.ts: fullyParallel=false, workers=1)
// against one shared in-memory mock store, so each test clears the list first
// to control its own starting state instead of relying on run order.

test.beforeEach(async ({ page }) => {
  await page.goto("/dashboard");
  await clearAllTodos(page);
});

test("TC-002: 0件のとき「Todoがありません」が表示される", async ({ page }) => {
  await expect(page.getByText("Todoがありません")).toBeVisible();
  await expect(page.locator("table tbody tr td[colspan]")).toBeVisible();
});

test("TC-007: 見出しが「Todoダッシュボード」固定で表示される", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Todoダッシュボード" })).toBeVisible();
});

test("TC-001, TC-008, TC-011: 追加順(古い順)で一覧表示され、各列が正しく表示される", async ({
  page,
}) => {
  await addTodoViaUI(page, {
    title: "先に追加したタスク",
    dueDate: "2026-10-01",
    assignee: "山田太郎",
    status: "未着手",
  });
  await addTodoViaUI(page, {
    title: "後で追加したタスク",
    dueDate: "2026-11-15",
    assignee: "鈴木花子",
    status: "完了",
  });

  await page.reload();

  const rows = page.locator("table tbody tr");
  await expect(rows).toHaveCount(2);

  const firstRowCells = await rows.nth(0).locator("td").allInnerTexts();
  expect(firstRowCells[0]).toBe("先に追加したタスク");
  expect(firstRowCells[1]).toBe("2026-10-01");
  expect(firstRowCells[2]).toBe("山田太郎");
  expect(firstRowCells[3]).toContain("未着手");

  const secondRowCells = await rows.nth(1).locator("td").allInnerTexts();
  expect(secondRowCells[0]).toBe("後で追加したタスク");
});

test("TC-009: ステータスバッジが4種類とも正しく表示される", async ({ page }) => {
  const statuses = ["未着手", "進行中", "完了", "保留"] as const;
  for (const status of statuses) {
    await addTodoViaUI(page, {
      title: `${status}タスク`,
      dueDate: "2026-10-01",
      assignee: "担当者",
      status,
    });
  }

  for (const status of statuses) {
    await expect(rowByTitle(page, `${status}タスク`)).toContainText(status);
  }
});

test("TC-003: Addボタンをクリックするとtodo-new(モーダル)が表示される", async ({ page }) => {
  await page.getByRole("button", { name: "+ Add" }).click();
  await expect(page.getByText("Todoを追加")).toBeVisible();
});

test("TC-004, TC-010, TC-012: 削除確認OKで該当行のみ削除される", async ({ page }) => {
  await addTodoViaUI(page, {
    title: "残すタスク",
    dueDate: "2026-10-01",
    assignee: "A",
    status: "未着手",
  });
  await addTodoViaUI(page, {
    title: "消すタスク",
    dueDate: "2026-10-02",
    assignee: "B",
    status: "未着手",
  });

  page.once("dialog", (dialog) => dialog.accept());
  const [deleteResponse] = await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes("/api/todos/") && r.request().method() === "DELETE"
    ),
    rowByTitle(page, "消すタスク").getByRole("button", { name: "削除" }).click(),
  ]);

  expect(deleteResponse.status()).toBe(204);
  await expect(rowByTitle(page, "消すタスク")).toHaveCount(0);
  await expect(rowByTitle(page, "残すタスク")).toHaveCount(1);
});

test("TC-005: 削除確認でキャンセルすると一覧は変更されない", async ({ page }) => {
  await addTodoViaUI(page, {
    title: "キャンセル対象タスク",
    dueDate: "2026-10-01",
    assignee: "A",
    status: "未着手",
  });

  page.once("dialog", (dialog) => dialog.dismiss());
  await rowByTitle(page, "キャンセル対象タスク").getByRole("button", { name: "削除" }).click();
  await page.waitForTimeout(300);

  await expect(rowByTitle(page, "キャンセル対象タスク")).toHaveCount(1);
});

test("TC-006: 削除リクエスト失敗時、一覧は変更されずエラー表示もない", async ({ page }) => {
  await addTodoViaUI(page, {
    title: "削除失敗タスク",
    dueDate: "2026-10-01",
    assignee: "A",
    status: "未着手",
  });

  await page.route("**/api/todos/*", (route) => {
    if (route.request().method() === "DELETE") {
      return route.fulfill({ status: 500, body: "" });
    }
    return route.continue();
  });

  page.once("dialog", (dialog) => dialog.accept());
  await rowByTitle(page, "削除失敗タスク").getByRole("button", { name: "削除" }).click();
  await page.waitForTimeout(500);

  await expect(rowByTitle(page, "削除失敗タスク")).toHaveCount(1);
  // TodoList.tsx has no error-message UI at all for a failed delete (spec:
  // "失敗した旨は表示しない") -- confirm the registration-failure message
  // text specifically never appears, rather than a substring that would
  // also match this test's own todo title ("削除失敗タスク").
  await expect(page.getByText("保存に失敗しました")).toHaveCount(0);
});
