import * as path from "node:path";
import { fileURLToPath } from "node:url";

import * as Vite from "vite";

function getEntry(file: string) {
  return Vite.normalizePath(path.join(path.dirname(fileURLToPath(import.meta.url)), file));
}

export function reactServerFrame({ entry = "/src/entry.server" }: { entry?: string } = {}) {
  return {
    name: "framework",
    config(userConfig) {
      return Vite.mergeConfig(
        {
          environments: {
            client: {
              build: {
                rolldownOptions: {
                  input: {
                    index: getEntry("entry.client.tsx"),
                  },
                },
              },
            },
            rsc: {
              build: {
                rolldownOptions: {
                  input: {
                    index: entry,
                  },
                },
              },
            },
            ssr: {
              build: {
                rolldownOptions: {
                  input: {
                    index: getEntry("entry.ssr.tsx"),
                  },
                },
              },
            },
          },
        } satisfies Vite.UserConfig,
        userConfig,
        true,
      );
    },
  } satisfies Vite.Plugin;
}
