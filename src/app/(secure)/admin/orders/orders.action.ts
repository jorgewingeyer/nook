"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { verifySession } from "@/lib/session";
import { orders, orderItems, orderStatusHistory, transactions } from "@/db/schema";
import type { OrderStatus } from "@/lib/order-utils";

const PAGE_SIZE = 20;

export type OrderListItem = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: Date;
};

export type OrderItem = {
  id: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type StatusHistoryEntry = {
  id: number;
  status: string;
  note: string | null;
  createdAt: Date;
};

export type OrderDetail = OrderListItem & {
  customerPhone: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  shippingZip: string;
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  discount: number;
  paymentMethod: string | null;
  mpPaymentId: string | null;
  notes: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  items: OrderItem[];
  statusHistory: StatusHistoryEntry[];
};

export async function getOrdersAction(params?: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<{ orders: OrderListItem[]; total: number; page: number }> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const page = params?.page ?? 1;
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [];
  if (params?.status && params.status !== "all") {
    conditions.push(eq(orders.status, params.status as OrderStatus));
  }
  if (params?.search) {
    const term = `%${params.search}%`;
    conditions.push(
      or(like(orders.orderNumber, term), like(orders.customerName, term), like(orders.customerEmail, term)),
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const [totalResult, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(orders).where(where),
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerName: orders.customerName,
        customerEmail: orders.customerEmail,
        total: orders.total,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
  ]);

  return { orders: rows, total: totalResult[0]?.count ?? 0, page };
}

export async function getOrderDetailAction(id: number): Promise<OrderDetail | null> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const row = await db.select().from(orders).where(eq(orders.id, id)).get();
  if (!row) return null;

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
      .where(eq(orderItems.orderId, id)),
    db
      .select({
        id: orderStatusHistory.id,
        status: orderStatusHistory.status,
        note: orderStatusHistory.note,
        createdAt: orderStatusHistory.createdAt,
      })
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, id))
      .orderBy(desc(orderStatusHistory.createdAt)),
  ]);

  return { ...row, items, statusHistory };
}

export async function updateOrderStatusAction(
  orderId: number,
  status: OrderStatus,
  note?: string,
  trackingNumber?: string,
): Promise<{ error?: string }> {
  const session = await verifySession();
  if (!session) return { error: "No autorizado" };

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const updates: Partial<typeof orders.$inferInsert> = {
    status,
    updatedAt: new Date(),
  };
  if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber || null;

  await Promise.all([
    db.update(orders).set(updates).where(eq(orders.id, orderId)),
    db.insert(orderStatusHistory).values({
      orderId,
      status,
      note: note || null,
      changedBy: session.userId,
    }),
  ]);

  return {};
}

export async function addOrderNoteAction(
  orderId: number,
  notes: string,
): Promise<{ error?: string }> {
  const session = await verifySession();
  if (!session) return { error: "No autorizado" };

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  await db
    .update(orders)
    .set({ notes, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  return {};
}

export type TransactionListItem = {
  id: number;
  orderId: number | null;
  orderNumber: string | null;
  type: string;
  amount: number;
  method: string;
  status: string;
  description: string | null;
  createdAt: Date;
};

export type FinanceSummary = {
  totalRevenue: number;
  pendingAmount: number;
  refundedAmount: number;
  totalTransactions: number;
};

export async function getFinanceSummaryAction(): Promise<FinanceSummary> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const [revenue, pending, refunded, total] = await Promise.all([
    db
      .select({ sum: sql<number>`coalesce(sum(amount), 0)` })
      .from(transactions)
      .where(and(eq(transactions.type, "sale"), eq(transactions.status, "completed"))),
    db
      .select({ sum: sql<number>`coalesce(sum(amount), 0)` })
      .from(transactions)
      .where(eq(transactions.status, "pending")),
    db
      .select({ sum: sql<number>`coalesce(sum(amount), 0)` })
      .from(transactions)
      .where(eq(transactions.type, "refund")),
    db.select({ count: sql<number>`count(*)` }).from(transactions),
  ]);

  return {
    totalRevenue: revenue[0]?.sum ?? 0,
    pendingAmount: pending[0]?.sum ?? 0,
    refundedAmount: Math.abs(refunded[0]?.sum ?? 0),
    totalTransactions: total[0]?.count ?? 0,
  };
}

export async function getTransactionsAction(params?: {
  type?: string;
  status?: string;
  page?: number;
}): Promise<{ transactions: TransactionListItem[]; total: number; page: number }> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const page = params?.page ?? 1;
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [];
  if (params?.type && params.type !== "all") {
    conditions.push(eq(transactions.type, params.type as any));
  }
  if (params?.status && params.status !== "all") {
    conditions.push(eq(transactions.status, params.status as any));
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const [totalResult, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(transactions).where(where),
    db
      .select({
        id: transactions.id,
        orderId: transactions.orderId,
        type: transactions.type,
        amount: transactions.amount,
        method: transactions.method,
        status: transactions.status,
        description: transactions.description,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .where(where)
      .orderBy(desc(transactions.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
  ]);

  // Enrich with order numbers
  const orderIds = rows.map((r) => r.orderId).filter(Boolean) as number[];
  let orderNumberMap: Record<number, string> = {};
  if (orderIds.length) {
    const orderRows = await db
      .select({ id: orders.id, orderNumber: orders.orderNumber })
      .from(orders)
      .where(sql`${orders.id} in (${orderIds.join(",")})`);
    orderNumberMap = Object.fromEntries(orderRows.map((o) => [o.id, o.orderNumber]));
  }

  return {
    transactions: rows.map((r) => ({
      ...r,
      orderNumber: r.orderId ? (orderNumberMap[r.orderId] ?? null) : null,
    })),
    total: totalResult[0]?.count ?? 0,
    page,
  };
}

export async function processRefundAction(
  orderId: number,
  amount: number,
  reason: string,
): Promise<{ error?: string }> {
  const session = await verifySession();
  if (!session) return { error: "No autorizado" };

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);
  const mpToken = (env as any).MP_ACCESS_TOKEN as string | undefined;

  const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) return { error: "Pedido no encontrado" };
  if (order.paymentStatus !== "paid") return { error: "El pedido no está pagado" };

  let mpRefundId: string | null = null;

  if (mpToken && order.mpPaymentId) {
    const { createMpRefund } = await import("@/lib/mercadopago");
    const refund = await createMpRefund(order.mpPaymentId, amount, mpToken);
    if (!refund) return { error: "Error al procesar el reembolso en MercadoPago" };
    mpRefundId = String(refund.id);
  }

  const { refunds } = await import("@/db/schema");

  await Promise.all([
    db.insert(refunds).values({
      orderId,
      requestedBy: session.userId,
      amount,
      reason,
      status: "completed",
      mpRefundId,
      processedBy: session.userId,
      processedAt: new Date(),
    }),
    db.insert(transactions).values({
      orderId,
      type: "refund",
      amount: -amount,
      currency: "ARS",
      method: order.paymentMethod === "mercadopago" ? "mercadopago" : "other",
      status: "completed",
      mpPaymentId: order.mpPaymentId,
      description: `Reembolso: ${reason}`,
    }),
    db.update(orders).set({ paymentStatus: "refunded", updatedAt: new Date() }).where(eq(orders.id, orderId)),
  ]);

  return {};
}
