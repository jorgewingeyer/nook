import { Suspense } from "react";
import { Package, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import {
  getCustomerSummaryAction,
  getDailySalesAction,
  getOrdersByStatusAction,
  getSalesKpisAction,
  getTopProductsAction,
  type ReportPeriod,
} from "./reports.action";
import { SalesBarChart, StatusPieChart } from "./sales-chart";
import { PeriodSelector } from "./period-selector";

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

async function ReportsContent({ period }: { period: ReportPeriod }) {
  const [kpis, dailySales, topProducts, ordersByStatus, customers] = await Promise.all([
    getSalesKpisAction(period),
    getDailySalesAction(period),
    getTopProductsAction(period),
    getOrdersByStatusAction(period),
    getCustomerSummaryAction(period),
  ]);

  const kpiCards = [
    {
      title: "Ingresos",
      value: formatCurrency(kpis.totalRevenue),
      icon: TrendingUp,
      sub: `${kpis.orderCount} pedidos`,
    },
    {
      title: "Ticket promedio",
      value: formatCurrency(kpis.avgTicket),
      icon: ShoppingBag,
      sub: "Por pedido",
    },
    {
      title: "Producto estrella",
      value: kpis.topProductName ?? "—",
      icon: Package,
      sub: "Más vendido en el período",
    },
    {
      title: "Clientes",
      value: customers.totalCustomers.toString(),
      icon: Users,
      sub: `${customers.guestOrders} compras como invitado`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map(({ title, value, icon: Icon, sub }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="truncate text-xl font-bold" title={value}>{value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ventas por día</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesBarChart data={dailySales} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pedidos por estado</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPieChart data={ordersByStatus} />
          </CardContent>
        </Card>
      </div>

      {/* Top products */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Top 10 productos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {topProducts.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              Sin ventas en el período seleccionado
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Unidades</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((p, i) => (
                  <TableRow key={p.productName}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{p.productName}</TableCell>
                    <TableCell className="text-right tabular-nums">{p.unitsSold}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(p.revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Customer summary */}
      {customers.topCustomerName && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cliente destacado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{customers.topCustomerName}</p>
                <p className="text-sm text-muted-foreground">
                  Mayor gasto en el período seleccionado
                </p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(customers.topCustomerRevenue)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-64 rounded-lg lg:col-span-3" />
        <Skeleton className="h-64 rounded-lg lg:col-span-2" />
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = (params.period as ReportPeriod) ?? "month";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
          <p className="text-sm text-muted-foreground">Analítica de ventas y pedidos</p>
        </div>
        <Suspense fallback={null}>
          <PeriodSelector current={period} />
        </Suspense>
      </div>

      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsContent period={period} />
      </Suspense>
    </div>
  );
}
