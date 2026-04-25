export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const PRODUCT_STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  active: { label: "Activo", variant: "default" },
  inactive: { label: "Inactivo", variant: "secondary" },
  draft: { label: "Borrador", variant: "outline" },
  archived: { label: "Archivado", variant: "destructive" },
};

export const PRODUCT_STATUS_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
  { value: "draft", label: "Borradores" },
  { value: "archived", label: "Archivados" },
] as const;

export function getProductStatusConfig(status: string): { label: string; variant: BadgeVariant } {
  return PRODUCT_STATUS_CONFIG[status] ?? { label: status, variant: "outline" };
}

export function validateProduct(fields: { name: string; sku: string; price: string }): string | null {
  if (!fields.name.trim()) return "El nombre es requerido";
  if (!fields.sku.trim()) return "El SKU es requerido";
  const priceNum = parseFloat(fields.price);
  if (isNaN(priceNum) || priceNum <= 0) return "El precio debe ser mayor a 0";
  return null;
}

export function parseProductAttributes(
  attributes: string | null | undefined,
): { color?: string; material?: string } {
  if (!attributes) return {};
  try {
    return JSON.parse(attributes);
  } catch {
    return {};
  }
}
