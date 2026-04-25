"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ORDER_STATUS_OPTIONS, type OrderStatus } from "@/lib/order-utils";
import { updateOrderStatusAction, processRefundAction } from "../orders.action";

interface OrderUpdateFormProps {
  orderId: number;
  currentStatus: string;
  currentTracking: string | null;
  isPaid: boolean;
  orderTotal: number;
}

export function OrderUpdateForm({
  orderId,
  currentStatus,
  currentTracking,
  isPaid,
  orderTotal,
}: OrderUpdateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<OrderStatus>(currentStatus as OrderStatus);
  const [note, setNote] = useState("");
  const [tracking, setTracking] = useState(currentTracking ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, status, note, tracking);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Pedido actualizado");
      setNote("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="order-status">Estado del pedido</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
          <SelectTrigger id="order-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tracking">Número de seguimiento</Label>
        <Input
          id="tracking"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Ej: OCA-123456"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="note">Nota interna (opcional)</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Agrega una nota sobre este cambio..."
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Guardar cambios
      </Button>

      {isPaid && <RefundDialog orderId={orderId} maxAmount={orderTotal} />}
    </form>
  );
}

function RefundDialog({ orderId, maxAmount }: { orderId: number; maxAmount: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState(String(maxAmount));
  const [reason, setReason] = useState("");

  function handleRefund(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0 || amt > maxAmount) {
      toast.error("Monto inválido");
      return;
    }
    if (!reason.trim()) {
      toast.error("Ingresa un motivo");
      return;
    }
    startTransition(async () => {
      const result = await processRefundAction(orderId, amt, reason);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Reembolso procesado");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full text-destructive hover:text-destructive">
          Procesar reembolso
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Procesar reembolso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleRefund} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="refund-amount">Monto a reembolsar (máx. ${maxAmount})</Label>
            <Input
              id="refund-amount"
              type="number"
              min="1"
              max={maxAmount}
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="refund-reason">Motivo</Label>
            <Textarea
              id="refund-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Producto defectuoso, cliente lo solicitó..."
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar reembolso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
