"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist, type WishlistItem } from "@/hooks/use-wishlist";

interface WishlistButtonProps {
  product: WishlistItem;
  className?: string;
}

export function WishlistButton({ product, className }: WishlistButtonProps) {
  const { toggle, isInWishlist, hydrated } = useWishlist();
  const active = isInWishlist(product.slug);

  return (
    <button
      type="button"
      aria-label={active ? "Quitar de lista de deseos" : "Agregar a lista de deseos"}
      disabled={!hydrated}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background",
        "disabled:opacity-0",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          active ? "fill-rose-500 stroke-rose-500" : "stroke-muted-foreground",
        )}
      />
    </button>
  );
}
