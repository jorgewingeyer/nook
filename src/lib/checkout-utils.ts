export type ShippingMethod = "standard" | "express";

export const SHIPPING_COSTS: Record<ShippingMethod, number> = {
  standard: 0,
  express: 2500,
};

export const SHIPPING_LABELS: Record<ShippingMethod, { label: string; description: string }> = {
  standard: { label: "Envío estándar", description: "5-7 días hábiles — Gratis" },
  express: { label: "Envío express", description: "1-2 días hábiles — $2.500" },
};

export function calcShippingCost(method: ShippingMethod): number {
  return SHIPPING_COSTS[method];
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `NOOK-${year}-${suffix}`;
}
