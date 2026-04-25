"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { removeFromCartAction, updateCartQuantityAction } from "@/app/(shop)/carrito/cart.action";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/app/(shop)/carrito/cart.action";

export function CartItemRow({ item }: { item: CartItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function updateQty(newQty: number) {
    startTransition(async () => {
      const result = await updateCartQuantityAction(item.productId, newQty);
      if (result.error) toast.error(result.error);
      else router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      await removeFromCartAction(item.productId);
      toast.success("Producto eliminado");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-4 py-5">
      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-parchment">
        {item.mainImage && (
          <Image
            src={`/api/media/${item.mainImage}`}
            alt={item.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <Link
          href={`/${item.slug}`}
          className="line-clamp-2 text-sm font-medium text-espresso transition-colors hover:text-gold"
        >
          {item.name}
        </Link>
        <p className="mt-0.5 text-xs text-warm-gray/60">{item.sku}</p>
        <p className="mt-1 font-serif text-base font-light text-espresso">
          {formatCurrency(item.subtotal)}
        </p>
      </div>

      <div className="flex items-center rounded-full border border-sand/70 bg-warm-white">
        <button
          type="button"
          onClick={() => updateQty(item.quantity - 1)}
          disabled={isPending}
          aria-label="Reducir"
          className="flex h-8 w-8 items-center justify-center text-espresso transition-colors hover:text-gold disabled:opacity-40"
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Minus className="h-3 w-3" strokeWidth={1.5} />
          )}
        </button>
        <span className="w-6 text-center text-sm font-medium text-espresso">{item.quantity}</span>
        <button
          type="button"
          onClick={() => updateQty(item.quantity + 1)}
          disabled={isPending || item.quantity >= item.stock}
          aria-label="Aumentar"
          className="flex h-8 w-8 items-center justify-center text-espresso transition-colors hover:text-gold disabled:opacity-40"
        >
          <Plus className="h-3 w-3" strokeWidth={1.5} />
        </button>
      </div>

      <button
        type="button"
        onClick={remove}
        disabled={isPending}
        aria-label="Eliminar producto"
        className="flex h-8 w-8 items-center justify-center rounded-full text-warm-gray transition-colors hover:bg-blush-light/50 hover:text-elara-error disabled:opacity-40"
      >
        <X className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
