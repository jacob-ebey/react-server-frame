"use client";

import { RowsIcon } from "@phosphor-icons/react";
import { startTransition, useActionState, useId } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export type LoginResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

export function LoginForm({
  action,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  action: (_: LoginResult | undefined, formData: FormData) => Promise<LoginResult>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const handleInputId = useId();
  const handleInputErrorId = useId();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
        action={formAction}
        onSubmit={(event) => {
          if (!pending) {
            startTransition(() => formAction(new FormData(event.currentTarget)));
          }
          event.preventDefault();
        }}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a href="#" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <RowsIcon className="size-6" />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Acme Inc.</h1>
            <FieldDescription>Connect with your internet handle.</FieldDescription>
          </div>
          <Field>
            <FieldLabel hidden htmlFor={handleInputId}>
              Handle
            </FieldLabel>
            <Input
              name="handleOrDid"
              id={handleInputId}
              aria-labelledby={handleInputErrorId}
              type="text"
              placeholder="alice.xyz.social"
              required
              inputMode="url"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="username"
              spellCheck="false"
            />
            <FieldError id={handleInputErrorId}>
              {state?.success === false ? state.error : null}
            </FieldError>
          </Field>
          <Field>
            <Button type="submit" disabled={pending || state?.success} focusableWhenDisabled>
              {state?.success ? state.message : pending ? "Logging in..." : "Login"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <Separator />
      <FieldDescription className="px-6 text-center">
        By clicking login, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
