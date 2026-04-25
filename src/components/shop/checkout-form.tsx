"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Zap, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrderAction } from "@/app/(shop)/checkout/checkout.action";
import { SHIPPING_LABELS, type ShippingMethod } from "@/lib/checkout-utils";
import { formatCurrency } from "@/lib/utils";
import type { CartData } from "@/app/(shop)/carrito/cart.action";

const SHIPPING_ICONS: Record<ShippingMethod, React.ReactNode> = {
  standard: <Truck className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />,
  express: <Zap className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />,
};

export function CheckoutForm({ cart }: { cart: CartData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");

  const shippingCost = shippingMethod === "express" ? 2500 : 0;
  const total = cart.subtotal + shippingCost;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("shippingMethod", shippingMethod);

    startTransition(async () => {
      const result = await createOrderAction(formData);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      if (result.redirect.startsWith("http")) {
        window.location.href = result.redirect;
      } else {
        router.push(result.redirect);
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-3">
        {/* Contact */}
        <section className="space-y-4 rounded-lg border border-sand/60 bg-warm-white p-5">
          <h2 className="font-medium text-espresso">Datos de contacto</h2>
          <div className="space-y-1.5">
            <Label htmlFor="customerName" className="text-warm-gray">
              Nombre completo *
            </Label>
            <Input id="customerName" name="customerName" required placeholder="Juan García" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customerEmail" className="text-warm-gray">
                Email *
              </Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                required
                placeholder="juan@ejemplo.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerPhone" className="text-warm-gray">
                Teléfono
              </Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                placeholder="+54 9 11 1234 5678"
              />
            </div>
          </div>
        </section>

        {/* Shipping address */}
        <section className="space-y-4 rounded-lg border border-sand/60 bg-warm-white p-5">
          <h2 className="font-medium text-espresso">Dirección de envío</h2>
          <div className="space-y-1.5">
            <Label htmlFor="shippingAddress" className="text-warm-gray">
              Calle y número *
            </Label>
            <Input
              id="shippingAddress"
              name="shippingAddress"
              required
              placeholder="Av. Corrientes 1234, Piso 3 B"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="shippingCity" className="text-warm-gray">
                Ciudad *
              </Label>
              <Input id="shippingCity" name="shippingCity" required placeholder="Buenos Aires" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shippingProvince" className="text-warm-gray">
                Provincia *
              </Label>
              <Input
                id="shippingProvince"
                name="shippingProvince"
                required
                placeholder="CABA"
              />
            </div>
          </div>
          <div className="space-y-1.5 sm:w-40">
            <Label htmlFor="shippingZip" className="text-warm-gray">
              Código postal *
            </Label>
            <Input id="shippingZip" name="shippingZip" required placeholder="C1043" />
          </div>
        </section>

        {/* Shipping method */}
        <section className="space-y-3 rounded-lg border border-sand/60 bg-warm-white p-5">
          <h2 className="font-medium text-espresso">Método de envío</h2>
          {(Object.keys(SHIPPING_LABELS) as ShippingMethod[]).map((method) => {
            const { label, description } = SHIPPING_LABELS[method];
            const isSelected = shippingMethod === method;
            return (
              <label
                key={method}
                className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors ${
                  isSelected
                    ? "border-gold/50 bg-gold-lighter/30"
                    : "border-sand/60 hover:border-sand/80 hover:bg-parchment/30"
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value={method}
                  checked={isSelected}
                  onChange={() => setShippingMethod(method)}
                  className="sr-only"
                />
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isSelected ? "border-gold bg-gold" : "border-sand/70"
                  }`}
                >
                  {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-cream" />}
                </div>
                {SHIPPING_ICONS[method]}
                <div className="flex-1">
                  <p className="text-sm font-medium text-espresso">{label}</p>
                  <p className="text-xs text-warm-gray">{description}</p>
                </div>
              </label>
            );
          })}
        </section>

        <Button type="submit" size="lg" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Procesando..." : `Ir a pagar ${formatCurrency(total)}`}
        </Button>
      </form>

      {/* Order summary */}
      <aside className="lg:col-span-2">
        <div className="sticky top-24 rounded-lg border border-sand/60 bg-warm-white p-5">
          <h2 className="mb-4 font-medium text-espresso">Resumen del pedido</h2>
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-2 text-sm">
                <span className="flex-1 leading-tight text-warm-gray">
                  {item.name}
                  <span className="ml-1 font-medium text-espresso">×{item.quantity}</span>
                </span>
                <span className="shrink-0 font-medium text-espresso">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
          <div className="my-4 border-t border-sand/60" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-warm-gray">Subtotal</span>
              <span className="text-espresso">{formatCurrency(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-gray">Envío</span>
              <span className="text-espresso">
                {shippingCost === 0 ? (
                  <span className="font-medium text-elara-success">Gratis</span>
                ) : (
                  formatCurrency(shippingCost)
                )}
              </span>
            </div>
          </div>
          <div className="my-4 border-t border-sand/60" />
          <div className="flex justify-between">
            <span className="font-medium text-espresso">Total</span>
            <span className="font-serif text-xl font-light text-espresso">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
