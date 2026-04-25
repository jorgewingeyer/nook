export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: "Pendiente", variant: "outline" },
  processing: { label: "Procesando", variant: "default" },
  shipped: { label: "Enviado", variant: "secondary" },
  delivered: { label: "Entregado", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
  refunded: { label: "Reembolsado", variant: "secondary" },
};

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: "Pendiente", variant: "outline" },
  paid: { label: "Pagado", variant: "default" },
  failed: { label: "Fallido", variant: "destructive" },
  refunded: { label: "Reembolsado", variant: "secondary" },
};

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "processing", label: "Procesando" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "refunded", label: "Reembolsado" },
];

export function getOrderStatusConfig(status: string): { label: string; variant: BadgeVariant } {
  return ORDER_STATUS_CONFIG[status as OrderStatus] ?? { label: status, variant: "outline" };
}

export function getPaymentStatusConfig(status: string): { label: string; variant: BadgeVariant } {
  return PAYMENT_STATUS_CONFIG[status as PaymentStatus] ?? { label: status, variant: "outline" };
}
