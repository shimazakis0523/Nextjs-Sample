import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <a className={styles.link} href="/dashboard">
        Todoダッシュボードを開く
      </a>
      <a className={styles.link} href="/test-dashboard">
        テスト結果ダッシュボードを見る
      </a>
    </div>
  );
}
