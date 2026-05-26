import React from 'react';
import { useAppContext } from '../context/AppContext';
/* eslint-disable react-refresh/only-export-components */
export * from './privacy';
export * from './policies';
import { CATEGORIES } from '../data/constants';
import { Hero, CatSection, PopularSection, SearchBar, ProductCard, ServicesSection, LoyaltySection } from '../components';

export const HomePage = () => (
  <div style={{ animation: 'fadeIn .2s ease' }}>
    <Hero />
    <ServicesSection />
    <CatSection />
    <LoyaltySection />
    <PopularSection />
  </div>
);

export const ShopPage = () => {
  const { getProds, aiResults, selCat, setSelCat, setAiResults } = useAppContext();
  const prods = getProds();
  return (
    <div style={{ animation: 'fadeIn .2s ease' }}>
      <SearchBar />
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">
            {aiResults !== null ? 'Search Results' : selCat ? selCat : 'All Products'}
          </h2>
          {selCat && <button className="see-all" onClick={() => setSelCat(null)}>Clear filter ×</button>}
        </div>
        <div className="cat-grid" style={{ marginBottom: 24 }}>
          {CATEGORIES.map(c => (
            <div key={c.name} className={'cat-card' + (selCat === c.name ? ' active' : '')}
              onClick={() => { setSelCat(selCat === c.name ? null : c.name); setAiResults(null); }}>
              <i className={'ti ' + c.icon + ' cat-icon'}></i>
              <div className="cat-name">{c.name}</div>
            </div>
          ))}
        </div>
        {prods.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><i className="ti ti-search-off"></i></div>
            <h3>No products found</h3>
            <p>Try a different search term or browse categories</p>
          </div>
        ) : (
          <div className="prod-grid">
            {prods.map(p => <React.Fragment key={p.id}><ProductCard p={p} /></React.Fragment>)}
          </div>
        )}
      </section>
    </div>
  );
};

export const CartPage = () => {
  const { navigate, cartCount, cart, cartTotal, deliveryFee, updateQty, removeFromCart, customerProfile, setShowCustomerAuth } = useAppContext();
  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('home')}><i className="ti ti-arrow-left"></i></button>
        <h2>Your Cart ({cartCount} items)</h2>
      </div>
      {cart.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><i className="ti ti-shopping-cart"></i></div>
          <h3>Your cart is empty</h3>
          <p>Browse our medicines and health products</p>
          <button className="btn-cta btn-primary" onClick={() => navigate('shop')}>Start Shopping →</button>
        </div>
      ) : (
        <div>
          {cart.map(c => (
            <div key={c.id} className="cart-item">
              <div className="cart-item-icon"><i className={'ti ' + c.icon}></i></div>
              <div className="cart-item-info">
                <h4>{c.name}</h4>
                <p>{c.brand} · {c.unit} · ₹{c.price} × {c.qty} = ₹{c.price * c.qty}</p>
              </div>
              <div className="cart-item-right">
                <div className="cart-qty">
                  <button onClick={() => updateQty(c.id, -1)}>−</button>
                  <span>{c.qty}</span>
                  <button onClick={() => updateQty(c.id, 1)}>+</button>
                </div>
                <button className="del-btn" onClick={() => removeFromCart(c.id)}><i className="ti ti-trash"></i></button>
              </div>
            </div>
          ))}
          <div style={{ height: 180 }} />
          <div className="sticky-bottom">
            <div className="sticky-inner">
              <div className="summary-row"><span>Subtotal</span><span>₹{cartTotal}</span></div>
              <div className="summary-row"><span>Delivery fee</span><span style={{ color: 'var(--success)' }}>Free</span></div>
              <div className="summary-row total"><span>Total</span><span>₹{cartTotal + deliveryFee}</span></div>
              {cartTotal < 200 ? (
                <button className="btn-checkout" style={{ background: 'var(--border-strong)', cursor: 'not-allowed' }} disabled>
                  Minimum Order ₹200 (Add ₹{200 - cartTotal} more)
                </button>
              ) : (
                <button className="btn-checkout" onClick={() => {
                  if (!customerProfile) {
                    alert('Please Login or Sign Up to place your order securely.');
                    setShowCustomerAuth(true);
                  } else {
                    navigate('checkout');
                  }
                }}>Proceed to Checkout →</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const CheckoutPage = () => {
  const { navigate, form, setForm, errors, locating, detectLocation, handlePrescriptionUpload, isUploadingRx, cart, cartTotal, placeOrder, isPlacingOrder, points, usePoints, setUsePoints, discount, finalTotal } = useAppContext();
  return (
    <div className="page" style={{ maxWidth: 1000 }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('cart')}><i className="ti ti-arrow-left"></i></button>
        <h2>Checkout</h2>
      </div>
      <div className="delivery-banner">📍 Delivery only within 50 metres of Diamond Chemist</div>
      <div className="checkout-grid">
        <div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className={'form-input' + (errors.name ? ' error' : '')} value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter your full name" />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className={'form-input' + (errors.phone ? ' error' : '')} value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit mobile number" />
            {errors.phone && <div className="error-text">{errors.phone}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Flat No. & Building Name</label>
            <input className={'form-input' + (errors.building ? ' error' : '')} value={form.building || ''}
              onChange={e => setForm({ ...form, building: e.target.value })} placeholder="e.g. Flat 402, Shivam Heights" />
            {errors.building && <div className="error-text">{errors.building}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Street / Area</label>
            <div style={{ position: 'relative' }}>
              <textarea className={'form-input form-textarea' + (errors.address ? ' error' : '')} value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Street name, landmark..." style={{ paddingBottom: 40 }} />
              <button onClick={detectLocation} disabled={locating}
                style={{ position: 'absolute', bottom: 10, right: 10, background: 'var(--primary-50)', color: 'var(--primary-700)', border: 'none', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', opacity: locating ? 0.6 : 1 }}>
                <i className="ti ti-current-location"></i> {locating ? 'Locating...' : 'Detect Location'}
              </button>
            </div>
            {errors.address && <div className="error-text">{errors.address}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Special Instructions (optional)</label>
            <input className="form-input" value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Ring the bell twice" />
          </div>
          <div className="form-group">
            <label className="form-label">Upload Prescription (Optional)</label>
            <div style={{ border: '1px dashed var(--border-strong)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              {isUploadingRx ? (
                <div style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>
                  <i className="ti ti-loader ti-spin" style={{ fontSize: 24, marginBottom: 8, display: 'inline-block' }}></i>
                  <div style={{ fontSize: 13 }}>Uploading securely to cloud...</div>
                </div>
              ) : form.prescription ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={form.prescription} alt="Prescription" style={{ maxHeight: 100, borderRadius: 4 }} />
                  <button onClick={() => setForm(prev => ({ ...prev, prescription: null }))} style={{ position: 'absolute', top: -10, right: -10, background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="ti ti-x" style={{ fontSize: 16 }}></i></button>
                </div>
              ) : (
                <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)' }}>
                  <i className="ti ti-upload" style={{ fontSize: 24, marginBottom: 4, color: 'var(--primary-500)' }}></i>
                  <span style={{ fontSize: 14 }}>Tap to attach photo</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handlePrescriptionUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="order-summary-card">
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, marginBottom: 14 }}>Order Summary</h3>
            {cart.map(c => (
              <div key={c.id} className="summary-item">
                <span className="name">{c.name} ×{c.qty}</span>
                <span>₹{c.price * c.qty}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px dashed var(--border-default)', margin: '10px 0' }} />
            <div className="summary-item"><span>Subtotal</span><span>₹{cartTotal}</span></div>
            <div className="summary-item"><span>Delivery</span><span style={{ color: 'var(--success)' }}>Free</span></div>
            {points > 0 && (
              <div style={{ marginTop: 12, padding: 12, background: 'var(--primary-50)', borderRadius: 8, border: '1px solid var(--primary-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Use Points (🪙 {points})</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Get up to 50% off!</div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={usePoints} onChange={e => setUsePoints(e.target.checked)} style={{ marginRight: 6, transform: 'scale(1.2)' }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Apply</span>
                  </label>
                </div>
              </div>
            )}
            {discount > 0 && (
              <div className="summary-item" style={{ color: 'var(--success)' }}><span>Discount applied</span><span>-₹{discount}</span></div>
            )}
            <div className="summary-item" style={{ fontWeight: 700, fontSize: 16, marginTop: 6 }}>
              <span>Total</span><span style={{ color: 'var(--primary-700)' }}>₹{finalTotal}</span>
            </div>
            <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-200)', borderRadius: 10, padding: '10px 14px', marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-qrcode" style={{ fontSize: 20, color: 'var(--primary-700)' }}></i>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary-900)' }}>Pay via UPI at Delivery</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Delivery boy will show UPI QR code at your door</div>
              </div>
            </div>
            <button className="btn-checkout" style={{ marginTop: 16, opacity: isPlacingOrder ? 0.7 : 1 }} onClick={placeOrder} disabled={isPlacingOrder}>
              {isPlacingOrder ? (
                <><i className="ti ti-loader"></i> Placing Order...</>
              ) : (
                <><i className="ti ti-check"></i> Place Order</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SuccessPage = () => {
  const { lastOrder, navigate } = useAppContext();
  const o = lastOrder;
  if (!o) return <div className="page"><p>No order found.</p></div>;
  return (
    <div className="success-page">
      <div className="check-circle"><i className="ti ti-check"></i></div>
      <h2>Order Placed!</h2>
      <p className="sub">We'll knock on your door shortly!</p>
      <div className="confirm-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>#{o.id}</span>
          <span className="status-badge badge-received">Received</span>
        </div>
        <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 10, marginBottom: 10 }}>
          <div className="confirm-row"><i className="ti ti-user"></i>{o.customer.name}</div>
          <div className="confirm-row"><i className="ti ti-phone"></i>{o.customer.phone}</div>
          <div className="confirm-row" style={{ alignItems: 'flex-start' }}><i className="ti ti-map-pin" style={{ marginTop: 2 }}></i>
            <div>
              {o.customer.building}, {o.customer.address}
              {o.customer.gps && (
                <div style={{ marginTop: 4 }}>
                  <a href={`https://www.google.com/maps?q=${o.customer.gps}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-700)', textDecoration: 'underline', fontWeight: 600, fontSize: 13 }}>
                    📍 View on Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>
          <div className="confirm-row"><i className="ti ti-package"></i>{o.items.length} items</div>
          {o.customer.notes && <div className="confirm-row"><i className="ti ti-note"></i>{o.customer.notes}</div>}
          {o.customer.prescription && <div className="confirm-row"><i className="ti ti-file-text"></i>Prescription Attached</div>}
        </div>
        <div style={{ borderTop: '1px dashed var(--border-default)', paddingTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary-700)' }}>₹{o.total} — Cash on Delivery</span>
          </div>
        </div>
      </div>
      <button className="btn-outline" onClick={() => navigate('home')}>Back to Home</button>
    </div>
  );
};

export const UserOrdersPage = () => {
  const { orders, navigate } = useAppContext();
  
  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('home')}><i className="ti ti-arrow-left"></i></button>
        <h2>My Order History</h2>
      </div>
      
      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><i className="ti ti-receipt"></i></div>
          <h3>No past orders</h3>
          <p>You haven't placed any medicine orders on this device yet.</p>
          <button className="btn-primary" onClick={() => navigate('shop')} style={{ marginTop: 16 }}>Start Shopping</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(o => (
            <div key={o.id} className="confirm-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary-800)' }}>#{o.id}</span>
                <span className={`status-badge badge-${o.status === 'Delivered' ? 'delivered' : 'received'}`}>{o.status}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                <i className="ti ti-calendar" style={{ marginRight: 6 }}></i>{o.time}
              </div>
              <div style={{ fontSize: 14, marginBottom: 12 }}>
                {o.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>{item.qty}x {item.name}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>₹{item.qty * item.price}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px dashed var(--border-default)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total Paid</span>
                <span style={{ color: 'var(--primary-700)' }}>₹{o.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const AboutPage = () => (
  <div className="page" style={{ textAlign: 'center', paddingTop: 48 }}>
    <img src="logo.jpeg" alt="Diamond Chemist" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px' }} />
    <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, marginBottom: 8 }}>Diamond Chemist</h2>
    <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 24 }}>Your neighbourhood chemist, now at your door</p>
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 14, padding: 24, maxWidth: 500, margin: '0 auto', textAlign: 'left' }}>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-start' }}>
        <i className="ti ti-map-pin" style={{ color: 'var(--primary-500)', marginRight: 8, marginTop: 4 }}></i>
        <div>
          <span style={{ fontWeight: 600, color: 'var(--primary-900)' }}>Diamond Chemist</span><br />
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Shop No.3, Mauli Dham Society, Shankara Nagar Rd, near SVB Complex, Dombivli East, Kalyan, Maharashtra 421203</span><br />
          <a href="https://maps.app.goo.gl/F4osHrGVWVP5qYmw6" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)', fontSize: 13, textDecoration: 'underline' }}>📍 View on Google Maps</a>
        </div>
      </div>
      <p style={{ marginBottom: 12 }}><i className="ti ti-truck-delivery" style={{ color: 'var(--primary-500)', marginRight: 8 }}></i>Serving households within 50 metres</p>
      <p style={{ marginBottom: 12 }}><i className="ti ti-clock" style={{ color: 'var(--primary-500)', marginRight: 8 }}></i>Shop open 9:00 AM – 11:30 PM</p>
      <p style={{ marginBottom: 12 }}><i className="ti ti-device-mobile" style={{ color: 'var(--primary-500)', marginRight: 8 }}></i>Online Orders 10:00 AM – 10:00 PM</p>
      <p style={{ marginBottom: 12 }}><i className="ti ti-phone" style={{ color: 'var(--primary-500)', marginRight: 8 }}></i>+91 98671 25593</p>
      <p><i className="ti ti-building-store" style={{ color: 'var(--primary-500)', marginRight: 8 }}></i>Your trusted pharmacy for 20+ years</p>
    </div>
  </div>
);

import { PrintJobsTab } from '../admin/PrintJobsTab';
import { AdminProductsTab } from '../admin/AdminProductsTab';

export const AdminPage = () => {
  const { orders, navigate, updateOrderStatus, logoutAdmin, notifyCustomer, verifyDeliveryOtp } = useAppContext();
  const [adminTab, setAdminTab] = React.useState('orders');
  const [otpState, setOtpState] = React.useState({});
  
  // Order filtering state
  const [orderFilter, setOrderFilter] = React.useState('active'); // 'all', 'active', 'completed'
  const [orderSearch, setOrderSearch] = React.useState('');
  const stats = {
    total: orders.length,
    pending: orders.filter(o => !['Delivered', 'Cancelled', 'Rx Rejected'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    revenue: orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.total, 0)
  };
  const statuses = ['Received', 'Accepted', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rx Rejected'];

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'active' && ['Delivered', 'Cancelled', 'Rx Rejected'].includes(o.status)) return false;
    if (orderFilter === 'completed' && !['Delivered', 'Cancelled', 'Rx Rejected'].includes(o.status)) return false;
    
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      if (!String(o.id).toLowerCase().includes(q) && 
          !o.customer?.name?.toLowerCase().includes(q) && 
          !o.customer?.phone?.includes(q)) {
        return false;
      }
    }
    return true;
  });
  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-btn" onClick={() => navigate('home')}><i className="ti ti-arrow-left"></i></button>
          <h2>Admin Dashboard</h2>
        </div>
        <button onClick={logoutAdmin} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--danger)', color: 'var(--danger)', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>Logout</button>
      </div>
      <div className="admin-tabs">
        <button className={`admin-tab ${adminTab === 'orders' ? 'active' : ''}`} onClick={() => setAdminTab('orders')}>Medicine Orders</button>
        <button className={`admin-tab ${adminTab === 'print' ? 'active' : ''}`} onClick={() => setAdminTab('print')}>Print Jobs</button>
        <button className={`admin-tab ${adminTab === 'products' ? 'active' : ''}`} onClick={() => setAdminTab('products')}>Products</button>
      </div>
      {adminTab === 'print' ? <PrintJobsTab /> : adminTab === 'products' ? (
        <AdminProductsTab />
      ) : <>
      <div className="stats-row">
        <div className="stat-card"><i className="ti ti-package"></i><div className="num">{stats.total}</div><div className="label">Total Orders</div></div>
        <div className="stat-card"><i className="ti ti-clock"></i><div className="num">{stats.pending}</div><div className="label">Pending</div></div>
        <div className="stat-card"><i className="ti ti-circle-check"></i><div className="num">{stats.delivered}</div><div className="label">Delivered</div></div>
        <div className="stat-card"><i className="ti ti-currency-rupee"></i><div className="num">₹{stats.revenue}</div><div className="label">Revenue</div></div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: 8, padding: 4 }}>
          <button onClick={() => setOrderFilter('active')} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: orderFilter === 'active' ? '#fff' : 'transparent', fontWeight: 600, boxShadow: orderFilter === 'active' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', color: orderFilter === 'active' ? 'var(--primary-900)' : 'var(--text-secondary)' }}>Active</button>
          <button onClick={() => setOrderFilter('completed')} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: orderFilter === 'completed' ? '#fff' : 'transparent', fontWeight: 600, boxShadow: orderFilter === 'completed' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', color: orderFilter === 'completed' ? 'var(--primary-900)' : 'var(--text-secondary)' }}>Completed</button>
          <button onClick={() => setOrderFilter('all')} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: orderFilter === 'all' ? '#fff' : 'transparent', fontWeight: 600, boxShadow: orderFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', color: orderFilter === 'all' ? 'var(--primary-900)' : 'var(--text-secondary)' }}>All</button>
        </div>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <i className="ti ti-search" style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-tertiary)' }}></i>
          <input 
            type="text" 
            placeholder="Search by ID, Name or Phone..." 
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 8, border: '1px solid var(--border-default)', outline: 'none' }}
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><i className="ti ti-clipboard-off"></i></div>
          <h3>No orders found</h3>
          <p>Try changing your filters or search.</p>
        </div>
      ) : (
        filteredOrders.map(o => (
          <div key={o.id} className="order-card">
            <div className="order-header">
              <span className="order-id">#{o.id}</span>
              <span className="order-time">{o.time}</span>
              <span className={'status-badge badge-' + o.status.toLowerCase().replace(/ /g, '-')
                .replace('out-for-delivery', 'out').replace('received', 'received')
                .replace('accepted', 'accepted').replace('delivered', 'delivered')}>
                {o.status}
              </span>
            </div>
            <div className="order-customer">
              <p><i className="ti ti-user"></i>{o.customer.name}</p>
              <p><i className="ti ti-phone"></i>{o.customer.phone}</p>
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 4, fontSize: 13 }}>
                <i className="ti ti-map-pin" style={{ marginTop: 3, marginRight: 6, color: 'var(--primary-500)', fontSize: 15 }}></i>
                <span>
                  {o.customer.building}, {o.customer.address}
                  {o.customer.gps && (
                    <a href={`https://www.google.com/maps?q=${o.customer.gps}`} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: 4, color: 'var(--primary-500)', textDecoration: 'underline', fontWeight: 600, fontSize: 12 }}>
                      [Open in Google Maps]
                    </a>
                  )}
                </span>
              </div>
              {o.customer.notes && <p><i className="ti ti-note"></i>{o.customer.notes}</p>}
              {o.customer.prescription && <p><a href={o.customer.prescription} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><i className="ti ti-file-text"></i>View Prescription Image</a></p>}
            </div>
            <table className="items-table"><tbody>
              {o.items.map(it => (
                <tr key={it.id}><td>{it.name} × {it.qty}</td><td className="right">₹{it.price * it.qty}</td></tr>
              ))}
            </tbody></table>
            <div className="order-total"><span>Total</span><span>₹{o.total}</span></div>
            {o.razorpay_payment_id && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="ti ti-credit-card" style={{ color: 'var(--primary-500)' }} />
                <span>Payment ID: <code style={{ background: 'var(--bg-subtle)', padding: '1px 5px', borderRadius: 4 }}>{o.razorpay_payment_id}</code></span>
                <a href={`https://dashboard.razorpay.com/app/payments/${o.razorpay_payment_id}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)', fontWeight: 600, fontSize: 11 }}>[View / Refund ↗]</a>
              </div>
            )}
            <div className="status-btns">
              {statuses.map(s => (
                <button key={s} className={'status-btn' + (o.status === s ? ' active' : '')}
                  style={s === 'Cancelled' || s === 'Rx Rejected' ? { background: o.status === s ? 'var(--danger)' : undefined, color: o.status === s ? '#fff' : 'var(--danger)', borderColor: 'var(--danger)' } : {}}
                  onClick={async () => {
                    const otp = await updateOrderStatus(o.id, s);
                    notifyCustomer(o, s, otp);
                  }}>{s}</button>
              ))}
            </div>

            {/* Delivery OTP Verification Panel */}
            {o.status === 'Out for Delivery' && !o.otp_verified && (
              <div style={{
                marginTop: 12, padding: 14, background: '#FFF7ED',
                border: '1.5px solid #FED7AA', borderRadius: 10
              }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#92400E', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="ti ti-lock" /> Delivery OTP Verification
                </div>
                <div style={{ fontSize: 12, color: '#78350F', marginBottom: 10 }}>
                  Customer ke WhatsApp pe OTP bheja gaya hai.
                  Delivery se pehle unse OTP lo aur neeche enter karo.
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    id={`otp-${o.id}`}
                    type="tel"
                    maxLength={4}
                    placeholder="4-digit OTP"
                    value={otpState[o.id]?.value || ''}
                    onChange={e => setOtpState(prev => ({ ...prev, [o.id]: { ...prev[o.id], value: e.target.value, result: null } }))}
                    style={{
                      width: 110, padding: '8px 12px', borderRadius: 8, fontSize: 18,
                      fontWeight: 700, letterSpacing: 6, textAlign: 'center',
                      border: '2px solid #FED7AA', outline: 'none'
                    }}
                  />
                  <button
                    onClick={async () => {
                      const entered = otpState[o.id]?.value || '';
                      const res = await verifyDeliveryOtp(o.id, entered);
                      setOtpState(prev => ({ ...prev, [o.id]: { ...prev[o.id], result: res } }));
                    }}
                    style={{
                      padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13,
                      background: '#D97706', color: '#fff', border: 'none', cursor: 'pointer'
                    }}
                  >
                    Verify &amp; Deliver
                  </button>
                </div>
                {otpState[o.id]?.result && (
                  <div style={{
                    marginTop: 10, padding: '8px 12px', borderRadius: 8, fontWeight: 600, fontSize: 13,
                    background: otpState[o.id].result.success ? '#D1FAE5' : '#FEE2E2',
                    color: otpState[o.id].result.success ? '#065F46' : '#991B1B'
                  }}>
                    {otpState[o.id].result.msg}
                  </div>
                )}
              </div>
            )}
            {o.status === 'Out for Delivery' && o.otp_verified && (
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: '#D1FAE5', color: '#065F46', fontWeight: 700, fontSize: 13 }}>
                ✅ OTP Verified — Delivery Complete!
              </div>
            )}
          </div>
        ))
      )}
      </>}
    </div>
  );
};
