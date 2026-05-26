import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

export const CustomerAuthModal = () => {
  const { setShowCustomerAuth, fetchCustomerProfile, setCustomerUser, setCustomerProfile, pendingRefCode, setPendingRefCode } = useAppContext();
  const [isSignUp, setIsSignUp] = useState(!!pendingRefCode); // Auto-show signup if referral code
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '', refCode: pendingRefCode || ''
  });

  // Sync referral code from URL into form (fires once on mount if ref param exists)
  useEffect(() => {
    if (pendingRefCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(prev => ({ ...prev, refCode: pendingRefCode }));
      setIsSignUp(true);
    }
  }, [pendingRefCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');

    try {
      if (isSignUp) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.name,
              phone: form.phone,
              referral_code: form.refCode
            }
          }
        });
        if (authError) throw authError;
        
        if (!authData || !authData.user) {
          throw new Error("Account creation failed. This email may already be registered. Please try logging in.");
        }
        
        // Profile and Points creation is now automatically handled securely by the Supabase backend Trigger!
      } else {
        // Login
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        
        // Special case bypass for Razorpay Demo Reviewer
        if (loginError && form.email === 'reviewer@razorpay.com' && form.password === 'RazorpayDemo123!') {
          // Manually fake a session for the Razorpay reviewer to bypass "Email not confirmed"
          setCustomerUser({ id: 'razorpay-demo-uuid', email: 'reviewer@razorpay.com' });
          setCustomerProfile({
            id: 'razorpay-demo-uuid',
            full_name: 'Razorpay Reviewer',
            phone: '9999999999',
            referral_code: 'RZPDEMO'
          });
          setShowCustomerAuth(false);
          setPendingRefCode('');
          setLoading(false);
          return;
        } else if (loginError) {
          throw loginError;
        }
      }
      
      setPendingRefCode('');
      await fetchCustomerProfile();
      setShowCustomerAuth(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowCustomerAuth(false);
    setPendingRefCode('');
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-card" style={{ maxWidth: 400, padding: 32 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, margin: 0, color: 'var(--primary-900)' }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
        </div>

        {/* Referral Banner — shown when a code is pre-filled from URL */}
        {form.refCode && isSignUp && (
          <div style={{
            background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
            border: '1.5px solid #6EE7B7',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span style={{ fontSize: 24 }}>🎁</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#065F46' }}>
                You&apos;ve been referred!
              </div>
              <div style={{ fontSize: 12, color: '#047857' }}>
                Sign up now to get <strong>20 FREE Diamond Points</strong> — courtesy of code <strong>{form.refCode}</strong>
              </div>
            </div>
          </div>
        )}

        {error && <div className="error-text" style={{ marginBottom: 16, background: '#FEF2F2', padding: 12, borderRadius: 8 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isSignUp && (
            <>
              <div>
                <label className="form-label">Full Name</label>
                <input required className="form-input" type="text" placeholder="Advait" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input required className="form-input" type="text" placeholder="10-digit number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
            </>
          )}
          
          <div>
            <label className="form-label">Email Address</label>
            <input required className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input required className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>

          {/* Referral code field — visible on Sign Up, and also shown on Login if a code is pending */}
          {(isSignUp || form.refCode) && (
            <div>
              <label className="form-label">
                {form.refCode ? '🎟️ Referral Code Applied' : 'Referral Code (Optional)'}
              </label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. ADV892"
                style={{
                  textTransform: 'uppercase',
                  ...(form.refCode ? {
                    borderColor: '#10B981',
                    background: '#F0FDF4',
                    fontWeight: 700,
                    color: '#065F46'
                  } : {})
                }}
                value={form.refCode}
                onChange={e => setForm({...form, refCode: e.target.value.toUpperCase()})}
              />
              {!form.refCode && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Get 20 free points if you were referred!</div>
              )}
            </div>
          )}

          <button type="submit" className="btn-checkout" disabled={loading} style={{ marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? <i className="ti ti-loader ti-spin"></i> : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <span style={{ color: 'var(--primary-700)', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setIsSignUp(!isSignUp); setError(''); }}>
            {isSignUp ? 'Login here' : 'Sign up here'}
          </span>
        </div>
      </div>
    </div>
  );
};
