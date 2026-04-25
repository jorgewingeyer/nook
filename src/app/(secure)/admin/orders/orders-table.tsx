"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import {
  getOrderStatusConfig,
  getPaymentStatusConfig,
  ORDER_STATUS_OPTIONS,
} from "@/lib/order-utils";
import type { OrderListItem } from "./orders.action";

interface OrdersTableProps {
  orders: OrderListItem[];
  total: number;
  page: number;
}

const PAGE_SIZE = 20;

export function OrdersTable({ orders, total, page }: OrdersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") ?? "all";
  const currentSearch = searchParams.get("search") ?? "";
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`/admin/orders?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <form onSubmit={(e) => { e.preventDefault(); update("search", new FormData(e.currentTarget).get("search") as string); }}>
          <Input name="search" placeholder="Buscar por número, cliente..." defaultValue={currentSearch} className="pl-9" />
        </form>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant={currentStatus === "all" ? "default" : "outline"}
          onClick={() => update("status", "all")}
        >
          Todos
        </Button>
        {ORDER_STATUS_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            size="sm"
            variant={currentStatus === opt.value ? "default" : "outline"}
            onClick={() => update("status", opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead className="hidden sm:table-cell">Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Pago</TableHead>
              <TableHead className="hidden lg:table-cell">Fecha</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  No hay pedidos
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const statusCfg = getOrderStatusConfig(order.status);
                const paymentCfg = getPaymentStatusConfig(order.paymentStatus);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-sm">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={paymentCfg.variant}>{paymentCfg.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/orders/${order.id}`}>Ver</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} pedidos en total</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Button variant="outline" size="sm" onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.set("page", String(page - 1)); router.push(`/admin/orders?${p}`); }}>
                Anterior
              </Button>
            )}
            <span className="self-center">Página {page} de {totalPages}</span>
            {page < totalPages && (
              <Button variant="outline" size="sm" onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.set("page", String(page + 1)); router.push(`/admin/orders?${p}`); }}>
                Siguiente
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
