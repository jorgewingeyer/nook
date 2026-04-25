import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrdersAction } from "./orders.action";
import { OrdersTable } from "./orders-table";

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}

function OrdersTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-64" />
      <div className="flex gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-8 w-20" />)}
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

async function OrdersContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const { orders, total, page } = await getOrdersAction({
    status: params.status,
    search: params.search,
    page: params.page ? parseInt(params.page) : 1,
  });

  return <OrdersTable orders={orders} total={total} page={page} />;
}

export default function OrdersPage(props: PageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-sm text-muted-foreground">Gestión y seguimiento de todos los pedidos</p>
      </div>

      <Suspense fallback={<OrdersTableSkeleton />}>
        <OrdersContent {...props} />
      </Suspense>
    </div>
  );
}
