import { auth, createSessionAuthScheme } from "remix/auth-middleware";
import * as s from "remix/data-schema";
import { Database } from "remix/data-table";

import { profiles } from "@/data/schema";
import { createAtmosphereAuthProvider } from "remix/auth";
import { Auth, type BadAuth, type GoodAuth } from "remix/auth-middleware";
import { createMemoryFileStorage } from "remix/file-storage/memory";
import { routes } from "@/routes";
import { getContext } from "remix/async-context-middleware";

export const atmosphereIdentifierSessionKey = "__atmosphere_identifier";

export function getAuth() {
  const { get } = getContext();
  return get(Auth) as GoodAuth<AuthIdentity> | BadAuth;
}

const authSessionSchema = s.object({
  did: s.string(),
});

export type AuthSession = s.InferOutput<typeof authSessionSchema>;

export type AuthIdentity = {
  did: string;
  displayName: string;
};

export function authMiddleware() {
  return auth({
    schemes: [
      createSessionAuthScheme<AuthIdentity, AuthSession>({
        read(session) {
          const parsed = s.parseSafe(authSessionSchema, session.get("auth"));
          if (parsed.success) return parsed.value;
          return null;
        },
        async verify({ did }, { get }) {
          const db = get(Database);
          const profile = await db.find(profiles, did);
          if (profile) {
            return {
              did,
              displayName: profile.displayName,
            };
          }
          return null;
        },
        invalidate(session) {
          session.unset("auth");
        },
      }),
    ],
  });
}

const fileStorage = createMemoryFileStorage();

export function createAuthProvider(handleOrDid: string) {
  const { request } = getContext();
  const url = new URL(request.url);
  const port = url.port ? `:${url.port}` : "";
  const redirectUri = new URL(routes.atmosphere.callback.href(), `http://127.0.0.1${port}`);

  return createAtmosphereAuthProvider(handleOrDid, {
    clientId: "http://localhost",
    redirectUri,
    fileStorage,
    scopes: ["atproto"],
  });
}
