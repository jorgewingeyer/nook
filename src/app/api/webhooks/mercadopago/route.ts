import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyMpWebhookSignature } from "@/lib/mercadopago";
import { processPaymentNotification } from "@/lib/payments";

async function handleNotification(dataId: string, env: any): Promise<number> {
  // Phase 2a: when the queue is bound (production), enqueue and return fast —
  // the standalone consumer processes with retries + DLQ. Locally (no queue),
  // process inline so the webhook still works in `next dev`.
  const queue = env.QUEUE_PAYMENTS;
  if (queue?.send) {
    await queue.send({ paymentId: dataId });
    return 200;
  }

  const db = getDb(env.DB);
  const result = await processPaymentNotification(db, env.MP_ACCESS_TOKEN, dataId);
  return result.status;
}

export async function POST(request: NextRequest) {
  const { env } = await getCloudflareContext();
  const secret = (env as any).MP_WEBHOOK_SECRET as string | undefined;

  let body: { type?: string; data?: { id?: string } };
  try {
    body = (await request.json()) as { type?: string; data?: { id?: string } };
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (body.type !== "payment" || !body.data?.id) {
    return NextResponse.json({ ok: true });
  }

  const dataId = String(body.data.id);

  if (secret) {
    const valid = await verifyMpWebhookSignature({
      signatureHeader: request.headers.get("x-signature"),
      requestId: request.headers.get("x-request-id"),
      dataId,
      secret,
    });
    if (!valid) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  } else {
    console.warn(
      "[mercadopago] MP_WEBHOOK_SECRET is not set — skipping signature verification. Set it in production.",
    );
  }

  try {
    const status = await handleNotification(dataId, env);
    return NextResponse.json({ ok: status === 200 }, { status });
  } catch (error) {
    console.error("[mercadopago] webhook processing failed", error);
    // 500 → MercadoPago retries instead of losing the notification.
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}

// Dev convenience only: trigger processing manually via
// /api/webhooks/mercadopago?topic=payment&id=<id>. Disabled once a webhook
// secret is configured (production), where signed POSTs are required.
export async function GET(request: NextRequest) {
  const { env } = await getCloudflareContext();
  const secret = (env as any).MP_WEBHOOK_SECRET as string | undefined;
  if (secret) {
    return NextResponse.json({ ok: true });
  }

  const url = new URL(request.url);
  const topic = url.searchParams.get("topic");
  const id = url.searchParams.get("id");

  if (topic === "payment" && id) {
    try {
      const db = getDb((env as any).DB);
      const result = await processPaymentNotification(db, (env as any).MP_ACCESS_TOKEN, id);
      return NextResponse.json({ ok: result.status === 200 }, { status: result.status });
    } catch (error) {
      console.error("[mercadopago] webhook (GET) processing failed", error);
      return NextResponse.json({ error: "processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
