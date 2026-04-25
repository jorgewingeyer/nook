// Élara Home — Cart Drawer Component

const CartDrawer = ({ open, onClose, items = [], onRemove }) => {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(46,31,14,0.38)',
        backdropFilter: 'blur(3px)', zIndex: 200,
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 280ms ease',
      }} />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px',
        background: 'var(--warm-white)', zIndex: 201, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 320ms cubic-bezier(0.25, 0, 0.15, 1)',
        boxShadow: 'var(--shadow-xl)',
      }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--espresso)' }}>Tu carrito</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--warm-gray)', marginTop: '2px' }}>{items.length} {items.length === 1 ? 'producto' : 'productos'}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warm-gray)', fontSize: '22px', lineHeight: 1, padding: '4px' }}>×</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '60px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--warm-gray)" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--warm-gray)' }}>Tu carrito espera por esas piezas que te enamoraron.</p>
            </div>
          ) : items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, #EEE0CC, #D4B896)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--warm-gray)' }}>{item.category}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--espresso)', lineHeight: 1.3, margin: '3px 0 6px' }}>{item.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--espresso)' }}>${(item.price * item.qty).toLocaleString('es-AR')}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--warm-gray)' }}>×{item.qty}</span>
                    <button onClick={() => onRemove?.(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warm-gray)', fontSize: '13px' }}>✕</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'var(--cream)' }}>
          {/* Free shipping bar */}
          {total < 50000 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--warm-gray)', marginBottom: '6px' }}>
                <span>Falta ${(50000 - total).toLocaleString('es-AR')} para envío gratis</span>
                <span>{Math.round((total / 50000) * 100)}%</span>
              </div>
              <div style={{ height: '4px', background: 'var(--sand)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min((total / 50000) * 100, 100)}%`, background: 'var(--gold)', transition: 'width 400ms ease', borderRadius: '2px' }} />
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--warm-gray)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Total</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--espresso)' }}>${total.toLocaleString('es-AR')}</span>
          </div>
          <button style={{
            width: '100%', padding: '15px', borderRadius: 'var(--radius-pill)',
            background: 'var(--espresso)', color: 'var(--cream)', border: 'none',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
            transition: 'background 220ms',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--stone)'}
          onMouseOut={e => e.currentTarget.style.background = 'var(--espresso)'}
          >Finalizar compra</button>
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--warm-gray)', marginTop: '10px', letterSpacing: '0.04em' }}>
            🔒 Pago 100% seguro · Devoluciones gratis en 30 días
          </p>
        </div>
      </div>
    </>
  );
};

Object.assign(window, { CartDrawer });
