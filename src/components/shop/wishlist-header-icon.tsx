"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/hooks/use-wishlist";

export function WishlistHeaderIcon() {
  const { items, hydrated } = useWishlist();
  const count = items.length;

  return (
    <Button asChild variant="ghost" size="sm" className="relative" aria-label="Lista de deseos">
      <Link href="/lista-de-deseos">
        <Heart className="h-5 w-5" />
        {hydrated && count > 0 && (
          <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs">
            {count > 99 ? "99+" : count}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
