import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  inventoryMovements,
  orderItems,
  orderStatusHistory,
  orders,
  products,
  transactions,
} from "@/db/schema";
import { getMpPayment, verifyMpWebhookSignature } from "@/lib/mercadopago";

type ProcessResult = { status: number };

async function processPayment(paymentId: string, env: any): Promise<ProcessResult> {
  const mpToken = env.MP_ACCESS_TOKEN as string | undefined;
  if (!mpToken) return { status: 200 };

  const db = getDb(env.DB);

  // A null payment usually means MP hasn't propagated it yet (or a transient
  // upstream error). Return 500 so MercadoPago retries with backoff instead of
  // silently dropping the notification.
  const payment = await getMpPayment(paymentId, mpToken);
  if (!payment) return { status: 500 };

  const order = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      total: orders.total,
      paymentStatus: orders.paymentStatus,
    })
    .from(orders)
    .where(eq(orders.orderNumber, payment.external_reference))
    .get();

  // Unknown order: ack so MP stops retrying.
  if (!order) return { status: 200 };

  if (payment.status === "approved" && order.paymentStatus !== "paid") {
    await db.batch([
      db
        .update(orders)
        .set({
          paymentStatus: "paid",
          mpPaymentId: String(payment.id),
          status: "processing",
        })
        .where(eq(orders.id, order.id)),
      db.insert(transactions).values({
        orderId: order.id,
        type: "sale",
        amount: order.total,
        currency: "ARS",
        method: "mercadopago",
        status: "completed",
        mpPaymentId: String(payment.id),
        description: `Pago pedido ${order.orderNumber}`,
      }),
      db.insert(orderStatusHistory).values({
        orderId: order.id,
        status: "processing",
        note: "Pago aprobado vía MercadoPago",
      }),
    ]);
    return { status: 200 };
  }

  if (
    payment.status === "rejected" &&
    order.paymentStatus !== "paid" &&
    order.paymentStatus !== "failed"
  ) {
    // Stock was reserved at checkout; restore it on rejection.
    const items = await db
      .select({ productId: orderItems.productId, quantity: orderItems.quantity })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    const statements: any[] = [];
    for (const item of items) {
      if (item.productId == null) continue;
      const product = await db
        .select({ stock: products.stock })
        .from(products)
        .where(eq(products.id, item.productId))
        .get();
      if (!product) continue;
      const newStock = product.stock + item.quantity;
      statements.push(
        db.update(products).set({ stock: newStock }).where(eq(products.id, item.productId)),
      );
      statements.push(
        db.insert(inventoryMovements).values({
          productId: item.productId,
          type: "in",
          quantity: item.quantity,
          previousStock: product.stock,
          newStock,
          reason: `Pago rechazado ${order.orderNumber}`,
          reference: order.orderNumber,
        }),
      );
    }

    statements.push(
      db.update(orders).set({ paymentStatus: "failed", status: "cancelled" }).where(eq(orders.id, order.id)),
    );
    statements.push(
      db.insert(orderStatusHistory).values({
        orderId: order.id,
        status: "cancelled",
        note: "Pago rechazado, stock restaurado",
      }),
    );

    await db.batch(statements as [any, ...any[]]);
    return { status: 200 };
  }

  // Other statuses (pending, in_process, refunded, …) or already-final orders: ack.
  return { status: 200 };
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
    const result = await processPayment(dataId, env);
    return NextResponse.json({ ok: result.status === 200 }, { status: result.status });
  } catch (error) {
    console.error("[mercadopago] webhook processing failed", error);
    // 500 → MercadoPago retries instead of losing the notification.
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}

// Dev convenience only: lets you trigger processing manually via
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
      const result = await processPayment(id, env);
      return NextResponse.json({ ok: result.status === 200 }, { status: result.status });
    } catch (error) {
      console.error("[mercadopago] webhook (GET) processing failed", error);
      return NextResponse.json({ error: "processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
