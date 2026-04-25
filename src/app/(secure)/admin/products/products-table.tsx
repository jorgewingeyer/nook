"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Archive, ArchiveRestore, Edit, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { archiveProductAction, type ProductListItem } from "./products.action";
import { useProductFilters } from "@/hooks/use-product-filters";
import { getProductStatusConfig, PRODUCT_STATUS_FILTERS } from "@/lib/product-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";

interface ProductsTableProps {
  products: ProductListItem[];
  total: number;
  page: number;
  limit: number;
  currentSearch?: string;
  currentStatus?: string;
}

export function ProductsTable({
  products,
  total,
  page,
  limit,
  currentSearch,
  currentStatus,
}: ProductsTableProps) {
  const router = useRouter();
  const { updateFilters } = useProductFilters();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(total / limit);

  function handleArchive(product: ProductListItem) {
    startTransition(async () => {
      const result = await archiveProductAction(product.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        const action = product.status === "archived" ? "restaurado" : "archivado";
        toast.success(`Producto ${action}`);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              updateFilters({ search: fd.get("search") as string });
            }}
          >
            <Input
              name="search"
              placeholder="Buscar por nombre..."
              defaultValue={currentSearch}
              className="pl-9"
            />
          </form>
        </div>
        <div className="flex gap-1 flex-wrap">
          {PRODUCT_STATUS_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={currentStatus === f.value || (!currentStatus && f.value === "all") ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters({ status: f.value })}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="hidden sm:table-cell">SKU</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead className="hidden md:table-cell">Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            )}
            {products.map((product) => {
              const { label, variant } = getProductStatusConfig(product.status);
              return (
                <TableRow
                  key={product.id}
                  data-archived={product.status === "archived" ? "true" : undefined}
                >
                  <TableCell>
                    {product.mainImage ? (
                      <Image
                        src={`/api/media/${product.mainImage}`}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-muted" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.categoryName && (
                        <p className="text-xs text-muted-foreground">{product.categoryName}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden font-mono text-sm sm:table-cell">
                    {product.sku}
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(product.price)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className={product.stock === 0 ? "text-destructive font-medium" : ""}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={variant}>{label}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="sr-only">Acciones</span>
                          <span className="text-lg leading-none">⋯</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`products/${product.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleArchive(product)}
                          disabled={isPending}
                          className={product.status === "archived" ? "text-green-600" : "text-destructive"}
                        >
                          {product.status === "archived" ? (
                            <>
                              <ArchiveRestore className="mr-2 h-4 w-4" />
                              Restaurar
                            </>
                          ) : (
                            <>
                              <Archive className="mr-2 h-4 w-4" />
                              Archivar
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Mostrando {(page - 1) * limit + 1}–{Math.min(page * limit, total)} de {total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateFilters({ page: String(page - 1) })}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateFilters({ page: String(page + 1) })}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
