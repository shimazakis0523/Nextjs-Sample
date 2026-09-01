import { test, expect } from "@playwright/test";
import { addTodoViaUI, clearAllTodos, openEditModal } from "./helpers";

// Covers doc/フロントエンド設計書/業務1_Todoダッシュボード/E2E仕様書_Todo編集.md.
// Tests run sequentially (playwright.config.ts: fullyParallel=false, workers=1).

const SEED_TODO = {
  title: "編集対象タスク",
  dueDate: "2026-09-05",
  assignee: "山田太郎",
  status: "未着手" as const,
};

test.beforeEach(async ({ page }) => {
  await page.goto("/dashboard");
  await clearAllTodos(page);
  await addTodoViaUI(page, SEED_TODO);
  await openEditModal(page, SEED_TODO.title);
});

test("TC-001: 正常系: 既存のTodoを編集する", async ({ page }) => {
  await page.locator('input[type="text"]').first().fill("更新後タスク");
  await page.locator("select").selectOption("完了");

  await page.getByRole("button", { name: "更新" }).click();

  await expect(page.getByText("Todoを編集")).toBeHidden();
  await expect(page.locator("table tbody tr", { hasText: "更新後タスク" })).toHaveCount(1);
  await expect(page.locator("table tbody tr", { hasText: SEED_TODO.title })).toHaveCount(0);
});

test("TC-002, TC-006: Todo名を空にすると送信がブロックされる", async ({ page }) => {
  await page.locator('input[type="text"]').first().fill("");

  await page.getByRole("button", { name: "更新" }).click();

  await expect(page.getByText("Todoを編集")).toBeVisible();
});

test("TC-007: 期限を空にすると送信がブロックされる", async ({ page }) => {
  await page.locator('input[type="date"]').fill("");

  await page.getByRole("button", { name: "更新" }).click();

  await expect(page.getByText("Todoを編集")).toBeVisible();
});

test("TC-008: 担当者を空にすると送信がブロックされる", async ({ page }) => {
  await page.locator('input[type="text"]').nth(1).fill("");

  await page.getByRole("button", { name: "更新" }).click();

  await expect(page.getByText("Todoを編集")).toBeVisible();
});

test("TC-009: ステータスの4選択肢がこの順で選択できる", async ({ page }) => {
  const options = await page.locator("select option").allTextContents();
  expect(options).toEqual(["未着手", "進行中", "完了", "保留"]);
});

test("TC-010: 初期表示時に対象Todoの現在値が反映されている", async ({ page }) => {
  await expect(page.locator('input[type="text"]').first()).toHaveValue(SEED_TODO.title);
  await expect(page.locator('input[type="date"]')).toHaveValue(SEED_TODO.dueDate);
  await expect(page.locator('input[type="text"]').nth(1)).toHaveValue(SEED_TODO.assignee);
  await expect(page.locator("select")).toHaveValue(SEED_TODO.status);
});

test("TC-011: 期限を過去日に変更しても更新できる", async ({ page }) => {
  await page.locator('input[type="date"]').fill("2020-01-01");

  await page.getByRole("button", { name: "更新" }).click();

  await expect(page.getByText("Todoを編集")).toBeHidden();
});

test("TC-003: 更新失敗時はモーダルが開いたまま失敗メッセージが表示され入力が保持される", async ({
  page,
}) => {
  await page.route("**/api/todos/*", (route) => {
    if (route.request().method() === "PUT") {
      return route.fulfill({ status: 500, body: "" });
    }
    return route.continue();
  });

  await page.locator('input[type="text"]').first().fill("失敗するタスク");
  await page.getByRole("button", { name: "更新" }).click();

  await expect(page.getByText("更新に失敗しました")).toBeVisible();
  await expect(page.getByText("Todoを編集")).toBeVisible();
  await expect(page.locator('input[type="text"]').first()).toHaveValue("失敗するタスク");
});

test("TC-013: 更新中はCancel/更新ボタンが操作不可になる", async ({ page }) => {
  await page.route("**/api/todos/*", async (route) => {
    if (route.request().method() === "PUT") {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
    return route.continue();
  });

  await page.getByRole("button", { name: "更新" }).click();

  await expect(page.getByRole("button", { name: "更新中..." })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Cancel" })).toBeDisabled();
});

test("TC-014: 失敗表示中に再度更新をクリックすると更新中状態に遷移する", async ({ page }) => {
  let putCallCount = 0;
  await page.route("**/api/todos/*", async (route) => {
    if (route.request().method() === "PUT") {
      putCallCount += 1;
      if (putCallCount === 1) {
        return route.fulfill({ status: 500, body: "" });
      }
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
    return route.continue();
  });

  await page.getByRole("button", { name: "更新" }).click();
  await expect(page.getByText("更新に失敗しました")).toBeVisible();

  await page.getByRole("button", { name: "更新" }).click();

  await expect(page.getByRole("button", { name: "更新中..." })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Cancel" })).toBeDisabled();
});

test("TC-015: 更新成功時は失敗メッセージが表示されない", async ({ page }) => {
  await page.getByRole("button", { name: "更新" }).click();

  await expect(page.getByText("Todoを編集")).toBeHidden();
  await expect(page.getByText("更新に失敗しました")).toHaveCount(0);
});

test("TC-004: Cancelボタンで画面が閉じ更新処理は呼ばれない", async ({ page }) => {
  let putCalled = false;
  await page.route("**/api/todos/*", (route) => {
    if (route.request().method() === "PUT") putCalled = true;
    return route.continue();
  });

  await page.getByRole("button", { name: "Cancel" }).click();

  await expect(page.getByText("Todoを編集")).toBeHidden();
  expect(putCalled).toBe(false);
  await expect(page.locator("table tbody tr", { hasText: SEED_TODO.title })).toHaveCount(1);
});

test("TC-005: モーダル外側クリックで画面が閉じ更新処理は呼ばれない", async ({ page }) => {
  let putCalled = false;
  await page.route("**/api/todos/*", (route) => {
    if (route.request().method() === "PUT") putCalled = true;
    return route.continue();
  });

  await page.locator('[class*="overlay"]').click({ position: { x: 5, y: 5 } });

  await expect(page.getByText("Todoを編集")).toBeHidden();
  expect(putCalled).toBe(false);
});

test("TC-012: Escキーを押しても画面は閉じない", async ({ page }) => {
  await page.keyboard.press("Escape");

  await expect(page.getByText("Todoを編集")).toBeVisible();
});
