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
