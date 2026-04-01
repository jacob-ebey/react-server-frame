import { lazy } from "react";
import { Frame } from "react-server-frame";
import { ProvideFrames, render, useServerMiddleware } from "react-server-frame/vite/frames";
import { asyncContext } from "remix/async-context-middleware";
import { auth, createSessionAuthScheme } from "remix/auth-middleware";
import { createCookie } from "remix/cookie";
import { createRouter } from "remix/fetch-router";
import { createMemoryFileStorage } from "remix/file-storage/memory";
import { createCookieSessionStorage } from "remix/session/cookie-storage";
import { session } from "remix/session-middleware";
import { useCacheMiddleware } from "vite-plugin-react-use-cache/remix";

import { routes } from "./routes.ts";

const About = lazy(() => import("./frames/about.tsx"));
const Home = lazy(() => import("./frames/home.tsx"));
const Sidebar = lazy(() => import("./frames/sidebar.tsx"));

const SESSION_SECRET = import.meta.env.DEV ? "s3cr3t" : process.env.SESSION_SECRET;

if (!SESSION_SECRET) throw new Error("SESSION_SECRET environment variable is not set");

const sessionCookie = createCookie("__session", {
  secrets: [SESSION_SECRET],
  httpOnly: true,
  secure: true,
  sameSite: "Lax",
});

const sessionStorage = createCookieSessionStorage();

const router = createRouter({
  middleware: [asyncContext()],
});

router.get("*", {
  middleware: [
    session(sessionCookie, sessionStorage),
    auth({
      schemes: [
        createSessionAuthScheme({
          read(session) {
            return session.get("auth") as { userId: string } | null;
          },
          verify(_) {
            // TODO: validate the user id
            return true;
          },
          invalidate(session) {
            session.unset("auth");
          },
        }),
      ],
    }),
    useCacheMiddleware(createMemoryFileStorage()),
    useServerMiddleware(),
  ],
  handler: ({ request }) => {
    return render(
      request,
      <ProvideFrames
        frames={routes.frames}
        components={{
          about: About,
          home: Home,
          partials: {
            sidebar: Sidebar,
          },
        }}
      >
        <Frame src={request.url} />
      </ProvideFrames>,
    );
  },
});

export default {
  async fetch(request: Request) {
    return router.fetch(new Request(request.url, request));
  },
};
