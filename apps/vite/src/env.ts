export const sessionSecret = process.env.SESSION_SECRET!;
if (!sessionSecret) throw new Error("SESSION_SECRET environment variable is not set");
