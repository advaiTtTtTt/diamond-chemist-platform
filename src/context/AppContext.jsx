/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

const normalizeOrder = (o) => ({
  ...o,
  total: o.total !== undefined ? o.total : o.total_amount,
  time: o.time || (o.created_at ? new Date(o.created_at).toLocaleString('en-IN') : ''),
  customer: o.customer || o.customer_info || {},
});

export const AppProvider = ({ children }) => {
  const [page, setPage] = useState(() => {
    const hash = window.location.hash.slice(1);
    return hash || 'home';
  });
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [aiResults, setAiResults] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [selCat, setSelCat] = useState(null);
  const [badgeBounce, setBadgeBounce] = useState(false);
  const [products, setProducts] = useState([]);
  const savedForm = JSON.parse(localStorage.getItem('diamond_customer') || '{}');
  const savedOrders = JSON.parse(localStorage.getItem('diamond_orders') || '[]');
  
  const [form, setForm] = useState({ 
    name: savedForm.name || '', 
    phone: savedForm.phone || '', 
    building: savedForm.building || '', 
    address: savedForm.address || '', 
    notes: '', gps: savedForm.gps || null, prescription: null 
  });
  const [points, setPoints] = useState(savedForm.points || 0);
  const [usePoints, setUsePoints] = useState(false);
  const [errors, setErrors] = useState({});
  const [locating, setLocating] = useState(false);
  const [orders, setOrders] = useState(savedOrders);
  const [lastOrder, setLastOrder] = useState(null);
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPw, setAdminPw] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isUploadingRx, setIsUploadingRx] = useState(false);
  const [printTrackCode, setPrintTrackCode] = useState('');
  
  // Customer Auth & Points
  const [customerUser, setCustomerUser] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [showCustomerAuth, setShowCustomerAuth] = useState(false);

  // Referral: capture ?ref=CODE from URL
  const [pendingRefCode, setPendingRefCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('ref')?.toUpperCase() || '';
  });

  const searchRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminAuth(!!session && session.user?.email === 'haste6inertia@gmail.com');
      if (session && session.user?.email !== 'haste6inertia@gmail.com') {
        setCustomerUser(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setAdminAuth(!!session && session.user?.email === 'haste6inertia@gmail.com');
      if (session && session.user?.email !== 'haste6inertia@gmail.com') {
        setCustomerUser(session.user);
      } else if (!session) {
        setCustomerUser(null);
        setCustomerProfile(null);
      }
    });

    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    };
    fetchProducts();

    const fetchOrders = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (data && !error) setOrders(data.map(normalizeOrder));
      } else {
        setOrders([]);
      }
    };
    fetchOrders();

    const playDing = () => {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log('Audio play failed (browser policy):', e));
    };

    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        playDing();
        fetchOrders();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Browser history support
  useEffect(() => {
    const onPop = (e) => {
      const p = e.state?.page || window.location.hash.slice(1) || 'home';
      setPage(p);
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Auto-open sign-up modal if user arrived via referral link (?ref=CODE)
  useEffect(() => {
    if (pendingRefCode && !customerProfile) {
      // Clean the ?ref= from URL so it doesn't stick around
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.pathname + url.hash);
      // Open the auth modal after a brief delay so the page renders first
      setTimeout(() => setShowCustomerAuth(true), 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCustomerProfile = useCallback(async () => {
    if (!customerUser) return;
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', customerUser.id).single();
      if (profile) {
        setCustomerProfile(profile);
        // Pre-fill checkout form if empty
        setForm(prev => ({ 
          ...prev, 
          name: prev.name || profile.full_name, 
          phone: prev.phone || profile.phone 
        }));
      }
      const { data: pts } = await supabase.rpc('get_active_points', { customer_id: customerUser.id });
      setPoints(pts || 0);
    } catch (e) {
      console.log('Error fetching profile:', e);
    }
  }, [customerUser]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCustomerProfile();
  }, [fetchCustomerProfile]);

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => s + c.qty * c.price, 0);
  const deliveryFee = 0;
  const discount = usePoints ? Math.min(points, Math.floor(cartTotal * 0.5)) : 0;
  const finalTotal = cartTotal + deliveryFee - discount;

  const triggerBounce = () => { setBadgeBounce(true); setTimeout(() => setBadgeBounce(false), 400); };

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === product.id);
      if (ex) return prev.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...product, qty: 1 }];
    });
    triggerBounce();
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0));
  };
  
  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));
  const getQty = (id) => { const c = cart.find(x => x.id === id); return c ? c.qty : 0; };

  const navigate = (p) => {
    setPage(p);
    window.scrollTo(0, 0);
    window.history.pushState({ page: p }, '', `#${p === 'home' ? '' : p}`);
  };

  const doSearch = async (q) => {
    if (!q.trim()) return;
    setAiLoading(true); setAiQuery(q); setAiResults(null);
    await new Promise(r => setTimeout(r, 800));
    const lower = q.toLowerCase();
    const queryWords = lower.split(/\s+/).filter(w => w.length > 1);

    // Symptom hints → search terms matched against real inventory only
    const symptomTerms = {
      fever: ['calpol', 'paracetamol', 'pcm', 'dolo', 'crocin', 'feb'],
      cold: ['cough', 'syrup', 'syp', 'cold', 'cetirizine', 'levocet', 'nasal'],
      cough: ['cough', 'syrup', 'syp', 'ambrolite', 'ascoril', 'benadryl'],
      pain: ['pain', 'diclofenac', 'aceclofenac', 'nimesulide', 'combiflam', 'spasm'],
      stomach: ['pan', 'pantop', 'omeprazole', 'digene', 'antacid', 'domperidone'],
      acidity: ['digene', 'eno', 'antacid', 'pantop', 'omeprazole'],
      vitamin: ['vitamin', 'b-complex', 'calcium', 'd3', 'electral', 'supradyn'],
      skin: ['cream', 'lotion', 'soap', 'ointment', 'betnovate', 'candid'],
      allergy: ['cetirizine', 'levocet', 'fexofenadine', 'montelukast'],
      diabetes: ['metformin', 'glyciphage', 'glimepiride', 'vildagliptin'],
      bp: ['telma', 'telmisartan', 'amlodipine', 'atenolol'],
      thyroid: ['thyronorm', 'thyroxine'],
    };

    // Levenshtein distance for fuzzy matching (spell check)
    const getEditDistance = (a, b) => {
      if(a.length === 0) return b.length; 
      if(b.length === 0) return a.length; 
      const matrix = [];
      for(let i = 0; i <= b.length; i++) matrix[i] = [i];
      for(let j = 0; j <= a.length; j++) matrix[0][j] = j;
      for(let i = 1; i <= b.length; i++){
        for(let j = 1; j <= a.length; j++){
          if(b.charAt(i-1) == a.charAt(j-1)){
            matrix[i][j] = matrix[i-1][j-1];
          } else {
            matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
          }
        }
      }
      return matrix[b.length][a.length];
    };

    let matched = new Set();

    // Map symptom words to search terms, then match real products
    Object.entries(symptomTerms).forEach(([symptom, terms]) => {
      queryWords.forEach(qw => {
        const threshold = qw.length > 5 ? 3 : 2;
        if (symptom.includes(qw) || getEditDistance(symptom, qw) <= threshold) {
          products.forEach(p => {
            const hay = `${p.name} ${p.desc || ''} ${p.brand || ''}`.toLowerCase();
            if (terms.some(t => hay.includes(t))) matched.add(p.name);
          });
        }
      });
    });

    // Direct product name / brand / description search
    products.forEach(p => {
      const pNameLower = p.name.toLowerCase();
      const pDescLower = (p.desc || '').toLowerCase();
      const pBrandLower = (p.brand || '').toLowerCase();
      if (pNameLower.includes(lower) || pDescLower.includes(lower) || pBrandLower.includes(lower)) {
        matched.add(p.name);
      }
      queryWords.forEach(qw => {
        pNameLower.split(' ').forEach(pw => {
          const threshold = qw.length > 5 ? 3 : 2;
          if (pw.length > 3 && getEditDistance(pw, qw) <= threshold) {
            matched.add(p.name);
          }
        });
      });
    });
    
    const results = products.filter(p => matched.has(p.name));
    setAiResults(results.length > 0 ? results : []);
    setAiLoading(false);
  };

  const clearAi = () => { setAiResults(null); setAiQuery(''); setSearch(''); };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported by your browser');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      
      // Diamond Chemist Exact Coordinates
      const SHOP_LAT = 19.198509803965546;
      const SHOP_LON = 73.10590402019947;
      
      const dist = getDistance(SHOP_LAT, SHOP_LON, lat, lon);
      
      const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';
      if (!IS_DEMO && dist > 50) {
        alert(`We only deliver within 50 metres. Your location is approximately ${Math.round(dist)} metres away.`);
        setLocating(false);
        return;
      }

      const gpsString = `${lat},${lon}`;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await res.json();
        if (data && data.display_name) {
          setForm(prev => ({ ...prev, address: data.display_name, gps: gpsString }));
        } else {
          setForm(prev => ({ ...prev, gps: gpsString }));
        }
      } catch {
        setForm(prev => ({ ...prev, gps: gpsString }));
        alert('Location verified. Please type your street address manually.');
      }
      setLocating(false);
    }, (err) => {
      alert(`Location access failed: ${err.message}`);
      setLocating(false);
    }, { enableHighAccuracy: true });
  };

  const handlePrescriptionUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingRx(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 800;
        if (width > MAX_WIDTH) {
          height = height * (MAX_WIDTH / width);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(async (blob) => {
          if (!blob) { setIsUploadingRx(false); return; }
          const fileName = `rx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
          const { error } = await supabase.storage.from('prescriptions').upload(fileName, blob, { contentType: 'image/jpeg' });
          if (error) {
            alert('Upload failed: ' + error.message);
            setIsUploadingRx(false);
            return;
          }
          const { data } = supabase.storage.from('prescriptions').getPublicUrl(fileName);
          setForm(prev => ({ ...prev, prescription: data.publicUrl }));
          setIsUploadingRx(false);
        }, 'image/jpeg', 0.6);
      }
      img.src = event.target.result;
    }
    reader.readAsDataURL(file);
  };

  const shareWebsite = async () => {
    if (!customerProfile) {
      alert('Please Login or Sign Up first to get your unique Referral Link!');
      setShowCustomerAuth(true);
      return;
    }
    const refLink = `${window.location.origin}/?ref=${customerProfile.referral_code}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Diamond Chemist',
          text: `Use my code ${customerProfile.referral_code} to get 20 FREE Diamond Points on sign up!`,
          url: refLink,
        });
      } else {
        await navigator.clipboard.writeText(refLink);
        alert('Your unique Referral Link copied to clipboard!');
      }
    } catch (err) {
      console.log('Share error:', err);
    }
  };

  const placeOrder = async () => {
    if (isPlacingOrder) return;
    
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim() || form.phone.length !== 10 || isNaN(form.phone)) errs.phone = 'Valid 10-digit phone required';
    if (!form.building?.trim()) errs.building = 'Flat/Building name is required';
    if (!form.address.trim()) errs.address = 'Street/Area is required';
    
    // Hardcoded to true for demo so you don't need to restart the server!
    const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';
    if (!IS_DEMO) {
      if (!form.gps) errs.address = 'Please use "Detect Location" to verify you are within our 50-metre delivery zone.';
    }

    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    
    setIsPlacingOrder(true);

    let order, error;
    
    if (IS_DEMO) {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 1200));
      order = {
        id: 'RX' + Math.floor(100000 + Math.random() * 900000),
        customer: { ...form },
        items: [...cart],
        total: finalTotal,
        subtotal: cartTotal,
        discount: discount,
        delivery_fee: deliveryFee,
        status: 'Received',
        time: new Date().toLocaleString('en-IN')
      };
      error = null;
    } else {
      const dbOrder = {
        customer_info: { ...form },
        items: [...cart],
        total_amount: finalTotal,
        status: 'Received'
      };

      // Launch Razorpay and capture payment_id before saving
      const rzpPaymentId = await new Promise((resolve) => {
        const IS_LIVE_RAZORPAY = !!window.Razorpay;
        if (!IS_LIVE_RAZORPAY) { resolve(null); return; }
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: finalTotal * 100,
          currency: 'INR',
          name: 'Diamond Chemist',
          description: 'Medicine Order',
          handler: (response) => resolve(response.razorpay_payment_id),
          modal: { ondismiss: () => resolve(null) },
          prefill: { name: form.name, contact: form.phone },
        };
        new window.Razorpay(options).open();
      });

      const res = await supabase.from('orders').insert([{ ...dbOrder, razorpay_payment_id: rzpPaymentId }]).select().single();
      order = res.data ? normalizeOrder(res.data) : res.data;
      error = res.error;
    }
    
    setIsPlacingOrder(false);

    if (error) {
      alert(`Failed to place order: ${error.message || 'Unknown error'}. Check internet or edge function deployment.`);
      console.error("Error saving order:", error);
      return;
    }

    const newPoints = usePoints ? points - discount : points;
    setPoints(newPoints);
    setUsePoints(false);

    localStorage.setItem('diamond_customer', JSON.stringify({
      name: form.name, phone: form.phone, building: form.building, address: form.address, gps: form.gps, points: newPoints
    }));

    const newOrders = [order, ...orders];
    setOrders(newOrders);
    localStorage.setItem('diamond_orders', JSON.stringify(newOrders));
    
    setLastOrder(order);
    setCart([]);


    setForm(prev => ({ ...prev, notes: '', prescription: null }));
    navigate('success');
  };

  const updateOrderStatus = async (orderId, status) => {
    let extra = {};

    // Generate a 4-digit OTP when dispatching for delivery
    if (status === 'Out for Delivery') {
      const otp = String(Math.floor(1000 + Math.random() * 9000));
      extra = { delivery_otp: otp, otp_verified: false };
      // Optimistically update local state with OTP
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, delivery_otp: otp, otp_verified: false } : o));
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    }

    const { error } = await supabase.from('orders').update({ status, ...extra }).eq('id', orderId);
    if (error) console.error('Error updating order:', error);

    // Return the OTP so the caller can pass it to notifyCustomer
    return extra.delivery_otp || null;
  };

  // Verify OTP entered by delivery boy — marks order Delivered on match
  const verifyDeliveryOtp = async (orderId, enteredOtp) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, msg: 'Order not found.' };
    if (order.otp_verified) return { success: true, msg: 'Already verified.' };
    if (String(enteredOtp).trim() !== String(order.delivery_otp).trim()) {
      return { success: false, msg: 'Galat OTP! Dawa mat dijiye.' };
    }
    // OTP matched — mark delivered
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Delivered', otp_verified: true } : o));
    const { error } = await supabase.from('orders')
      .update({ status: 'Delivered', otp_verified: true })
      .eq('id', orderId);
    if (error) console.error('OTP verify error:', error);
    return { success: true, msg: 'OTP sahi hai! Dawa de dijiye. ✅' };
  };

  // Send a pre-filled WhatsApp message to customer for critical status changes
  const notifyCustomer = (order, status, otp = null) => {
    const phone = '91' + order.customer?.phone;
    let msg = '';
    if (status === 'Cancelled') {
      msg = `नमस्ते ${order.customer?.name?.split(' ')[0] || ''},\nआपका Diamond Chemist का ऑर्डर #${order.id} डिलीवर नहीं हो सका। आपका ₹${order.total} का पेमेंट 3-5 दिनों में वापस आ जाएगा।\nकिसी भी सवाल के लिए हमसे संपर्क करें।\n- Diamond Chemist 🏥`;
    } else if (status === 'Rx Rejected') {
      msg = `नमस्ते ${order.customer?.name?.split(' ')[0] || ''},\nआपका Diamond Chemist का ऑर्डर #${order.id} रद्द किया गया है क्योंकि जो प्रिस्क्रिप्शन आपने दिया वो मान्य नहीं है। आपका ₹${order.total} का पेमेंट 3-5 दिनों में वापस आ जाएगा।\n- Diamond Chemist 🏥`;
    } else if (status === 'Out for Delivery') {
      msg = `नमस्ते ${order.customer?.name?.split(' ')[0] || ''},\n` +
        `आपकी दवाइयाँ रास्ते में हैं! 🚴\n\n` +
        `📦 ऑर्डर: #${order.id}\n` +
        (otp ? `🔐 डिलीवरी OTP: *${otp}*\n\n` +
        `⚠️ यह OTP सिर्फ डिलीवरी बॉय को बताएं। किसी और को नहीं।\n` : '') +
        `\n- Diamond Chemist 🏥`;
    }
    if (msg && phone.length >= 12) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  const openAdmin = () => {
    if (adminAuth) { navigate('admin'); }
    else { setShowAdminModal(true); }
  };

  const loginAdmin = async () => {
    if (!adminEmail || !adminPw) return;
    setIsLoggingIn(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPw,
    });
    setIsLoggingIn(false);
    if (error) {
      setAuthError(error.message);
    } else {
      setShowAdminModal(false);
      setAdminPw('');
      navigate('admin');
    }
  };

  const logoutAdmin = async () => {
    await supabase.auth.signOut();
    navigate('home');
  };

  const logoutCustomer = async () => {
    await supabase.auth.signOut();
    setCustomerUser(null);
    setCustomerProfile(null);
    setPoints(0);
    navigate('home');
  };

  const getProds = () => {
    if (aiResults !== null) return aiResults;
    if (selCat) return products.filter(p => p.category === selCat);
    return products;
  };

  const contextValue = {
    page, setPage, navigate,
    cart, setCart, cartCount, cartTotal, deliveryFee,
    addToCart, updateQty, removeFromCart, getQty, badgeBounce,
    search, setSearch, searchRef, doSearch, clearAi,
    aiResults, aiLoading, aiQuery,
    selCat, setSelCat, getProds, products,
    form, setForm, errors, setErrors, locating, detectLocation, handlePrescriptionUpload, isUploadingRx, placeOrder, isPlacingOrder,
    orders, lastOrder, updateOrderStatus,
    adminAuth, adminEmail, setAdminEmail, adminPw, setAdminPw, showAdminModal, setShowAdminModal, openAdmin, loginAdmin, logoutAdmin, authError, isLoggingIn,
    printTrackCode, setPrintTrackCode, points, usePoints, setUsePoints, discount, finalTotal, shareWebsite,
    customerUser, setCustomerUser, customerProfile, setCustomerProfile, showCustomerAuth, setShowCustomerAuth, fetchCustomerProfile, logoutCustomer,
    notifyCustomer, verifyDeliveryOtp,
    pendingRefCode, setPendingRefCode
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
