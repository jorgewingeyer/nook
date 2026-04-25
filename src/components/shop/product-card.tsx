import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ShopProduct } from "@/app/(shop)/shop.action";
import { WishlistButton } from "./wishlist-button";

export function ProductCard({ product }: { product: ShopProduct }) {
  const isOutOfStock = product.stock === 0;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-sand/60 bg-warm-white transition-all duration-[220ms] hover:-translate-y-[3px] hover:shadow-md">
      <Link href={`/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-parchment">
          {product.mainImage ? (
            <Image
              src={`/api/media/${product.mainImage}`}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-[420ms] group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sand">
              <Package className="h-10 w-10" strokeWidth={1.5} />
            </div>
          )}

          {/* Badge */}
          {isOutOfStock ? (
            <span className="absolute left-3 top-3 rounded-full bg-espresso px-2.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-[0.10em] text-gold-light">
              Sin stock
            </span>
          ) : product.isFeatured ? (
            <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-[0.10em] text-white">
              Destacado
            </span>
          ) : null}
        </div>

        {/* Info */}
        <div className="p-3">
          {product.categoryName && (
            <p className="mb-1 font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-warm-gray/70">
              {product.categoryName}
            </p>
          )}
          <p className="line-clamp-2 font-serif text-[1.05rem] font-normal leading-snug text-espresso">
            {product.name}
          </p>
          <p className="mt-2 font-sans text-[15px] font-semibold text-espresso">
            {formatCurrency(product.price)}
          </p>
        </div>
      </Link>

      {/* Wishlist button — visible on mobile, appears on hover for desktop */}
      <WishlistButton
        product={{
          slug: product.slug,
          name: product.name,
          price: product.price,
          mainImage: product.mainImage,
          categoryName: product.categoryName,
        }}
        className="absolute right-2 top-2 opacity-100 transition-opacity duration-[220ms] sm:opacity-0 sm:group-hover:opacity-100"
      />
    </div>
  );
}
