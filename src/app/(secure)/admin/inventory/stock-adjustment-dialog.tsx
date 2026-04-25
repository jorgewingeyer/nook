"use client";

import { useState } from "react";
import { Loader2, PackageMinus, PackagePlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStockAdjustment } from "@/hooks/use-stock-adjustment";
import { MOVEMENT_TYPE_CONFIG, type MovementType } from "@/lib/inventory-utils";

const MOVEMENT_TYPE_ICONS: Record<MovementType, React.ReactNode> = {
  in: <PackagePlus className="h-4 w-4 text-green-600" />,
  out: <PackageMinus className="h-4 w-4 text-red-600" />,
  adjustment: <RefreshCw className="h-4 w-4 text-blue-600" />,
};

interface StockAdjustmentDialogProps {
  productId: number;
  productName: string;
  currentStock: number;
}

export function StockAdjustmentDialog({
  productId,
  productName,
  currentStock,
}: StockAdjustmentDialogProps) {
  const [open, setOpen] = useState(false);

  const { isPending, type, setType, quantity, setQuantity, reason, setReason, preview, handleSubmit, reset } =
    useStockAdjustment({ productId, currentStock, onSuccess: () => setOpen(false) });

  function handleOpenChange(value: boolean) {
    if (!value) reset();
    setOpen(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Ajustar stock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar stock</DialogTitle>
          <p className="text-sm text-muted-foreground">{productName}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">Stock actual</p>
            <p className="text-2xl font-bold">{currentStock}</p>
            {preview !== null && preview !== currentStock && (
              <p className="text-sm text-muted-foreground">
                → <span className="font-semibold text-foreground">{preview}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo de movimiento</Label>
            <Select value={type} onValueChange={(v) => setType(v as MovementType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(MOVEMENT_TYPE_CONFIG) as MovementType[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      {MOVEMENT_TYPE_ICONS[value]}
                      {MOVEMENT_TYPE_CONFIG[value].label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{MOVEMENT_TYPE_CONFIG[type].description}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {type === "adjustment" ? "Nuevo stock total" : "Cantidad"}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Recepción de mercadería, venta manual..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
