import { cache } from "react";
import type { Route } from "remix/fetch-router/routes";

import { ClientFrame, FetchFrameProvider } from "./frames.client.tsx";
import type { Payload } from "./generic-payload.ts";

export async function render(
  createTemporaryReferenceSet: () => unknown,
  renderToReadableStream: (
    payload: any,
    options: {
      temporaryReferences: unknown;
      onError: (error: unknown) => string | undefined;
    },
  ) => ReadableStream<Uint8Array>,
  prerender: (body: ReadableStream<Uint8Array>) => Promise<Response>,
  request: Request,
  root: React.ReactNode,
) {
  try {
    const payload: Payload = {
      root,
    };

    const temporaryReferences = createTemporaryReferenceSet();

    const body = renderToReadableStream(payload, {
      temporaryReferences,
      onError(error: unknown) {
        if (error instanceof NotFoundError) {
          return "404";
        }
        if (request.signal.aborted) {
          return;
        }
        console.error(error);
      },
    });

    const url = new URL(request.url);
    if (url.searchParams.has("_rsc")) {
      return new Response(body, {
        headers: {
          "Content-Type": "text/x-component; charset=utf-8",
        },
      });
    }

    return await prerender(body);
  } catch (reason) {
    if (reason instanceof Error && reason.name === "NotFoundError") {
      return new Response("Not Found", { status: 404 });
    }

    if (!request.signal.aborted) {
      console.error(reason);
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}

const frameCache = cache(
  (): {
    frames?: Record<string, Route>;
    components?: Record<string, React.ComponentType>;
    url?: string;
  } => ({}),
);

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

interface Routes extends Record<string, Route | Routes> {}

type Components<R extends Record<any, any>> = {
  [K in keyof R]: (R[K] extends Record<any, any> ? Components<R[K]> : never) | React.ComponentType;
};

export type ProvideFramesProps<Frames extends Routes> = {
  children?: React.ReactNode;
  components: Components<Frames>;
  fetchFrame: (url: URL, signal: AbortSignal) => Promise<React.ReactNode>;
  frames: Frames;
  url: string;
};

export function ProvideFrames<Frames extends Routes>({
  children,
  components,
  fetchFrame,
  frames,
  url,
}: ProvideFramesProps<Frames>) {
  const cache = frameCache();

  cache.components = { ...cache.components, ...components };
  cache.frames = { ...cache.frames, ...frames };
  cache.url = url;

  return <FetchFrameProvider fetchFrame={fetchFrame}>{children}</FetchFrameProvider>;
}

export function Frame({ src }: { src: string }) {
  const cache = frameCache();
  if (!cache.components || !cache.frames || !cache.url) throw new Error("No frames provided");

  const url = new URL(src, cache.url);

  const Component = match(cache.frames, cache.components, url.href);
  if (!Component) throw new NotFoundError("No matching frame found");

  return (
    <ClientFrame src={src}>
      <Component />
    </ClientFrame>
  );
}

function match(
  frames: Routes,
  components: Components<Routes>,
  href: string,
): React.ComponentType | undefined {
  for (const [id, route] of Object.entries(frames)) {
    if (typeof (route as Route).pattern?.test === "function") {
      if ((route as Route).pattern.test(href)) return components?.[id] as React.ComponentType;
    } else {
      let matched = match(route as Routes, components?.[id] as Components<Routes>, href);
      if (matched) return matched;
    }
  }
}
