import {
  createFromFetch,
  createFromReadableStream,
  createTemporaryReferenceSet,
  encodeReply,
  setServerCallback,
} from "@vitejs/plugin-rsc/browser";

import { createServerCallback, hydrate } from "react-server-frame/browser";
import type { Payload } from "../generic-payload.ts";

setServerCallback(
  createServerCallback({
    createFromFetch: (response, options) => createFromFetch<Payload>(response, options),
    createTemporaryReferenceSet,
    encodeReply,
  }),
);

hydrate({ createFromFetch, createFromReadableStream });
