"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    <div className="flex items-center gap-4 py-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
        {item.mainImage ? (
          <Image
            src={`/api/media/${item.mainImage}`}
            alt={item.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <Link
          href={`/${item.slug}`}
          className="line-clamp-2 text-sm font-medium hover:underline"
        >
          {item.name}
        </Link>
        <p className="text-xs text-muted-foreground">{item.sku}</p>
        <p className="mt-1 text-sm font-semibold">{formatCurrency(item.subtotal)}</p>
      </div>

      <div className="flex items-center gap-1 rounded-md border">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => updateQty(item.quantity - 1)}
          disabled={isPending}
          aria-label="Reducir"
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Minus className="h-3 w-3" />}
        </Button>
        <span className="w-6 text-center text-sm">{item.quantity}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => updateQty(item.quantity + 1)}
          disabled={isPending || item.quantity >= item.stock}
          aria-label="Aumentar"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={remove}
        disabled={isPending}
        aria-label="Eliminar producto"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
