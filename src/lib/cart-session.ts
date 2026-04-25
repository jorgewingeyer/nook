export const COOKIE_CART = "nook_cart";
export const CART_EXPIRY_DAYS = 30;

export function generateCartSessionId(): string {
  return crypto.randomUUID();
}

export function cartCookieOptions() {
  const expires = new Date();
  expires.setDate(expires.getDate() + CART_EXPIRY_DAYS);
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  };
}
