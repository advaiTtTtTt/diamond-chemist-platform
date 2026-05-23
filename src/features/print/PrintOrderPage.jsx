import React, { useRef, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { usePrintFlow } from './usePrintFlow';
import { formatSettingsLabel, maskPhoneDisplay, billablePages } from './printPricing';

function StepBar({ current }) {
  const labels = ['Upload', 'Settings', 'Review', 'Pay'];
  return (
    <div className="print-step-bar">
      {labels.map((label, i) => (
        <React.Fragment key={label}>
          <div className={`print-step-item ${i < current ? 'done' : ''} ${i === current ? 'active' : ''}`}>
            <span className="print-step-dot">{i < current ? '✓' : i + 1}</span>
            <span>{label}</span>
          </div>
          {i < labels.length - 1 && <div className={`print-step-line ${i < current ? 'filled' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function UploadStep({ flow }) {
  const fileRef = useRef();
  const [dragOver, setDragOver] = useState(false);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) flow.handleFileSelect(file);
  };

  const fileIcon = flow.fileMetadata?.type === 'pdf' ? 'ti-file-type-pdf' :
    flow.fileMetadata?.type === 'docx' ? 'ti-file-type-docx' : 'ti-photo';

  return (
    <div>
      <div
        className={`print-dropzone ${dragOver ? 'drag-over' : ''} ${flow.uploadError ? 'error' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !flow.fileMetadata && fileRef.current?.click()}
      >
        <i className="ti ti-cloud-upload print-drop-icon"></i>
        <p className="print-drop-title">{dragOver ? 'Drop to upload' : 'Drop your file here'}</p>
        <p className="print-drop-sub">or click to browse</p>
        <p className="print-drop-hint">PDF · Word (.docx) · JPG · PNG · Max 25MB</p>
        <input ref={fileRef} type="file" hidden accept=".pdf,.docx,.jpg,.jpeg,.png,.webp"
          onChange={e => flow.handleFileSelect(e.target.files[0])} />
      </div>
      {flow.uploadError && <p className="error-text">{flow.uploadError}</p>}

      {flow.fileMetadata && (
        <div className="print-file-card">
          <i className={`ti ${fileIcon}`}></i>
          <div className="print-file-info">
            <strong>{flow.fileMetadata.name}</strong>
            <span>{(flow.fileMetadata.size / 1024 / 1024).toFixed(1)} MB · {flow.fileMetadata.type.toUpperCase()}</span>
            {flow.isUploading && (
              <div className="print-progress-wrap">
                <div className="print-progress-bar" style={{ width: `${flow.uploadProgress}%` }} />
                <span>Uploading... {flow.uploadProgress}%</span>
              </div>
            )}
            {!flow.isUploading && flow.uploadProgress === 100 && (
              <span className="print-upload-done">✓ Uploaded</span>
            )}
          </div>
          <button className="print-remove-btn" onClick={flow.removeFile}><i className="ti ti-x"></i></button>
        </div>
      )}

      <div className="print-customer-row">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className={`form-input ${flow.formErrors.name ? 'error' : ''}`} value={flow.customerName}
            onChange={e => flow.setCustomerName(e.target.value)} placeholder="Your full name" />
          {flow.formErrors.name && <div className="error-text">{flow.formErrors.name}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number *</label>
          <input className={`form-input ${flow.formErrors.phone ? 'error' : ''}`} value={flow.customerPhone}
            onChange={e => flow.setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit mobile" />
          {flow.formErrors.phone && <div className="error-text">{flow.formErrors.phone}</div>}
        </div>
      </div>
      <p className="print-sms-note">📱 We'll SMS your pickup code and updates to this number</p>
      <button className="print-btn-primary full" disabled={!flow.fileMetadata || flow.isUploading}
        onClick={flow.nextStep}>Next: Print Settings →</button>
    </div>
  );
}

function SettingsStep({ flow }) {
  const s = flow.printSettings;
  const set = (key, val) => flow.setPrintSettings(prev => ({ ...prev, [key]: val }));

  const pageNotice = s.page_count >= 200
    ? `Large document detected (${s.page_count} pages). This may take several minutes to print.`
    : flow.fileMetadata?.type === 'pdf'
      ? `We detected ${s.page_count} pages in your document`
      : flow.fileMetadata?.type === 'docx'
        ? 'DOCX files are auto-converted to PDF for printing'
        : 'Each image counts as 1 page';

  return (
    <div>
      <div className="print-info-banner"><i className="ti ti-info-circle"></i> {pageNotice}</div>

      <div className="print-settings-grid">
        <div className="print-setting-group">
          <label>Colour Mode</label>
          <div className="print-toggle-cards">
            {[
              { id: 'bw', label: 'Black & White', icon: 'ti-file-text', price: '₹2+ per page' },
              { id: 'colour', label: 'Colour', icon: 'ti-palette', price: '₹10+ per page' },
            ].map(opt => (
              <button key={opt.id} type="button"
                className={`print-toggle-card ${s.colour_mode === opt.id ? 'selected' : ''}`}
                onClick={() => set('colour_mode', opt.id)}>
                <span className="print-radio">{s.colour_mode === opt.id ? '◉' : '○'}</span>
                <i className={`ti ${opt.icon}`}></i>
                <strong>{opt.label}</strong>
                <span>{opt.price}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="print-setting-group">
          <label>Sides</label>
          <div className="print-toggle-cards">
            {[
              { id: 'single', label: 'Single-sided' },
              { id: 'double', label: 'Double-sided', note: 'Saves paper · Price per sheet' },
            ].map(opt => (
              <button key={opt.id} type="button"
                className={`print-toggle-card ${s.sides === opt.id ? 'selected' : ''}`}
                onClick={() => set('sides', opt.id)}>
                <span className="print-radio">{s.sides === opt.id ? '◉' : '○'}</span>
                <strong>{opt.label}</strong>
                {opt.note && <span>{opt.note}</span>}
              </button>
            ))}
          </div>
          
          {s.sides === 'double' && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
              <label style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>Flip Binding Option</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer', flex: 1 }}>
                  <input type="radio" name="binding" checked={s.binding !== 'short'} onChange={() => set('binding', 'long')} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Long Edge (Book)</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Standard reading</div>
                    <div style={{ marginTop: 8, border: '1px solid #ccc', width: 40, height: 50, position: 'relative', background: '#fff', borderLeft: '4px solid #333' }}>
                      <div style={{ position: 'absolute', top: 5, left: 5, right: 5, height: 4, background: '#eee' }}></div>
                      <i className="ti ti-arrow-forward" style={{ position: 'absolute', right: -12, top: '40%', fontSize: 12 }}></i>
                    </div>
                  </div>
                </label>
                <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer', flex: 1 }}>
                  <input type="radio" name="binding" checked={s.binding === 'short'} onChange={() => set('binding', 'short')} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Short Edge (Calendar)</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Flip page upwards</div>
                    <div style={{ marginTop: 8, border: '1px solid #ccc', width: 40, height: 50, position: 'relative', background: '#fff', borderTop: '4px solid #333' }}>
                      <div style={{ position: 'absolute', top: 8, left: 5, right: 5, height: 4, background: '#eee' }}></div>
                      <i className="ti ti-arrow-up" style={{ position: 'absolute', top: -12, left: '35%', fontSize: 12 }}></i>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="print-setting-group">
          <label>Paper Size</label>
          <div className="print-pill-group">
            {['a4', 'a3', 'letter'].map(sz => (
              <button key={sz} type="button"
                className={`print-pill ${s.paper_size === sz ? 'active' : ''}`}
                onClick={() => set('paper_size', sz)}>{sz.toUpperCase()}</button>
            ))}
          </div>
        </div>

        <div className="print-setting-group">
          <label>Number of Copies</label>
          <div className="print-copies-stepper">
            <button type="button" onClick={() => set('copies', Math.max(1, s.copies - 1))}>−</button>
            <span>{s.copies}</span>
            <button type="button" onClick={() => set('copies', Math.min(50, s.copies + 1))}>+</button>
          </div>
          <span className="print-copies-hint">Maximum 50 copies</span>
        </div>
        
        <div className="print-setting-group">
          <label>Special Instructions (Optional)</label>
          <textarea 
            className="form-input" 
            placeholder="e.g. Please bind the pages together, or print on glossy paper if available"
            value={s.notes}
            onChange={e => set('notes', e.target.value)}
            style={{ height: '80px', resize: 'vertical' }}
          />
        </div>
      </div>

      <div className="print-price-card sticky">
        <h4>Price breakdown</h4>
        <p>{s.page_count} pages × ₹{flow.pricePerPage.toFixed(2)} ({formatSettingsLabel(s)})</p>
        <p>× {s.copies} copies ({billablePages(s.page_count, s.sides) * s.copies} sheets)</p>
        <div className="print-price-total" key={flow.calculatedPrice}>
          Total: ₹{flow.calculatedPrice.toFixed(2)}
        </div>
        {flow.calculatedPrice === 10 && <p className="print-min-notice">Minimum charge ₹10 applies</p>}
        <div className="print-price-actions">
          <button className="print-btn-outline" onClick={flow.prevStep}>← Back</button>
          <button className="print-btn-primary" onClick={flow.nextStep}>Review Order →</button>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ flow }) {
  const s = flow.printSettings;
  return (
    <div>
      <div className="print-summary-card">
        <div className="print-summary-head">
          <h3>🖨️ Print Job Summary</h3>
          <button className="print-edit-link" onClick={() => flow.setCurrentStep(1)}>Edit</button>
        </div>
        <div className="print-summary-rows">
          <div><span>File</span><strong>{flow.fileMetadata?.name}</strong></div>
          <div><span>Pages</span><strong>{s.page_count} pages detected</strong></div>
          <div><span>Copies</span><strong>{s.copies}</strong></div>
          <div><span>Mode</span><strong>{s.colour_mode === 'colour' ? 'Colour' : 'Black & White'}</strong></div>
          <div><span>Sides</span><strong>{s.sides === 'double' ? 'Double-sided' : 'Single-sided'}</strong></div>
          <div><span>Paper</span><strong>{s.paper_size.toUpperCase()}</strong></div>
          <div><span>Customer</span><strong>{flow.customerName}</strong></div>
          <div><span>Phone</span><strong>{maskPhoneDisplay(flow.customerPhone)}</strong></div>
          {s.notes && <div style={{ gridColumn: '1 / -1', marginTop: 8 }}><span>Notes</span><strong style={{ display: 'block', fontWeight: 400, marginTop: 4 }}>{s.notes}</strong></div>}
        </div>
        
        <div style={{ marginTop: 20, padding: 16, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', textAlign: 'center' }}>
          <h4 style={{ fontSize: 14, marginBottom: 12, color: 'var(--primary-800)' }}>Visual Preview</h4>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            {s.sides === 'single' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 60, height: 80, background: '#fff', border: '1px solid #ccc', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 10, left: 10, width: 40, height: 4, background: s.colour_mode === 'colour' ? '#3B82F6' : '#666' }}></div>
                  <div style={{ position: 'absolute', top: 20, left: 10, width: 30, height: 4, background: s.colour_mode === 'colour' ? '#EF4444' : '#666' }}></div>
                  <div style={{ position: 'absolute', top: 30, left: 10, width: 35, height: 4, background: '#ccc' }}></div>
                </div>
                <span style={{ fontSize: 12, marginTop: 8, color: '#666' }}>Single Sided</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 60, height: 80, background: '#fff', border: `1px solid #ccc`, borderLeft: s.binding === 'long' ? '4px solid #333' : '1px solid #ccc', borderTop: s.binding === 'short' ? '4px solid #333' : '1px solid #ccc', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 5, right: 5, fontSize: 10, color: '#999' }}>Pg 1</span>
                  <div style={{ position: 'absolute', top: 20, left: 10, width: 30, height: 4, background: s.colour_mode === 'colour' ? '#3B82F6' : '#666' }}></div>
                </div>
                <i className={`ti ${s.binding === 'short' ? 'ti-arrow-up' : 'ti-arrow-right'}`} style={{ color: '#999' }}></i>
                <div style={{ width: 60, height: 80, background: '#fff', border: `1px solid #ccc`, borderRight: s.binding === 'long' ? '4px solid #333' : '1px solid #ccc', borderTop: s.binding === 'short' ? '4px solid #333' : '1px solid #ccc', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 5, left: 5, fontSize: 10, color: '#999' }}>Pg 2</span>
                  <div style={{ position: 'absolute', top: 20, left: 10, width: 30, height: 4, background: s.colour_mode === 'colour' ? '#EF4444' : '#666' }}></div>
                </div>
              </div>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 12 }}>
            {s.sides === 'single' ? 'Printed on one side of the paper only.' : s.binding === 'long' ? 'Printed on both sides. Flip like a standard book.' : 'Printed on both sides. Flip the page upwards like a calendar.'}
          </p>
        </div>

        <div className="print-summary-total">
          {s.page_count} pages × ₹{flow.pricePerPage.toFixed(2)} × {s.copies} copies
          <strong>₹{flow.calculatedPrice.toFixed(2)}</strong>
        </div>
      </div>
      <div className="print-warning-banner">
        ⚠️ Once payment is made, print settings cannot be changed.
        Refunds are available only if printing fails technically.
      </div>
      <div className="print-price-actions">
        <button className="print-btn-outline" onClick={flow.prevStep}>← Back to Settings</button>
        <button className="print-btn-primary full" onClick={flow.nextStep}>
          Pay ₹{flow.calculatedPrice.toFixed(2)} →
        </button>
      </div>
    </div>
  );
}

function PaymentStep({ flow, onSuccess }) {
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    setLoading(true);
    setErr('');
    try {
      await flow.createJobAndPay();
      onSuccess();
    } catch (e) {
      if (e.message === 'cancelled') {
        setErr('Payment cancelled. Your file is still saved. Try again?');
      } else if (flow.paymentStatus === 'verify_failed') {
        setErr(`Payment verification failed. Contact Diamond Chemist with your payment reference.`);
      } else {
        setErr(e.message || 'Payment failed');
      }
    }
    setLoading(false);
  };

  const started = React.useRef(false);
  React.useEffect(() => {
    if (!started.current) {
      started.current = true;
      pay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusMsg = {
    creating: 'Creating your print order...',
    paying: 'Opening secure payment...',
    verifying: 'Verifying payment...',
    cancelled: err,
    verify_failed: err,
    error: err,
  }[flow.paymentStatus] || (loading ? 'Processing...' : '');

  return (
    <div className="print-payment-step">
      <div className="print-spinner-wrap">
        {['creating', 'paying', 'verifying'].includes(flow.paymentStatus) && (
          <i className="ti ti-loader ti-spin print-spinner"></i>
        )}
        <p>{statusMsg}</p>
      </div>
      {(flow.paymentStatus === 'cancelled' || err) && (
        <button className="print-btn-primary full" onClick={pay}>Retry Payment</button>
      )}
      <button className="print-btn-outline" onClick={flow.prevStep}>← Back</button>
    </div>
  );
}

export function PrintOrderPage() {
  const { navigate } = useAppContext();
  const flow = usePrintFlow();

  const onSuccess = () => navigate('print-success');

  return (
    <div className="page print-order-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('print')}><i className="ti ti-arrow-left"></i></button>
        <h2>Print Order</h2>
      </div>
      <StepBar steps={flow.steps} current={flow.currentStep} />
      <div className="print-wizard-body">
        {flow.currentStep === 0 && <UploadStep flow={flow} />}
        {flow.currentStep === 1 && <SettingsStep flow={flow} />}
        {flow.currentStep === 2 && <ReviewStep flow={flow} />}
        {flow.currentStep === 3 && <PaymentStep flow={flow} onSuccess={onSuccess} />}
      </div>
    </div>
  );
}
