"use client";

import { startTransition, useActionState, useId } from "react";
import { loginAction } from "./login.actions.ts";

import styles from "./login.module.css";

export function Login() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  const errorId = useId();

  return (
    <form
      className={styles.login}
      action={action}
      onSubmit={(event) => {
        if (pending) {
          event.preventDefault();
          return;
        }
        const formData = new FormData(event.currentTarget);
        startTransition(() => action(formData));
        event.preventDefault();
      }}
    >
      <label>
        <span>User ID</span>
        <input type="text" name="userId" aria-labelledby={errorId} />
        {state?.error ? <span id={errorId}>{state.error}</span> : null}
      </label>
      <button aria-disabled={pending}>{pending ? "Logging in..." : "Login"}</button>
    </form>
  );
}
