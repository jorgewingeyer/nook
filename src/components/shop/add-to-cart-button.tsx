"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
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
      <Button disabled size="lg" className="w-full sm:w-auto">
        Sin stock
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 rounded-md border">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          aria-label="Reducir cantidad"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
          disabled={quantity >= stock}
          aria-label="Aumentar cantidad"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Button size="lg" onClick={handleAdd} disabled={isPending} className="flex-1 sm:flex-none">
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ShoppingCart className="mr-2 h-4 w-4" />
        )}
        Agregar al carrito
      </Button>
    </div>
  );
}
