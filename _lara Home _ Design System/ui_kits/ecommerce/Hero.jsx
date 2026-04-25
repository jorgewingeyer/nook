// Nook — Hero Component
const Hero = ({ onShop }) => (
  <section style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--cream)', paddingTop: '108px', overflow: 'hidden' }}>
    {/* Left: Copy */}
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px 60px 64px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
        <div style={{ width: '28px', height: '1.5px', background: 'var(--gold)' }}></div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-dark)' }}>Nueva Colección 2026</span>
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(2.8rem,4.5vw,4.5rem)', lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--espresso)', marginBottom: '24px' }}>
        Cada rincón<br />
        <em style={{ color: 'var(--gold-dark)' }}>tiene su historia.</em>
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 300, lineHeight: 1.8, color: 'var(--warm-gray)', marginBottom: '40px', maxWidth: '440px' }}>
        Piezas seleccionadas a mano para transformar cada nook de tu hogar en un lugar con personalidad. Donde lo moderno, lo vintage y lo industrial conviven en perfecta armonía.
      </p>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '56px' }}>
        <button onClick={onShop} style={{ padding: '14px 36px', borderRadius: 'var(--radius-pill)', border: 'none', background: 'var(--espresso)', color: 'var(--cream)', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 220ms' }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--stone)'}
          onMouseOut={e => e.currentTarget.style.background = 'var(--espresso)'}
        >Explorá la colección</button>
        <a href="#" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em', color: 'var(--gold-dark)', textDecoration: 'none', borderBottom: '1px solid var(--gold)', paddingBottom: '2px' }}>Nuestra historia →</a>
      </div>
      {/* Social proof */}
      <div style={{ display: 'flex', gap: '40px', paddingTop: '28px', borderTop: '1px solid var(--border)' }}>
        {[['4.9 ★', 'Valoración'], ['+3.200', 'Clientes'], ['100%', 'Compra segura']].map(([v, l]) => (
          <div key={l}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 500, color: 'var(--espresso)' }}>{v}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--warm-gray)', letterSpacing: '0.06em', marginTop: '2px' }}>{l}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Right: Image collage */}
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Main hero image */}
      <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&h=900&fit=crop&q=85" alt="Living room decor" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
      {/* Overlay gradient */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(to right, var(--cream), transparent)' }} />
      {/* Floating product card */}
      <div style={{ position: 'absolute', bottom: '48px', left: '-20px', background: 'rgba(250,246,241,0.96)', backdropFilter: 'blur(12px)', borderRadius: 'var(--radius-md)', padding: '16px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', width: '200px' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--warm-gray)', marginBottom: '4px' }}>Más vendido</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--espresso)', marginBottom: '8px', lineHeight: 1.3 }}>Lámpara Arco Dorada</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600, color: 'var(--espresso)' }}>$89.900</span>
          <span style={{ color: 'var(--gold)', fontSize: '12px' }}>★★★★★</span>
        </div>
      </div>
    </div>
  </section>
);
Object.assign(window, { Hero });
