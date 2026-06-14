// Phase 3 — real-time cart sync helpers (server side). Publishes a change ping
// to the cart-sync Durable Object worker after a cart mutation. Feature-detected
// via CART_SYNC_HOST and non-throwing, so the cart works unchanged without it.

/**
 * Derives the Durable Object room id from the (httpOnly) cart session id by
 * hashing it, so the raw cookie value is never exposed to the browser.
 */
export async function cartRoomId(sessionId: string): Promise<string> {
  const data = new TextEncoder().encode(`nook-cart:${sessionId}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function publishCartUpdate(env: any, sessionId: string | undefined | null): Promise<void> {
  const host = env?.CART_SYNC_HOST as string | undefined;
  if (!host || !sessionId) return;
  try {
    const roomId = await cartRoomId(sessionId);
    const base = host.startsWith("http") ? host : `https://${host}`;
    await fetch(`${base}/room/${roomId}/publish`, {
      method: "POST",
      headers: env?.CART_SYNC_SECRET ? { "x-cart-secret": env.CART_SYNC_SECRET as string } : {},
    });
  } catch {
    // sync is best-effort; never block a cart mutation
  }
}
