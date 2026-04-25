"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ShopCategory } from "@/app/(shop)/shop.action";

const SORT_OPTIONS = [
  { value: "newest", label: "Más nuevos" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
  { value: "name", label: "A-Z" },
] as const;

interface CatalogFiltersProps {
  categories: ShopCategory[];
  currentSearch?: string;
  currentCategory?: string;
  currentSort?: string;
}

export function CatalogFilters({
  categories,
  currentSearch,
  currentCategory,
  currentSort,
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (!val || val === "all") params.delete(key);
        else params.set(key, val);
      });
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const hasFilters = currentSearch || currentCategory || currentSort;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            updateParams({ search: fd.get("search") as string });
          }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Buscar productos..."
            defaultValue={currentSearch}
            className="pl-9"
          />
        </form>

        <div className="flex gap-2">
          <Select
            value={currentCategory ?? "all"}
            onValueChange={(v) => updateParams({ category: v })}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentSort ?? "newest"}
            onValueChange={(v) => updateParams({ sort: v })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filtros activos</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs underline"
            onClick={() => router.push(pathname)}
          >
            Limpiar
          </Button>
        </div>
      )}
    </div>
  );
}
