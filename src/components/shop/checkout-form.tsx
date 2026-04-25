"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createOrderAction } from "@/app/(shop)/checkout/checkout.action";
import { SHIPPING_LABELS, type ShippingMethod } from "@/lib/checkout-utils";
import { formatCurrency } from "@/lib/utils";
import type { CartData } from "@/app/(shop)/carrito/cart.action";

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
      <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-3">
        {/* Contact */}
        <div className="space-y-4 rounded-lg border p-5">
          <h2 className="font-semibold">Datos de contacto</h2>
          <div className="space-y-2">
            <Label htmlFor="customerName">Nombre completo *</Label>
            <Input id="customerName" name="customerName" required placeholder="Juan García" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email *</Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                required
                placeholder="juan@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Teléfono</Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                placeholder="+54 9 11 1234 5678"
              />
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="space-y-4 rounded-lg border p-5">
          <h2 className="font-semibold">Dirección de envío</h2>
          <div className="space-y-2">
            <Label htmlFor="shippingAddress">Calle y número *</Label>
            <Input
              id="shippingAddress"
              name="shippingAddress"
              required
              placeholder="Av. Corrientes 1234, Piso 3 B"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shippingCity">Ciudad *</Label>
              <Input id="shippingCity" name="shippingCity" required placeholder="Buenos Aires" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingProvince">Provincia *</Label>
              <Input
                id="shippingProvince"
                name="shippingProvince"
                required
                placeholder="CABA"
              />
            </div>
          </div>
          <div className="space-y-2 sm:w-40">
            <Label htmlFor="shippingZip">Código postal *</Label>
            <Input id="shippingZip" name="shippingZip" required placeholder="C1043" />
          </div>
        </div>

        {/* Shipping method */}
        <div className="space-y-3 rounded-lg border p-5">
          <h2 className="font-semibold">Método de envío</h2>
          {(Object.keys(SHIPPING_LABELS) as ShippingMethod[]).map((method) => {
            const { label, description } = SHIPPING_LABELS[method];
            return (
              <label
                key={method}
                className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors ${
                  shippingMethod === method ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value={method}
                  checked={shippingMethod === method}
                  onChange={() => setShippingMethod(method)}
                  className="h-4 w-4"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </label>
            );
          })}
        </div>

        <Button type="submit" size="lg" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Procesando..." : `Ir a pagar ${formatCurrency(total)}`}
        </Button>
      </form>

      {/* Order summary */}
      <aside className="lg:col-span-2">
        <div className="sticky top-24 space-y-4 rounded-lg border p-5">
          <h2 className="font-semibold">Resumen del pedido</h2>
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-2 text-sm">
                <span className="flex-1 leading-tight">
                  {item.name}
                  <span className="ml-1 text-muted-foreground">×{item.quantity}</span>
                </span>
                <span className="shrink-0 font-medium">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span>{shippingCost === 0 ? "Gratis" : formatCurrency(shippingCost)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
