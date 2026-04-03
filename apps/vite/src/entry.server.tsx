import { lazy } from "react";
import { mapFrames, useServerMiddleware } from "react-server-frame/vite/frames";
import { useCacheMiddleware } from "vite-plugin-react-use-cache/remix";

import { asyncContext } from "remix/async-context-middleware";
import { createCookie } from "remix/cookie";
import { createRouter, type MiddlewareContext } from "remix/fetch-router";
import { createMemoryFileStorage } from "remix/file-storage/memory";
import { createCookieSessionStorage } from "remix/session/cookie-storage";
import { session } from "remix/session-middleware";

import { routes } from "@/routes";
import atmosphere from "@/routes/atmosphere";
import { authMiddleware } from "@/lib/auth";
import { databaseMiddleware } from "@/lib/database";

const Home = lazy(() => import("@/frames/home"));

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) throw new Error("SESSION_SECRET environment variable is not set");

const sessionCookie = createCookie("__session", {
  secrets: [SESSION_SECRET],
  httpOnly: true,
  secure: true,
  sameSite: "Lax",
});

const sessionStorage = createCookieSessionStorage();

const middleware = [
  asyncContext(),
  session(sessionCookie, sessionStorage),
  databaseMiddleware(),
  authMiddleware(),
];

const router = createRouter({
  middleware,
});

router.map(routes.atmosphere, atmosphere);

mapFrames(router, routes.frames, {
  middleware: [useCacheMiddleware(createMemoryFileStorage()), useServerMiddleware()],
  components: {
    home: Home,
  },
});

export type AppContext = MiddlewareContext<typeof middleware>;

export default {
  async fetch(request: Request) {
    return router.fetch(new Request(request.url, request));
  },
};
