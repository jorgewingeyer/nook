"use client";

import { useCallback, useEffect, useState } from "react";

export interface WishlistItem {
  slug: string;
  name: string;
  price: number;
  mainImage: string | null;
  categoryName: string | null;
}

const STORAGE_KEY = "nook_wishlist";

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored) as WishlistItem[]);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const toggle = useCallback((item: WishlistItem) => {
    setItems((prev) =>
      prev.some((i) => i.slug === item.slug)
        ? prev.filter((i) => i.slug !== item.slug)
        : [...prev, item],
    );
  }, []);

  const isInWishlist = useCallback(
    (slug: string) => items.some((i) => i.slug === slug),
    [items],
  );

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  return { items, toggle, isInWishlist, remove, hydrated };
}
