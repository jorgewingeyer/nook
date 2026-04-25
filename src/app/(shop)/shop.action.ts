"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { categories, productImages, products } from "@/db/schema";

const PAGE_SIZE = 12;

export type ShopProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  description: string | null;
  stock: number;
  isFeatured: boolean;
  categoryName: string | null;
  mainImage: string | null;
};

export type ShopProductDetail = ShopProduct & {
  sku: string;
  costPrice: number | null;
  weight: number | null;
  attributes: string | null;
  tags: string | null;
  images: { id: number; url: string; isMain: boolean; altText: string | null }[];
  related: ShopProduct[];
};

export type ShopCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

export async function getShopCatalogAction(params?: {
  search?: string;
  categorySlug?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "name";
  page?: number;
}): Promise<{ products: ShopProduct[]; total: number; page: number; limit: number }> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const page = params?.page ?? 1;
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [eq(products.status, "active")];

  if (params?.search) {
    conditions.push(sql`${products.name} LIKE ${"%" + params.search + "%"}`);
  }

  if (params?.categorySlug) {
    const cat = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, params.categorySlug))
      .get();
    if (cat) conditions.push(eq(products.categoryId, cat.id));
  }

  const orderBy = (() => {
    switch (params?.sortBy) {
      case "price_asc": return sql`${products.price} ASC`;
      case "price_desc": return sql`${products.price} DESC`;
      case "name": return sql`${products.name} ASC`;
      default: return sql`${products.createdAt} DESC`;
    }
  })();

  const [totalResult, rows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(...conditions)),
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        description: products.description,
        stock: products.stock,
        isFeatured: products.isFeatured,
        categoryId: products.categoryId,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(PAGE_SIZE)
      .offset(offset),
  ]);

  const mainImages = rows.length
    ? await db
        .select({ productId: productImages.productId, url: productImages.url })
        .from(productImages)
        .where(and(inArray(productImages.productId, rows.map((r) => r.id)), eq(productImages.isMain, true)))
    : [];

  const imageMap = Object.fromEntries(mainImages.map((img) => [img.productId, img.url]));

  return {
    products: rows.map((r) => ({
      ...r,
      mainImage: imageMap[r.id] ?? null,
    })),
    total: totalResult[0]?.count ?? 0,
    page,
    limit: PAGE_SIZE,
  };
}

export async function getFeaturedProductsAction(): Promise<ShopProduct[]> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      description: products.description,
      stock: products.stock,
      isFeatured: products.isFeatured,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.status, "active"), eq(products.isFeatured, true)))
    .orderBy(desc(products.createdAt))
    .limit(8);

  if (!rows.length) return [];

  const mainImages = await db
    .select({ productId: productImages.productId, url: productImages.url })
    .from(productImages)
    .where(and(inArray(productImages.productId, rows.map((r) => r.id)), eq(productImages.isMain, true)));

  const imageMap = Object.fromEntries(mainImages.map((img) => [img.productId, img.url]));
  return rows.map((r) => ({ ...r, mainImage: imageMap[r.id] ?? null }));
}

export async function getShopProductAction(slug: string): Promise<ShopProductDetail | null> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const row = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      price: products.price,
      costPrice: products.costPrice,
      description: products.description,
      stock: products.stock,
      weight: products.weight,
      attributes: products.attributes,
      tags: products.tags,
      isFeatured: products.isFeatured,
      categoryId: products.categoryId,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.status, "active")))
    .get();

  if (!row) return null;

  const [images, related] = await Promise.all([
    db
      .select({
        id: productImages.id,
        url: productImages.url,
        isMain: productImages.isMain,
        altText: productImages.altText,
      })
      .from(productImages)
      .where(eq(productImages.productId, row.id))
      .orderBy(desc(productImages.isMain), productImages.sortOrder),

    row.categoryId
      ? db
          .select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            price: products.price,
            description: products.description,
            stock: products.stock,
            isFeatured: products.isFeatured,
            categoryName: categories.name,
          })
          .from(products)
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .where(
            and(
              eq(products.status, "active"),
              eq(products.categoryId, row.categoryId!),
              sql`${products.id} != ${row.id}`,
            ),
          )
          .orderBy(desc(products.createdAt))
          .limit(4)
      : Promise.resolve([]),
  ]);

  const relatedIds = related.map((r) => r.id);
  const relatedImages = relatedIds.length
    ? await db
        .select({ productId: productImages.productId, url: productImages.url })
        .from(productImages)
        .where(and(inArray(productImages.productId, relatedIds), eq(productImages.isMain, true)))
    : [];

  const relatedImageMap = Object.fromEntries(relatedImages.map((img) => [img.productId, img.url]));

  return {
    ...row,
    mainImage: images.find((i) => i.isMain)?.url ?? images[0]?.url ?? null,
    images,
    related: related.map((r) => ({ ...r, mainImage: relatedImageMap[r.id] ?? null })),
  };
}

export async function getShopCategoriesAction(): Promise<ShopCategory[]> {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      imageUrl: categories.imageUrl,
    })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.sortOrder, categories.name);
}
