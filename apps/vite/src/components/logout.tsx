"use client";

import { useFormStatus } from "react-dom";
import { logout } from "./logout.actions.ts";

export function Logout() {
  return (
    <form action={logout}>
      <LogoutButton />
    </form>
  );
}

function LogoutButton() {
  const { pending } = useFormStatus();
  return <button>{pending ? "Logging out..." : "Logout"}</button>;
}
