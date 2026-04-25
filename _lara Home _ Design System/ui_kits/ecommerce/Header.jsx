// Nook — Header (Desktop)
const Header = ({ cartCount = 0, wishlistCount = 0, onCartOpen }) => {
  const [scrolled, setScrolled] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = ['Iluminación', 'Jarrones', 'Platos', 'Copas', 'Velas'];

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(245,237,224,0.94)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(178,148,95,0.20)' : '1px solid transparent',
      transition: 'all 300ms ease',
    }}>
      {/* Trust strip */}
      <div style={{ background: 'var(--espresso)', color: 'var(--gold-light)', textAlign: 'center', padding: '9px 16px', fontSize: '11px', letterSpacing: '0.09em', fontFamily: 'var(--font-body)' }}>
        Envío gratis en compras +$50.000 &nbsp;·&nbsp; Devoluciones sin costo &nbsp;·&nbsp; Pago 100% seguro
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: '68px' }}>
        <a href="#" style={{ textDecoration: 'none', display:'flex', alignItems:'center', gap:'10px' }}>
          <svg width="36" height="42" viewBox="0 0 36 48" fill="none">
            <path d="M4 44 L4 20 Q4 4 18 4 Q32 4 32 20 L32 44" stroke="#B8945F" strokeWidth="2" strokeLinecap="round"/>
            <path d="M11 44 L11 22 Q11 12 18 12 Q25 12 25 22 L25 44" stroke="#B8945F" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
            <line x1="0" y1="44" x2="36" y2="44" stroke="#B8945F" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'28px', fontWeight:400, letterSpacing:'2px', color:'var(--espresso)', lineHeight:1 }}>nook</span>
        </a>
        <nav style={{ display: 'flex', gap: '28px' }}>
          {navLinks.map(link => (
            <a key={link} href="#" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--espresso)', textDecoration: 'none', paddingBottom: '2px', borderBottom: '1.5px solid transparent', transition: 'all 200ms' }}
              onMouseOver={e => { e.target.style.color = 'var(--gold)'; e.target.style.borderBottomColor = 'var(--gold)'; }}
              onMouseOut={e => { e.target.style.color = 'var(--espresso)'; e.target.style.borderBottomColor = 'transparent'; }}
            >{link}</a>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {[
            { icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>, action: () => setSearchOpen(s => !s) },
            { icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, badge: wishlistCount },
            { icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
          ].map((btn, i) => (
            <button key={i} onClick={btn.action} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--espresso)', padding: '4px', position: 'relative', display: 'flex' }}>
              {btn.icon}
              {btn.badge > 0 && <span style={{ position: 'absolute', top: '-3px', right: '-3px', background: 'var(--blush)', color: 'var(--espresso)', width: '14px', height: '14px', borderRadius: '50%', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{btn.badge}</span>}
            </button>
          ))}
          <button onClick={onCartOpen} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--espresso)', color: 'var(--cream)', border: 'none', borderRadius: 'var(--radius-pill)', padding: '8px 18px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em', transition: 'background 200ms' }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--stone)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--espresso)'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Carrito {cartCount > 0 && <span style={{ background: 'var(--gold)', color: 'white', width: '18px', height: '18px', borderRadius: '50%', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{cartCount}</span>}
          </button>
        </div>
      </div>
      {searchOpen && (
        <div style={{ padding: '0 48px 14px', borderTop: '1px solid var(--border)' }}>
          <input autoFocus placeholder="Buscá tu próximo rincón favorito…" style={{ width: '100%', padding: '10px 18px', border: '1.5px solid var(--border-strong)', borderRadius: 'var(--radius-pill)', background: 'var(--warm-white)', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--espresso)', outline: 'none' }} />
        </div>
      )}
    </header>
  );
};
Object.assign(window, { Header });
