import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { formatSettingsLabel, maskPhoneDisplay } from './printPricing';

const STATUS_STEPS = [
  { key: 'PAID', label: 'Payment Received' },
  { key: 'PRINTING', label: 'Printing Now' },
  { key: 'READY', label: 'Ready for Pickup' },
  { key: 'COLLECTED', label: 'Collected' },
];

function stepIndex(status) {
  if (status === 'PAID') return 0;
  if (status === 'PRINTING') return 1;
  if (status === 'READY') return 2;
  if (status === 'COLLECTED') return 3;
  if (status === 'ERROR') return 1;
  return 0;
}

function PickupCodeDisplay({ code }) {
  const [visible, setVisible] = useState(0);
  const suffix = code.replace('PRN-', '');
  useEffect(() => {
    if (visible < suffix.length) {
      const t = setTimeout(() => setVisible(v => v + 1), 80);
      return () => clearTimeout(t);
    }
  }, [visible, suffix.length]);

  return (
    <div className="print-code-box">
      <span className="print-code-prefix">PRN-</span>
      <span className="print-code-suffix">{suffix.slice(0, visible)}</span>
    </div>
  );
}

export function PrintSuccessScreen() {
  const { navigate } = useAppContext();
  const [job] = useState(() => {
    try {
      const saved = sessionStorage.getItem('print_job_success');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [status, setStatus] = useState('PAID');
  const [copied, setCopied] = useState(false);



  useEffect(() => {
    if (!job?.id) return;
    const channel = supabase
      .channel(`print-job-${job.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'print_jobs',
        filter: `id=eq.${job.id}`,
      }, (payload) => {
        setStatus(payload.new.status);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [job?.id]);

  if (!job) {
    return (
      <div className="page print-success-page">
        <p>No print job found.</p>
        <button className="print-btn-primary" onClick={() => navigate('print')}>Start Printing</button>
      </div>
    );
  }

  const currentIdx = stepIndex(status);
  const code = job.pickup_code || '';
  const totalPrints = job.page_count * job.copies;

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = () => {
    const text = `My print order at Diamond Chemist is ready. Pickup code: ${code}`;
    if (navigator.share) navigator.share({ text });
    else copyCode();
  };

  return (
    <div className="page print-success-page">
      <div className="print-success-check">
        <svg viewBox="0 0 52 52" className="print-check-svg">
          <circle cx="26" cy="26" r="25" fill="none" stroke="var(--success)" strokeWidth="2" className="print-check-circle" />
          <path fill="none" stroke="var(--success)" strokeWidth="3" d="M14 27l8 8 16-16" className="print-check-path" />
        </svg>
      </div>
      <h2 className="print-success-title">Printing in Progress!</h2>
      <p className="print-success-sub">
        Your document is printing automatically. Show the code below when you arrive.
      </p>

      <div className="print-pickup-card">
        <p className="print-pickup-label">Your Pickup Code</p>
        <PickupCodeDisplay code={code} />
        <p className="print-pickup-hint">Show this code at the counter</p>
        <div className="print-code-actions">
          <button className="print-btn-outline" onClick={copyCode}>
            <i className={`ti ${copied ? 'ti-check' : 'ti-copy'}`}></i>
            {copied ? 'Copied!' : 'Copy code'}
          </button>
          <button className="print-btn-outline" onClick={shareCode}>
            <i className="ti ti-share"></i> Share
          </button>
        </div>
      </div>

      <div className="print-order-mini">
        <div><span>File</span><strong>{job.file_name}</strong></div>
        <div><span>Pages</span><strong>{job.page_count} pages, {job.copies} copies ({totalPrints} prints total)</strong></div>
        <div><span>Mode</span><strong>{formatSettingsLabel(job)}</strong></div>
        <div><span>Paid</span><strong>₹{Number(job.total_amount).toFixed(2)}</strong></div>
      </div>

      <div className="print-status-tracker">
        {STATUS_STEPS.map((step, i) => {
          const done = i <= currentIdx && status !== 'ERROR';
          
          const printing = status === 'PRINTING' && i === 1;
          const ready = status === 'READY' && i === 2;
          return (
            <div key={step.key} className={`print-status-step ${done ? 'done' : ''} ${printing || ready ? 'active' : ''}`}>
              <div className="print-status-dot">
                {done && i < currentIdx ? '✓' : (printing && i === 1) ? <i className="ti ti-loader ti-spin"></i> : i + 1}
              </div>
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>

      {status === 'READY' && (
        <div className="print-ready-banner">✅ Your prints are ready! Head to the counter.</div>
      )}

      <p className="print-sms-reminder">
        📱 We've sent this code to {maskPhoneDisplay(job.customer_phone)}
      </p>
      <p className="print-screenshot-hint">
        Screenshot this page or note down your code. It's also been sent to your phone.
      </p>
      <button className="print-btn-outline" onClick={() => navigate('home')}>Back to Home</button>
    </div>
  );
}
