"use server";

import { redirect } from "react-server-frame";
import { getContext } from "remix/async-context-middleware";
import { startExternalAuth } from "remix/auth";
import * as s from "remix/data-schema";
import { Session } from "remix/session";

import type { AppContext } from "@/entry.server";
import { routes } from "@/routes";
import { atmosphereIdentifierSessionKey, createAuthProvider } from "@/lib/auth";
import type { LoginResult } from "@/components/login-form";
import type { LogoutResult } from "@/components/logout-form";

export async function logoutAction(): Promise<LogoutResult> {
  try {
    const { get } = getContext();
    const session = get(Session);
    session.unset("auth");
    session.regenerateId(true);
    redirect(routes.frames.home.href());
    return {
      success: true,
      message: "Logged out successfully.",
    };
  } catch (reason) {
    console.error(reason);
    return {
      success: false,
      error: "Failed to log out.",
    };
  }
}

const loginFormSchema = s.object({
  handleOrDid: s.string(),
});

export async function loginAction(_: unknown, formData: FormData): Promise<LoginResult> {
  const parsed = s.parseSafe(loginFormSchema, Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Handle is required.",
    };
  }

  const context = getContext() as AppContext;

  try {
    const identifier = normalizeAtmosphereIdentifier(parsed.value.handleOrDid);
    const provider = await createAuthProvider(identifier);

    let session = context.get(Session);
    session.set(atmosphereIdentifierSessionKey, identifier);

    redirect(await startExternalAuth(provider, context));
  } catch (reason) {
    console.error(reason);
    return {
      success: false,
      error: "Failed to login.",
    };
  }

  return {
    success: true,
    message: "Redirecting...",
  };
}

function normalizeAtmosphereIdentifier(value: string) {
  return value.trim();
}
