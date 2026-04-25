import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Check, AlertCircle, X, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { ProductImageGallery } from "@/components/shop/product-image-gallery";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { formatCurrency } from "@/lib/utils";
import { parseProductAttributes } from "@/lib/product-utils";
import { getShopProductAction } from "../shop.action";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getShopProductAction(slug);
  if (!product) notFound();

  const attrs = parseProductAttributes(product.attributes);
  const tags = product.tags ? (JSON.parse(product.tags) as string[]) : [];
  const hasSpecs = attrs.color || attrs.material || product.weight || tags.length > 0;

  return (
    <div className="space-y-0">
      <div className="container mx-auto max-w-6xl space-y-10 px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-warm-gray" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-gold">
            Tienda
          </Link>
          {product.categoryName && (
            <>
              <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
              <span>{product.categoryName}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
          <span className="text-espresso">{product.name}</span>
        </nav>

        {/* Main section */}
        <div className="grid gap-10 lg:grid-cols-2">
          <ProductImageGallery images={product.images} name={product.name} />

          <div className="space-y-7">
            {/* Category + name */}
            <div className="space-y-2">
              {product.categoryName && (
                <p className="text-xs font-medium uppercase tracking-widest text-gold">
                  {product.categoryName}
                </p>
              )}
              <h1 className="font-serif text-3xl font-light leading-tight text-espresso sm:text-4xl">
                {product.name}
              </h1>
              <p className="text-xs text-warm-gray/60">SKU: {product.sku}</p>
            </div>

            {/* Price */}
            <div className="space-y-0.5">
              <p className="font-serif text-3xl font-light text-espresso">
                {formatCurrency(product.price)}
              </p>
              <p className="text-xs text-warm-gray">IVA incluido</p>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-1.5 text-sm">
              {product.stock > 10 ? (
                <>
                  <Check className="h-4 w-4 text-elara-success" strokeWidth={2} />
                  <span className="font-medium text-elara-success">En stock</span>
                </>
              ) : product.stock > 0 ? (
                <>
                  <AlertCircle className="h-4 w-4 text-elara-warning" strokeWidth={1.5} />
                  <span className="font-medium text-elara-warning">
                    Últimas {product.stock} unidades
                  </span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-elara-error" strokeWidth={1.5} />
                  <span className="font-medium text-elara-error">Sin stock</span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm leading-relaxed text-warm-gray">{product.description}</p>
            )}

            {/* Add to cart + wishlist */}
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <AddToCartButton productId={product.id} stock={product.stock} />
              </div>
              <WishlistButton
                product={{
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  mainImage: product.mainImage,
                  categoryName: product.categoryName,
                }}
                className="h-12 w-12 shrink-0 rounded-full border border-sand/70 text-warm-gray hover:border-gold/50 hover:text-gold"
              />
            </div>

            {/* Trust signals */}
            <div className="rounded-lg border border-sand/60 bg-warm-white p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                  <span className="text-espresso">Envío gratis en pedidos superiores a $50.000</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RotateCcw className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                  <span className="text-espresso">Devolución gratuita en 30 días</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                  <span className="text-espresso">Pago 100% seguro</span>
                </div>
              </div>
            </div>

            {/* Specs accordion */}
            {hasSpecs && (
              <details className="group rounded-lg border border-sand/60">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-espresso">
                  Especificaciones
                  <ChevronRight
                    className="h-4 w-4 text-warm-gray transition-transform group-open:rotate-90"
                    strokeWidth={1.5}
                  />
                </summary>
                <div className="border-t border-sand/40 px-4 pb-4 pt-3">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                    {attrs.color && (
                      <>
                        <dt className="text-warm-gray">Color</dt>
                        <dd className="font-medium text-espresso">{attrs.color}</dd>
                      </>
                    )}
                    {attrs.material && (
                      <>
                        <dt className="text-warm-gray">Material</dt>
                        <dd className="font-medium text-espresso">{attrs.material}</dd>
                      </>
                    )}
                    {product.weight && (
                      <>
                        <dt className="text-warm-gray">Peso</dt>
                        <dd className="font-medium text-espresso">{product.weight} kg</dd>
                      </>
                    )}
                    {tags.length > 0 && (
                      <>
                        <dt className="text-warm-gray">Tags</dt>
                        <dd className="font-medium text-espresso">{tags.join(", ")}</dd>
                      </>
                    )}
                  </dl>
                </div>
              </details>
            )}

            <details className="group rounded-lg border border-sand/60">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-espresso">
                Envío y devoluciones
                <ChevronRight
                  className="h-4 w-4 text-warm-gray transition-transform group-open:rotate-90"
                  strokeWidth={1.5}
                />
              </summary>
              <div className="border-t border-sand/40 px-4 pb-4 pt-3 text-sm leading-relaxed text-warm-gray">
                Envíos a todo el país. Plazo de entrega: 3–5 días hábiles para el interior,
                24–48 hs para CABA y GBA. Devoluciones gratuitas dentro de los 30 días de
                recibido el pedido.
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Related products */}
      {product.related.length > 0 && (
        <section className="bg-parchment py-14">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="mb-6 font-serif text-2xl font-light text-espresso">
              También te puede gustar
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {product.related.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
