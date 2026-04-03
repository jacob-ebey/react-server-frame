"use client";

import { Button } from "@/components/ui/button";
import { startTransition, useActionState } from "react";

export type LogoutResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

export function LogoutForm({
  action,
  className,
}: {
  action: (_: LogoutResult | undefined) => Promise<LogoutResult>;
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
