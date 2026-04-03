"use client";

import { startTransition, useActionState } from "react";

import { Button } from "@/components/ui/button";
import type { logoutAction } from "@/lib/auth.actions";

export function LogoutForm({
  action,
  className,
}: {
  action: typeof logoutAction;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(event) => {
        if (!pending) {
          startTransition(() => formAction());
        }
        event.preventDefault();
      }}
    >
      <Button type="submit" disabled={pending} focusableWhenDisabled className="w-full">
        {state?.success ? state.message : pending ? "Logging out..." : "Log out"}
      </Button>
    </form>
  );
}
