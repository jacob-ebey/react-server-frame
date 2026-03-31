import { createTemporaryReferenceSet, renderToReadableStream } from "@vitejs/plugin-rsc/rsc";

import { ProvideFrames as _ProvideFrames, render as _render } from "../frames.tsx";

import { fetchFrame } from "./fetch-frame.ts";

export async function render(request: Request, root: React.ReactNode) {
  const ssr = await import.meta.viteRsc.import<typeof import("./entry.ssr.tsx")>(
    "./entry.ssr.tsx",
    {
      environment: "ssr",
    },
  );

  return _render(createTemporaryReferenceSet, renderToReadableStream, ssr.prerender, request, root);
}

export function ProvideFrames(
  props: Omit<React.ComponentProps<typeof _ProvideFrames>, "fetchFrame">,
) {
  return <_ProvideFrames {...props} fetchFrame={fetchFrame} />;
}
