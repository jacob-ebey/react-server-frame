import { ReloadSidebar } from "./sidebar.client.tsx";
import styles from "./sidebar.module.css";

export default async function Sidebar() {
  "use cache";

  await new Promise((resolve) => setTimeout(resolve, 500));
  return (
    <aside className={styles.sidebar}>
      <h2>sidebar</h2>
      <p>{new Date().toISOString()}</p>
      <ReloadSidebar />
    </aside>
  );
}
