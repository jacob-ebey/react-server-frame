import { Document } from "@/components/document.tsx";
import { LoginForm } from "@/components/login-form.tsx";
import { LogoutForm } from "@/components/logout-form";
import { Separator } from "@/components/ui/separator";
import { getAuth } from "@/lib/auth";
import { loginAction, logoutAction } from "@/lib/auth.actions";

export default function Home() {
  const auth = getAuth();

  return (
    <Document>
      <main className="flex min-h-screen items-center justify-center p-4 py-24">
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
          <LoginForm action={loginAction} className="w-full max-w-md" />
        )}
      </main>
    </Document>
  );
}
