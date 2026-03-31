"use client";

import type { Payload } from "../generic-payload.ts";

if (typeof document !== "undefined") {
  void import("@vitejs/plugin-rsc/browser");
}

export async function fetchFrame(url: URL, signal: AbortSignal) {
  const { createFromFetch } = await import("@vitejs/plugin-rsc/browser");
  url.searchParams.set("_rsc", "1");
  const payload = await createFromFetch<Payload>(fetch(url, { signal }));
  return payload.root;
}
