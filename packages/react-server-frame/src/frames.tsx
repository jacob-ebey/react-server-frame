import { cache } from "react";
import type { ReactFormState } from "react-dom/client";
import { getContext } from "remix/async-context-middleware";
import type { Route } from "remix/fetch-router/routes";

import { ClientFrame, FetchFrameProvider } from "./frames.client.tsx";
import type { Payload } from "./generic-payload.ts";
import type { Middleware } from "remix/fetch-router";

export class UseServerState {
  formState?: ReactFormState;
  returnValue?: Promise<unknown>;
  temporaryReferences?: unknown;
  status?: number;

  constructor(
    formState: ReactFormState | undefined,
    returnValue: Promise<unknown> | undefined,
    temporaryReferences: unknown,
    status: number | undefined,
  ) {
    this.formState = formState;
    this.returnValue = returnValue;
    this.temporaryReferences = temporaryReferences;
    this.status = status;
  }
}

export class RedirectState {
  location: string;
  constructor(location: string) {
    this.location = location;
  }
}

export function useServerMiddleware({
  createTemporaryReferenceSet,
  decodeAction,
  decodeFormState,
  decodeReply,
  loadServerAction,
}: {
  createTemporaryReferenceSet: () => unknown;
  decodeAction: (formData: FormData) => Promise<() => Promise<void>>;
  decodeFormState: (actionResult: unknown, body: FormData) => Promise<ReactFormState | undefined>;
  decodeReply: (body: string | FormData, options?: object) => Promise<unknown[]>;
  loadServerAction: (id: string) => Promise<Function>;
}): Middleware {
  return async ({ request, set }, next) => {
    let formState: ReactFormState | undefined;
    let returnValue: Promise<unknown> | undefined;
    let temporaryReferences: unknown;
    let actionStatus: number | undefined;

    if (request.method === "POST") {
      const actionId = request.headers.get("x-rsc-action");

      if (actionId) {
        try {
          const contentType = request.headers.get("content-type");
          const body = contentType?.startsWith("multipart/form-data")
            ? await request.formData()
            : await request.text();
          temporaryReferences = createTemporaryReferenceSet();
          const args = await decodeReply(body, { temporaryReferences });
          const action = await loadServerAction(actionId);
          returnValue = action.apply(null, args);
          await returnValue;
        } catch (e) {
          actionStatus = 500;
          returnValue = Promise.reject(e);
        }
      } else {
        try {
          const formData = await request.formData();
          const decodedAction = await decodeAction(formData);
          const result = await decodedAction();
          formState = await decodeFormState(result, formData);
        } catch (e) {
          console.error(e);
        }
      }
    }

    set(
      UseServerState,
      new UseServerState(formState, returnValue, temporaryReferences, actionStatus),
    );
    return next();
  };
}

export function redirect(location: string) {
  const ctx = getContext();
  ctx.set(RedirectState, new RedirectState(location));
}

export async function render({
  createTemporaryReferenceSet,
  prerender,
  renderToReadableStream,
  request,
  root,
}: {
  createTemporaryReferenceSet: () => unknown;
  prerender: (body: ReadableStream<Uint8Array>) => Promise<Response>;
  renderToReadableStream: (
    payload: any,
    options?: {
      temporaryReferences: unknown;
      onError: (error: unknown) => string | undefined;
    },
  ) => ReadableStream<Uint8Array>;
  request: Request;
  root: React.ReactNode;
}) {
  const ctx = getContext();
  let redirect: RedirectState | undefined;
  try {
    redirect = ctx.get(RedirectState);
  } catch {}
  let state: UseServerState | undefined;
  try {
    state = ctx.get(UseServerState);
  } catch {}

  try {
    const payload: Payload = redirect
      ? {
          type: "redirect",
          redirect: redirect.location,
          returnValue: state?.returnValue,
        }
      : {
          type: "render",
          root,
          returnValue: state?.returnValue,
          formState: state?.formState,
        };

    const temporaryReferences = state?.temporaryReferences ?? createTemporaryReferenceSet();

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
    if (url.pathname.endsWith(".rsc")) {
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
};

export function ProvideFrames<Frames extends Routes>({
  children,
  components,
  fetchFrame,
  frames,
}: ProvideFramesProps<Frames>) {
  const cache = frameCache();

  cache.components = { ...cache.components, ...components };
  cache.frames = { ...cache.frames, ...frames };

  return <FetchFrameProvider fetchFrame={fetchFrame}>{children}</FetchFrameProvider>;
}

export function Frame({ src }: { src: string }) {
  const cache = frameCache();
  if (!cache.components || !cache.frames) throw new Error("No frames provided");

  const url = new URL(src, "http://react-server-frame/");
  if (url.pathname.endsWith(".rsc")) {
    url.pathname = url.pathname.slice(0, -4);
  }

  const Component = match(cache.frames, cache.components, url.href);
  if (!Component) throw new NotFoundError("No matching frame found");

  return (
    <ClientFrame src={url.pathname + url.search}>
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
