"use client";

import { startTransition, useActionState, useId } from "react";
import { loginAction } from "./login.actions.ts";

import buttonStyles from "./button.module.css";
import loginStyles from "./login.module.css";

export function Login() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  const errorId = useId();

  return (
    <form
      className={loginStyles.login}
      action={action}
      onSubmit={(event) => {
        if (pending) {
          event.preventDefault();
          return;
        }
        const formData = new FormData(event.currentTarget);
        event.preventDefault();
        startTransition(() => action(formData));
      }}
    >
      <label>
        <span>User ID</span>
        <input type="text" name="userId" aria-labelledby={errorId} />
        {state?.error ? (
          <span data-error id={errorId}>
            {state.error}
          </span>
        ) : null}
      </label>
      <div>
        <button className={buttonStyles.button}>{pending ? "Logging in..." : "Login"}</button>
      </div>
    </form>
  );
}
