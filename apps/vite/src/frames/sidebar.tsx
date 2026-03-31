import { ReloadSidebar } from "./sidebar.client.tsx";
import styles from "./sidebar.module.css";

export default async function Sidebar() {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return (
    <aside className={styles.sidebar}>
      <h2>sidebar</h2>
      <p>{new Date().toISOString()}</p>
      <ReloadSidebar />
    </aside>
  );
}
