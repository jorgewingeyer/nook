import { Suspense } from "react";
import Link from "next/link";
import { Package, Star, Truck, RotateCcw, ShieldCheck } from "lucide-react";
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

const TRUST_ITEMS = [
  { icon: Truck,       text: "Envío gratis +$50.000" },
  { icon: RotateCcw,   text: "30 días de devolución" },
  { icon: ShieldCheck, text: "Pago 100% seguro" },
  { icon: Star,        text: "4.9 · +3.200 clientes" },
] as const;

const CATEGORY_IMAGES = [
  { label: "Iluminación", slug: "iluminacion", image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=500&h=600&fit=crop&q=80" },
  { label: "Jarrones",    slug: "jarrones",    image: "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=500&h=600&fit=crop&q=80" },
  { label: "Platos",      slug: "platos",      image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&h=600&fit=crop&q=80" },
  { label: "Copas",       slug: "copas",       image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&h=600&fit=crop&q=80" },
] as const;

const REVIEWS = [
  { name: "Valentina M.", city: "Buenos Aires", stars: 5, text: "La calidad supera cualquier expectativa. El packaging fue increíble — llegó como si fuera un regalo especial. Definitivamente vuelvo a comprar en Nook." },
  { name: "Carolina B.",  city: "Córdoba",      stars: 5, text: "El jarrón es exactamente como en las fotos, incluso más lindo en persona. Llegó perfectamente embalado y antes de lo prometido." },
  { name: "Luciana R.",   city: "Rosario",      stars: 5, text: "La atención al cliente es de otro nivel. Me ayudaron a elegir el set perfecto para mi comedor. Nook se convirtió en mi tienda favorita." },
] as const;

const SOCIAL_PROOF = [
  { value: "4.9 ★", label: "Valoración" },
  { value: "+3.200", label: "Clientes" },
  { value: "100%", label: "Compra segura" },
] as const;

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
    <div>
      {/* ── HERO — full-width split layout ── */}
      {!hasFilters && (
        <section className="grid min-h-[90vh] grid-cols-1 bg-cream pt-[108px] lg:grid-cols-2">
          {/* Left: copy */}
          <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16 lg:py-20">
            {/* Eyebrow label */}
            <div className="mb-7 flex items-center gap-2">
              <div className="h-px w-7 bg-gold" />
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-gold-dark">
                Nueva Colección 2026
              </span>
            </div>

            <h1 className="font-serif text-[clamp(2.4rem,4.5vw,4.5rem)] font-light leading-[1.1] tracking-tight text-espresso">
              Cada rincón
              <br />
              <em className="text-gold-dark">tiene su historia.</em>
            </h1>

            <p className="mt-6 max-w-[440px] font-sans text-[16px] font-light leading-[1.8] text-warm-gray">
              Piezas seleccionadas a mano para transformar cada rincón de tu hogar en un lugar con personalidad. Donde lo moderno, lo vintage y lo artesanal conviven en perfecta armonía.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="bg-espresso text-cream hover:bg-stone-warm">
                <Link href="/?sort=newest">Explorá la colección</Link>
              </Button>
              <Link
                href="/nosotros"
                className="border-b border-gold pb-0.5 font-sans text-[12px] font-medium tracking-[0.06em] text-gold-dark transition-colors hover:text-gold"
              >
                Nuestra historia →
              </Link>
            </div>

            {/* Social proof stats */}
            <div className="mt-14 flex gap-10 border-t border-sand/40 pt-7">
              {SOCIAL_PROOF.map(({ value, label }) => (
                <div key={label}>
                  <p className="font-serif text-[1.5rem] font-medium text-espresso">{value}</p>
                  <p className="mt-0.5 font-sans text-[11px] tracking-[0.06em] text-warm-gray">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: lifestyle image */}
          <div className="relative min-h-[50vw] overflow-hidden lg:min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&h=900&fit=crop&q=85"
              alt="Decoración del hogar Nook"
              className="h-full w-full object-cover object-center"
            />
            {/* Left-side gradient bleed into cream */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-cream to-transparent lg:block hidden" />
            {/* Floating mini card */}
            <div className="absolute bottom-12 left-0 -translate-x-0 lg:-translate-x-5 hidden lg:block rounded-lg border border-sand/60 bg-warm-white/96 p-4 shadow-lg backdrop-blur-sm">
              <p className="font-sans text-[9px] uppercase tracking-[0.12em] text-warm-gray">
                Más vendido
              </p>
              <p className="mt-1 font-serif text-[0.95rem] leading-snug text-espresso">
                Lámpara Arco Dorada
              </p>
              <div className="mt-2 flex items-center justify-between gap-4">
                <span className="font-sans text-[15px] font-semibold text-espresso">$89.900</span>
                <span className="text-[12px] text-gold">★★★★★</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TRUST BAR ── */}
      {!hasFilters && (
        <div className="border-b border-sand/40 bg-warm-white py-3.5">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-10">
              {TRUST_ITEMS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 font-sans text-xs font-medium text-warm-gray">
                  <Icon className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1440px] space-y-12 px-6 py-10 lg:px-12">
        {/* ── FEATURED PRODUCTS ── */}
        {!hasFilters && featured.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.20em] text-gold">
                  ✦ Destacados
                </p>
                <h2 className="mt-2 font-serif text-[clamp(1.6rem,2.5vw,2.2rem)] font-light text-espresso">
                  Los favoritos de Nook
                </h2>
              </div>
              <Link
                href="/?sort=newest"
                className="font-sans text-sm text-warm-gray transition-colors hover:text-gold"
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

        {/* ── CATEGORY PILLS ── */}
        {!hasFilters && categories.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-light text-espresso">Categorías</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/?category=${cat.slug}`}
                  className="rounded-full border border-sand/60 bg-warm-white px-4 py-1.5 font-sans text-sm font-medium text-espresso transition-all hover:border-gold/50 hover:bg-gold-lighter/40 hover:text-gold"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── CATALOG ── */}
        <section className="space-y-6">
          <div>
            {!hasFilters && (
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.20em] text-gold">
                ✦ Nuestros productos
              </p>
            )}
            <div className="mt-2 flex items-center justify-between">
              <h2 className="font-serif text-[clamp(1.6rem,2.5vw,2.2rem)] font-light text-espresso">
                {hasFilters ? "Resultados" : "Piezas que transforman rincones"}
              </h2>
              {catalog.total > 0 && (
                <span className="font-sans text-sm text-warm-gray">{catalog.total} productos</span>
              )}
            </div>
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
              <Package className="h-12 w-12 text-sand" strokeWidth={1.5} />
              <p className="font-sans text-base">No se encontraron productos</p>
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
                      <Link
                        href={`/?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
                      >
                        Anterior
                      </Link>
                    </Button>
                  )}
                  <span className="font-sans text-sm text-warm-gray">
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

      {/* ── EDITORIAL BANNER ── */}
      {!hasFilters && (
        <section className="overflow-hidden sm:grid sm:grid-cols-2">
          <div className="relative min-h-[300px] sm:min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&h=700&fit=crop&q=80"
              alt="Rincón Nook"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center bg-espresso px-8 py-16 sm:px-14 sm:py-20">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.20em] text-gold-light">
              ✦ Nuestra filosofía
            </p>
            <h2 className="mt-4 font-serif text-[clamp(1.8rem,2.8vw,2.8rem)] font-light leading-snug text-cream">
              No vendemos objetos.
              <br />
              <em className="text-gold-light">Creamos rincones.</em>
            </h2>
            <p className="mt-5 font-sans text-sm font-light leading-relaxed text-cream/60">
              Nook nació de observar cómo las personas gravitan hacia esos espacios especiales — el
              rincón del café, el lugar junto a la ventana, el sillón que combina perfecto con la
              lámpara nueva. Cada pieza que elegimos cuenta una historia.
            </p>
            <Link
              href="/nosotros"
              className="mt-8 inline-flex self-start rounded-full border border-gold-light/40 px-6 py-2.5 font-sans text-xs font-medium uppercase tracking-wider text-gold-light transition-colors hover:bg-gold-light/10"
            >
              Conocé nuestra historia
            </Link>
          </div>
        </section>
      )}

      {/* ── CATEGORY IMAGE GRID ── */}
      {!hasFilters && (
        <section className="bg-parchment py-16 sm:py-20">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
            <div className="mb-10 text-center">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.20em] text-gold">
                ✦ Explorá
              </p>
              <h2 className="mt-3 font-serif text-[clamp(1.8rem,3vw,2.6rem)] font-light text-espresso">
                Nuestras categorías
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CATEGORY_IMAGES.map((cat) => (
                <Link
                  key={cat.label}
                  href={`/?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-lg"
                >
                  <div className="aspect-[5/6] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="h-full w-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 to-transparent" />
                  <span className="absolute bottom-4 left-4 font-serif text-lg font-light text-white drop-shadow">
                    {cat.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── REVIEWS ── */}
      {!hasFilters && (
        <section className="bg-warm-white py-16 sm:py-20">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
            <div className="mb-12 text-center">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.20em] text-gold">
                ✦ Testimonios
              </p>
              <h2 className="mt-3 font-serif text-[clamp(1.8rem,3vw,2.6rem)] font-light text-espresso">
                Lo que dicen nuestras clientas
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {REVIEWS.map((review, i) => (
                <div key={i} className="rounded-lg border border-sand/60 bg-cream p-7">
                  <div className="mb-4 font-sans text-sm tracking-widest text-gold">
                    {"★".repeat(review.stars)}
                  </div>
                  <p className="font-serif text-base italic leading-relaxed text-espresso">
                    "{review.text}"
                  </p>
                  <p className="mt-5 font-sans text-xs font-medium uppercase tracking-wider text-warm-gray">
                    {review.name} · {review.city}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
