export type MovementType = "in" | "out" | "adjustment";

export const MOVEMENT_TYPE_CONFIG: Record<MovementType, { label: string; description: string }> = {
  in: { label: "Entrada", description: "Agrega unidades al stock actual" },
  out: { label: "Salida", description: "Retira unidades del stock actual" },
  adjustment: { label: "Ajuste", description: "Establece el stock a una cantidad exacta" },
};

export function calcStockPreview(
  type: MovementType,
  currentStock: number,
  quantity: number,
): number | null {
  if (isNaN(quantity) || quantity <= 0) return null;
  if (type === "in") return currentStock + quantity;
  if (type === "out") return Math.max(0, currentStock - quantity);
  return quantity;
}

export function stockLevelClassName(stock: number, isLow: boolean): string {
  if (stock === 0) return "font-bold text-destructive";
  if (isLow) return "font-semibold text-yellow-600";
  return "font-medium";
}
