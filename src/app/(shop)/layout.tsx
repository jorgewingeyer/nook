import Link from "next/link";
import { Truck, ShieldCheck, RefreshCw, Instagram, Facebook } from "lucide-react";
import { ShopHeader } from "@/components/shop/shop-header";
import { NookLogo } from "@/components/shop/nook-logo";
import { NewsletterForm } from "@/components/shop/newsletter-form";
import { ShoppingAssistant } from "@/components/shop/shopping-assistant";
import { CartSync } from "@/components/shop/cart-sync";
import { cookies } from "next/headers";
import { COOKIE_CART } from "@/lib/cart-session";
import { cartRoomId } from "@/lib/cart-sync";
import { getCartCountAction } from "./carrito/cart.action";

const FOOTER_COLS = [
  {
    title: "La tienda",
    links: [
      { label: "Iluminación", href: "/?category=iluminacion" },
      { label: "Textiles",    href: "/?category=textiles" },
      { label: "Decoración",  href: "/?category=decoracion" },
      { label: "Vintage",     href: "/?category=vintage" },
      { label: "Outlet",      href: "/?category=outlet" },
    ],
  },
  {
    title: "Te ayudamos",
    links: [
      { label: "Cómo comprar",    href: "/ayuda/como-comprar" },
      { label: "Envíos",          href: "/ayuda/envios" },
      { label: "Devoluciones",    href: "/ayuda/devoluciones" },
      { label: "Seguí tu pedido", href: "/pedido" },
      { label: "Preguntas frecuentes", href: "/ayuda/faq" },
    ],
  },
  {
    title: "Nook",
    links: [
      { label: "Nuestra historia",  href: "/nosotros" },
      { label: "Sustentabilidad",   href: "/sustentabilidad" },
      { label: "Blog",              href: "/blog" },
      { label: "Contacto",          href: "/contacto" },
    ],
  },
] as const;

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const cartCount = await getCartCountAction();
  const cartSessionId = (await cookies()).get(COOKIE_CART)?.value;
  const cartRoom = cartSessionId ? await cartRoomId(cartSessionId) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader cartCount={cartCount} />
      <main className="flex-1">{children}</main>
      <ShoppingAssistant />
      <CartSync roomId={cartRoom} />


      <footer className="bg-espresso font-sans text-cream">
        {/* Trust signals strip */}
        <div className="border-b border-cream/10">
          <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-12">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-cream">Enviamos a todo el país</p>
                  <p className="mt-0.5 text-xs text-cream/60">Despachamos en 24–48 hs hábiles</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-cream">Pago 100% seguro</p>
                  <p className="mt-0.5 text-xs text-cream/60">Procesamos con MercadoPago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-cream">Devoluciones sin costo</p>
                  <p className="mt-0.5 text-xs text-cream/60">Tenés 30 días si algo no te convence</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main footer columns */}
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-12">
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
            {/* Brand col */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-1">
              <div className="mb-5">
                <NookLogo variant="dark" width={130} />
              </div>
              <p className="max-w-[220px] font-serif text-[1rem] font-light italic leading-relaxed text-cream/60">
                "No vendemos objetos. Creamos rincones."
              </p>
              {/* Social links */}
              <div className="mt-6 flex gap-3">
                {[
                  { label: "Instagram", icon: Instagram, href: "#" },
                  { label: "Facebook",  icon: Facebook,  href: "#" },
                ].map(({ label, icon: Icon, href }) => (
                  <Link
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-gold-light transition-colors duration-200 hover:bg-gold/15 hover:border-gold/50"
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </Link>
                ))}
                {/* Pinterest & TikTok as text placeholders (no Lucide icons) */}
                {[
                  { label: "PI", href: "#" },
                  { label: "TK", href: "#" },
                ].map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 font-sans text-[10px] font-semibold text-gold-light transition-colors duration-200 hover:bg-gold/15 hover:border-gold/50"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <p className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-light">
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-[13px] text-cream/60 transition-colors duration-200 hover:text-cream"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter + copyright */}
          <div className="mt-14 border-t border-gold/15 pt-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-serif text-[1rem] font-light text-cream">
                  Suscribite y llevate 10% off en tu primera compra
                </p>
                <p className="mt-1 text-[11px] text-cream/45">
                  Inspiración, novedades y rincones bien elegidos. Sin spam, prometido.
                </p>
              </div>
              <NewsletterForm />
            </div>

            <p className="mt-8 text-center font-sans text-[11px] text-cream/30">
              © {new Date().getFullYear()} Nook. Todos los derechos reservados.
              &nbsp;·&nbsp;
              <Link href="/politicas" className="transition-colors hover:text-cream/50">
                Términos
              </Link>
              &nbsp;·&nbsp;
              <Link href="/politicas" className="transition-colors hover:text-cream/50">
                Privacidad
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
