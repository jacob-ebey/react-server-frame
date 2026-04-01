"use client";

import { fetchFrame as _fetchFrame } from "../frames.client.tsx";

if (typeof document !== "undefined") {
  void import("@vitejs/plugin-rsc/browser");
}

export async function fetchFrame(url: URL, signal: AbortSignal) {
  const { createFromFetch } = await import("@vitejs/plugin-rsc/browser");
  return _fetchFrame(url, signal, createFromFetch);
}
