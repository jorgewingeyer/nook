"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, desc, eq, lte, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { auditLogs, categories, inventoryMovements, products } from "@/db/schema";
import { verifySession } from "@/lib/session";

export type InventoryItem = {
  id: number;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  categoryName: string | null;
  isLow: boolean;
};

export type StockMovement = {
  id: number;
  type: "in" | "out" | "adjustment";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  reference: string | null;
  createdAt: Date;
};

export async function getInventoryAction(params?: {
  lowStockOnly?: boolean;
  search?: string;
}): Promise<InventoryItem[]> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const conditions = [];
  if (params?.lowStockOnly) {
    conditions.push(lte(products.stock, products.minStock));
  }

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      stock: products.stock,
      minStock: products.minStock,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(
      conditions.length > 0
        ? and(
            ...conditions,
            sql`${products.status} != 'archived'`,
          )
        : sql`${products.status} != 'archived'`,
    )
    .orderBy(products.name);

  return rows.map((r) => ({ ...r, isLow: r.stock <= r.minStock }));
}

export async function getMovementsAction(productId: number): Promise<StockMovement[]> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const rows = await db
    .select({
      id: inventoryMovements.id,
      type: inventoryMovements.type,
      quantity: inventoryMovements.quantity,
      previousStock: inventoryMovements.previousStock,
      newStock: inventoryMovements.newStock,
      reason: inventoryMovements.reason,
      reference: inventoryMovements.reference,
      createdAt: inventoryMovements.createdAt,
    })
    .from(inventoryMovements)
    .where(eq(inventoryMovements.productId, productId))
    .orderBy(desc(inventoryMovements.createdAt))
    .limit(50);

  return rows as StockMovement[];
}

export async function adjustStockAction(
  productId: number,
  type: "in" | "out" | "adjustment",
  quantity: number,
  reason: string,
): Promise<{ error?: string }> {
  const session = await verifySession();
  if (!session) return { error: "No autenticado" };

  if (quantity <= 0 || !Number.isInteger(quantity)) {
    return { error: "La cantidad debe ser un número entero positivo" };
  }

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const [product] = await db
    .select({ stock: products.stock })
    .from(products)
    .where(eq(products.id, productId));

  if (!product) return { error: "Producto no encontrado" };

  const previousStock = product.stock;
  let newStock: number;

  if (type === "in") {
    newStock = previousStock + quantity;
  } else if (type === "out") {
    newStock = previousStock - quantity;
    if (newStock < 0) return { error: `Stock insuficiente. Stock actual: ${previousStock}` };
  } else {
    newStock = quantity;
  }

  await db
    .update(products)
    .set({ stock: newStock, updatedAt: new Date() })
    .where(eq(products.id, productId));

  await db.insert(inventoryMovements).values({
    productId,
    type,
    quantity: type === "adjustment" ? newStock - previousStock : quantity,
    previousStock,
    newStock,
    reason: reason || null,
    userId: session.userId,
  });

  await db.insert(auditLogs).values({
    userId: session.userId,
    action: `inventory.${type}`,
    entityType: "product",
    entityId: productId,
    oldValue: JSON.stringify({ stock: previousStock }),
    newValue: JSON.stringify({ stock: newStock }),
  });

  return {};
}
