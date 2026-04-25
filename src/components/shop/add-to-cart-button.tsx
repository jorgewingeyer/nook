"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToCartAction } from "@/app/(shop)/carrito/cart.action";

interface AddToCartButtonProps {
  productId: number;
  stock: number;
}

export function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(1);

  const outOfStock = stock === 0;

  function handleAdd() {
    startTransition(async () => {
      const result = await addToCartAction(productId, quantity);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Agregado al carrito");
      router.refresh();
    });
  }

  if (outOfStock) {
    return (
      <Button disabled variant="outline" size="lg" className="w-full cursor-not-allowed opacity-60">
        Sin stock
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-sand/70 bg-warm-white">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Reducir cantidad"
            className="flex h-9 w-9 items-center justify-center text-espresso transition-colors hover:text-gold disabled:opacity-40"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <span className="min-w-[2rem] text-center text-sm font-medium text-espresso">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            disabled={quantity >= stock}
            aria-label="Aumentar cantidad"
            className="flex h-9 w-9 items-center justify-center text-espresso transition-colors hover:text-gold disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
        <span className="text-xs text-warm-gray">{stock} disponibles</span>
      </div>

      <Button size="lg" onClick={handleAdd} disabled={isPending} className="w-full">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
        ) : (
          <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
        )}
        {isPending ? "Agregando..." : "Agregar al carrito"}
      </Button>
    </div>
  );
}
