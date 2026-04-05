import {
  createAtmosphereAuthProvider,
  refreshExternalAuth,
  type OAuthDpopTokens,
} from "remix/auth";
import {
  Auth,
  auth,
  createSessionAuthScheme,
  type BadAuth,
  type GoodAuth,
} from "remix/auth-middleware";
import { getContext } from "remix/async-context-middleware";
import * as s from "remix/data-schema";
import { Database } from "remix/data-table";

import { profiles, tokens } from "@/data/schema";
import { sessionSecret, tokensSecret } from "@/env";
import { routes } from "@/routes";

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
  tokens: OAuthDpopTokens;
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
          if (!profile) return null;
          const tokens = await getTokens(did);
          if (!tokens) return null;
          return {
            did,
            displayName: profile.displayName,
            tokens,
          };
        },
        invalidate(session) {
          session.unset("auth");
        },
      }),
    ],
  });
}

export function createAuthProvider(handleOrDid: string) {
  const { request } = getContext();
  const url = new URL(request.url);
  const port = url.port ? `:${url.port}` : "";
  const redirectUri = new URL(routes.atmosphere.callback.href(), `http://127.0.0.1${port}`);

  return createAtmosphereAuthProvider(handleOrDid, {
    clientId: "http://localhost",
    redirectUri,
    sessionSecret,
    scopes: ["atproto"],
  });
}

export async function saveTokens(did: string, oAuthTokens: OAuthDpopTokens) {
  const { get } = getContext();
  const db = get(Database);

  const value = await encrypt(
    JSON.stringify(oAuthTokens, (key, value) => {
      if (
        key === "expiresAt" &&
        value !== null &&
        typeof value === "object" &&
        value instanceof Date
      ) {
        return value.getTime();
      }
      return value;
    }),
  );

  const existing = await db.find(tokens, did);
  if (existing) await db.update(tokens, did, { value });
  else await db.create(tokens, { did, value });
}

export async function getTokens(did: string): Promise<OAuthDpopTokens | null> {
  const { get } = getContext();
  const db = get(Database);
  const existing = await db.find(tokens, did);
  if (existing) {
    const value = await decrypt(existing.value);
    const tokens = JSON.parse(value, (key, value) => {
      if (key === "expiresAt" && typeof value === "number") {
        return new Date(value);
      }
      return value;
    }) as OAuthDpopTokens;

    if (tokens.expiresAt && new Date(tokens.expiresAt).getTime() <= new Date().getTime()) {
      console.log("REVALIDATING TOKEN");
      const refreshed = await refreshExternalAuth(await createAuthProvider(did), tokens);
      await saveTokens(did, refreshed.tokens);
      return refreshed.tokens;
    }

    return tokens;
  }
  return null;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const ivLength = 12;

async function encryptionKey() {
  const secret = tokensSecret;
  if (!secret) throw new Error("TOKENS_SECRET environment variable is not set");

  const keyMaterial = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
  return crypto.subtle.importKey("raw", keyMaterial, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function encrypt(value: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(ivLength));
  const key = await encryptionKey();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(value),
  );

  const bytes = new Uint8Array(ivLength + ciphertext.byteLength);
  bytes.set(iv, 0);
  bytes.set(new Uint8Array(ciphertext), ivLength);

  return Buffer.from(bytes).toString("base64url");
}

async function decrypt(value: string): Promise<string> {
  const bytes = Buffer.from(value, "base64url");
  const iv = bytes.subarray(0, ivLength);
  const ciphertext = bytes.subarray(ivLength);

  const key = await encryptionKey();
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);

  return decoder.decode(plaintext);
}
