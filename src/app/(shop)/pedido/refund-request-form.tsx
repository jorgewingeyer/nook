"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { requestRefundAction } from "./pedido.action";

const RETURN_REASONS = [
  { value: "defective", label: "Producto defectuoso o dañado" },
  { value: "not_as_described", label: "No es como se describía" },
  { value: "wrong_item", label: "Recibí un producto incorrecto" },
  { value: "changed_mind", label: "Cambié de opinión" },
  { value: "other", label: "Otro motivo" },
];

export function RefundRequestForm({ orderId }: { orderId: number }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return;
    startTransition(async () => {
      const label = RETURN_REASONS.find((r) => r.value === reason)?.label ?? reason;
      const fullReason = detail ? `${label}: ${detail}` : label;
      const result = await requestRefundAction(orderId, fullReason);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Solicitud enviada. Te contactaremos pronto.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Solicitar devolución
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar devolución</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Las devoluciones se procesan dentro de los 30 días de recibido el pedido.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="reason">Motivo</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Seleccioná un motivo" />
              </SelectTrigger>
              <SelectContent>
                {RETURN_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="detail">Descripción adicional (opcional)</Label>
            <Textarea
              id="detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Contanos más sobre el problema..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !reason}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar solicitud
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
