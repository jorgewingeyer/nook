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
    <header className="sticky top-0 z-50 border-b border-sand/40 bg-cream/90 backdrop-blur-md supports-[backdrop-filter]:bg-cream/80">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-serif text-2xl font-light tracking-tight text-espresso transition-colors hover:text-gold"
          >
            Nook
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/"
              className="text-sm font-medium text-warm-gray transition-colors hover:text-espresso"
            >
              Tienda
            </Link>
            <Link
              href="/nosotros"
              className="text-sm font-medium text-warm-gray transition-colors hover:text-espresso"
            >
              Nosotros
            </Link>
            <Link
              href="/pedido"
              className="text-sm font-medium text-warm-gray transition-colors hover:text-espresso"
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
