"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { cart, cartItems, productImages, products } from "@/db/schema";
import {
  COOKIE_CART,
  CART_EXPIRY_DAYS,
  cartCookieOptions,
  generateCartSessionId,
} from "@/lib/cart-session";

export type CartItem = {
  id: number;
  productId: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  stock: number;
  quantity: number;
  mainImage: string | null;
  subtotal: number;
};

export type CartData = {
  sessionId: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
};

async function getOrCreateCart(db: ReturnType<typeof import("@/lib/db").getDb>, sessionId: string) {
  const existing = await db.select().from(cart).where(eq(cart.sessionId, sessionId)).get();
  if (existing) return existing;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CART_EXPIRY_DAYS);

  const result = await db
    .insert(cart)
    .values({ sessionId, expiresAt })
    .returning()
    .get();
  return result;
}

export async function getCartAction(sessionId?: string): Promise<CartData> {
  const empty: CartData = { sessionId: sessionId ?? "", items: [], subtotal: 0, itemCount: 0 };
  if (!sessionId) return empty;

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const cartRow = await db.select().from(cart).where(eq(cart.sessionId, sessionId)).get();
  if (!cartRow) return empty;

  const items = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      price: products.price,
      stock: products.stock,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartRow.id));

  if (!items.length) return empty;

  const mainImages = await db
    .select({ productId: productImages.productId, url: productImages.url })
    .from(productImages)
    .where(
      and(
        eq(productImages.isMain, true),
        sql`${productImages.productId} IN (${items.map((i) => i.productId).join(",")})`,
      ),
    );

  const imageMap = Object.fromEntries(mainImages.map((img) => [img.productId, img.url]));

  const enrichedItems: CartItem[] = items.map((item) => ({
    ...item,
    mainImage: imageMap[item.productId] ?? null,
    subtotal: item.price * item.quantity,
  }));

  const subtotal = enrichedItems.reduce((sum, i) => sum + i.subtotal, 0);
  const itemCount = enrichedItems.reduce((sum, i) => sum + i.quantity, 0);

  return { sessionId, items: enrichedItems, subtotal, itemCount };
}

export async function getCartCountAction(): Promise<number> {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_CART)?.value;
  if (!sessionId) return 0;

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const cartRow = await db.select({ id: cart.id }).from(cart).where(eq(cart.sessionId, sessionId)).get();
  if (!cartRow) return 0;

  const result = await db
    .select({ count: sql<number>`coalesce(sum(${cartItems.quantity}), 0)` })
    .from(cartItems)
    .where(eq(cartItems.cartId, cartRow.id))
    .get();

  return result?.count ?? 0;
}

export async function addToCartAction(
  productId: number,
  quantity: number = 1,
): Promise<{ error?: string; sessionId?: string }> {
  const jar = await cookies();
  let sessionId = jar.get(COOKIE_CART)?.value;

  if (!sessionId) {
    sessionId = generateCartSessionId();
    jar.set(COOKIE_CART, sessionId, cartCookieOptions());
  }

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const product = await db
    .select({ id: products.id, stock: products.stock, status: products.status })
    .from(products)
    .where(eq(products.id, productId))
    .get();

  if (!product || product.status !== "active") return { error: "Producto no disponible" };
  if (product.stock < quantity) return { error: "Stock insuficiente" };

  const cartRow = await getOrCreateCart(db, sessionId);

  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartRow.id), eq(cartItems.productId, productId)))
    .get();

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > product.stock) return { error: "Stock insuficiente" };
    await db
      .update(cartItems)
      .set({ quantity: newQty })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({ cartId: cartRow.id, productId, quantity });
  }

  return { sessionId };
}

export async function removeFromCartAction(productId: number): Promise<{ error?: string }> {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_CART)?.value;
  if (!sessionId) return {};

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const cartRow = await db.select({ id: cart.id }).from(cart).where(eq(cart.sessionId, sessionId)).get();
  if (!cartRow) return {};

  await db
    .delete(cartItems)
    .where(and(eq(cartItems.cartId, cartRow.id), eq(cartItems.productId, productId)));

  return {};
}

export async function updateCartQuantityAction(
  productId: number,
  quantity: number,
): Promise<{ error?: string }> {
  if (quantity < 1) return removeFromCartAction(productId);

  const jar = await cookies();
  const sessionId = jar.get(COOKIE_CART)?.value;
  if (!sessionId) return { error: "Carrito no encontrado" };

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const product = await db
    .select({ stock: products.stock })
    .from(products)
    .where(eq(products.id, productId))
    .get();

  if (!product || quantity > product.stock) return { error: "Stock insuficiente" };

  const cartRow = await db.select({ id: cart.id }).from(cart).where(eq(cart.sessionId, sessionId)).get();
  if (!cartRow) return {};

  await db
    .update(cartItems)
    .set({ quantity })
    .where(and(eq(cartItems.cartId, cartRow.id), eq(cartItems.productId, productId)));

  return {};
}
