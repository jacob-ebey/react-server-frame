import { createFromFetch, createFromReadableStream } from "@vitejs/plugin-rsc/browser";
import { startTransition, StrictMode, use, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { rscStream } from "rsc-html-stream/client";

import type { Payload } from "../generic-payload.ts";

createFromReadableStream<Payload>(rscStream).then(
  (payload) =>
    hydrateRoot(
      document.body,
      <StrictMode>
        <Content payload={Promise.resolve(payload)} />
      </StrictMode>,
      {
        formState: payload.formState,
      },
    ),
  (reason) => console.error("Failed to hydrate root", reason),
);

let setPayload: (payload: Promise<Payload>) => void;

function Content({ payload }: { payload: Promise<Payload> }) {
  const [promise, _setPayload] = useState(payload);
  setPayload = _setPayload;

  return use(promise).root;
}

let navigationController = new AbortController();
function navigate(to: string) {
  const url = new URL(to);
  url.searchParams.set("_rsc", "1");

  let thisController = new AbortController();
  startTransition(() =>
    setPayload(createFromFetch<Payload>(fetch(url, { signal: thisController.signal }))),
  );
  navigationController.abort();
  navigationController = thisController;
}

window.navigation?.addEventListener("navigate", (event) => {
  if (!event.canIntercept) {
    return;
  }

  if (event.hashChange || event.downloadRequest !== null) {
    return;
  }

  event.intercept({
    async handler() {
      navigate(event.destination.url);
    },
  });
});

if (import.meta.hot) {
  import.meta.hot.on("rsc:update", (e) => {
    console.log("[vite-rsc:update]", e.file);
    navigate(location.href);
  });
}
