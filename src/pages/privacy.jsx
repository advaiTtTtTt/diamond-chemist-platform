
import { useAppContext } from '../context/AppContext';

export const PrivacyPage = () => {
  const { navigate } = useAppContext();
  
  return (
    <div className="page" style={{ maxWidth: 800, lineHeight: 1.6, paddingBottom: 60 }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('home')}><i className="ti ti-arrow-left"></i></button>
        <h2>Privacy Policy</h2>
      </div>
      
      <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 12, border: '1px solid var(--border-default)' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Last Updated: May 2026</p>

        <h3 style={{ marginTop: 20, marginBottom: 10, color: 'var(--primary-900)' }}>1. Information We Collect</h3>
        <p>When you place an order with Diamond Chemist, we collect the following personal information to facilitate local delivery:</p>
        <ul style={{ paddingLeft: 20, marginBottom: 15 }}>
          <li>Full Name</li>
          <li>Phone Number (for delivery contact)</li>
          <li>Delivery Address (including flat, building, and street)</li>
          <li>GPS Location (strictly used to verify you are within our 50-metre delivery zone)</li>
          <li>Prescription Images (only if voluntarily uploaded by you for specific medications)</li>
        </ul>

        <h3 style={{ marginTop: 20, marginBottom: 10, color: 'var(--primary-900)' }}>2. How We Use Your Information</h3>
        <p>Your data is used exclusively for fulfilling your pharmacy orders. We do not sell, rent, or share your personal information with any third-party marketing agencies.</p>

        <h3 style={{ marginTop: 20, marginBottom: 10, color: 'var(--primary-900)' }}>3. Data Security & Encryption</h3>
        <p>We take your privacy seriously. Your Personal Identifiable Information (PII), including your name, phone number, and exact address, is **encrypted** using industry-standard symmetric encryption (AES-256) before it is stored in our database. The shop owner can decrypt this data solely for the purpose of completing your delivery.</p>

        <h3 style={{ marginTop: 20, marginBottom: 10, color: 'var(--primary-900)' }}>4. Compliance</h3>
        <p>We operate in accordance with local regulations including the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.</p>

        <h3 style={{ marginTop: 20, marginBottom: 10, color: 'var(--primary-900)' }}>5. Contact Us</h3>
        <p>If you have any questions about this privacy policy, please contact us at Shop No.3, Mauli Dham Society, Dombivli East, or call +91 98671 25593.</p>
      </div>
    </div>
  );
};
