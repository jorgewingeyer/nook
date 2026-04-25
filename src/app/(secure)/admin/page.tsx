import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  AlertTriangle,
  CreditCard,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { orders, products, transactions } from "@/db/schema";
import { verifySession } from "@/lib/session";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getOrderStatusConfig } from "@/lib/order-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function DashboardPage() {
  const session = await verifySession();
  const { env } = await getCloudflareContext();
  const db = getDb((env as any).DB);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoTs = Math.floor(thirtyDaysAgo.getTime() / 1000);

  const [
    activeProductsResult,
    totalOrdersResult,
    revenueResult,
    lowStockResult,
    recentOrders,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.status, "active")),

    db.select({ count: sql<number>`count(*)` }).from(orders),

    db
      .select({ total: sql<number>`coalesce(sum(amount), 0)` })
      .from(transactions)
      .where(and(eq(transactions.type, "sale"), eq(transactions.status, "completed"))),

    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(
        and(
          sql`${products.stock} <= ${products.minStock}`,
          sql`${products.status} != 'archived'`,
        ),
      ),

    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerName: orders.customerName,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5),
  ]);

  const activeProducts = activeProductsResult[0]?.count ?? 0;
  const totalOrders = totalOrdersResult[0]?.count ?? 0;
  const revenue = revenueResult[0]?.total ?? 0;
  const lowStock = lowStockResult[0]?.count ?? 0;

  const kpis = [
    {
      title: "Productos activos",
      value: activeProducts.toString(),
      icon: Package,
      description: "En catálogo público",
      href: "/admin/products",
    },
    {
      title: "Órdenes totales",
      value: totalOrders.toString(),
      icon: ShoppingBag,
      description: "Desde el inicio",
      href: "/admin/orders",
    },
    {
      title: "Ingresos netos",
      value: formatCurrency(revenue),
      icon: CreditCard,
      description: "Pagos completados",
      href: "/admin/finance",
    },
    {
      title: "Stock bajo",
      value: lowStock.toString(),
      icon: AlertTriangle,
      description: lowStock > 0 ? "Requieren atención" : "Todo en orden",
      href: "/admin/inventory?tab=low",
      alert: lowStock > 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Bienvenido, {session?.role === "admin" ? "Administrador" : "Agente"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/products/new">Nuevo producto</Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ title, value, icon: Icon, description, href, alert }) => (
          <Link key={title} href={href}>
            <Card className={`transition-shadow hover:shadow-md ${alert ? "border-yellow-300" : ""}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {title}
                </CardTitle>
                <Icon
                  className={`h-4 w-4 ${alert ? "text-yellow-500" : "text-muted-foreground"}`}
                />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Órdenes recientes</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/orders">Ver todas</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <TrendingUp className="h-10 w-10" />
              <p className="text-sm">Aún no hay órdenes</p>
              <p className="text-xs">Las órdenes aparecerán aquí cuando los clientes compren</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead className="hidden sm:table-cell">Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => {
                  const { label, variant } = getOrderStatusConfig(order.status);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                      <TableCell className="hidden sm:table-cell">{order.customerName}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Badge variant={variant}>{label}</Badge>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {formatDate(order.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
