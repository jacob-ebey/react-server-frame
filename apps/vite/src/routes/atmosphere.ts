import { completeAuth, finishExternalAuth } from "remix/auth";
import type { Controller } from "remix/fetch-router";
import { redirect } from "remix/response/redirect";
import { Session } from "remix/session";

import type { AppContext } from "@/entry.server";
import { routes } from "@/routes";
import {
  atmosphereIdentifierSessionKey,
  createAuthProvider,
  saveTokens,
  type AuthSession,
} from "@/lib/auth";
import { Database, eq } from "remix/data-table";
import { profiles } from "@/data/schema";
import { createFetch } from "remix/dpop-fetch";

export default {
  actions: {
    async callback(context) {
      const session = context.get(Session);
      const identifier = normalizeAtmosphereIdentifier(
        session.get(atmosphereIdentifierSessionKey) as string | null | undefined,
      );

      if (identifier == null) {
        return redirect(
          routes.frames.home.href() +
            `?${new URLSearchParams({
              error: "Could not finish login.",
            })}`,
        );
      }

      session.unset(atmosphereIdentifierSessionKey);

      try {
        const provider = await createAuthProvider(identifier);
        const { result, returnTo } = await finishExternalAuth(provider, context);

        await saveTokens(result.profile.did, result.tokens);

        const fetchAtmosphere = createFetch(result.tokens);

        const url = new URL("/xrpc/com.atproto.repo.getRecord", result.profile.pdsUrl);
        url.searchParams.set("repo", result.profile.did);
        url.searchParams.set("collection", "app.bsky.actor.profile");
        url.searchParams.set("rkey", "self");
        const bskyDisplayName = await fetchAtmosphere(url)
          .then((response) => response.json())
          .then((res) => res?.value?.displayName?.trim())
          .catch(() => null);

        const { did, handle } = result.profile;

        const displayName = bskyDisplayName || handle?.replace(/^(@|at:)/, "") || did;

        const db = context.get(Database);
        if ((await db.count(profiles, { where: eq(profiles.did, did) })) > 0) {
          await db.update(profiles, did, {
            displayName,
          });
        } else {
          await db.create(profiles, {
            did,
            displayName,
          });
        }

        const authSession = completeAuth(context);
        authSession.set("auth", {
          did: result.profile.did,
        } satisfies AuthSession);

        return redirect(returnTo || routes.frames.home.href());
      } catch (reason) {
        console.error(reason);
        return redirect(
          routes.frames.home.href() +
            `?${new URLSearchParams({
              error: "Authentication failed.",
            })}`,
        );
      }
    },
  },
} satisfies Controller<typeof routes.atmosphere, AppContext>;

function normalizeAtmosphereIdentifier(value: string | null | undefined): string | null {
  let trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
