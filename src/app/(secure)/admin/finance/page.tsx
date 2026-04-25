import { Suspense } from "react";
import { ArrowDownLeft, ArrowUpRight, Clock, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { getFinanceSummaryAction, getTransactionsAction } from "@/app/(secure)/admin/orders/orders.action";
import { TransactionsTable } from "./transactions-table";

interface PageProps {
  searchParams: Promise<{ type?: string; page?: string }>;
}

async function FinanceContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const [summary, { transactions, total, page }] = await Promise.all([
    getFinanceSummaryAction(),
    getTransactionsAction({ type: params.type, page: params.page ? parseInt(params.page) : 1 }),
  ]);

  const kpis = [
    {
      title: "Ingresos totales",
      value: formatCurrency(summary.totalRevenue),
      icon: ArrowUpRight,
      className: "text-green-600",
    },
    {
      title: "Pendiente de cobro",
      value: formatCurrency(summary.pendingAmount),
      icon: Clock,
      className: "text-yellow-600",
    },
    {
      title: "Reembolsado",
      value: formatCurrency(summary.refundedAmount),
      icon: ArrowDownLeft,
      className: "text-destructive",
    },
    {
      title: "Transacciones",
      value: summary.totalTransactions.toString(),
      icon: Receipt,
      className: "text-muted-foreground",
    },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ title, value, icon: Icon, className }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <Icon className={`h-4 w-4 ${className}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Libro de transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsTable transactions={transactions} total={total} page={page} />
        </CardContent>
      </Card>
    </>
  );
}

function FinanceSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </>
  );
}

export default function FinancePage(props: PageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finanzas</h1>
        <p className="text-sm text-muted-foreground">Libro de transacciones y reembolsos</p>
      </div>

      <Suspense fallback={<FinanceSkeleton />}>
        <FinanceContent {...props} />
      </Suspense>
    </div>
  );
}
