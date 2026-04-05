export const sessionSecret = process.env.SESSION_SECRET!;
if (!sessionSecret) throw new Error("SESSION_SECRET environment variable is not set");

export const tokensSecret = process.env.TOKENS_SECRET!;
if (!tokensSecret) throw new Error("TOKENS_SECRET environment variable is not set");
