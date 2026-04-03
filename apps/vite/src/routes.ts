import { route } from "remix/fetch-router/routes";

export const routes = route({
  atmosphere: {
    callback: "/atmosphere/callback",
  },
  frames: {
    home: "/",
  },
});
