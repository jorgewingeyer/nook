import { cookies } from "next/headers";
import Link from "next/link";
import { ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "@/components/shop/cart-item-row";
import { formatCurrency } from "@/lib/utils";
import { COOKIE_CART } from "@/lib/cart-session";
import { getCartAction } from "./cart.action";

const FREE_SHIPPING_THRESHOLD = 50000;

export default async function CarritoPage() {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_CART)?.value;
  const cart = await getCartAction(sessionId);

  if (!cart.items.length) {
    return (
      <div className="container mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center">
        <ShoppingBag className="h-14 w-14 text-sand" strokeWidth={1} />
        <div>
          <h1 className="font-serif text-2xl font-light text-espresso">Tu carrito está vacío</h1>
          <p className="mt-2 text-sm text-warm-gray">
            Explorá nuestra tienda y encontrá algo que te guste.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/">Ir a la tienda</Link>
        </Button>
      </div>
    );
  }

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cart.subtotal);
  const shippingProgress = Math.min(100, (cart.subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 font-serif text-2xl font-light text-espresso">
        Carrito{" "}
        <span className="font-sans text-base font-normal text-warm-gray">
          ({cart.itemCount} {cart.itemCount === 1 ? "producto" : "productos"})
        </span>
      </h1>

      {/* Free shipping progress */}
      <div className="mb-8 rounded-lg border border-sand/60 bg-warm-white px-4 py-3">
        {remaining === 0 ? (
          <div className="flex items-center gap-2 text-sm font-medium text-elara-success">
            <Truck className="h-4 w-4" strokeWidth={1.5} />
            ¡Tenés envío gratis!
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-warm-gray">
              <Truck className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
              <span>
                Agregá{" "}
                <span className="font-medium text-espresso">{formatCurrency(remaining)}</span>{" "}
                más para envío gratis
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-sand/40">
              <div
                className="h-full rounded-full bg-gold transition-all duration-300"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="divide-y divide-sand/40 rounded-lg border border-sand/60 bg-warm-white px-4">
            {cart.items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>
          <div className="mt-4">
            <Button asChild variant="ghost" size="sm" className="text-warm-gray hover:text-gold">
              <Link href="/">← Continuar comprando</Link>
            </Button>
          </div>
        </div>

        {/* Summary */}
        <aside className="rounded-lg border border-sand/60 bg-warm-white p-5 lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-4 font-medium text-espresso">Resumen</h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-warm-gray">Subtotal</span>
              <span className="text-espresso">{formatCurrency(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-gray">Envío</span>
              <span className="text-warm-gray">
                {remaining === 0 ? (
                  <span className="font-medium text-elara-success">Gratis</span>
                ) : (
                  "Se calcula al finalizar"
                )}
              </span>
            </div>
          </div>
          <div className="my-4 border-t border-sand/60" />
          <div className="flex justify-between">
            <span className="font-medium text-espresso">Total</span>
            <span className="font-serif text-xl font-light text-espresso">
              {formatCurrency(cart.subtotal)}
            </span>
          </div>
          <Button asChild size="lg" className="mt-5 w-full">
            <Link href="/checkout">Finalizar compra</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
