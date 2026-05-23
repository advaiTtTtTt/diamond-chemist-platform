import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Navbar, Footer } from './components';
import { HomePage, ShopPage, CartPage, CheckoutPage, SuccessPage, AboutPage, AdminPage, PrivacyPage, UserOrdersPage, TermsPage, RefundPage, ShippingPage, ContactPage } from './pages';
import { PrintLandingPage, PrintOrderPage, PrintSuccessScreen, PrintTrackingScreen } from './features/print';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught app error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>
          <h2 style={{ color: 'var(--primary-900)', marginBottom: 12 }}>Oops, something went wrong.</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>We apologize for the inconvenience. Please refresh the page to try again.</p>
          <button className="btn-checkout" onClick={() => window.location.reload()} style={{ maxWidth: 200, margin: '0 auto' }}>
            <i className="ti ti-reload"></i> Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { page, navigate, showAdminModal, setShowAdminModal, adminEmail, setAdminEmail, adminPw, setAdminPw, loginAdmin, authError, isLoggingIn, lastOrder } = useAppContext();

  return (
    <div>
      <Navbar />
      
      {/* Active Order Indicator */}
      {lastOrder && lastOrder.status !== 'Delivered' && page === 'home' && (
        <div 
          onClick={() => navigate('success')}
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--primary-700)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 50,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 8px 30px rgba(11, 77, 60, 0.3)',
            cursor: 'pointer',
            zIndex: 100,
            animation: 'slideUp 0.3s ease-out'
          }}>
          <div style={{
            background: 'var(--primary-600)',
            width: 32, height: 32, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <i className="ti ti-package" style={{ fontSize: 18 }}></i>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Order {lastOrder.id}</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Status: {lastOrder.status}</div>
          </div>
          <i className="ti ti-chevron-right" style={{ marginLeft: 8, opacity: 0.7 }}></i>
        </div>
      )}
      {showAdminModal && (
        <div className="modal-overlay" onClick={() => setShowAdminModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Admin Login</h3>
            {authError && <div className="error-text" style={{ marginBottom: 10 }}>{authError}</div>}
            <input className="form-input" type="email" placeholder="Admin Email"
              value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
              style={{ marginBottom: 10 }} />
            <input className="form-input" type="password" placeholder="Enter password"
              value={adminPw} onChange={e => setAdminPw(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') loginAdmin(); }}
              style={{ marginBottom: 14 }} />
            <button className="btn-checkout" onClick={loginAdmin} disabled={isLoggingIn} style={{ opacity: isLoggingIn ? 0.7 : 1 }}>
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </div>
      )}
      {page === 'home' && <HomePage />}
      {page === 'shop' && <ShopPage />}
      {page === 'cart' && <CartPage />}
      {page === 'checkout' && <CheckoutPage />}
      {page === 'success' && <SuccessPage />}
      {page === 'orders' && <UserOrdersPage />}
      {page === 'about' && <AboutPage />}
      {page === 'admin' && <AdminPage />}
      {page === 'privacy' && <PrivacyPage />}
      {page === 'terms' && <TermsPage />}
      {page === 'refund' && <RefundPage />}
      {page === 'shipping' && <ShippingPage />}
      {page === 'contact' && <ContactPage />}
      {page === 'print' && <PrintLandingPage />}
      {page === 'print-order' && <PrintOrderPage />}
      {page === 'print-success' && <PrintSuccessScreen />}
      {page === 'print-track' && <PrintTrackingScreen />}
      
      {page !== 'checkout' && page !== 'cart' && page !== 'success' && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
