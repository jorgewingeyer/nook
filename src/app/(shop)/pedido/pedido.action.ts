"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders, orderItems, orderStatusHistory, refunds } from "@/db/schema";

export type TrackingOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  shippingMethod: string;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  shippingZip: string;
  status: string;
  paymentStatus: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  createdAt: Date;
  items: {
    id: number;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  statusHistory: {
    id: number;
    status: string;
    note: string | null;
    createdAt: Date;
  }[];
};

export async function getOrderByLookupAction(
  orderNumber: string,
  email: string,
): Promise<{ data?: TrackingOrder; error?: string }> {
  if (!orderNumber.trim() || !email.trim()) {
    return { error: "Completá todos los campos" };
  }

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const order = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.orderNumber, orderNumber.trim().toUpperCase()),
        eq(orders.customerEmail, email.trim().toLowerCase()),
      ),
    )
    .get();

  if (!order) return { error: "No encontramos un pedido con esos datos" };

  const [items, statusHistory] = await Promise.all([
    db
      .select({
        id: orderItems.id,
        productName: orderItems.productName,
        productSku: orderItems.productSku,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        totalPrice: orderItems.totalPrice,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id)),
    db
      .select({
        id: orderStatusHistory.id,
        status: orderStatusHistory.status,
        note: orderStatusHistory.note,
        createdAt: orderStatusHistory.createdAt,
      })
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, order.id))
      .orderBy(desc(orderStatusHistory.createdAt)),
  ]);

  return { data: { ...order, items, statusHistory } };
}

export async function requestRefundAction(
  orderId: number,
  reason: string,
): Promise<{ error?: string }> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) return { error: "Pedido no encontrado" };
  if (!["delivered", "processing", "shipped"].includes(order.status)) {
    return { error: "Solo se pueden solicitar devoluciones de pedidos entregados o en proceso" };
  }

  const existing = await db
    .select({ id: refunds.id })
    .from(refunds)
    .where(eq(refunds.orderId, orderId))
    .get();
  if (existing) return { error: "Ya existe una solicitud de devolución para este pedido" };

  await db.insert(refunds).values({
    orderId,
    amount: order.total,
    reason,
    status: "pending",
  });

  return {};
}
