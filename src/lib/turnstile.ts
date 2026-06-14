const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifies a Cloudflare Turnstile token server-side.
 * Returns true when the challenge passes. If no secret is configured, the
 * check is skipped (dev convenience) with a warning — set TURNSTILE_SECRET_KEY
 * in production. Cloudflare provides always-pass test keys for local dev:
 *   site key:   1x00000000000000000000AA
 *   secret key: 1x0000000000000000000000000000000AA
 */
export async function verifyTurnstile(
  token: string | undefined | null,
  secret: string | undefined | null,
  remoteIp?: string | null,
): Promise<boolean> {
  if (!secret) {
    console.warn(
      "[turnstile] TURNSTILE_SECRET_KEY is not set — skipping verification. Set it in production.",
    );
    return true;
  }
  if (!token) return false;

  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteIp) body.append("remoteip", remoteIp);

  try {
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
