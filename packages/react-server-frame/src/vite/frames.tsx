import {
  createTemporaryReferenceSet,
  decodeAction,
  decodeFormState,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
} from "@vitejs/plugin-rsc/rsc";
import type { Middleware } from "remix/fetch-router";

import {
  ProvideFrames as _ProvideFrames,
  render as _render,
  useServerMiddleware as _useServerMiddleware,
} from "../frames.tsx";

import { fetchFrame } from "./fetch-frame.ts";

export function useServerMiddleware(): Middleware {
  return _useServerMiddleware({
    createTemporaryReferenceSet,
    decodeAction,
    decodeFormState,
    decodeReply,
    loadServerAction,
  });
}

export async function render(request: Request, root: React.ReactNode) {
  const ssr = await import.meta.viteRsc.import<typeof import("./entry.ssr.tsx")>(
    "./entry.ssr.tsx",
    {
      environment: "ssr",
    },
  );

  return _render({
    createTemporaryReferenceSet,
    prerender: ssr.prerender,
    renderToReadableStream,
    request,
    root,
  });
}

export function ProvideFrames(
  props: Omit<React.ComponentProps<typeof _ProvideFrames>, "fetchFrame">,
) {
  return <_ProvideFrames {...props} fetchFrame={fetchFrame} />;
}
