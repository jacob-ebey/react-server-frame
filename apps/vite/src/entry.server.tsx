import { lazy } from "react";
import { Frame } from "react-server-frame";
import { ProvideFrames, render } from "react-server-frame/vite/frames";
import { createRouter } from "remix/fetch-router";
import { createMemoryFileStorage } from "remix/file-storage/memory";
import { useCacheMiddleware } from "vite-plugin-react-use-cache/remix";

import { routes } from "./routes.ts";

const About = lazy(() => import("./frames/about.tsx"));
const Home = lazy(() => import("./frames/home.tsx"));
const Sidebar = lazy(() => import("./frames/sidebar.tsx"));

const router = createRouter();

router.get("*", {
  middleware: [useCacheMiddleware(createMemoryFileStorage())],
  handler: ({ request }) => {
    return render(
      request,
      <ProvideFrames
        url={request.url}
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
