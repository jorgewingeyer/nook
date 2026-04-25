import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { ShopProduct } from "@/app/(shop)/shop.action";
import { WishlistButton } from "./wishlist-button";

export function ProductCard({ product }: { product: ShopProduct }) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
      <Link href={`/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.mainImage ? (
            <Image
              src={`/api/media/${product.mainImage}`}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Package className="h-12 w-12" />
            </div>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="absolute left-2 top-2">
              Sin stock
            </Badge>
          )}
        </div>
        <div className="p-3">
          {product.categoryName && (
            <p className="mb-0.5 text-xs text-muted-foreground">{product.categoryName}</p>
          )}
          <p className="line-clamp-2 text-sm font-medium leading-tight">{product.name}</p>
          <p className="mt-1.5 text-base font-semibold">{formatCurrency(product.price)}</p>
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
        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
      />
    </div>
  );
}
