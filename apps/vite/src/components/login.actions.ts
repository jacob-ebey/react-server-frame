"use server";

import { redirect } from "react-server-frame";
import { getContext } from "remix/async-context-middleware";
import { Session } from "remix/session";

export async function loginAction(_: unknown, formData: FormData) {
  let userId = formData.get("userId");
  if (typeof userId !== "string") return { success: false, error: "Invalid User ID" };
  userId = userId.trim();
  if (userId === "") return { success: false, error: "User ID is required" };

  const ctx = getContext();
  const session = ctx.get(Session);
  session.set("auth", { userId });

  redirect("/");

  return { success: true, message: `Welcome ${userId}` };
}
