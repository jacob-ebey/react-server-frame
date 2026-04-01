import { createFromReadableStream } from "@vitejs/plugin-rsc/ssr";
import { use } from "react";
import { renderToReadableStream } from "react-dom/server";
import { injectRSCPayload } from "rsc-html-stream/server";

import type { Payload } from "../generic-payload.ts";

export async function prerender(body: ReadableStream<Uint8Array>) {
  const [decodeBody, inlineBody] = body.tee();

  let decode: Promise<Payload> | undefined;
  function Content() {
    decode ??= createFromReadableStream<Payload>(decodeBody);
    const payload = use(decode);

    if (payload.type === "redirect") {
      return (
        <html>
          <head></head>
          <body>
            <meta http-equiv="refresh" content={`0; url=${payload.redirect}`} />
          </body>
        </html>
      );
    }

    return <>{payload.root}</>;
  }

  let notFoundError = false;
  try {
    const bootstrapScriptContent = await import.meta.viteRsc.loadBootstrapScriptContent("index");

    const html = await renderToReadableStream(<Content />, {
      bootstrapScriptContent,
      onError(reason: unknown) {
        if (
          typeof reason === "object" &&
          reason !== null &&
          "digest" in reason &&
          reason.digest === "404"
        ) {
          notFoundError = true;
          return reason.digest;
        }
      },
    });

    const payload = await decode;
    return new Response(html.pipeThrough(injectRSCPayload(inlineBody)), {
      status: payload!.type === "redirect" ? 302 : notFoundError ? 404 : 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (reason) {
    if (notFoundError) return new Response("Not Found", { status: 404 });

    console.error("Failed to prerender", reason);
    return new Response("Internal Server Error", { status: 500 });
  }
}
