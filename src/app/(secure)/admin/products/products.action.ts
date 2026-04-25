"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, desc, eq, inArray, like, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { uploadFile, deleteFile } from "@/lib/storage";
import {
  auditLogs,
  categories,
  inventoryMovements,
  priceHistory,
  productImages,
  products,
} from "@/db/schema";
import { verifySession } from "@/lib/session";
import { slugify } from "@/lib/utils";

export type ProductStatus = "active" | "inactive" | "archived" | "draft";

export type ProductListItem = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  stock: number;
  status: ProductStatus;
  isFeatured: boolean;
  categoryName: string | null;
  mainImage: string | null;
  createdAt: Date;
};

export type ProductDetail = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  price: number;
  costPrice: number | null;
  categoryId: number | null;
  stock: number;
  minStock: number;
  weight: number | null;
  attributes: string | null;
  tags: string | null;
  status: ProductStatus;
  isFeatured: boolean;
  images: { id: number; url: string; isMain: boolean; sortOrder: number }[];
};

export async function getCategoriesAction() {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.name);
}

export async function createCategoryAction(
  name: string,
): Promise<{ error?: string; data?: { id: number; name: string } }> {
  const session = await verifySession();
  if (!session) return { error: "No autenticado" };

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  try {
    const [created] = await db
      .insert(categories)
      .values({ name, slug: slugify(name) })
      .returning({ id: categories.id, name: categories.name });
    return { data: created };
  } catch {
    return { error: "Ya existe una categoría con ese nombre" };
  }
}

export async function getProductsAction(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (params?.search) conditions.push(like(products.name, `%${params.search}%`));
  if (params?.status && params.status !== "all")
    conditions.push(eq(products.status, params.status as ProductStatus));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        price: products.price,
        stock: products.stock,
        status: products.status,
        isFeatured: products.isFeatured,
        categoryName: categories.name,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(products).where(where),
  ]);

  const productIds = rows.map((r) => r.id);
  let mainImages: { productId: number; url: string }[] = [];
  if (productIds.length > 0) {
    mainImages = await db
      .select({ productId: productImages.productId, url: productImages.url })
      .from(productImages)
      .where(
        and(
          inArray(productImages.productId, productIds),
          eq(productImages.isMain, true),
        ),
      );
  }

  const imageMap = new Map(mainImages.map((i) => [i.productId, i.url]));

  return {
    products: rows.map((r) => ({
      ...r,
      mainImage: imageMap.get(r.id) ?? null,
    })) as ProductListItem[],
    total: countResult[0]?.count ?? 0,
    page,
    limit,
  };
}

export async function getProductAction(id: number): Promise<ProductDetail | null> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const [product] = await db.select().from(products).where(eq(products.id, id));
  if (!product) return null;

  const images = await db
    .select({
      id: productImages.id,
      url: productImages.url,
      isMain: productImages.isMain,
      sortOrder: productImages.sortOrder,
    })
    .from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(productImages.sortOrder);

  return { ...product, images };
}

function parseProductFormData(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const sku = (formData.get("sku") as string)?.trim().toUpperCase();
  const price = parseFloat(formData.get("price") as string);
  const rawSlug = (formData.get("slug") as string)?.trim();
  const slug = rawSlug || slugify(name ?? "");
  const description = (formData.get("description") as string)?.trim() || null;
  const costPrice = parseFloat(formData.get("costPrice") as string) || null;
  const categoryId = parseInt(formData.get("categoryId") as string) || null;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const minStock = parseInt(formData.get("minStock") as string) || 5;
  const weight = parseFloat(formData.get("weight") as string) || null;
  const status = (formData.get("status") as ProductStatus) || "draft";
  const isFeatured = formData.get("isFeatured") === "true";
  const tags = (formData.get("tags") as string)?.trim() || null;
  const color = (formData.get("color") as string)?.trim();
  const material = (formData.get("material") as string)?.trim();
  const attributes =
    color || material ? JSON.stringify({ color: color || null, material: material || null }) : null;

  return { name, sku, price, slug, description, costPrice, categoryId, stock, minStock, weight, status, isFeatured, tags, attributes };
}

async function uploadProductImages(
  env: any,
  db: ReturnType<typeof getDb>,
  productId: number,
  files: File[],
  existingCount: number,
) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size === 0) continue;
    const ext = file.name.split(".").pop() ?? "jpg";
    const key = `products/${productId}/${Date.now()}-${i}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    await uploadFile(env.R2_BUCKET, key, arrayBuffer, { contentType: file.type });
    await db.insert(productImages).values({
      productId,
      url: key,
      isMain: existingCount === 0 && i === 0,
      sortOrder: existingCount + i,
    });
  }
}

export async function createProductAction(
  formData: FormData,
): Promise<{ error?: string; data?: { id: number } }> {
  const session = await verifySession();
  if (!session) return { error: "No autenticado" };

  const { name, sku, price, ...rest } = parseProductFormData(formData);

  if (!name || !sku || isNaN(price) || price <= 0) {
    return { error: "Nombre, SKU y precio son requeridos" };
  }

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  try {
    const [product] = await db
      .insert(products)
      .values({ name, sku, price, ...rest })
      .returning({ id: products.id });

    const imageFiles = (formData.getAll("images") as File[]).filter((f) => f.size > 0);
    await uploadProductImages(env as any, db, product.id, imageFiles, 0);

    // Register initial stock movement if stock > 0
    if ((rest.stock ?? 0) > 0) {
      await db.insert(inventoryMovements).values({
        productId: product.id,
        type: "in",
        quantity: rest.stock ?? 0,
        previousStock: 0,
        newStock: rest.stock ?? 0,
        reason: "Stock inicial",
        userId: session.userId,
      });
    }

    await db.insert(auditLogs).values({
      userId: session.userId,
      action: "product.create",
      entityType: "product",
      entityId: product.id,
      newValue: JSON.stringify({ name, sku }),
    });

    return { data: { id: product.id } };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("UNIQUE constraint") && msg.includes("slug")) return { error: "Ya existe un producto con ese slug" };
    if (msg.includes("UNIQUE constraint") && msg.includes("sku")) return { error: "Ya existe un producto con ese SKU" };
    console.error("createProductAction error:", error);
    return { error: "Error al crear el producto" };
  }
}

export async function updateProductAction(
  id: number,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await verifySession();
  if (!session) return { error: "No autenticado" };

  const existing = await getProductAction(id);
  if (!existing) return { error: "Producto no encontrado" };

  const { name, sku, price, ...rest } = parseProductFormData(formData);

  if (!name || !sku || isNaN(price) || price <= 0) {
    return { error: "Nombre, SKU y precio son requeridos" };
  }

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  try {
    if (existing.price !== price) {
      await db.insert(priceHistory).values({
        productId: id,
        oldPrice: existing.price,
        newPrice: price,
        reason: (formData.get("priceChangeReason") as string) || null,
        changedBy: session.userId,
      });
    }

    await db
      .update(products)
      .set({ name, sku, price, ...rest, updatedAt: new Date() })
      .where(eq(products.id, id));

    // New image uploads
    const imageFiles = (formData.getAll("images") as File[]).filter((f) => f.size > 0);
    await uploadProductImages(env as any, db, id, imageFiles, existing.images.length);

    // Delete removed images
    const deleteIds = (formData.getAll("deleteImageIds") as string[]).map(Number).filter(Boolean);
    if (deleteIds.length > 0) {
      const toDelete = existing.images.filter((img) => deleteIds.includes(img.id));
      await Promise.all(toDelete.map((img) => deleteFile((env as any).R2_BUCKET, img.url)));
      await db.delete(productImages).where(inArray(productImages.id, deleteIds));

      // If main image was deleted, promote next image
      const mainWasDeleted = toDelete.some((img) => img.isMain);
      if (mainWasDeleted) {
        const remaining = await db
          .select({ id: productImages.id })
          .from(productImages)
          .where(eq(productImages.productId, id))
          .orderBy(productImages.sortOrder)
          .limit(1);
        if (remaining[0]) {
          await db
            .update(productImages)
            .set({ isMain: true })
            .where(eq(productImages.id, remaining[0].id));
        }
      }
    }

    await db.insert(auditLogs).values({
      userId: session.userId,
      action: "product.update",
      entityType: "product",
      entityId: id,
      oldValue: JSON.stringify({ name: existing.name, sku: existing.sku, price: existing.price }),
      newValue: JSON.stringify({ name, sku, price }),
    });

    return {};
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("UNIQUE constraint") && msg.includes("slug")) return { error: "Ya existe un producto con ese slug" };
    if (msg.includes("UNIQUE constraint") && msg.includes("sku")) return { error: "Ya existe un producto con ese SKU" };
    console.error("updateProductAction error:", error);
    return { error: "Error al actualizar el producto" };
  }
}

export async function archiveProductAction(id: number): Promise<{ error?: string }> {
  const session = await verifySession();
  if (!session) return { error: "No autenticado" };

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const [product] = await db
    .select({ status: products.status, name: products.name })
    .from(products)
    .where(eq(products.id, id));
  if (!product) return { error: "Producto no encontrado" };

  const newStatus: ProductStatus = product.status === "archived" ? "inactive" : "archived";

  await db
    .update(products)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(products.id, id));

  await db.insert(auditLogs).values({
    userId: session.userId,
    action: `product.${newStatus}`,
    entityType: "product",
    entityId: id,
    newValue: JSON.stringify({ status: newStatus }),
  });

  return {};
}
