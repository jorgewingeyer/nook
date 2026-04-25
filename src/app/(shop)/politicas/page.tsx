import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const POLICIES = [
  {
    id: "devoluciones",
    title: "Política de devoluciones",
    content: `Aceptamos devoluciones dentro de los 30 días corridos desde la recepción del pedido.

Para iniciar una devolución:
1. Ingresá a "Seguir mi pedido" en la tienda con tu número de pedido y email.
2. Hacé clic en "Solicitar devolución" y describí el motivo.
3. Te contactaremos dentro de 48 horas hábiles con las instrucciones de envío.

El reembolso se acredita al método de pago original dentro de los 5-10 días hábiles de recibir el producto en nuestro depósito.

Condiciones: El producto debe estar en su estado original, sin uso, y con todos sus accesorios. Los artículos en oferta o personalizados no tienen devolución.`,
  },
  {
    id: "envios",
    title: "Política de envíos",
    content: `Enviamos a todo el territorio argentino.

Tiempos estimados:
• Envío estándar (gratis): 5 a 7 días hábiles.
• Envío express ($2.500): 1 a 2 días hábiles.

Los plazos comienzan a contar desde que el pago es confirmado. Todos los envíos incluyen número de seguimiento.

Para zonas con dificultad de acceso, los tiempos pueden extenderse. Ante cualquier demora, contactate con nosotros a hola@nook.com.ar.`,
  },
  {
    id: "privacidad",
    title: "Política de privacidad",
    content: `Nook respeta tu privacidad y protege tus datos personales conforme a la Ley 25.326 de Protección de Datos Personales.

¿Qué datos recolectamos?
• Nombre, email y teléfono al realizar una compra.
• Dirección de entrega.
• Datos de pago (procesados de forma segura por MercadoPago — no almacenamos datos de tarjetas).

¿Para qué los usamos?
• Procesar y entregar tus pedidos.
• Informarte sobre el estado de tu envío.
• Enviarte novedades y promociones (podés darte de baja en cualquier momento).

Tus datos no son vendidos ni cedidos a terceros sin tu consentimiento. Podés ejercer tu derecho de acceso, rectificación o supresión escribiéndonos a hola@nook.com.ar.`,
  },
  {
    id: "terminos",
    title: "Términos y condiciones",
    content: `Al realizar una compra en Nook aceptás los siguientes términos:

1. Los precios incluyen IVA y están expresados en pesos argentinos.
2. Las imágenes de los productos son representativas. Puede haber variaciones menores de color entre la pantalla y el producto real.
3. El stock es limitado. Si un producto se agota antes de procesar tu pedido, te notificamos y reintegramos el pago.
4. Nook se reserva el derecho de cancelar pedidos sospechosos de fraude.
5. Las promociones y descuentos no son acumulables salvo indicación expresa.

Para consultas sobre los términos, escribinos a hola@nook.com.ar.`,
  },
];

export default function PoliticasPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Políticas y legales</h1>
        <p className="mt-2 text-muted-foreground">
          Todo lo que necesitás saber sobre cómo operamos.
        </p>
      </div>

      {/* Jump links */}
      <nav className="flex flex-wrap gap-2 text-sm">
        {POLICIES.map((p) => (
          <a
            key={p.id}
            href={`#${p.id}`}
            className="rounded-full border px-3 py-1 transition-colors hover:bg-muted"
          >
            {p.title}
          </a>
        ))}
      </nav>

      <Separator />

      {POLICIES.map((policy, i) => (
        <section key={policy.id} id={policy.id} className="scroll-mt-20 space-y-3">
          <h2 className="text-xl font-semibold">{policy.title}</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            {policy.content.split("\n\n").map((paragraph, j) => (
              <p key={j} className="whitespace-pre-line">{paragraph}</p>
            ))}
          </div>
          {i < POLICIES.length - 1 && <Separator className="mt-6" />}
        </section>
      ))}

      <Separator />

      <p className="text-center text-sm text-muted-foreground">
        ¿Tenés preguntas?{" "}
        <Link href="/nosotros" className="text-foreground hover:underline">
          Contactanos
        </Link>
      </p>
    </div>
  );
}
