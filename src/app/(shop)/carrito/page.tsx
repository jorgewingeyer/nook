import { cookies } from "next/headers";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CartItemRow } from "@/components/shop/cart-item-row";
import { formatCurrency } from "@/lib/utils";
import { COOKIE_CART } from "@/lib/cart-session";
import { getCartAction } from "./cart.action";

export default async function CarritoPage() {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_CART)?.value;
  const cart = await getCartAction(sessionId);

  if (!cart.items.length) {
    return (
      <div className="container mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
          <p className="mt-2 text-muted-foreground">
            Explorá nuestra tienda y encontrá algo que te guste.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/">Ir a la tienda</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">
        Carrito{" "}
        <span className="text-base font-normal text-muted-foreground">
          ({cart.itemCount} {cart.itemCount === 1 ? "producto" : "productos"})
        </span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="divide-y rounded-lg border">
            {cart.items.map((item) => (
              <div key={item.id} className="px-4">
                <CartItemRow item={item} />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link href="/">← Continuar comprando</Link>
            </Button>
          </div>
        </div>

        {/* Summary */}
        <aside className="space-y-4 rounded-lg border p-5 lg:sticky lg:top-24 lg:self-start">
          <h2 className="font-semibold">Resumen</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span className="text-muted-foreground">Se calcula al finalizar</span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(cart.subtotal)}</span>
          </div>
          <Button asChild size="lg" className="w-full">
            <Link href="/checkout">Finalizar compra</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
