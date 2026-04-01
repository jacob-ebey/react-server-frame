import {
  createFromFetch,
  createFromReadableStream,
  createTemporaryReferenceSet,
  encodeReply,
  setServerCallback,
} from "@vitejs/plugin-rsc/browser";
import { startTransition, StrictMode, use, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { rscStream } from "rsc-html-stream/client";

import type { Payload } from "../generic-payload.ts";

setServerCallback(async (id, args) => {
  const url = new URL(window.location.href);
  url.pathname += ".rsc";
  const temporaryReferences = createTemporaryReferenceSet();
  const payload = await createFromFetch<Payload>(
    fetch(url, {
      method: "POST",
      body: await encodeReply(args, { temporaryReferences }),
      headers: {
        "x-rsc-action": id,
      },
    }),
    { temporaryReferences },
  );
  if (payload.type === "render") {
    startTransition(() => {
      setPayload(Promise.resolve(payload));
    });
  }
  if (payload.type === "redirect") {
    if (window.navigation) {
      window.navigation.navigate(payload.redirect, {
        history: "replace",
      });
    } else {
      window.location.href = payload.redirect;
    }
  }
  return payload.returnValue;
});

createFromReadableStream<Payload>(rscStream).then(
  (payload) =>
    startTransition(() => {
      hydrateRoot(
        document,
        <StrictMode>
          <Content initialPayload={Promise.resolve(payload)} />
        </StrictMode>,
        {
          formState: payload.formState,
        },
      );
    }),
  (reason) => console.error("Failed to hydrate root", reason),
);

let setPayload: (payload: Promise<Payload>) => void;

let seenPayloads = new WeakMap<Payload, Promise<void>>();

function Content({ initialPayload }: { initialPayload: Promise<Payload> }) {
  const [promise, _setPayload] = useState(initialPayload);
  setPayload = _setPayload;

  const payload = use(promise);

  if (payload.type === "redirect") {
    if (window.navigation) {
      if (!seenPayloads.has(payload)) {
        const promise = Promise.resolve(
          window.navigation.navigate(payload.redirect, {
            history: "replace",
          }).finished,
        ).then(() => {});
        seenPayloads.set(payload, Promise.resolve(promise));
      }
      use(seenPayloads.get(payload)!);
      return null;
    } else {
      window.location.href = payload.redirect;
      return null;
    }
  }

  return payload.root;
}

let navigationController = new AbortController();
async function navigate(to: string) {
  const url = new URL(to, window.location.href);
  url.pathname += ".rsc";

  const thisController = new AbortController();
  const responses = fetch(url, { signal: thisController.signal }).then((response) => [
    response,
    response.clone(),
  ]);

  startTransition(() => setPayload(createFromFetch<Payload>(responses.then(([r]) => r))));
  navigationController.abort();
  navigationController = thisController;

  const [, response] = await responses;
  if (!response.body) return;
  const reader = response.body.getReader();
  try {
    let chunk = await reader.read();
    while (!chunk.done) {
      chunk = await reader.read();
    }
  } finally {
    reader.releaseLock();
  }
}

window.navigation?.addEventListener("navigate", (event) => {
  if (!event.canIntercept) {
    return;
  }

  if (event.hashChange || event.downloadRequest !== null) {
    return;
  }

  const url = new URL(event.destination.url);

  if (window.location.origin !== url.origin) {
    window.location.href = url.href;
    return;
  }

  event.intercept({
    async handler() {
      await navigate(event.destination.url);
    },
  });
});

if (import.meta.hot) {
  import.meta.hot.on("rsc:update", (e) => {
    console.log("[vite-rsc:update]", e.file);
    void navigate(location.href);
  });
}
