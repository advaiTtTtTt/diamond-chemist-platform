import React from 'react';
export * from './CustomerAuthModal';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES, QUICK_SEARCHES } from '../data/products';

export const Navbar = () => {
  const { navigate, cartCount, badgeBounce, shareWebsite, points, customerProfile, setShowCustomerAuth, logoutCustomer, openAdmin } = useAppContext();
  return (
    <nav className="navbar">
      <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('home')}>
        <img src="logo.jpeg" alt="Diamond Chemist" />
        <span>Diamond Chemist</span>
      </div>
      <div className="nav-links">
        <button className="nav-link" onClick={() => navigate('home')}>Home</button>
        <button className="nav-link" onClick={() => navigate('shop')}>Shop</button>
        <button className="nav-link" onClick={() => navigate('print')}>Print</button>
        <button className="nav-link" onClick={() => navigate('orders')}>My Orders</button>
        <button className="nav-link" onClick={() => navigate('about')}>About</button>
        <button className="nav-link" onClick={shareWebsite} style={{ color: 'var(--primary-700)', fontWeight: 600 }}>
          <i className="ti ti-share" style={{ marginRight: 4 }}></i>Share & Earn
        </button>
      </div>
      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {!customerProfile ? (
          <button onClick={() => setShowCustomerAuth(true)} style={{ background: 'var(--primary-700)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 50, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
            Login / Sign Up
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-900)' }}>Hi, {customerProfile.full_name?.split(' ')[0] || 'User'}</span>
              <span style={{ fontSize: 11, cursor: 'pointer', color: 'var(--text-secondary)', textDecoration: 'underline' }} onClick={logoutCustomer}>Logout</span>
            </div>
            {points > 0 && (
              <div className="points-badge" style={{ background: '#FEF3C7', color: '#D97706', padding: '4px 10px', borderRadius: '20px', fontSize: '14px', fontWeight: 600 }}>
                🪙 {points} pts
              </div>
            )}
          </div>
        )}
        <button className="cart-btn" onClick={() => navigate('cart')}>
          <i className="ti ti-shopping-cart"></i>
          {cartCount > 0 && <span className={'cart-badge' + (badgeBounce ? ' bounce' : '')}>{cartCount}</span>}
        </button>
        <button className="admin-link" onClick={openAdmin}>Admin</button>
      </div>
    </nav>
  );
};

export const Hero = () => {
  const { navigate } = useAppContext();
  return (
    <section className="hero">
      <i className="ti ti-diamond hero-deco"></i>
      <div style={{ maxWidth: 600, position: 'relative', zIndex: 1 }}>
        <div className="hero-pill">📍 Delivering within 50 metres</div>
        <h1 className="hero-title">Medicines at Your<br />Doorstep in Minutes</h1>
        <p className="hero-sub">Medicines, vitamins, first aid &amp; more delivered from Diamond Chemist — your trusted neighbourhood chemist.</p>
        <div className="hero-ctas">
          <button className="btn-cta btn-primary" onClick={() => navigate('shop')}>Shop Now →</button>
          <button className="btn-cta btn-secondary" onClick={() => window.open('tel:+919867125593')}>📞 Call Us</button>
        </div>
        <div className="trust-strip">
          <span className="trust-item">✓ Genuine Medicines</span>
          <span className="trust-item">⚡ Fast Delivery</span>
          <span className="trust-item">💵 Cash on Delivery</span>
        </div>
      </div>
    </section>
  );
};

export const ServicesSection = () => {
  const { navigate, setSelCat } = useAppContext();
  return (
    <section className="section" style={{ paddingTop: 32, paddingBottom: 16 }}>
      <div className="services-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        padding: '0 10px'
      }}>
        <div className="service-box" onClick={() => { setSelCat(null); navigate('shop'); }} style={{
          background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', 
          border: '1px solid var(--border-default)', cursor: 'pointer', transition: 'all 0.2s ease',
          display: 'flex', alignItems: 'flex-start', gap: '16px'
        }}>
          <div style={{ width: 56, height: 56, borderRadius: '12px', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="ti ti-pill" style={{ fontSize: 28, color: 'var(--primary-700)' }}></i>
          </div>
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 4, color: 'var(--primary-900)', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Medicines</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.4 }}>Fast delivery of genuine medicines & daily health essentials.</p>
          </div>
        </div>

        <div className="service-box" onClick={() => { setSelCat('Stationery'); navigate('shop'); }} style={{
          background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', 
          border: '1px solid var(--border-default)', cursor: 'pointer', transition: 'all 0.2s ease',
          display: 'flex', alignItems: 'flex-start', gap: '16px'
        }}>
          <div style={{ width: 56, height: 56, borderRadius: '12px', background: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="ti ti-pencil" style={{ fontSize: 28, color: '#DB2777' }}></i>
          </div>
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 4, color: 'var(--primary-900)', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Stationery</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.4 }}>School supplies, notebooks, pens, and office needs.</p>
          </div>
        </div>

        <div className="service-box" onClick={() => navigate('print')} style={{
          background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', 
          border: '1px solid var(--border-default)', cursor: 'pointer', transition: 'all 0.2s ease',
          display: 'flex', alignItems: 'flex-start', gap: '16px'
        }}>
          <div style={{ width: 56, height: 56, borderRadius: '12px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="ti ti-printer" style={{ fontSize: 28, color: '#D97706' }}></i>
          </div>
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 4, color: 'var(--primary-900)', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Print-on-Demand</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.4 }}>Upload documents online and pick up high-quality prints.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ProductCard = ({ p }) => {
  const { getQty, addToCart, updateQty } = useAppContext();
  const qty = getQty(p.id);
  
  return (
    <div className="prod-card">
      <div className="prod-chips">
        <span className="chip chip-cat">{p.category}</span>
        {p.popular && <span className="chip chip-pop">★ Popular</span>}
      </div>
      <div className="prod-icon-box"><i className={'ti ' + p.icon}></i></div>
      <div className="prod-name">{p.name}</div>
      <div className="prod-meta">{p.brand} · {p.unit}</div>
      <div className="prod-desc">{p.desc}</div>
      <div className="prod-price">₹{p.price}</div>
      {qty === 0 ? (
        <button className="btn-add" onClick={() => addToCart(p)}>Add to Cart</button>
      ) : (
        <div className="qty-ctrl">
          <button className="qty-btn" onClick={() => updateQty(p.id, -1)}>−</button>
          <span className="qty-num">{qty}</span>
          <button className="qty-btn" onClick={() => updateQty(p.id, 1)}>+</button>
        </div>
      )}
    </div>
  );
};

export const CatSection = () => {
  const { selCat, setSelCat, setAiResults, navigate } = useAppContext();
  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">Shop by Category</h2>
      </div>
      <div className="cat-grid">
        {CATEGORIES.map(c => (
          <div key={c.name} className={'cat-card' + (selCat === c.name ? ' active' : '')}
            onClick={() => { setSelCat(selCat === c.name ? null : c.name); setAiResults(null); navigate('shop'); }}>
            <i className={'ti ' + c.icon + ' cat-icon'}></i>
            <div className="cat-name">{c.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const PopularSection = () => {
  const { navigate, products } = useAppContext();
  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">Most Ordered</h2>
        <button className="see-all" onClick={() => navigate('shop')}>See all →</button>
      </div>
      <div className="prod-grid">
        {products.filter(p => p.popular).map(p => <React.Fragment key={p.id}><ProductCard p={p} /></React.Fragment>)}
      </div>
    </section>
  );
};

export const SearchBar = () => {
  const { searchRef, search, setSearch, doSearch, aiLoading, aiResults, clearAi, aiQuery } = useAppContext();
  return (
    <div>
      <div className="search-wrap">
        <div className="search-bar">
          <i className="ti ti-search"></i>
          <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search medicines by name or symptom..."
            onKeyDown={e => { if (e.key === 'Enter') doSearch(search); }} />
          <div className="search-status">
            {aiLoading && <span className="loading">● Searching…</span>}
            {aiResults !== null && !aiLoading && (
              <span className="ai-chip">{aiResults.length} found <span className="close" onClick={clearAi}>×</span></span>
            )}
          </div>
        </div>
      </div>
      <div className="search-pills">
        {QUICK_SEARCHES.map(q => (
          <button key={q} className="pill-btn" onClick={() => { setSearch(q); doSearch(q); }}>{q}</button>
        ))}
      </div>
      {aiResults !== null && !aiLoading && aiResults.length > 0 && (
        <div className="ai-banner"><div className="ai-banner-inner">Found {aiResults.length} results for "{aiQuery}"</div></div>
      )}
    </div>
  );
};

export const Footer = () => {
  const { navigate } = useAppContext();
  return (
    <footer style={{ background: 'var(--primary-900)', color: 'rgba(255,255,255,0.8)', padding: '40px 20px', marginTop: 40 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'space-between' }}>
        <div style={{ flex: '1 1 250px' }}>
          <h3 style={{ color: 'white', marginBottom: 16, fontFamily: "'Cormorant Garamond', serif", fontSize: 24 }}>Diamond Chemist</h3>
          <p style={{ fontSize: 14, marginBottom: 8 }}>Shop No.3, Mauli Dham Society, Shankara Nagar Rd, near SVB Complex, Dombivli East, Kalyan, Maharashtra 421203</p>
          <p style={{ fontSize: 14 }}>📞 +91 98671 25593</p>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ color: 'white', marginBottom: 16 }}>Legal Policies</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span onClick={() => { navigate('terms'); window.scrollTo(0,0); }} style={{ cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>Terms & Conditions</span>
            <span onClick={() => { navigate('privacy'); window.scrollTo(0,0); }} style={{ cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>Privacy Policy</span>
            <span onClick={() => { navigate('refund'); window.scrollTo(0,0); }} style={{ cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>Refund & Cancellation</span>
            <span onClick={() => { navigate('shipping'); window.scrollTo(0,0); }} style={{ cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>Shipping & Delivery</span>
            <span onClick={() => { navigate('contact'); window.scrollTo(0,0); }} style={{ cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>Contact Us</span>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12 }}>
        © {new Date().getFullYear()} Diamond Chemist. All rights reserved.
      </div>
    </footer>
  );
};

export const LoyaltySection = () => {
  const { shareWebsite, points } = useAppContext();
  return (
    <section className="section" style={{ background: 'linear-gradient(135deg, var(--primary-900), var(--primary-700))', borderRadius: 16, padding: '40px 24px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 10, marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
      <i className="ti ti-gift" style={{ fontSize: 48, color: '#FCD34D', marginBottom: 16 }}></i>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, marginBottom: 8, color: 'white' }}>Diamond Rewards Program</h2>
      <p style={{ fontSize: 16, opacity: 0.9, maxWidth: 600, marginBottom: 24, lineHeight: 1.5 }}>
        Earn 50 Diamond Points (worth ₹50) every time you share our website with your friends or family! Use points at checkout to get up to 50% off your medicine orders.
      </p>
      
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', zIndex: 1 }}>
        <button onClick={shareWebsite} style={{ background: '#FCD34D', color: 'var(--primary-900)', border: 'none', padding: '14px 28px', borderRadius: 50, fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
          <i className="ti ti-share" style={{ fontSize: 20 }}></i> Share Website Now
        </button>
      </div>

      {points > 0 && (
        <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: 50, border: '1px solid rgba(255,255,255,0.2)' }}>
          Your current balance: <strong style={{ color: '#FCD34D', fontSize: 18, marginLeft: 6 }}>🪙 {points} Points</strong>
        </div>
      )}
      
      <div style={{ position: 'absolute', top: -30, right: -20, opacity: 0.1, fontSize: 150 }}><i className="ti ti-diamond"></i></div>
      <div style={{ position: 'absolute', bottom: -30, left: -20, opacity: 0.1, fontSize: 150 }}><i className="ti ti-coin"></i></div>
    </section>
  );
};

