import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WishlistHeaderIcon } from "./wishlist-header-icon";

interface ShopHeaderProps {
  cartCount: number;
}

export function ShopHeader({ cartCount }: ShopHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Nook
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Tienda
            </Link>
            <Link
              href="/pedido"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Mi pedido
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-1">
        <WishlistHeaderIcon />
        <Button asChild variant="ghost" size="sm" className="relative gap-2">
          <Link href="/carrito" aria-label={`Carrito, ${cartCount} productos`}>
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">Carrito</span>
            {cartCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs">
                {cartCount > 99 ? "99+" : cartCount}
              </Badge>
            )}
          </Link>
        </Button>
        </div>
      </div>
    </header>
  );
}
