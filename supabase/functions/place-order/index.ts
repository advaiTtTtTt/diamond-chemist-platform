import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import CryptoJS from "https://esm.sh/crypto-js@4.1.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const ENCRYPTION_KEY = Deno.env.get('PII_ENCRYPTION_KEY');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!ENCRYPTION_KEY) throw new Error('FATAL: PII_ENCRYPTION_KEY environment variable is missing. Refusing to process order.');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { customer, cart, deliveryFee, paymentMethod, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json()

    if (paymentMethod === 'ONLINE') {
      if (!RAZORPAY_KEY_SECRET) throw new Error('Razorpay secret not configured.');
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) throw new Error('Missing payment details.');

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw', encoder.encode(RAZORPAY_KEY_SECRET),
        { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      );
      
      const data = encoder.encode(razorpay_order_id + '|' + razorpay_payment_id);
      const signatureBytes = await crypto.subtle.sign('HMAC', key, data);
      const generatedSignature = Array.from(new Uint8Array(signatureBytes)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (generatedSignature !== razorpay_signature) throw new Error('Invalid payment signature. Payment verification failed.');
    }

    // 1. Fetch actual prices and stock directly from the database
    const productIds = cart.map((item: any) => item.id)
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, price, name, stock')
      .in('id', productIds)

    if (prodError) throw prodError

    // 2. Validate stock and calculate true total server-side
    let calculatedTotal = 0;
    const finalItems = [];

    for (const cartItem of cart) {
      const dbProduct = products.find(p => p.id === cartItem.id);
      if (!dbProduct) throw new Error(`Product ${cartItem.id} not found`);
      
      // Stock decrement validation
      if (dbProduct.stock < cartItem.qty) {
        throw new Error(`Insufficient stock for ${dbProduct.name}. Only ${dbProduct.stock} left.`);
      }

      calculatedTotal += (dbProduct.price * cartItem.qty);
      finalItems.push({
        ...cartItem,
        price: dbProduct.price, // force correct price from DB
        name: dbProduct.name
      });
    }

    const finalTotal = calculatedTotal + (deliveryFee || 0);

    // 2.5 Encrypt PII
    const encrypt = (text: string) => CryptoJS.AES.encrypt(text || '', ENCRYPTION_KEY).toString();
    const secureCustomer = {
      ...customer,
      name: encrypt(customer.name),
      phone: encrypt(customer.phone),
      address: encrypt(customer.address),
      building: encrypt(customer.building),
      gps: encrypt(customer.gps)
    };

    // 3. Create the order
    const order = {
      id: paymentMethod === 'ONLINE' ? razorpay_order_id : ('RX' + Math.floor(100000 + Math.random() * 900000)),
      customer: secureCustomer,
      items: finalItems,
      total: finalTotal,
      delivery_fee: deliveryFee || 0,
      status: paymentMethod === 'ONLINE' ? 'Paid (Online)' : 'Pending (COD)',
      time: new Date().toLocaleString('en-IN')
    };

    const { data: orderData, error: orderError } = await supabase.from('orders').insert([order]).select().single()
    if (orderError) throw orderError

    // 4. Decrement stock
    for (const item of finalItems) {
      const dbProduct = products.find(p => p.id === item.id);
      const newStock = dbProduct.stock - item.qty;
      await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
    }

    const returnOrder = {
      ...orderData,
      customer
    };

    return new Response(
      JSON.stringify(returnOrder),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
