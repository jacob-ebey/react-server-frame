import { lazy } from "react";
import { createRouter } from "remix/fetch-router";

import { ProvideFrames, render } from "react-server-frame/vite/frames";
import { Frame } from "react-server-frame";

import { routes } from "./routes.ts";

const About = lazy(() => import("./frames/about.tsx"));
const Home = lazy(() => import("./frames/home.tsx"));
const Sidebar = lazy(() => import("./frames/sidebar.tsx"));

const router = createRouter();

router.get("*", ({ request }) => {
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
});

export default {
  async fetch(request: Request) {
    return router.fetch(new Request(request.url, request));
  },
};
