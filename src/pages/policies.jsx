import React from 'react';
import { useAppContext } from '../context/AppContext';

export const TermsPage = () => {
  const { navigate } = useAppContext();
  return (
    <div className="page" style={{ maxWidth: 800, lineHeight: 1.6, paddingBottom: 60 }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('home')}><i className="ti ti-arrow-left"></i></button>
        <h2>Terms & Conditions</h2>
      </div>
      <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 12, border: '1px solid var(--border-default)' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Last Updated: May 2026</p>
        <h3 style={{ marginTop: 20, marginBottom: 10, color: 'var(--primary-900)' }}>1. Acceptance of Terms</h3>
        <p>By accessing and using the Diamond Chemist platform, you agree to comply with and be bound by these Terms and Conditions.</p>
        <h3 style={{ marginTop: 20, marginBottom: 10, color: 'var(--primary-900)' }}>2. Use of Platform</h3>
        <p>This platform is for purchasing pharmaceutical, healthcare, and everyday products. You must be at least 18 years old to make a purchase. Prescription medications require a valid prescription from a registered medical practitioner.</p>
        <h3 style={{ marginTop: 20, marginBottom: 10, color: 'var(--primary-900)' }}>3. Pricing and Payments</h3>
        <p>All prices are listed in INR (Indian Rupees). Prices are subject to change without notice. We accept online payments via Razorpay and Cash on Delivery (COD).</p>
        <h3 style={{ marginTop: 20, marginBottom: 10, color: 'var(--primary-900)' }}>4. Limitation of Liability</h3>
        <p>Diamond Chemist is not liable for any allergic reactions or misuse of the medications purchased. Always consult a doctor before consuming any medicine.</p>
      </div>
    </div>
  );
};

export const RefundPage = () => {
  const { navigate } = useAppContext();
  return (
    <div className="page" style={{ maxWidth: 800, lineHeight: 1.6, paddingBottom: 60 }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('home')}><i className="ti ti-arrow-left"></i></button>
        <h2>Refund & Cancellation Policy</h2>
      </div>
      <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 12, border: '1px solid var(--border-default)' }}>
        <h3 style={{ marginTop: 20, marginBottom: 10, color: 'var(--primary-900)' }}>1. Cancellation Policy</h3>
        <p>Orders can be cancelled before they are dispatched for delivery. Once an order is marked as "Out for Delivery", it cannot be cancelled.</p>
        <h3 style={{ marginTop: 20, marginBottom: 10, color: 'var(--primary-900)' }}>2. Refund Policy</h3>
        <p>We accept returns and provide full refunds under the following conditions:</p>
        <ul style={{ paddingLeft: 20, marginBottom: 15 }}>
          <li>The wrong product was delivered.</li>
          <li>The product is expired or damaged upon arrival.</li>
        </ul>
        <p>Medicines that require temperature control (like insulin or vaccines) cannot be returned once delivered. Refunds will be processed to the original payment method within 5-7 business days.</p>
      </div>
    </div>
  );
};

export const ShippingPage = () => {
  const { navigate } = useAppContext();
  return (
    <div className="page" style={{ maxWidth: 800, lineHeight: 1.6, paddingBottom: 60 }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('home')}><i className="ti ti-arrow-left"></i></button>
        <h2>Shipping & Delivery Policy</h2>
      </div>
      <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 12, border: '1px solid var(--border-default)' }}>
        <h3 style={{ marginTop: 20, marginBottom: 10, color: 'var(--primary-900)' }}>1. Delivery Coverage</h3>
        <p>We currently offer hyper-local delivery exclusively within a 50-metre radius of our physical store in Dombivli East, Kalyan.</p>
        <h3 style={{ marginTop: 20, marginBottom: 10, color: 'var(--primary-900)' }}>2. Delivery Timelines</h3>
        <p>Orders placed between 10:00 AM and 10:00 PM are typically delivered within 30 minutes. Orders placed outside these hours will be processed the next business day.</p>
        <h3 style={{ marginTop: 20, marginBottom: 10, color: 'var(--primary-900)' }}>3. Delivery Charges</h3>
        <p>Delivery is absolutely FREE for all orders above ₹200 within our delivery zone.</p>
      </div>
    </div>
  );
};

export const ContactPage = () => {
  const { navigate } = useAppContext();
  return (
    <div className="page" style={{ maxWidth: 800, lineHeight: 1.6, paddingBottom: 60 }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('home')}><i className="ti ti-arrow-left"></i></button>
        <h2>Contact Us</h2>
      </div>
      <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 12, border: '1px solid var(--border-default)' }}>
        <p>We are always here to help you with your healthcare needs.</p>
        <div style={{ marginTop: 20, marginBottom: 10 }}>
          <p><strong>Physical Address:</strong><br/>
          Diamond Chemist, Shop No.3, Mauli Dham Society, Shankara Nagar Rd, near SVB Complex, Dombivli East, Kalyan, Maharashtra 421203</p>
        </div>
        <div style={{ marginTop: 20, marginBottom: 10 }}>
          <p><strong>Phone Number:</strong><br/>
          +91 98671 25593</p>
        </div>
        <div style={{ marginTop: 20, marginBottom: 10 }}>
          <p><strong>Email Address:</strong><br/>
          diamondchemist21@gmail.com</p>
        </div>
        <div style={{ marginTop: 20 }}>
          <p><strong>Store Hours:</strong><br/>
          Monday - Sunday: 9:00 AM – 11:30 PM</p>
        </div>
      </div>
    </div>
  );
};
