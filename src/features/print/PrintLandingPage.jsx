import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

export function PrintLandingPage() {
  const { navigate, setPrintTrackCode } = useAppContext();
  const [trackInput, setTrackInput] = useState('');

  const goTrack = () => {
    if (!trackInput.trim()) return;
    setPrintTrackCode(trackInput.trim().toUpperCase());
    navigate('print-track');
  };

  return (
    <div className="print-page">
      <section className="print-hero">
        <div className="print-hero-inner">
          <div className="print-hero-pill">🖨️ Print in minutes · Pickup at the shop</div>
          <h1 className="print-hero-title">Upload. Pay. Collect.</h1>
          <p className="print-hero-sub">
            PDF, Word docs, photos — printed in minutes.
            Pay online, collect at Diamond Chemist with your code.
          </p>
          <button className="print-cta-btn" onClick={() => navigate('print-order')}>
            Start Printing →
          </button>
          <div className="print-trust-strip">
            <span>🔒 Secure upload</span>
            <span>📄 Any file format</span>
            <span>⚡ Auto-printed instantly</span>
            <span>💰 Pay online</span>
          </div>
        </div>
      </section>

      <section className="section print-pricing-section">
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 24 }}>Simple, Transparent Pricing</h2>
        <div className="print-pricing-grid">
          <div className="print-pricing-card">
            <div className="print-pricing-header">
              <i className="ti ti-file-text"></i>
              <div>
                <h3>Black &amp; White</h3>
                <p>Documents, forms, notes</p>
              </div>
            </div>
            <table className="print-price-table">
              <tbody>
                <tr><td>A4 Single-sided</td><td>₹2 per page</td></tr>
                <tr><td>A4 Double-sided</td><td>₹1.50 per page</td></tr>
                <tr><td>A3 Single-sided</td><td>₹4 per page</td></tr>
              </tbody>
            </table>
            <span className="print-popular-chip">Most popular</span>
          </div>
          <div className="print-pricing-card">
            <div className="print-pricing-header">
              <i className="ti ti-palette"></i>
              <div>
                <h3>Colour</h3>
                <p>Photos, presentations, certificates</p>
              </div>
            </div>
            <table className="print-price-table">
              <tbody>
                <tr><td>A4 Single-sided</td><td>₹10 per page</td></tr>
                <tr><td>A4 Double-sided</td><td>₹8 per page</td></tr>
                <tr><td>A3 Single-sided</td><td>₹18 per page</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="print-fine-print">
          Minimum charge ₹10. DOCX files auto-converted to PDF.
          Max file size 25MB. Payment required before printing.
        </p>
      </section>

      <section className="section print-how-section">
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 32 }}>How It Works</h2>
        <div className="print-steps-flow">
          {[
            { icon: 'ti-cloud-upload', title: 'Upload your file', sub: 'PDF, Word, JPG or PNG' },
            { icon: 'ti-settings', title: 'Choose settings', sub: 'Copies, colour, paper size' },
            { icon: 'ti-credit-card', title: 'Pay online', sub: 'UPI, card or netbanking' },
            { icon: 'ti-qrcode', title: 'Collect with code', sub: 'Show your code at the counter' },
          ].map((s, i) => (
            <div key={i} className="print-flow-step">
              <div className="print-flow-icon"><i className={`ti ${s.icon}`}></i></div>
              <strong>{s.title}</strong>
              <span>{s.sub}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section print-formats-section">
        <div className="print-format-chips">
          <span><i className="ti ti-file-type-pdf"></i> PDF files</span>
          <span><i className="ti ti-file-type-docx"></i> Word (.docx)</span>
          <span><i className="ti ti-photo"></i> JPG / PNG</span>
        </div>
      </section>

      <section className="section">
        <div className="print-track-card">
          <h3>Already ordered? Track your print job</h3>
          <div className="print-track-row">
            <input
              className="form-input"
              placeholder="Enter pickup code (e.g. PRN-4K7X)"
              value={trackInput}
              onChange={e => setTrackInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && goTrack()}
            />
            <button className="print-btn-primary" onClick={goTrack}>Track →</button>
          </div>
        </div>
      </section>
    </div>
  );
}
