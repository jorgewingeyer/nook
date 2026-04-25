import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { COOKIE_CART } from "@/lib/cart-session";
import { getCartAction } from "../carrito/cart.action";

export default async function CheckoutPage() {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_CART)?.value;

  if (!sessionId) redirect("/carrito");

  const cart = await getCartAction(sessionId);
  if (!cart.items.length) redirect("/carrito");

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Finalizar compra</h1>
      <CheckoutForm cart={cart} />
    </div>
  );
}
