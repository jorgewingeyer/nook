// Nook — Footer
const Footer = () => {
  const cols = [
    { title: 'Tienda', links: ['Iluminación', 'Textiles', 'Decoración', 'Vintage', 'Outlet'] },
    { title: 'Ayuda', links: ['Cómo comprar', 'Envíos', 'Devoluciones', 'Seguí tu pedido', 'FAQ'] },
    { title: 'Marca', links: ['Nuestra historia', 'Sustentabilidad', 'Blog', 'Contacto'] },
  ];
  return (
    <footer style={{ background: 'var(--espresso)', color: 'var(--cream)', padding: '64px 48px 32px', fontFamily: 'var(--font-body)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '40px', marginBottom: '48px' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'18px' }}>
            <svg width="28" height="34" viewBox="0 0 36 48" fill="none">
              <path d="M4 44 L4 20 Q4 4 18 4 Q32 4 32 20 L32 44" stroke="#D4AF7A" strokeWidth="2" strokeLinecap="round"/>
              <path d="M11 44 L11 22 Q11 12 18 12 Q25 12 25 22 L25 44" stroke="#D4AF7A" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
              <line x1="0" y1="44" x2="36" y2="44" stroke="#D4AF7A" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'24px', fontWeight:400, letterSpacing:'2px', color:'var(--cream)', lineHeight:1 }}>nook</span>
          </div>
          <p style={{ fontSize: '13px', lineHeight: 1.75, color: 'rgba(245,237,224,0.6)', maxWidth: '220px', fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
            "Cada rincón tiene el potencial de convertirse en un espacio especial."
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '22px' }}>
            {['IG', 'FB', 'PI', 'TK'].map(s => (
              <a key={s} href="#" style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid rgba(184,148,95,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-light)', textDecoration: 'none', fontSize: '10px', fontWeight: 600, transition: 'all 200ms' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(184,148,95,0.18)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
              >{s}</a>
            ))}
          </div>
        </div>
        {cols.map(col => (
          <div key={col.title}>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: '14px' }}>{col.title}</div>
            {col.links.map(link => (
              <a key={link} href="#" style={{ display: 'block', fontSize: '13px', color: 'rgba(245,237,224,0.6)', textDecoration: 'none', marginBottom: '9px', transition: 'color 180ms' }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--cream)'}
                onMouseOut={e => e.currentTarget.style.color = 'rgba(245,237,224,0.6)'}
              >{link}</a>
            ))}
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(184,148,95,0.18)', paddingTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 300, color: 'var(--cream)', marginBottom: '3px' }}>Suscribite · 10% off en tu primera compra</div>
          <div style={{ fontSize: '11px', color: 'rgba(245,237,224,0.45)' }}>Inspiración y novedades directo a tu mail, sin spam.</div>
        </div>
        <div style={{ display: 'flex' }}>
          <input placeholder="tu@email.com" style={{ padding: '10px 16px', border: '1px solid rgba(184,148,95,0.35)', borderRight: 'none', background: 'rgba(245,237,224,0.07)', color: 'var(--cream)', fontFamily: 'var(--font-body)', fontSize: '13px', borderRadius: 'var(--radius-pill) 0 0 var(--radius-pill)', outline: 'none', width: '220px' }} />
          <button style={{ padding: '10px 20px', background: 'var(--gold)', color: 'white', border: 'none', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '0 var(--radius-pill) var(--radius-pill) 0' }}>Suscribirme</button>
        </div>
      </div>
      <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(245,237,224,0.3)', flexWrap: 'wrap', gap: '8px' }}>
        <span>© 2026 Nook. Todos los derechos reservados.</span>
        <span>Términos · Privacidad · Cookies</span>
      </div>
    </footer>
  );
};
Object.assign(window, { Footer });
