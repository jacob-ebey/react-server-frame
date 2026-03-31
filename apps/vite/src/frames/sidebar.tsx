import { ReloadSidebar } from "./sidebar.client.tsx";

export default async function Sidebar() {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return (
    <aside>
      <p>sidebar {new Date().toISOString()}</p>
      <ReloadSidebar />
    </aside>
  );
}
