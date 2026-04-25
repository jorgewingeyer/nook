import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { orders, transactions } from "@/db/schema";
import { getMpPayment } from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb((env as any).DB);
    const mpToken = (env as any).MP_ACCESS_TOKEN as string | undefined;
    if (!mpToken) return NextResponse.json({ ok: true });

    const body = await request.json() as { type?: string; data?: { id?: string } };
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ ok: true });
    }

    const payment = await getMpPayment(body.data.id, mpToken);
    if (!payment) return NextResponse.json({ ok: true });

    const order = await db
      .select({ id: orders.id, total: orders.total, paymentStatus: orders.paymentStatus })
      .from(orders)
      .where(eq(orders.orderNumber, payment.external_reference))
      .get();

    if (!order) return NextResponse.json({ ok: true });

    if (payment.status === "approved" && order.paymentStatus !== "paid") {
      await db
        .update(orders)
        .set({
          paymentStatus: "paid",
          mpPaymentId: String(payment.id),
          status: "processing",
        })
        .where(eq(orders.id, order.id));

      await db.insert(transactions).values({
        orderId: order.id,
        type: "sale",
        amount: order.total,
        currency: "ARS",
        method: "mercadopago",
        status: "completed",
        mpPaymentId: String(payment.id),
        description: `Pago pedido ${payment.external_reference}`,
      });
    }

    if (payment.status === "rejected") {
      await db
        .update(orders)
        .set({ paymentStatus: "failed", status: "cancelled" })
        .where(eq(orders.id, order.id));
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const topic = url.searchParams.get("topic");
  const id = url.searchParams.get("id");

  if (topic === "payment" && id) {
    await POST(new NextRequest(request.url, {
      method: "POST",
      body: JSON.stringify({ type: "payment", data: { id } }),
      headers: { "Content-Type": "application/json" },
    }));
  }

  return NextResponse.json({ ok: true });
}
