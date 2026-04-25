"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NookLogo } from "./nook-logo";
import { WishlistHeaderIcon } from "./wishlist-header-icon";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/?category=iluminacion", label: "Iluminación" },
  { href: "/?category=jarrones",    label: "Jarrones" },
  { href: "/?category=platos",      label: "Platos" },
  { href: "/?category=copas",       label: "Copas" },
  { href: "/?category=velas",       label: "Velas" },
] as const;

interface ShopHeaderProps {
  cartCount: number;
}

export function ShopHeader({ cartCount }: ShopHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Trust strip */}
      <div className="bg-espresso py-2 text-center font-sans text-[11px] tracking-[0.09em] text-gold-light">
        Envío gratis en compras +$50.000&nbsp;&nbsp;·&nbsp;&nbsp;Devoluciones sin costo&nbsp;&nbsp;·&nbsp;&nbsp;Pago 100% seguro
      </div>

      {/* Main nav */}
      <div
        className={cn(
          "transition-all duration-300",
          scrolled
            ? "border-b border-sand/20 bg-cream/94 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <Link href="/" aria-label="Nook Home — ir al inicio">
            <NookLogo variant="light" width={140} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Categorías">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="border-b border-transparent pb-0.5 font-sans text-[12px] font-medium uppercase tracking-[0.09em] text-espresso transition-colors duration-200 hover:border-gold hover:text-gold"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Search — desktop only */}
            <button
              type="button"
              aria-label="Buscar productos"
              className="hidden rounded-full p-2 text-espresso transition-colors hover:text-gold lg:flex"
            >
              <Search className="h-[17px] w-[17px]" strokeWidth={1.5} />
            </button>

            {/* Wishlist */}
            <WishlistHeaderIcon />

            {/* Cart — pill button */}
            <Link
              href="/carrito"
              aria-label={`Carrito, ${cartCount} ${cartCount === 1 ? "producto" : "productos"}`}
              className={cn(
                "relative ml-1 flex items-center gap-2 rounded-full px-4 py-2 font-sans text-[12px] font-medium uppercase tracking-[0.06em] transition-colors duration-200",
                "bg-espresso text-cream hover:bg-stone-warm",
              )}
            >
              <ShoppingBag className="h-[15px] w-[15px]" strokeWidth={1.5} />
              <span className="hidden sm:inline">Carrito</span>
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </Badge>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="ml-2 rounded-full p-2 text-espresso transition-colors hover:text-gold lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <nav
            className="border-t border-sand/30 bg-cream/98 px-6 py-4 lg:hidden"
            aria-label="Menú móvil"
          >
            <ul className="space-y-1">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md px-3 py-2.5 font-sans text-sm font-medium uppercase tracking-[0.09em] text-espresso transition-colors hover:bg-parchment hover:text-gold"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
