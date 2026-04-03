import { createServer } from "node:http";

import { createRouter } from "remix/fetch-router";
import { createRequestListener } from "remix/node-fetch-server";
import { staticFiles } from "remix/static-middleware";

// @ts-ignore - may or may not exist yet
import _app from "./dist/rsc/index.js";

const app = _app as typeof import("./src/entry.server.js").default;

const router = createRouter({
  middleware: [
    staticFiles("dist/client", {
      cacheControl: "public, max-age=31536000, immutable",
    }),
  ],
});

router.route("ANY", "*", ({ request }) => app.fetch(request));

const server = createServer(
  createRequestListener(async (request) => {
    try {
      return await router.fetch(request);
    } catch (error) {
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }),
);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

server.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}`);
});

let shuttingDown = false;

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close(() => process.exit(0));
  server.closeAllConnections();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
