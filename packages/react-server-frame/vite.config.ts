import * as fs from "node:fs/promises";
import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    dts: {
      tsgo: true,
    },
    exports: true,
    entry: {
      index: "./src/frames.tsx",
      browser: "./src/browser.tsx",
      client: "./src/frames.client.tsx",
      "vite/fetch-frame": "./src/vite/fetch-frame.ts",
      "vite/frames": "./src/vite/frames.tsx",
      "vite/plugin": "./src/vite/plugin.ts",
    },
    hooks: {
      async "build:done"() {
        await Promise.all([
          fs.copyFile("src/vite/entry.client.tsx", "dist/vite/entry.client.tsx"),
          fs.copyFile("src/vite/entry.ssr.tsx", "dist/vite/entry.ssr.tsx"),
        ]);
      },
    },
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
