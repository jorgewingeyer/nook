import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground hover:underline">
          Tienda
        </Link>
        {product.categoryName && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>{product.categoryName}</span>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Main product section */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <ProductImageGallery images={product.images} name={product.name} />

        {/* Info */}
        <div className="space-y-6">
          {product.categoryName && (
            <p className="text-sm font-medium text-muted-foreground">{product.categoryName}</p>
          )}
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">SKU: {product.sku}</p>
          </div>

          <p className="text-3xl font-bold">{formatCurrency(product.price)}</p>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          {/* Stock indicator */}
          <div className="flex items-center gap-2 text-sm">
            {product.stock > 10 ? (
              <span className="text-green-600 font-medium">✓ En stock</span>
            ) : product.stock > 0 ? (
              <span className="text-yellow-600 font-medium">
                ⚠ Últimas {product.stock} unidades
              </span>
            ) : (
              <span className="text-destructive font-medium">✗ Sin stock</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <AddToCartButton productId={product.id} stock={product.stock} />
            <WishlistButton
              product={{
                slug: product.slug,
                name: product.name,
                price: product.price,
                mainImage: product.mainImage,
                categoryName: product.categoryName,
              }}
              className="h-10 w-10 rounded-lg border"
            />
          </div>

          <Separator />

          {/* Attributes */}
          {(attrs.color || attrs.material || product.weight) && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {attrs.color && (
                <>
                  <dt className="text-muted-foreground">Color</dt>
                  <dd className="font-medium">{attrs.color}</dd>
                </>
              )}
              {attrs.material && (
                <>
                  <dt className="text-muted-foreground">Material</dt>
                  <dd className="font-medium">{attrs.material}</dd>
                </>
              )}
              {product.weight && (
                <>
                  <dt className="text-muted-foreground">Peso</dt>
                  <dd className="font-medium">{product.weight} kg</dd>
                </>
              )}
            </dl>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {product.related.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Productos relacionados</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {product.related.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
