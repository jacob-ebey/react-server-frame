import { route } from "remix/fetch-router/routes";

export const routes = route({
  frames: {
    home: "/",
    about: "/about",
    partials: {
      sidebar: "/frame/sidebar",
    },
  },
});
