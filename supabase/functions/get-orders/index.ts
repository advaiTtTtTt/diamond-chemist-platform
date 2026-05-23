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
    // 1. Verify Authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const ENCRYPTION_KEY = Deno.env.get('PII_ENCRYPTION_KEY');
    if (!ENCRYPTION_KEY) throw new Error('FATAL: PII_ENCRYPTION_KEY environment variable is missing. Refusing to decrypt data.');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) throw new Error('Unauthorized')

    // 2. Fetch Orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (ordersError) throw ordersError

    // 3. Decrypt PII
    const decrypt = (text: string) => {
      try {
        const bytes = CryptoJS.AES.decrypt(text, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
      } catch (e) {
        return "Decryption Error";
      }
    };

    const decryptedOrders = orders.map(order => ({
      ...order,
      customer: {
        ...order.customer,
        name: decrypt(order.customer.name),
        phone: decrypt(order.customer.phone),
        address: decrypt(order.customer.address),
        building: decrypt(order.customer.building),
        gps: decrypt(order.customer.gps)
      }
    }));

    return new Response(
      JSON.stringify(decryptedOrders),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: err.message === 'Unauthorized' ? 401 : 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
