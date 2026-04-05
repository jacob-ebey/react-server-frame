import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ensureEnvLocal = async (): Promise<string> => {
  const envPath = resolve(process.cwd(), ".env");

  if (!existsSync(envPath)) {
    await writeFile(envPath, "");
  }

  return envPath;
};

const upsertEnvVar = (input: string, key: string, value: string): string => {
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, "m");

  if (re.test(input)) {
    const match = input.match(re);
    const current = match ? match[0].slice(key.length + 1) : "";
    const trimmed = current.trim();

    if (trimmed === "" || trimmed === `''` || trimmed === `""`) {
      return input.replace(re, line);
    }

    return input;
  }

  const suffix = input.endsWith("\n") || input.length === 0 ? "" : "\n";
  return `${input}${suffix}${line}\n`;
};

const envLocalPath = await ensureEnvLocal();
const envLocal = await readFile(envLocalPath, "utf8");

const sessionSecret = crypto.randomUUID() + "-" + crypto.randomUUID();
const tokensSecret = crypto.randomUUID() + "-" + crypto.randomUUID();

let updated = envLocal;
updated = upsertEnvVar(updated, "SESSION_SECRET", sessionSecret);
updated = upsertEnvVar(updated, "TOKENS_SECRET", tokensSecret);

await writeFile(envLocalPath, updated);

console.log(`updated ${envLocalPath}`);
