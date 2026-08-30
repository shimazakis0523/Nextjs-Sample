import { test, expect } from "@playwright/test";
import { clearAllTodos } from "./helpers";

// Covers specs/001-todo-dashboard/screens/todo-new/e2e-test-spec.md.
// Tests run sequentially (playwright.config.ts: fullyParallel=false, workers=1).

test.beforeEach(async ({ page }) => {
  await page.goto("/dashboard");
  await clearAllTodos(page);
  await page.getByRole("button", { name: "+ Add" }).click();
  await expect(page.getByText("Todoを追加")).toBeVisible();
});

test("TC-006: 初期表示で各項目が既定状態になっている", async ({ page }) => {
  await expect(page.getByText("Todoを追加")).toBeVisible();
  await expect(page.locator('input[type="text"]').first()).toHaveValue("");
  await expect(page.locator('input[type="date"]')).toHaveValue("");
  await expect(page.locator('input[type="text"]').nth(1)).toHaveValue("");
  await expect(page.locator("select")).toHaveValue("未着手");
});

test("TC-011: ステータスの4選択肢がこの順で選択できる", async ({ page }) => {
  const options = await page.locator("select option").allTextContents();
  expect(options).toEqual(["未着手", "進行中", "完了", "保留"]);
});

test("TC-001, TC-013: 必須項目を入力してSaveすると登録され画面が閉じる(失敗メッセージなし)", async ({
  page,
}) => {
  await page.locator('input[type="text"]').first().fill("新規タスク");
  await page.locator('input[type="date"]').fill("2026-12-01");
  await page.locator('input[type="text"]').nth(1).fill("担当太郎");

  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Todoを追加")).toBeHidden();
  await expect(page.getByText("保存に失敗しました")).toHaveCount(0);
  await expect(page.locator("table tbody tr", { hasText: "新規タスク" })).toHaveCount(1);
});

test("TC-002, TC-007: Todo名が未入力だと送信がブロックされる", async ({ page }) => {
  await page.locator('input[type="date"]').fill("2026-12-01");
  await page.locator('input[type="text"]').nth(1).fill("担当太郎");

  await page.getByRole("button", { name: "Save" }).click();

  // native HTML required-field validation blocks submission -- modal stays open
  await expect(page.getByText("Todoを追加")).toBeVisible();
});

test("TC-008: 期限が未入力だと送信がブロックされる", async ({ page }) => {
  await page.locator('input[type="text"]').first().fill("タイトル");
  await page.locator('input[type="text"]').nth(1).fill("担当太郎");

  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Todoを追加")).toBeVisible();
});

test("TC-009: 担当者が未入力だと送信がブロックされる", async ({ page }) => {
  await page.locator('input[type="text"]').first().fill("タイトル");
  await page.locator('input[type="date"]').fill("2026-12-01");

  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Todoを追加")).toBeVisible();
});

test("TC-010: 期限に過去日を指定してもブロックされず登録できる", async ({ page }) => {
  await page.locator('input[type="text"]').first().fill("過去日タスク");
  await page.locator('input[type="date"]').fill("2020-01-01");
  await page.locator('input[type="text"]').nth(1).fill("担当太郎");

  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Todoを追加")).toBeHidden();
  await expect(page.locator("table tbody tr", { hasText: "過去日タスク" })).toHaveCount(1);
});

test("TC-003: 登録失敗時はモーダルが開いたまま失敗メッセージが表示され入力が保持される", async ({
  page,
}) => {
  await page.route("**/api/todos", (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({ status: 500, body: "" });
    }
    return route.continue();
  });

  await page.locator('input[type="text"]').first().fill("失敗するタスク");
  await page.locator('input[type="date"]').fill("2026-12-01");
  await page.locator('input[type="text"]').nth(1).fill("担当太郎");

  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("保存に失敗しました")).toBeVisible();
  await expect(page.getByText("Todoを追加")).toBeVisible();
  await expect(page.locator('input[type="text"]').first()).toHaveValue("失敗するタスク");
});

test("TC-012: 保存処理中はSaveが「Saving...」になりCancel/Saveとも操作不可になる", async ({
  page,
}) => {
  await page.route("**/api/todos", async (route) => {
    if (route.request().method() === "POST") {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
    return route.continue();
  });

  await page.locator('input[type="text"]').first().fill("保存中確認タスク");
  await page.locator('input[type="date"]').fill("2026-12-01");
  await page.locator('input[type="text"]').nth(1).fill("担当太郎");

  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByRole("button", { name: "Saving..." })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Cancel" })).toBeDisabled();
});

test("TC-004: Cancelボタンで画面が閉じ登録処理は呼ばれない", async ({ page }) => {
  let postCalled = false;
  await page.route("**/api/todos", (route) => {
    if (route.request().method() === "POST") postCalled = true;
    return route.continue();
  });

  await page.getByRole("button", { name: "Cancel" }).click();

  await expect(page.getByText("Todoを追加")).toBeHidden();
  expect(postCalled).toBe(false);
});

test("TC-005: モーダル外側クリックで画面が閉じ登録処理は呼ばれない", async ({ page }) => {
  let postCalled = false;
  await page.route("**/api/todos", (route) => {
    if (route.request().method() === "POST") postCalled = true;
    return route.continue();
  });

  await page.locator('[class*="overlay"]').click({ position: { x: 5, y: 5 } });

  await expect(page.getByText("Todoを追加")).toBeHidden();
  expect(postCalled).toBe(false);
});

test("TC-014: Escキーを押しても画面は閉じない", async ({ page }) => {
  await page.keyboard.press("Escape");

  await expect(page.getByText("Todoを追加")).toBeVisible();
});
