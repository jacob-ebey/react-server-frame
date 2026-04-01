import {
  createTemporaryReferenceSet,
  decodeAction,
  decodeFormState,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
} from "@vitejs/plugin-rsc/rsc";
import type { ReactFormState } from "react-dom/client";
import type { Middleware } from "remix/fetch-router";

import { ProvideFrames as _ProvideFrames, render as _render, UseServerState } from "../frames.tsx";

import { fetchFrame } from "./fetch-frame.ts";

export function useServerMiddleware(): Middleware {
  return async ({ request, set }, next) => {
    let formState: ReactFormState | undefined;
    let returnValue: Promise<unknown> | undefined;
    let temporaryReferences: unknown;
    let actionStatus: number | undefined;

    if (request.method === "POST") {
      const actionId = request.headers.get("x-rsc-action");

      if (actionId) {
        const contentType = request.headers.get("content-type");
        const body = contentType?.startsWith("multipart/form-data")
          ? await request.formData()
          : await request.text();
        temporaryReferences = createTemporaryReferenceSet();
        const args = await decodeReply(body, { temporaryReferences });
        const action = await loadServerAction(actionId);
        try {
          returnValue = action.apply(null, args);
          await returnValue;
        } catch (e) {
          actionStatus = 500;
          returnValue = Promise.reject(e);
        }
      } else {
        const formData = await request.formData();
        const decodedAction = await decodeAction(formData);
        try {
          const result = await decodedAction();
          formState = await decodeFormState(result, formData);
        } catch (e) {
          console.error(e);
        }
      }

      // try {
      //   const redirect = get(RedirectState);

      //   if (actionId) {
      //     const temporaryReferences = createTemporaryReferenceSet();
      //     const body = renderToReadableStream(
      //       {
      //         type: "redirect",
      //         redirect: redirect.location,
      //         returnValue,
      //       } satisfies Payload,
      //       {
      //         temporaryReferences,
      //       },
      //     );
      //     return new Response(body, {
      //       headers: {
      //         "Content-Type": "text/x-component; charset=utf-8",
      //       },
      //     });
      //   }

      //   return new Response("", {
      //     headers: {
      //       Location: redirect.location,
      //     },
      //   });
      // } catch {}
    }

    set(
      UseServerState,
      new UseServerState(formState, returnValue, temporaryReferences, actionStatus),
    );
    return next();
  };
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
