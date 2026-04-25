import { Suspense } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/shop/product-card";
import { CatalogFilters } from "@/components/shop/catalog-filters";
import {
  getFeaturedProductsAction,
  getShopCatalogAction,
  getShopCategoriesAction,
} from "./shop.action";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: "price_asc" | "price_desc" | "newest" | "name";
    page?: string;
  }>;
}

export default async function TiendaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const hasFilters = params.search || params.category || params.sort;

  const [categories, catalog, featured] = await Promise.all([
    getShopCategoriesAction(),
    getShopCatalogAction({
      search: params.search,
      categorySlug: params.category,
      sortBy: params.sort,
      page,
    }),
    hasFilters ? Promise.resolve([]) : getFeaturedProductsAction(),
  ]);

  const totalPages = Math.ceil(catalog.total / catalog.limit);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-10">
      {/* Hero — only when no filters active */}
      {!hasFilters && (
        <section className="rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-700 px-8 py-16 text-white sm:px-12 sm:py-20">
          <p className="text-sm font-medium uppercase tracking-widest opacity-70">Bienvenido</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
            Descubrí lo que <br className="hidden sm:block" />
            tenemos para vos
          </h1>
          <p className="mt-4 max-w-md text-lg opacity-80">
            Productos seleccionados con cuidado. Envío a todo el país.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-neutral-900 hover:bg-neutral-100">
              <Link href="/?sort=newest">Ver novedades</Link>
            </Button>
            {categories[0] && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
              >
                <Link href={`/?category=${categories[0].slug}`}>{categories[0].name}</Link>
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Featured products */}
      {!hasFilters && featured.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Destacados</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {!hasFilters && categories.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Categorías</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.slug}`}
                className="rounded-full border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Catalog */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {hasFilters ? "Resultados" : "Todos los productos"}
          </h2>
          {catalog.total > 0 && (
            <span className="text-sm text-muted-foreground">{catalog.total} productos</span>
          )}
        </div>

        <Suspense fallback={null}>
          <CatalogFilters
            categories={categories}
            currentSearch={params.search}
            currentCategory={params.category}
            currentSort={params.sort}
          />
        </Suspense>

        {catalog.products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
            <Package className="h-12 w-12" />
            <p className="text-base">No se encontraron productos</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/">Limpiar filtros</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {catalog.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                {page > 1 && (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
                    >
                      Anterior
                    </Link>
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                {page < totalPages && (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                    >
                      Siguiente
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
