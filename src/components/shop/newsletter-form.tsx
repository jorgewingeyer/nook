"use client";

export function NewsletterForm() {
  return (
    <form
      className="flex"
      onSubmit={(e) => e.preventDefault()}
      aria-label="Suscripción al newsletter"
    >
      <input
        type="email"
        placeholder="tu@email.com"
        aria-label="Tu dirección de email"
        className="w-52 rounded-l-full border border-gold/30 bg-cream/[0.08] px-4 py-2.5 font-sans text-[13px] text-cream outline-none placeholder:text-cream/30 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
      />
      <button
        type="submit"
        className="rounded-r-full bg-gold px-5 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-cream transition-colors hover:bg-gold-light"
      >
        Suscribirme
      </button>
    </form>
  );
}
