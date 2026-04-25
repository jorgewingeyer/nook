"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adjustStockAction } from "@/app/(secure)/admin/inventory/inventory.action";
import { calcStockPreview, type MovementType } from "@/lib/inventory-utils";

interface UseStockAdjustmentOptions {
  productId: number;
  currentStock: number;
  onSuccess?: () => void;
}

export function useStockAdjustment({ productId, currentStock, onSuccess }: UseStockAdjustmentOptions) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<MovementType>("in");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const preview = calcStockPreview(type, currentStock, parseInt(quantity));

  function reset() {
    setType("in");
    setQuantity("");
    setReason("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = parseInt(quantity);
    if (isNaN(q) || q <= 0) return void toast.error("Ingresa una cantidad válida");

    startTransition(async () => {
      const result = await adjustStockAction(productId, type, q, reason);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Stock actualizado");
      reset();
      router.refresh();
      onSuccess?.();
    });
  }

  return {
    isPending,
    type,
    setType,
    quantity,
    setQuantity,
    reason,
    setReason,
    preview,
    handleSubmit,
    reset,
  };
}
