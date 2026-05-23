import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

export const CustomerAuthModal = () => {
  const { setShowCustomerAuth, fetchCustomerProfile } = useAppContext();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '', refCode: ''
  });

  const generateReferralCode = (name) => {
    const prefix = name ? name.substring(0, 3).toUpperCase() : 'DIA';
    return `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');

    try {
      if (isSignUp) {
        // 1. Sign up user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });
        if (authError) throw authError;
        
        if (!authData || !authData.user) {
          throw new Error("Account creation failed. This email may already be registered. Please try logging in.");
        }

        // 2. Check referral code if provided
        let referrerId = null;
        if (form.refCode) {
          const { data: refData } = await supabase.from('profiles').select('id').eq('referral_code', form.refCode.toUpperCase()).single();
          if (refData) referrerId = refData.id;
        }

        // 3. Create profile
        const myRefCode = generateReferralCode(form.name);
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: authData.user.id,
          full_name: form.name,
          phone: form.phone,
          referral_code: myRefCode,
          referred_by: referrerId
        }]);
        if (profileError) throw profileError;

        // 4. Give welcome bonus if referred
        if (referrerId) {
          await supabase.from('points_ledger').insert([{
            user_id: authData.user.id,
            amount: 20,
            transaction_type: 'welcome_bonus',
            expires_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
          }]);
        }
      } else {
        // Login
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (loginError) throw loginError;
      }
      
      await fetchCustomerProfile();
      setShowCustomerAuth(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setShowCustomerAuth(false)}>
      <div className="modal-card" style={{ maxWidth: 400, padding: 32 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, margin: 0, color: 'var(--primary-900)' }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <button onClick={() => setShowCustomerAuth(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
        </div>

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

          {isSignUp && (
            <div>
              <label className="form-label">Referral Code (Optional)</label>
              <input className="form-input" type="text" placeholder="e.g. ADV892" style={{ textTransform: 'uppercase' }} value={form.refCode} onChange={e => setForm({...form, refCode: e.target.value})} />
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Get 20 free points if you were referred!</div>
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
