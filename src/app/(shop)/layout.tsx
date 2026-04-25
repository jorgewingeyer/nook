import Link from "next/link";
import { ShopHeader } from "@/components/shop/shop-header";
import { getCartCountAction } from "./carrito/cart.action";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const cartCount = await getCartCountAction();

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader cartCount={cartCount} />
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-muted/30 py-10 text-sm text-muted-foreground">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="font-semibold text-foreground">Nook</p>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-1">
              <Link href="/" className="hover:text-foreground hover:underline">Tienda</Link>
              <Link href="/nosotros" className="hover:text-foreground hover:underline">Nosotros</Link>
              <Link href="/politicas" className="hover:text-foreground hover:underline">Políticas</Link>
              <Link href="/pedido" className="hover:text-foreground hover:underline">Seguir pedido</Link>
            </nav>
          </div>
          <p className="mt-6 text-center">© {new Date().getFullYear()} Nook. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
