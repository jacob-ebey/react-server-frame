"use server";

import { redirect } from "react-server-frame";
import { getContext } from "remix/async-context-middleware";
import { Session } from "remix/session";

export async function logout() {
  const ctx = getContext();
  const session = ctx.get(Session);
  session.destroy();
  redirect("/");
}
