import { Suspense } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoriesAction, getProductsAction } from "./products.action";
import { ProductsTable } from "./products-table";

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");

  const [{ products, total, limit }] = await Promise.all([
    getProductsAction({ search: params.search, status: params.status, page }),
    getCategoriesAction(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">{total} productos en total</p>
        </div>
        <Button asChild>
          <Link href="products/new">
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>
      <Suspense fallback={<ProductsTableSkeleton />}>
        <ProductsTable
          products={products}
          total={total}
          page={page}
          limit={limit}
          currentSearch={params.search}
          currentStatus={params.status}
        />
      </Suspense>
    </div>
  );
}

function ProductsTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filter row: search + status pills */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-9 flex-1" />
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-md" />
          ))}
        </div>
      </div>
      {/* Table */}
      <div className="rounded-md border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b px-4 py-3 last:border-0">
            <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="hidden h-3.5 w-16 sm:block" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="hidden h-4 w-8 md:block" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
