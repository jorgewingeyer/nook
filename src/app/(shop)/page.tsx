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
    <div className="container mx-auto max-w-6xl space-y-12 px-4 py-8">
      {/* Hero — only when no filters active */}
      {!hasFilters && (
        <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-charcoal via-espresso to-stone-warm px-8 py-16 sm:px-12 sm:py-24">
          <p className="text-xs font-medium uppercase tracking-widest text-gold">
            Bienvenida
          </p>
          <h1 className="mt-3 font-serif text-4xl font-light leading-tight tracking-tight text-cream sm:text-6xl">
            Tu hogar, tu mejor <br className="hidden sm:block" />
            obra de arte.
          </h1>
          <p className="mt-5 max-w-md text-base font-light leading-relaxed text-cream/70">
            Piezas seleccionadas con cuidado para transformar cada rincón en un refugio de calma.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/?sort=newest">Explorá la colección</Link>
            </Button>
            {categories[0] && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-cream/25 text-cream hover:bg-cream/10 hover:text-cream"
              >
                <Link href={`/?category=${categories[0].slug}`}>{categories[0].name}</Link>
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Featured products */}
      {!hasFilters && featured.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-2xl font-light text-espresso">Destacados</h2>
            <Link
              href="/?sort=newest"
              className="text-sm text-warm-gray transition-colors hover:text-gold"
            >
              Ver todos
            </Link>
          </div>
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
          <h2 className="font-serif text-2xl font-light text-espresso">Categorías</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.slug}`}
                className="rounded-full border border-sand/60 bg-warm-white px-4 py-1.5 text-sm font-medium text-espresso transition-all hover:border-gold/50 hover:bg-gold-lighter/40 hover:text-gold"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Catalog */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-light text-espresso">
            {hasFilters ? "Resultados" : "Todos los productos"}
          </h2>
          {catalog.total > 0 && (
            <span className="text-sm text-warm-gray">{catalog.total} productos</span>
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
          <div className="flex flex-col items-center gap-4 py-20 text-warm-gray">
            <Package className="h-12 w-12 text-sand" />
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

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                {page > 1 && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}>
                      Anterior
                    </Link>
                  </Button>
                )}
                <span className="text-sm text-warm-gray">
                  Página {page} de {totalPages}
                </span>
                {page < totalPages && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}>
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
