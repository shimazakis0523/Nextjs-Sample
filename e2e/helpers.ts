import { type Page, expect } from "@playwright/test";

export type NewTodoInput = {
  title: string;
  dueDate: string;
  assignee: string;
  status?: "未着手" | "進行中" | "完了" | "保留";
};

/** Deletes every row currently in the list, accepting each confirm dialog. */
export async function clearAllTodos(page: Page) {
  while (true) {
    const rows = page.locator("table tbody tr");
    const count = await rows.count();
    if (count === 0) break;

    // The "no todos" empty-state row has no delete button -- stop if so.
    const deleteButton = rows.first().getByRole("button", { name: "削除" });
    if ((await deleteButton.count()) === 0) break;

    page.once("dialog", (dialog) => dialog.accept());
    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes("/api/todos/") && r.request().method() === "DELETE"
      ),
      deleteButton.click(),
    ]);
  }
}

/** Opens the Add modal, fills the form, and saves -- leaves the modal closed on success. */
export async function addTodoViaUI(page: Page, input: NewTodoInput) {
  await page.getByRole("button", { name: "+ Add" }).click();
  await expect(page.getByText("Todoを追加")).toBeVisible();

  await page.locator('input[type="text"]').first().fill(input.title);
  await page.locator('input[type="date"]').fill(input.dueDate);
  await page.locator('input[type="text"]').nth(1).fill(input.assignee);
  if (input.status) {
    await page.locator("select").selectOption(input.status);
  }

  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Todoを追加")).toBeHidden();
}

export function rowByTitle(page: Page, title: string) {
  return page.locator("table tbody tr", { has: page.getByText(title, { exact: true }) });
}
