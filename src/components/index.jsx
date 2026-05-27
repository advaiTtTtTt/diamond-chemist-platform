import React, { useState } from 'react';
// eslint-disable-next-line react-refresh/only-export-components
export * from './CustomerAuthModal';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES, QUICK_SEARCHES } from '../data/constants';

export const Navbar = () => {
  const { navigate, cartCount, badgeBounce, shareWebsite, points, customerProfile, setShowCustomerAuth, logoutCustomer, openAdmin, setShowShareModal } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeAndNav = (p) => { setMobileMenuOpen(false); navigate(p); };
  return (
    <>
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
          <i className="ti ti-gift" style={{ marginRight: 6 }}></i> Share & Earn
        </button>
      </div>
      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {!customerProfile ? (
          <button onClick={() => setShowCustomerAuth(true)} style={{ background: 'var(--primary-700)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 50, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
            Login / Sign Up
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                <i className="ti ti-user"></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-900)' }}>Hi, {customerProfile.full_name?.split(' ')[0] || 'User'}</span>
                <span style={{ fontSize: 11, cursor: 'pointer', color: 'var(--text-secondary)', textDecoration: 'underline' }} onClick={logoutCustomer}>Logout</span>
              </div>
            </div>
            {points > 0 && (
              <div className="points-badge" onClick={() => setShowShareModal(true)} style={{ background: '#FEF3C7', color: '#D97706', padding: '4px 10px', borderRadius: '20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <i className={`ti ${mobileMenuOpen ? 'ti-x' : 'ti-menu-2'}`}></i>
        </button>
      </div>
    </nav>
    {mobileMenuOpen && (
      <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
        <div className="mobile-menu" onClick={e => e.stopPropagation()}>
          <div className="mobile-menu-header">
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: 'var(--primary-900)' }}>Menu</span>
            <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}><i className="ti ti-x"></i></button>
          </div>
          {customerProfile && (
            <div style={{ padding: '12px 14px', marginBottom: 8, background: 'var(--primary-50)', borderRadius: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--primary-900)' }}>Hi, {customerProfile.full_name?.split(' ')[0]}</div>
              {points > 0 && <div style={{ fontSize: 12, color: '#D97706', marginTop: 2 }}>🪙 {points} Diamond Points</div>}
            </div>
          )}
          <button className="mobile-menu-link" onClick={() => closeAndNav('home')}><i className="ti ti-home"></i>Home</button>
          <button className="mobile-menu-link" onClick={() => closeAndNav('shop')}><i className="ti ti-shopping-bag"></i>Shop Medicines</button>
          <button className="mobile-menu-link" onClick={() => closeAndNav('print')}><i className="ti ti-printer"></i>Print Service</button>
          <button className="mobile-menu-link" onClick={() => closeAndNav('orders')}><i className="ti ti-receipt"></i>My Orders</button>
          <button className="mobile-menu-link" onClick={() => closeAndNav('about')}><i className="ti ti-info-circle"></i>About Us</button>
          <button className="mobile-menu-link" onClick={() => { setMobileMenuOpen(false); shareWebsite(); }} style={{ color: 'var(--primary-700)' }}><i className="ti ti-share"></i>Share & Earn</button>
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-default)' }}>
            {!customerProfile ? (
              <button className="mobile-menu-link" onClick={() => { setMobileMenuOpen(false); setShowCustomerAuth(true); }} style={{ fontWeight: 600, color: 'var(--primary-700)' }}><i className="ti ti-login"></i>Login / Sign Up</button>
            ) : (
              <button className="mobile-menu-link" onClick={() => { setMobileMenuOpen(false); logoutCustomer(); }} style={{ color: 'var(--danger)' }}><i className="ti ti-logout"></i>Logout</button>
            )}
          </div>
        </div>
      </div>
    )}
    </>
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
  const icon = p.icon || 'ti-pill';
  const brand = p.brand || 'Diamond Chemist';
  const unit = p.unit || (p.stock ? `Stock: ${p.stock}` : '1 unit');
  const desc = p.desc || p.description || p.category || '';
  
  return (
    <div className="prod-card">
      <div className="prod-chips">
        <span className="chip chip-cat">{p.category}</span>
        {p.popular && <span className="chip chip-pop">★ Popular</span>}
      </div>
      <div className="prod-icon-box"><i className={'ti ' + icon}></i></div>
      <div className="prod-name">{p.name}</div>
      <div className="prod-meta">{brand} · {unit}</div>
      <div className="prod-desc">{desc}</div>
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

export const ShareModal = () => {
  const { customerProfile, setShowShareModal, points } = useAppContext();
  const [copied, setCopied] = useState(false);

  if (!customerProfile) return null;

  const refLink = `${window.location.origin}/?ref=${customerProfile.referral_code}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(refLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', padding: '32px 24px', maxWidth: 420, position: 'relative' }}>
        <button onClick={() => setShowShareModal(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 24, color: 'var(--text-secondary)' }}>
          <i className="ti ti-x"></i>
        </button>
        
        <div style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', width: 72, height: 72, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#D97706', fontSize: 36, boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)' }}>
          <i className="ti ti-diamond"></i>
        </div>
        
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, marginBottom: 4, color: 'var(--primary-900)' }}>Diamond Wallet</h3>
        
        <div style={{ fontSize: 42, fontWeight: 800, color: '#D97706', letterSpacing: -1, marginBottom: 8 }}>
          {points} <span style={{ fontSize: 18, color: 'var(--text-secondary)', fontWeight: 600 }}>pts</span>
        </div>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.5, padding: '0 12px' }}>
          Your points can be used for up to <strong>50% off</strong> on your medicine orders at checkout.
        </p>

        <div style={{ height: 1, background: 'var(--border-light)', margin: '0 12px 24px' }}></div>

        <h4 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary-800)', marginBottom: 8 }}><i className="ti ti-gift" style={{ marginRight: 6 }}></i> Share & Earn More</h4>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16, lineHeight: 1.5, padding: '0 12px' }}>
          Share your unique referral link. Friends get <strong>20 Points</strong> on signup, and you get <strong>50 Points</strong> when they place their first order!
        </p>
        
        <div style={{ background: 'var(--bg-subtle)', border: '1px dashed var(--border-strong)', borderRadius: 12, padding: '16px 12px', marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Your Referral Code</span>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary-700)', letterSpacing: 2, marginTop: 4 }}>
            {customerProfile.referral_code}
          </div>
        </div>
        
        <button className="btn-primary" onClick={copyLink} style={{ width: '100%', padding: '14px 20px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: copied ? 'var(--success)' : 'var(--primary-700)', transition: 'background 0.2s ease' }}>
          {copied ? <><i className="ti ti-check"></i> Link Copied!</> : <><i className="ti ti-copy"></i> Copy Referral Link</>}
        </button>
      </div>
    </div>
  );
};

