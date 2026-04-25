import Link from "next/link";
import { Heart, Package, Truck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function NosotrosPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 space-y-12">
      {/* Hero */}
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Nosotros</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Nook es una tienda de decoración para el hogar que nació de la convicción de que
          los espacios donde vivimos merecen ser especiales.
        </p>
      </section>

      <Separator />

      {/* Historia */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Nuestra historia</h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>
            Fundada en 2024, Nook nació de la necesidad de encontrar piezas de decoración
            con diseño cuidado a precios accesibles. Nos cansamos de que los productos lindos
            estuvieran fuera del alcance, y que los accesibles tuvieran poco valor estético.
          </p>
          <p>
            Hoy ofrecemos una selección curada de productos para el hogar: muebles, textiles,
            iluminación y accesorios que transforman cualquier ambiente. Cada pieza es elegida
            con atención al diseño, la durabilidad y el precio justo.
          </p>
        </div>
      </section>

      {/* Valores */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Nuestros valores</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            {
              icon: Heart,
              title: "Diseño con propósito",
              description: "Elegimos productos que combinan estética y funcionalidad, no solo lo que está de moda.",
            },
            {
              icon: Users,
              title: "Comunidad primero",
              description: "Valoramos cada relación con nuestros clientes y trabajamos para superar sus expectativas.",
            },
            {
              icon: Package,
              title: "Calidad garantizada",
              description: "Revisamos personalmente cada proveedor y producto antes de incluirlo en nuestro catálogo.",
            },
            {
              icon: Truck,
              title: "Envío a todo el país",
              description: "Entregamos en cualquier punto de Argentina con tracking en tiempo real.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4 rounded-lg border p-4">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contacto */}
      <section className="rounded-xl bg-muted/40 p-6 space-y-3">
        <h2 className="text-lg font-semibold">Contacto</h2>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Email: <a href="mailto:hola@nook.com.ar" className="text-foreground hover:underline">hola@nook.com.ar</a></p>
          <p>Instagram: <a href="https://instagram.com/nookhogar" className="text-foreground hover:underline" target="_blank" rel="noopener noreferrer">@nookhogar</a></p>
          <p>Atención al cliente: Lunes a Viernes de 10 a 18 hs.</p>
        </div>
      </section>

      <div className="flex justify-center">
        <Button asChild>
          <Link href="/">Ver catálogo</Link>
        </Button>
      </div>
    </div>
  );
}
