import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { PrintSuccessScreen } from './PrintSuccessScreen';


export function PrintTrackingScreen() {
  const { navigate, printTrackCode, setPrintTrackCode } = useAppContext();
  const [code, setCode] = useState(printTrackCode || '');
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const track = async (pickupCode) => {
    const c = (pickupCode || code).trim().toUpperCase();
    if (!c) return;
    setLoading(true);
    setError('');
    const { data, error: fnErr } = await supabase.functions.invoke('track-print-job', {
      body: { pickup_code: c },
    });
    setLoading(false);
    if (fnErr || data?.error) {
      setError(data?.error || 'Code not found. Please check and try again.');
      setJob(null);
      return;
    }
    setJob(data.job);
    setStatus(data.job.status);
    sessionStorage.setItem('print_job_success', JSON.stringify({
      id: data.job.id,
      pickup_code: data.job.pickup_code,
      file_name: data.job.file_name,
      page_count: data.job.page_count,
      copies: data.job.copies,
      colour_mode: data.job.colour_mode,
      sides: data.job.sides,
      paper_size: data.job.paper_size,
      total_amount: data.job.total_amount,
      customer_phone: data.job.customer_phone_masked,
    }));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (printTrackCode) track(printTrackCode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printTrackCode]);

  useEffect(() => {
    if (!job?.id) return;
    const channel = supabase
      .channel(`print-track-${job.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'print_jobs', filter: `id=eq.${job.id}`,
      }, (payload) => setStatus(payload.new.status))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [job?.id]);

  if (job && ['PAID', 'PRINTING', 'READY'].includes(status)) {
    return <PrintSuccessScreen />;
  }

  if (job?.status === 'COLLECTED') {
    return (
      <div className="page print-track-page">
        <div className="print-collected-msg">
          <i className="ti ti-circle-check"></i>
          <h2>Already Collected</h2>
          <p>This order has already been collected. Thank you for using Diamond Chemist Print!</p>
          <p className="print-code-display">{job.pickup_code}</p>
          <button className="print-btn-primary" onClick={() => navigate('print')}>New Print Job</button>
        </div>
      </div>
    );
  }

  if (job?.status === 'CANCELLED' || job?.status === 'ERROR') {
    return (
      <div className="page print-track-page">
        <div className="print-error-msg">
          <i className="ti ti-alert-circle"></i>
          <h2>{job.status === 'ERROR' ? 'Print Failed' : 'Order Cancelled'}</h2>
          <p>{job.error_log || 'Please contact the shop for assistance.'}</p>
          <p>Code: {job.pickup_code}</p>
          <button className="print-btn-primary" onClick={() => navigate('print')}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page print-track-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => { setPrintTrackCode(''); navigate('print'); }}>
          <i className="ti ti-arrow-left"></i>
        </button>
        <h2>Track Print Job</h2>
      </div>
      <div className="print-track-form">
        <input
          className="form-input"
          placeholder="Enter pickup code (e.g. PRN-4K7X)"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && track()}
        />
        <button className="print-btn-primary full" onClick={() => track()} disabled={loading}>
          {loading ? 'Looking up...' : 'Track →'}
        </button>
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
