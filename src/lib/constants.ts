export const COOKIE_SESSION = "session";
export const SESSION_SECRET = process.env.SESSION_SECRET || process.env.NEXTJS_SESSION_SECRET || "";

if (!SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET environment variable is not set. Minimum 32 characters required.",
  );
}

if (SESSION_SECRET.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters long");
}
