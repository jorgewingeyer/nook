import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, MapPin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="container mx-auto max-w-2xl px-4 py-12">
      {/* Success header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-sage-light/40">
          <CheckCircle2 className="h-10 w-10 text-elara-success" strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-3xl font-light text-espresso">¡Pedido recibido!</h1>
        <p className="mt-2 text-sm text-warm-gray">
          Gracias por tu compra. Te confirmaremos el envío por email.
        </p>
      </div>

      {/* Order card */}
      <div className="space-y-5 rounded-xl border border-sand/60 bg-warm-white p-6">
        {/* Order number + status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-warm-gray">
              Número de pedido
            </p>
            <p className="mt-0.5 font-mono text-lg font-semibold text-espresso">
              {order.orderNumber}
            </p>
          </div>
          <Badge variant={variant}>{label}</Badge>
        </div>

        <div className="border-t border-sand/60" />

        {/* Items */}
        <div className="space-y-2.5">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-warm-gray">
                {item.productName}{" "}
                <span className="font-medium text-espresso">×{item.quantity}</span>
              </span>
              <span className="font-medium text-espresso">{formatCurrency(item.totalPrice)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-sand/60" />

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-warm-gray">Subtotal</span>
            <span className="text-espresso">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-warm-gray">Envío</span>
            <span className="text-espresso">
              {order.shippingCost === 0 ? (
                <span className="font-medium text-elara-success">Gratis</span>
              ) : (
                formatCurrency(order.shippingCost)
              )}
            </span>
          </div>
        </div>

        <div className="border-t border-sand/60" />

        <div className="flex justify-between">
          <span className="font-medium text-espresso">Total</span>
          <span className="font-serif text-xl font-light text-espresso">
            {formatCurrency(order.total)}
          </span>
        </div>

        <div className="border-t border-sand/60" />

        {/* Delivery info */}
        <div className="space-y-2.5 text-sm text-warm-gray">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
            <div>
              <p className="font-medium text-espresso">{order.customerName}</p>
              <p>
                {order.shippingAddress}, {order.shippingCity}, {order.shippingProvince} (
                {order.shippingZip})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Mail className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
            <span>{order.customerEmail}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Package className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
            <span>Pedido realizado el {formatDate(order.createdAt as Date)}</span>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
