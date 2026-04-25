// Nook — Product Card with real images
const ProductCard = ({ name, category, price, oldPrice, badge, badgeStyle, stars = 5, reviews = 0, image, onAddToCart, onWishlist }) => {
  const [wished, setWished] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  const bc = { sale: { bg: 'var(--espresso)', color: 'var(--gold-light)' }, new: { bg: 'var(--gold)', color: 'white' }, hot: { bg: 'var(--blush)', color: 'var(--stone)' } }[badgeStyle] || {};

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: 'var(--warm-white)', borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'pointer', boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)', transform: hovered ? 'translateY(-3px)' : 'none', transition: 'all 240ms ease', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
      {/* Image */}
      <div style={{ position: 'relative', height: '240px', overflow: 'hidden', background: 'linear-gradient(145deg, #EEE0CC, #DFC9A8)' }}>
        {image && !imgError ? (
          <img src={image} alt={name} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 400ms ease', transform: hovered ? 'scale(1.04)' : 'scale(1)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="#2E1F0E" strokeWidth="1.5" strokeLinecap="round"><rect x="8" y="18" width="40" height="30" rx="2"/><path d="M18 18v-6a10 10 0 0120 0v6"/></svg>
          </div>
        )}
        {badge && <div style={{ position: 'absolute', top: '12px', left: '12px', background: bc.bg, color: bc.color, fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-body)' }}>{badge}</div>}
        <button onClick={e => { e.stopPropagation(); setWished(!wished); onWishlist?.(); }} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(250,246,241,0.92)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: wished ? '#C9A0A0' : '#B8A090', fontSize: '15px', boxShadow: 'var(--shadow-xs)', transition: 'transform 180ms' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.12)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >{wished ? '♥' : '♡'}</button>
        {hovered && (
          <button onClick={e => { e.stopPropagation(); onAddToCart?.(); }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(46,31,14,0.88)', backdropFilter: 'blur(4px)', color: 'var(--cream)', border: 'none', padding: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            + Agregar al carrito
          </button>
        )}
      </div>
      {/* Info */}
      <div style={{ padding: '14px 14px 6px', flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--warm-gray)', marginBottom: '4px' }}>{category}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 400, color: 'var(--espresso)', lineHeight: 1.3, marginBottom: '8px' }}>{name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600, color: 'var(--espresso)' }}>${price.toLocaleString('es-AR')}</span>
          {oldPrice && <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--warm-gray)', textDecoration: 'line-through' }}>${oldPrice.toLocaleString('es-AR')}</span>}
        </div>
      </div>
      <div style={{ padding: '0 14px 14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ color: 'var(--gold)', fontSize: '11px' }}>{'★'.repeat(Math.round(stars))}</span>
        {reviews > 0 && <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--warm-gray)' }}>({reviews})</span>}
      </div>
    </div>
  );
};
Object.assign(window, { ProductCard });
