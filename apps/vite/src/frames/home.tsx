import { Document } from "@/components/document.tsx";
import { LoginForm } from "@/components/login-form.tsx";
import { LogoutForm } from "@/components/logout-form";
import { Separator } from "@/components/ui/separator";
import { atmosphereIdentifierSessionKey, getAuth } from "@/lib/auth";
import { loginAction, logoutAction } from "@/lib/auth.actions";
import { routes } from "@/routes";
import { getContext } from "remix/async-context-middleware";
import { Session } from "remix/session";

export default function Home() {
  const { get } = getContext();
  const auth = getAuth();
  const session = get(Session);
  const handleOrDid = session.get(atmosphereIdentifierSessionKey) as string | undefined;

  return (
    <Document>
      <main className="flex min-h-screen items-center justify-center p-4 py-24">
        <p>
          <a href={routes.frames.protected.href()}>Protected Route</a>
        </p>
        {auth.ok ? (
          <div className="w-full max-w-md flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-xl font-bold">
                Welcome{" "}
                {auth.identity.displayName === auth.identity.did
                  ? auth.identity.did
                  : `@${auth.identity.displayName}`}
              </h1>
            </div>
            <Separator />
            <LogoutForm action={logoutAction} />
          </div>
        ) : (
          <LoginForm action={loginAction} handleOrDid={handleOrDid} className="w-full max-w-md" />
        )}
      </main>
    </Document>
  );
}
