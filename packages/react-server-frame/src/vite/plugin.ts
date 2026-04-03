import { execFile } from "node:child_process";
import * as path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import * as Vite from "vite";

const execFileAsync = promisify(execFile);

function getEntry(file: string) {
  return Vite.normalizePath(path.join(path.dirname(fileURLToPath(import.meta.url)), file));
}

export function reactServerFrame({ entry = "/src/entry.server" }: { entry?: string } = {}) {
  return [
    {
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
    },
    {
      name: "framework:optimize-deps",
      async configEnvironment(name, config) {
        if (name !== "client") return;

        const entries = new Set<string>([getEntry("entry.client.tsx")]);

        try {
          const ruleYaml = `id: find-use-client-directives
language: TSX
rule:
  all:
    - kind: expression_statement
    - has:
        kind: string
        regex: '^[''"]use client[''"]$'
    - inside:
        kind: program
        stopBy: neighbor`;

          const { stdout } = await execFileAsync("ast-grep", [
            "scan",
            "--json",
            "--inline-rules",
            ruleYaml,
          ]);
          const results: Array<{ file: string }> = JSON.parse(stdout);
          for (const result of results) {
            entries.add(result.file);
          }
          console.log(`Optimizing dependencies for ${entries.size} client modules`);
        } catch {
          console.warn(
            "Install https://ast-grep.github.io/ to enable dependencies optimization discovery",
          );
        }

        return Vite.mergeConfig(
          config,
          {
            optimizeDeps: {
              entries: [...entries],
            },
          } as Vite.EnvironmentOptions,
          true,
        );
      },
    },
  ] satisfies Vite.Plugin[];
}
