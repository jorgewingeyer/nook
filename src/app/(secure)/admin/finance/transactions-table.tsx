"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { TransactionListItem } from "@/app/(secure)/admin/orders/orders.action";

const TYPE_LABELS: Record<string, { label: string }> = {
  sale: { label: "Venta" },
  refund: { label: "Reembolso" },
  commission: { label: "Comisión" },
  adjustment: { label: "Ajuste" },
  other: { label: "Otro" },
};

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  completed: { label: "Completado", variant: "default" },
  pending: { label: "Pendiente", variant: "outline" },
  failed: { label: "Fallido", variant: "destructive" },
};

const TYPE_TABS = [
  { value: "all", label: "Todos" },
  { value: "sale", label: "Ventas" },
  { value: "refund", label: "Reembolsos" },
  { value: "commission", label: "Comisiones" },
];

const PAGE_SIZE = 20;

interface TransactionsTableProps {
  transactions: TransactionListItem[];
  total: number;
  page: number;
}

export function TransactionsTable({ transactions, total, page }: TransactionsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type") ?? "all";
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`/admin/finance?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {TYPE_TABS.map((tab) => (
          <Button
            key={tab.value}
            size="sm"
            variant={currentType === tab.value ? "default" : "outline"}
            onClick={() => update("type", tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead className="hidden sm:table-cell">Pedido</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead className="hidden md:table-cell">Método</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden lg:table-cell">Descripción</TableHead>
              <TableHead className="hidden lg:table-cell">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  No hay transacciones
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => {
                const typeCfg = TYPE_LABELS[tx.type] ?? { label: tx.type };
                const statusCfg = STATUS_LABELS[tx.status] ?? { label: tx.status, variant: "outline" as const };
                const isNegative = tx.amount < 0;
                return (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <Badge variant="secondary">{typeCfg.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {tx.orderNumber ? (
                        <Link
                          href={`/admin/orders/${tx.orderId}`}
                          className="font-mono text-xs hover:underline"
                        >
                          {tx.orderNumber}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell
                      className={`font-medium tabular-nums ${isNegative ? "text-destructive" : "text-green-600"}`}
                    >
                      {isNegative ? "−" : "+"}{formatCurrency(Math.abs(tx.amount))}
                    </TableCell>
                    <TableCell className="hidden capitalize md:table-cell text-muted-foreground">
                      {tx.method}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden max-w-48 truncate text-muted-foreground lg:table-cell">
                      {tx.description ?? "—"}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {formatDate(tx.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} transacciones en total</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Button variant="outline" size="sm" onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.set("page", String(page - 1)); router.push(`/admin/finance?${p}`); }}>
                Anterior
              </Button>
            )}
            <span className="self-center">Página {page} de {totalPages}</span>
            {page < totalPages && (
              <Button variant="outline" size="sm" onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.set("page", String(page + 1)); router.push(`/admin/finance?${p}`); }}>
                Siguiente
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
