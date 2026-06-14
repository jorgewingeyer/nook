const MP_API = "https://api.mercadopago.com";

export interface MpItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

export interface MpPayer {
  name: string;
  email: string;
  phone?: { number: string };
}

interface MpPreferenceInput {
  items: MpItem[];
  payer: MpPayer;
  orderId: number;
  orderNumber: string;
  accessToken: string;
  appUrl: string;
}

export interface MpPreferenceResult {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
}

export async function createMpPreference({
  items,
  payer,
  orderId,
  orderNumber,
  accessToken,
  appUrl,
}: MpPreferenceInput): Promise<MpPreferenceResult> {
  const response = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: items.map((item) => ({ ...item, currency_id: item.currency_id ?? "ARS" })),
      payer,
      back_urls: {
        success: `${appUrl}/checkout/exito?order_id=${orderId}`,
        failure: `${appUrl}/checkout?order_id=${orderId}&error=payment_failed`,
        pending: `${appUrl}/checkout/exito?order_id=${orderId}&status=pending`,
      },
      auto_return: "approved",
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      external_reference: orderNumber,
      statement_descriptor: "Nook",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MercadoPago preference creation failed: ${text}`);
  }

  const data = await response.json() as { id: string; init_point: string; sandbox_init_point: string };
  return {
    preferenceId: data.id,
    initPoint: data.init_point,
    sandboxInitPoint: data.sandbox_init_point,
  };
}

export async function createMpRefund(
  paymentId: string,
  amount: number | null,
  accessToken: string,
): Promise<{ id: number } | null> {
  const body = amount !== null ? JSON.stringify({ amount }) : "{}";
  const response = await fetch(`${MP_API}/v1/payments/${paymentId}/refunds`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body,
  });
  if (!response.ok) return null;
  return response.json() as Promise<{ id: number }>;
}

export async function getMpPayment(paymentId: string, accessToken: string) {
  const response = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  return response.json() as Promise<{
    id: number;
    status: string;
    external_reference: string;
    transaction_amount: number;
  }>;
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Verifies a MercadoPago webhook signature.
 * MP sends `x-signature: ts=<ts>,v1=<hmac>` and `x-request-id`.
 * The signed manifest is `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`,
 * HMAC-SHA256'd with the webhook secret configured in the MP dashboard.
 * See https://www.mercadopago.com/developers/en/docs/your-integrations/notifications/webhooks
 */
export async function verifyMpWebhookSignature({
  signatureHeader,
  requestId,
  dataId,
  secret,
}: {
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string;
  secret: string;
}): Promise<boolean> {
  if (!signatureHeader) return false;

  const parts: Record<string, string> = {};
  for (const segment of signatureHeader.split(",")) {
    const idx = segment.indexOf("=");
    if (idx === -1) continue;
    const key = segment.slice(0, idx).trim();
    const value = segment.slice(idx + 1).trim();
    if (key) parts[key] = value;
  }

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  // MP lowercases data.id when it is alphanumeric.
  const normalizedId = dataId.toLowerCase();
  let manifest = "";
  if (normalizedId) manifest += `id:${normalizedId};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${ts};`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(manifest),
  );
  const computed = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return timingSafeEqualHex(computed, v1);
}
