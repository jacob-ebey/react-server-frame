import { getContext } from "remix/async-context-middleware";
import { Auth, type BadAuth, type GoodAuth } from "remix/auth-middleware";

import { Document } from "../components/document.tsx";
import { Login } from "../components/login.tsx";
import { Logout } from "../components/logout.tsx";
import { routes } from "../routes.ts";

export default function Home() {
  const ctx = getContext();
  const auth = ctx.get(Auth) as GoodAuth<{ userId: string }> | BadAuth;

  return (
    <Document>
      <h1>Hello, World!</h1>
      <p>
        Go <a href={routes.frames.about.href()}>About</a>
      </p>
      <p>{new Date().toISOString()}</p>
      {auth.ok ? (
        <>
          <h2>Welcome {auth.identity.userId}</h2>
          <Logout />
        </>
      ) : (
        <Login />
      )}
    </Document>
  );
}
