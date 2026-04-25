import { CheckCircle, Circle, Package, Truck } from "lucide-react";
import { RefundRequestForm } from "./refund-request-form";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getOrderStatusConfig, getPaymentStatusConfig } from "@/lib/order-utils";
import { getOrderByLookupAction } from "./pedido.action";
import { OrderLookupForm } from "./order-lookup-form";

interface PageProps {
  searchParams: Promise<{ numero?: string; email?: string }>;
}

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"] as const;

export default async function PedidoPage({ searchParams }: PageProps) {
  const { numero, email } = await searchParams;
  const showResult = !!(numero && email);

  const result = showResult ? await getOrderByLookupAction(numero!, email!) : null;
  const order = result?.data;
  const lookupError = result?.error;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Seguimiento de pedido</h1>
        <p className="text-muted-foreground text-sm">
          Ingresá el número de tu pedido y el email con el que compraste
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <OrderLookupForm defaultNumber={numero} defaultEmail={email} />
          {lookupError && (
            <p className="mt-3 text-center text-sm text-destructive">{lookupError}</p>
          )}
        </CardContent>
      </Card>

      {order && (
        <>
          {/* Status progress */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-mono">{order.orderNumber}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={getOrderStatusConfig(order.status).variant}>
                    {getOrderStatusConfig(order.status).label}
                  </Badge>
                  <Badge variant={getPaymentStatusConfig(order.paymentStatus).variant}>
                    {getPaymentStatusConfig(order.paymentStatus).label}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Realizado el {formatDate(order.createdAt)}
              </p>
            </CardHeader>
            <CardContent>
              {/* Progress bar */}
              {!["cancelled", "refunded"].includes(order.status) && (
                <div className="mb-6 mt-2">
                  <div className="flex justify-between">
                    {STATUS_STEPS.map((step, i) => {
                      const currentIdx = STATUS_STEPS.indexOf(order.status as typeof STATUS_STEPS[number]);
                      const isDone = i <= currentIdx;
                      const isActive = i === currentIdx;
                      const cfg = getOrderStatusConfig(step);
                      return (
                        <div key={step} className="flex flex-1 flex-col items-center gap-1">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                              isDone
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted bg-background text-muted-foreground"
                            } ${isActive ? "ring-2 ring-primary ring-offset-2" : ""}`}
                          >
                            {isDone ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                          </div>
                          <span className={`text-xs ${isDone ? "font-medium" : "text-muted-foreground"}`}>
                            {cfg.label}
                          </span>
                          {i < STATUS_STEPS.length - 1 && (
                            <div
                              className={`absolute top-4 h-0.5 w-full -translate-y-1/2 ${
                                i < currentIdx ? "bg-primary" : "bg-muted"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tracking number */}
              {order.trackingNumber && (
                <div className="rounded-md bg-muted px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Número de seguimiento:</span>
                    {order.trackingUrl ? (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-primary hover:underline"
                      >
                        {order.trackingNumber}
                      </a>
                    ) : (
                      <span className="font-mono">{order.trackingNumber}</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                <Package className="mr-2 inline h-4 w-4" />
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.productSku} · x{item.quantity}
                    </p>
                  </div>
                  <span className="font-medium tabular-nums">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}

              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Envío</span>
                  <span>{order.shippingCost === 0 ? "Gratis" : formatCurrency(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Dirección de entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{order.customerName}</p>
              <p className="text-muted-foreground">
                {order.shippingAddress}, {order.shippingCity}, {order.shippingProvince} {order.shippingZip}
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            {["delivered", "processing", "shipped"].includes(order.status) &&
              order.paymentStatus === "paid" && (
                <RefundRequestForm orderId={order.id} />
              )}
            <Button asChild variant="outline">
              <Link href="/">Seguir comprando</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
