import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getOrderStatusConfig } from "@/lib/order-utils";
import { getOrderAction } from "../checkout.action";

interface PageProps {
  searchParams: Promise<{ order_id?: string }>;
}

export default async function ExitoPage({ searchParams }: PageProps) {
  const { order_id } = await searchParams;
  const orderId = parseInt(order_id ?? "");
  if (isNaN(orderId)) redirect("/");

  const order = await getOrderAction(orderId);
  if (!order) redirect("/");

  const { label, variant } = getOrderStatusConfig(order.paymentStatus);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 space-y-8">
      {/* Success header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold">¡Pedido recibido!</h1>
        <p className="text-muted-foreground">
          Gracias por tu compra. Te confirmaremos el envío por email.
        </p>
      </div>

      {/* Order card */}
      <div className="rounded-xl border p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Número de pedido</p>
            <p className="mt-0.5 font-mono text-lg font-bold">{order.orderNumber}</p>
          </div>
          <Badge variant={variant}>{label}</Badge>
        </div>

        <Separator />

        {/* Items */}
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {item.productName}{" "}
                <span className="font-medium text-foreground">×{item.quantity}</span>
              </span>
              <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Envío</span>
            <span>{order.shippingCost === 0 ? "Gratis" : formatCurrency(order.shippingCost)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        <Separator />

        {/* Shipping info */}
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-1.5 font-medium">
            <Package className="h-4 w-4" />
            Dirección de entrega
          </div>
          <p className="text-muted-foreground">
            {order.customerName} — {order.shippingAddress}, {order.shippingCity},{" "}
            {order.shippingProvince} ({order.shippingZip})
          </p>
          <p className="text-muted-foreground">Email: {order.customerEmail}</p>
          <p className="mt-1 text-xs">
            Pedido realizado el {formatDate(order.createdAt as Date)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" variant="outline" className="flex-1">
          <Link
            href={`/pedido?numero=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(order.customerEmail)}`}
          >
            Seguir mi pedido
          </Link>
        </Button>
        <Button asChild size="lg" className="flex-1">
          <Link href="/">Seguir comprando</Link>
        </Button>
      </div>
    </div>
  );
}
