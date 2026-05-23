import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { cart, deliveryFee } = await req.json()

    // 1. Fetch actual prices directly from the database
    const productIds = cart.map((item: any) => item.id)
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, price, stock')
      .in('id', productIds)

    if (prodError) throw prodError

    // 2. Validate stock and calculate true total server-side
    let calculatedTotal = 0;

    for (const cartItem of cart) {
      const dbProduct = products.find(p => p.id === cartItem.id);
      if (!dbProduct) throw new Error(`Product ${cartItem.id} not found`);
      if (dbProduct.stock < cartItem.qty) throw new Error(`Insufficient stock for product ID: ${cartItem.id}`);
      calculatedTotal += (dbProduct.price * cartItem.qty);
    }

    const finalTotal = calculatedTotal + (deliveryFee || 0);

    // 3. Create Razorpay Order
    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!keyId || !keySecret) throw new Error('Razorpay keys not configured');

    const auth = btoa(`${keyId}:${keySecret}`);

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: finalTotal * 100, // amount in smallest currency unit (paise)
        currency: 'INR',
        receipt: `rx_${Date.now()}`
      })
    });

    const rzpData = await rzpRes.json();
    if (!rzpRes.ok) throw new Error(rzpData.error?.description || 'Failed to create Razorpay order');

    return new Response(
      JSON.stringify({ 
        order_id: rzpData.id, 
        amount: rzpData.amount, 
        currency: rzpData.currency 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
