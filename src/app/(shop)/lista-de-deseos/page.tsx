"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useWishlist } from "@/hooks/use-wishlist";

export default function WishlistPage() {
  const { items, remove, hydrated } = useWishlist();

  if (!hydrated) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lista de deseos</h1>
        <p className="text-sm text-muted-foreground">
          {items.length === 0
            ? "Tu lista está vacía"
            : `${items.length} producto${items.length !== 1 ? "s" : ""} guardado${items.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <Heart className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            Guardá los productos que te gustan para encontrarlos fácilmente.
          </p>
          <Button asChild>
            <Link href="/">Ver productos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.slug}
              className="group relative overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
            >
              <Link href={`/${item.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {item.mainImage ? (
                    <Image
                      src={`/api/media/${item.mainImage}`}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <Package className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  {item.categoryName && (
                    <p className="mb-0.5 text-xs text-muted-foreground">{item.categoryName}</p>
                  )}
                  <p className="line-clamp-2 text-sm font-medium leading-tight">{item.name}</p>
                  <p className="mt-1.5 text-base font-semibold">{formatCurrency(item.price)}</p>
                </div>
              </Link>

              <button
                type="button"
                aria-label="Quitar de lista de deseos"
                onClick={() => remove(item.slug)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
