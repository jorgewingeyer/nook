import { eq } from "drizzle-orm";
import {
  inventoryMovements,
  orderItems,
  orderStatusHistory,
  orders,
  products,
  transactions,
} from "../db/schema";
import { getMpPayment } from "./mercadopago";

export interface PaymentProcessResult {
  status: number;
  /** Products that dropped to/below their minStock after this payment. */
  lowStock?: { productId: number; stock: number; minStock: number }[];
}

type Db = ReturnType<typeof import("./db").getDb>;

/**
 * Core MercadoPago payment reconciliation, shared by the inline webhook path
 * (local dev / no queue) and the async queue consumer worker. Pure: takes a
 * Drizzle D1 instance + access token, no request/env coupling.
 *
 * Returns an HTTP-style status: 200 = handled/ack, 500 = transient (retry).
 */
export async function processPaymentNotification(
  db: Db,
  mpToken: string | undefined,
  paymentId: string,
): Promise<PaymentProcessResult> {
  if (!mpToken) return { status: 200 };

  const payment = await getMpPayment(paymentId, mpToken);
  // Likely propagation delay or a transient upstream error → signal retry.
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

    // Flag products that hit their low-stock threshold (caller decides how to
    // notify — Phase 2b workflow / Phase 3 alerts).
    const items = await db
      .select({ productId: orderItems.productId })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));
    const lowStock: PaymentProcessResult["lowStock"] = [];
    for (const item of items) {
      if (item.productId == null) continue;
      const p = await db
        .select({ stock: products.stock, minStock: products.minStock })
        .from(products)
        .where(eq(products.id, item.productId))
        .get();
      if (p && p.stock <= p.minStock) {
        lowStock.push({ productId: item.productId, stock: p.stock, minStock: p.minStock });
      }
    }

    return { status: 200, lowStock };
  }

  if (
    payment.status === "rejected" &&
    order.paymentStatus !== "paid" &&
    order.paymentStatus !== "failed"
  ) {
    await restoreOrderStock(db, order.id, order.orderNumber, "Pago rechazado");
    return { status: 200 };
  }

  return { status: 200 };
}

/**
 * Restores reserved stock for an order's items and marks it cancelled/failed.
 * Shared by payment rejection and the pending-order expiry workflow.
 */
export async function restoreOrderStock(
  db: Db,
  orderId: number,
  orderNumber: string,
  reason: string,
): Promise<void> {
  const items = await db
    .select({ productId: orderItems.productId, quantity: orderItems.quantity })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

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
        reason: `${reason} ${orderNumber}`,
        reference: orderNumber,
      }),
    );
  }

  statements.push(
    db.update(orders).set({ paymentStatus: "failed", status: "cancelled" }).where(eq(orders.id, orderId)),
  );
  statements.push(
    db.insert(orderStatusHistory).values({
      orderId,
      status: "cancelled",
      note: `${reason}, stock restaurado`,
    }),
  );

  await db.batch(statements as [any, ...any[]]);
}
