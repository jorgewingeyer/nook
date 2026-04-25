"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { auditLogs, orderItems, orders, products, transactions, users } from "@/db/schema";

export type ReportPeriod = "today" | "week" | "month" | "year";

function periodStartDate(period: ReportPeriod): Date {
  const now = new Date();
  switch (period) {
    case "today": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "month": {
      const d = new Date(now);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "year": {
      return new Date(now.getFullYear(), 0, 1);
    }
  }
}

export type SalesKpis = {
  totalRevenue: number;
  orderCount: number;
  avgTicket: number;
  topProductName: string | null;
};

export type DailySale = {
  date: string; // "YYYY-MM-DD"
  revenue: number;
  orders: number;
};

export type TopProduct = {
  productName: string;
  unitsSold: number;
  revenue: number;
};

export type OrdersByStatus = {
  status: string;
  count: number;
};

export type CustomerSummary = {
  totalCustomers: number;
  guestOrders: number;
  avgOrderValue: number;
  topCustomerName: string | null;
  topCustomerRevenue: number;
};

export async function getSalesKpisAction(period: ReportPeriod): Promise<SalesKpis> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);
  const from = periodStartDate(period);

  const [revenueRow, countRow, topProduct] = await Promise.all([
    db
      .select({ total: sql<number>`coalesce(sum(${orders.total}), 0)` })
      .from(orders)
      .where(and(eq(orders.paymentStatus, "paid"), gte(orders.createdAt, from))),
    db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(gte(orders.createdAt, from)),
    db
      .select({
        productName: orderItems.productName,
        totalQty: sql<number>`sum(${orderItems.quantity})`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(gte(orders.createdAt, from))
      .groupBy(orderItems.productName)
      .orderBy(sql`sum(${orderItems.quantity}) desc`)
      .limit(1),
  ]);

  const totalRevenue = revenueRow[0]?.total ?? 0;
  const orderCount = countRow[0]?.count ?? 0;

  return {
    totalRevenue,
    orderCount,
    avgTicket: orderCount > 0 ? totalRevenue / orderCount : 0,
    topProductName: topProduct[0]?.productName ?? null,
  };
}

export async function getDailySalesAction(period: ReportPeriod): Promise<DailySale[]> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);
  const from = periodStartDate(period);

  const rows = await db
    .select({
      date: sql<string>`strftime('%Y-%m-%d', datetime(${orders.createdAt}, 'unixepoch'))`,
      revenue: sql<number>`coalesce(sum(case when ${orders.paymentStatus} = 'paid' then ${orders.total} else 0 end), 0)`,
      orders: sql<number>`count(*)`,
    })
    .from(orders)
    .where(gte(orders.createdAt, from))
    .groupBy(sql`strftime('%Y-%m-%d', datetime(${orders.createdAt}, 'unixepoch'))`)
    .orderBy(sql`strftime('%Y-%m-%d', datetime(${orders.createdAt}, 'unixepoch'))`);

  return rows;
}

export async function getTopProductsAction(period: ReportPeriod): Promise<TopProduct[]> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);
  const from = periodStartDate(period);

  const rows = await db
    .select({
      productName: orderItems.productName,
      unitsSold: sql<number>`sum(${orderItems.quantity})`,
      revenue: sql<number>`sum(${orderItems.totalPrice})`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(gte(orders.createdAt, from))
    .groupBy(orderItems.productName)
    .orderBy(sql`sum(${orderItems.totalPrice}) desc`)
    .limit(10);

  return rows;
}

export async function getOrdersByStatusAction(period: ReportPeriod): Promise<OrdersByStatus[]> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);
  const from = periodStartDate(period);

  const rows = await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(gte(orders.createdAt, from))
    .groupBy(orders.status);

  return rows;
}

export async function getCustomerSummaryAction(period: ReportPeriod): Promise<CustomerSummary> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);
  const from = periodStartDate(period);

  const [totalCustomers, guestOrders, avgRow, topCustomer] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "customer")),
    db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(gte(orders.createdAt, from), sql`${orders.customerId} is null`)),
    db
      .select({ avg: sql<number>`avg(${orders.total})` })
      .from(orders)
      .where(gte(orders.createdAt, from)),
    db
      .select({
        customerName: orders.customerName,
        total: sql<number>`sum(${orders.total})`,
      })
      .from(orders)
      .where(and(gte(orders.createdAt, from), eq(orders.paymentStatus, "paid")))
      .groupBy(orders.customerName)
      .orderBy(sql`sum(${orders.total}) desc`)
      .limit(1),
  ]);

  return {
    totalCustomers: totalCustomers[0]?.count ?? 0,
    guestOrders: guestOrders[0]?.count ?? 0,
    avgOrderValue: avgRow[0]?.avg ?? 0,
    topCustomerName: topCustomer[0]?.customerName ?? null,
    topCustomerRevenue: topCustomer[0]?.total ?? 0,
  };
}

export type AuditEntry = {
  id: number;
  userName: string | null;
  action: string;
  entityType: string;
  entityId: number | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
};

export async function getAuditLogsAction(params?: {
  action?: string;
  page?: number;
}): Promise<{ logs: AuditEntry[]; total: number }> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const PAGE_SIZE = 30;
  const page = params?.page ?? 1;
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [];
  if (params?.action && params.action !== "all") {
    conditions.push(eq(auditLogs.action, params.action));
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const [totalResult, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(auditLogs).where(where),
    db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        oldValue: auditLogs.oldValue,
        newValue: auditLogs.newValue,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
  ]);

  // Enrich with user names
  const userIds = [...new Set(rows.map((r) => r.userId).filter(Boolean) as number[])];
  let userMap: Record<number, string> = {};
  if (userIds.length) {
    const userRows = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(sql`${users.id} in (${userIds.join(",")})`);
    userMap = Object.fromEntries(userRows.map((u) => [u.id, u.name]));
  }

  return {
    logs: rows.map((r) => ({
      ...r,
      userName: r.userId ? (userMap[r.userId] ?? null) : null,
    })),
    total: totalResult[0]?.count ?? 0,
  };
}

export async function getPriceHistoryAction(productId: number) {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const rows = await db
    .select({
      id: products.id,
    })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!rows.length) return [];

  const { priceHistory } = await import("@/db/schema");
  return db
    .select({
      id: priceHistory.id,
      oldPrice: priceHistory.oldPrice,
      newPrice: priceHistory.newPrice,
      reason: priceHistory.reason,
      createdAt: priceHistory.createdAt,
      changedBy: priceHistory.changedBy,
    })
    .from(priceHistory)
    .where(eq(priceHistory.productId, productId))
    .orderBy(desc(priceHistory.createdAt))
    .limit(50);
}
