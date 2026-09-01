import type { Metadata } from "next";
import type { Todo, TodoStatus } from "@/lib/backend";
import dashboardStyles from "../dashboard/dashboard.module.css";
import styles from "./mockup.module.css";

export const metadata: Metadata = {
  title: "UIモックアップ | Todoダッシュボード",
  description:
    "Todo一覧・Todo新規登録の静的UIモックアップ(doc/common/adr/0004-mockup-first-requirements.md)。",
};

const STATUS_CLASS: Record<TodoStatus, string> = {
  未着手: dashboardStyles.statusTodo,
  進行中: dashboardStyles.statusInProgress,
  完了: dashboardStyles.statusDone,
  保留: dashboardStyles.statusOnHold,
};

const SAMPLE_TODOS: Todo[] = [
  { id: "1", title: "サンプルタスク", dueDate: "2026-09-05", assignee: "山田太郎", status: "未着手" },
  { id: "2", title: "デザインレビュー", dueDate: "2026-09-10", assignee: "鈴木花子", status: "進行中" },
  { id: "3", title: "テスト計画作成", dueDate: "2026-09-12", assignee: "佐藤次郎", status: "完了" },
  { id: "4", title: "本番リリース準備", dueDate: "2026-09-20", assignee: "田中一郎", status: "保留" },
];

const STATUSES: TodoStatus[] = ["未着手", "進行中", "完了", "保留"];

export default function MockupPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h1 className={styles.title}>UIモックアップ: Todoダッシュボード</h1>
        <p className={styles.lead}>
          Todo一覧・Todo新規登録の画面定義書に基づく静的モックアップです(操作は行えません)。
          <br />
          doc/common/adr/0004-mockup-first-requirements.mdに基づき、実装済み画面のスナップショット
          として、各ユースケース記述_*.mdのヘッダーから参照されています。
        </p>
      </header>

      <section className={styles.screen} aria-labelledby="todo-list-heading">
        <h2 id="todo-list-heading" className={styles.screenTitle}>
          Todo一覧
        </h2>
        <div className={styles.frame}>
          <div className={dashboardStyles.header}>
            <h1>Todoダッシュボード</h1>
            <button type="button" className={dashboardStyles.addButton}>
              + Add
            </button>
          </div>

          <table className={dashboardStyles.table}>
            <thead>
              <tr>
                <th>Todo名</th>
                <th>期限</th>
                <th>担当者</th>
                <th>ステータス</th>
                <th>
                  <span className={dashboardStyles.visuallyHidden}>操作</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_TODOS.map((todo) => (
                <tr key={todo.id}>
                  <td>{todo.title}</td>
                  <td>{todo.dueDate}</td>
                  <td>{todo.assignee}</td>
                  <td>
                    <span
                      className={`${dashboardStyles.statusBadge} ${STATUS_CLASS[todo.status]}`}
                    >
                      {todo.status}
                    </span>
                  </td>
                  <td>
                    <button type="button" className={dashboardStyles.deleteButton}>
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.frameNote}>
            ※ Todoが0件のときは、一覧の代わりに「Todoがありません」という空状態メッセージを表示する。
          </p>
        </div>
      </section>

      <section className={styles.screen} aria-labelledby="todo-new-heading">
        <h2 id="todo-new-heading" className={styles.screenTitle}>
          Todo新規登録(モーダル)
        </h2>
        <div className={`${styles.frame} ${styles.frameDark}`}>
          <div className={dashboardStyles.overlay} style={{ position: "static" }}>
            <div className={dashboardStyles.modal}>
              <h2>Todoを追加</h2>
              <label className={dashboardStyles.field}>
                Todo名
                <input type="text" defaultValue="" readOnly />
              </label>
              <label className={dashboardStyles.field}>
                期限
                <input type="date" defaultValue="" readOnly />
              </label>
              <label className={dashboardStyles.field}>
                担当者
                <input type="text" defaultValue="" readOnly />
              </label>
              <label className={dashboardStyles.field}>
                ステータス
                <select defaultValue={STATUSES[0]} disabled>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <div className={dashboardStyles.modalActions}>
                <button type="button" disabled>
                  Cancel
                </button>
                <button type="button" className={dashboardStyles.saveButton} disabled>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
