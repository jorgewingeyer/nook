import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { ShopProduct } from "@/app/(shop)/shop.action";
import { WishlistButton } from "./wishlist-button";

export function ProductCard({ product }: { product: ShopProduct }) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-sand/60 bg-warm-white transition-all duration-[220ms] hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-parchment">
          {product.mainImage ? (
            <Image
              src={`/api/media/${product.mainImage}`}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-[420ms] group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sand">
              <Package className="h-10 w-10" strokeWidth={1.5} />
            </div>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="absolute left-2 top-2 text-xs">
              Sin stock
            </Badge>
          )}
        </div>
        <div className="p-3">
          {product.categoryName && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-warm-gray/70">
              {product.categoryName}
            </p>
          )}
          <p className="line-clamp-2 font-serif text-base font-light leading-snug text-espresso">
            {product.name}
          </p>
          <p className="mt-2 text-sm font-medium text-espresso">
            {formatCurrency(product.price)}
          </p>
        </div>
      </Link>

      <WishlistButton
        product={{
          slug: product.slug,
          name: product.name,
          price: product.price,
          mainImage: product.mainImage,
          categoryName: product.categoryName,
        }}
        className="absolute right-2 top-2 opacity-0 transition-opacity duration-[220ms] group-hover:opacity-100"
      />
    </div>
  );
}
