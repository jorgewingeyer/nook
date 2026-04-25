"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { cart, cartItems, inventoryMovements, orderItems, orderStatusHistory, orders, products } from "@/db/schema";
import { COOKIE_CART } from "@/lib/cart-session";
import { calcShippingCost, generateOrderNumber, type ShippingMethod } from "@/lib/checkout-utils";
import { createMpPreference } from "@/lib/mercadopago";
import { getCartAction } from "../carrito/cart.action";

export type CheckoutResult =
  | { error: string }
  | { redirect: string; orderId: number };

export async function createOrderAction(formData: FormData): Promise<CheckoutResult> {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_CART)?.value;
  if (!sessionId) return { error: "Carrito vacío" };

  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const cartData = await getCartAction(sessionId);
  if (!cartData.items.length) return { error: "El carrito está vacío" };

  const customerName = (formData.get("customerName") as string | null)?.trim() ?? "";
  const customerEmail = (formData.get("customerEmail") as string | null)?.trim() ?? "";
  const customerPhone = (formData.get("customerPhone") as string | null)?.trim() ?? "";
  const shippingAddress = (formData.get("shippingAddress") as string | null)?.trim() ?? "";
  const shippingCity = (formData.get("shippingCity") as string | null)?.trim() ?? "";
  const shippingProvince = (formData.get("shippingProvince") as string | null)?.trim() ?? "";
  const shippingZip = (formData.get("shippingZip") as string | null)?.trim() ?? "";
  const shippingMethod = ((formData.get("shippingMethod") as string) ?? "standard") as ShippingMethod;

  if (!customerName) return { error: "El nombre es requerido" };
  if (!customerEmail || !customerEmail.includes("@")) return { error: "Email inválido" };
  if (!shippingAddress) return { error: "La dirección es requerida" };
  if (!shippingCity) return { error: "La ciudad es requerida" };
  if (!shippingProvince) return { error: "La provincia es requerida" };
  if (!shippingZip) return { error: "El código postal es requerido" };

  for (const item of cartData.items) {
    const product = await db
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, item.productId))
      .get();
    if (!product || product.stock < item.quantity) {
      return { error: `Stock insuficiente para "${item.name}"` };
    }
  }

  const shippingCost = calcShippingCost(shippingMethod);
  const subtotal = cartData.subtotal;
  const total = subtotal + shippingCost;
  const orderNumber = generateOrderNumber();

  const order = await db
    .insert(orders)
    .values({
      orderNumber,
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      shippingAddress,
      shippingCity,
      shippingProvince,
      shippingZip,
      shippingMethod,
      shippingCost,
      subtotal,
      discount: 0,
      total,
      paymentMethod: "mercadopago",
      paymentStatus: "pending",
      status: "pending",
    })
    .returning({ id: orders.id })
    .get();

  await db.insert(orderItems).values(
    cartData.items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      productName: item.name,
      productSku: item.sku,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.subtotal,
    })),
  );

  await db.insert(orderStatusHistory).values({
    orderId: order.id,
    status: "pending",
    note: "Pedido creado, esperando pago",
  });

  for (const item of cartData.items) {
    const product = await db
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, item.productId))
      .get();

    if (product) {
      const newStock = product.stock - item.quantity;
      await db.update(products).set({ stock: newStock }).where(eq(products.id, item.productId));
      await db.insert(inventoryMovements).values({
        productId: item.productId,
        type: "out",
        quantity: item.quantity,
        previousStock: product.stock,
        newStock,
        reason: `Pedido ${orderNumber}`,
        reference: orderNumber,
      });
    }
  }

  const mpToken = (env as any).MP_ACCESS_TOKEN as string | undefined;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL as string | undefined) ?? "https://nook.localhost:1355";

  let redirectUrl = `/checkout/exito?order_id=${order.id}`;

  if (mpToken) {
    try {
      const preference = await createMpPreference({
        items: cartData.items.map((item) => ({
          id: String(item.productId),
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        payer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone ? { number: customerPhone } : undefined,
        },
        orderId: order.id,
        orderNumber,
        accessToken: mpToken,
        appUrl,
      });

      await db
        .update(orders)
        .set({ mpPreferenceId: preference.preferenceId })
        .where(eq(orders.id, order.id));

      redirectUrl = preference.sandboxInitPoint;
    } catch {
      // MP preference failed: send user to success page anyway (order is created)
    }
  }

  const cartRow = await db.select({ id: cart.id }).from(cart).where(eq(cart.sessionId, sessionId)).get();
  if (cartRow) {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartRow.id));
  }

  jar.delete(COOKIE_CART);

  return { redirect: redirectUrl, orderId: order.id };
}

export async function getOrderAction(orderId: number) {
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .get();

  if (!order) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return { ...order, items };
}
