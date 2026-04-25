import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Circle, Package, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getOrderStatusConfig, getPaymentStatusConfig } from "@/lib/order-utils";
import { getOrderDetailAction } from "../orders.action";
import { OrderUpdateForm } from "./order-update-form";
import { PackingListButton } from "@/components/shared/packing-list-pdf";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrderDetailAction(parseInt(id));
  if (!order) notFound();

  const statusCfg = getOrderStatusConfig(order.status);
  const paymentCfg = getPaymentStatusConfig(order.paymentStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="-ml-2">
          <Link href="/admin/orders" aria-label="Volver">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-1 flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-xl font-bold">{order.orderNumber}</h1>
              <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
              <Badge variant={paymentCfg.variant}>{paymentCfg.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(order.createdAt)} — {order.customerName}
            </p>
          </div>
          <PackingListButton order={order} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                <Package className="mr-2 inline h-4 w-4" />
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {item.productSku}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="space-y-1.5 p-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Descuento</span>
                    <span>−{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Envío ({order.shippingMethod === "express" ? "Express" : "Estándar"})</span>
                  <span>
                    {order.shippingCost === 0 ? "Gratis" : formatCurrency(order.shippingCost)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Shipping */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">{order.customerName}</p>
                <p className="text-muted-foreground">{order.customerEmail}</p>
                {order.customerPhone && (
                  <p className="text-muted-foreground">{order.customerPhone}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  <Truck className="mr-1.5 inline h-3.5 w-3.5" />
                  Envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>{order.shippingAddress}</p>
                <p className="text-muted-foreground">
                  {order.shippingCity}, {order.shippingProvince} {order.shippingZip}
                </p>
                {order.trackingNumber && (
                  <p className="mt-2 font-mono text-xs">
                    Tracking: {order.trackingNumber}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: actions + timeline */}
        <div className="space-y-6">
          {/* Update form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Actualizar pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderUpdateForm
                orderId={order.id}
                currentStatus={order.status}
                currentTracking={order.trackingNumber}
                isPaid={order.paymentStatus === "paid"}
                orderTotal={order.total}
              />
            </CardContent>
          </Card>

          {/* Status history */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Historial</CardTitle>
            </CardHeader>
            <CardContent>
              {order.statusHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin historial</p>
              ) : (
                <ol className="relative space-y-4 border-l border-muted pl-4">
                  {order.statusHistory.map((entry, i) => {
                    const cfg = getOrderStatusConfig(entry.status);
                    return (
                      <li key={entry.id} className="relative">
                        <span className="absolute -left-[1.35rem] flex h-5 w-5 items-center justify-center rounded-full border bg-background">
                          {i === 0 ? (
                            <CheckCircle className="h-3 w-3 text-primary" />
                          ) : (
                            <Circle className="h-3 w-3 text-muted-foreground" />
                          )}
                        </span>
                        <Badge variant={cfg.variant} className="mb-1">
                          {cfg.label}
                        </Badge>
                        {entry.note && (
                          <p className="text-xs text-muted-foreground">{entry.note}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDate(entry.createdAt)}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
