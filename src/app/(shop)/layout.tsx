import Link from "next/link";
import { Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { ShopHeader } from "@/components/shop/shop-header";
import { getCartCountAction } from "./carrito/cart.action";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const cartCount = await getCartCountAction();

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader cartCount={cartCount} />
      <main className="flex-1">{children}</main>

      <footer className="bg-espresso text-cream">
        {/* Trust signals */}
        <div className="border-b border-cream/10">
          <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-cream">Envío a todo el país</p>
                  <p className="mt-0.5 text-xs text-cream/60">Despacho en 24–48 hs hábiles</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-cream">Pago 100% seguro</p>
                  <p className="mt-0.5 text-xs text-cream/60">Procesado por MercadoPago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-cream">Devoluciones sin costo</p>
                  <p className="mt-0.5 text-xs text-cream/60">Hasta 30 días después de la compra</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Links and brand */}
        <div className="container mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div>
              <p className="font-serif text-xl font-light text-cream">Nook</p>
              <p className="mt-1 text-xs text-cream/50">Tu hogar, tu mejor obra de arte.</p>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link href="/" className="text-sm text-cream/60 transition-colors hover:text-gold">
                Tienda
              </Link>
              <Link href="/nosotros" className="text-sm text-cream/60 transition-colors hover:text-gold">
                Nosotros
              </Link>
              <Link href="/politicas" className="text-sm text-cream/60 transition-colors hover:text-gold">
                Políticas
              </Link>
              <Link href="/pedido" className="text-sm text-cream/60 transition-colors hover:text-gold">
                Seguir pedido
              </Link>
            </nav>
          </div>
          <p className="mt-8 text-center text-xs text-cream/30">
            © {new Date().getFullYear()} Nook. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
