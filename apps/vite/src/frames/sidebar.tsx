import { getContext } from "remix/async-context-middleware";
import { Auth, type BadAuth, type GoodAuth } from "remix/auth-middleware";

import { ReloadSidebar } from "./sidebar.client.tsx";

export default function Sidebar() {
  const ctx = getContext();
  const auth = ctx.get(Auth) as GoodAuth<{ userId: string }> | BadAuth;

  const userId = auth.ok ? auth.identity.userId : undefined;

  return (
    <aside>
      <h2>sidebar{userId ? ` | ${userId}` : ""}</h2>
      <p>{new Date().toISOString()}</p>
      <CachedSidebar userId={userId} />
      <ReloadSidebar />
    </aside>
  );
}

async function CachedSidebar({ userId }: { userId?: string }) {
  "use cache";
  await new Promise((resolve) => setTimeout(resolve, 500));
  return (
    <>
      <p>expensive {userId ? ` ${userId}` : ""}</p>
      <p>{new Date().toISOString()}</p>
    </>
  );
}
