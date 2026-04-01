"use client";

import type { Payload } from "../generic-payload.ts";

if (typeof document !== "undefined") {
  void import("@vitejs/plugin-rsc/browser");
}

export async function fetchFrame(url: URL, signal: AbortSignal) {
  const { createFromFetch } = await import("@vitejs/plugin-rsc/browser");
  url.pathname += ".rsc";
  const payload = await createFromFetch<Payload>(fetch(url, { signal }));
  if (payload.type === "redirect") {
    if (window.navigation) {
      return Promise.resolve(
        window.navigation.navigate(payload.redirect, {
          history: "replace",
        }).finished,
      ).then(() => {
        return null as React.ReactNode;
      });
    } else {
      window.location.href = payload.redirect;
      return;
    }
  }
  return payload.root;
}
