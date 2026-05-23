import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import CryptoJS from "https://esm.sh/crypto-js@4.1.1";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-agent-secret',
}

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function getAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  return createClient(supabaseUrl, supabaseKey)
}

export function encryptPII(text: string, key: string) {
  return CryptoJS.AES.encrypt(text || '', key).toString()
}

export function decryptPII(text: string, key: string) {
  try {
    const bytes = CryptoJS.AES.decrypt(text, key)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch {
    return ''
  }
}

export async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  const secret = Deno.env.get('RAZORPAY_KEY_SECRET')
  if (!secret) return false
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const data = encoder.encode(orderId + '|' + paymentId)
  const signatureBytes = await crypto.subtle.sign('HMAC', key, data)
  const generated = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0')).join('')
  return generated === signature
}

const PICKUP_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export async function generatePickupCode(supabase: ReturnType<typeof createClient>): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    let suffix = ''
    for (let i = 0; i < 4; i++) {
      suffix += PICKUP_CHARS[Math.floor(Math.random() * PICKUP_CHARS.length)]
    }
    const code = `PRN-${suffix}`
    const { data } = await supabase.from('print_jobs').select('id').eq('pickup_code', code).maybeSingle()
    if (!data) return code
  }
  throw new Error('Could not generate unique pickup code')
}

export function billablePages(pageCount: number, sides: string): number {
  if (sides === 'double') return Math.ceil(pageCount / 2)
  return pageCount
}

export async function fetchPrice(
  supabase: ReturnType<typeof createClient>,
  colour_mode: string,
  sides: string,
  paper_size: string
) {
  const { data, error } = await supabase
    .from('print_pricing')
    .select('price_per_page')
    .eq('colour_mode', colour_mode)
    .eq('sides', sides)
    .eq('paper_size', paper_size)
    .eq('is_active', true)
    .maybeSingle()
  if (error || !data) throw new Error('Pricing not available for selected options')
  return Number(data.price_per_page)
}

export function calculateTotal(
  pricePerPage: number,
  pageCount: number,
  copies: number,
  sides: string
): { total: number; pricePerPage: number } {
  const sheets = billablePages(pageCount, sides) * copies
  let total = pricePerPage * sheets
  if (total < 10) total = 10
  return { total: Math.round(total * 100) / 100, pricePerPage }
}

export async function sendSms(phone: string, message: string) {
  const authKey = Deno.env.get('MSG91_AUTH_KEY')
  const senderId = Deno.env.get('MSG91_SENDER_ID') || 'DIAMND'
  if (!authKey) {
    console.log('[SMS skipped - no MSG91_AUTH_KEY]', phone, message)
    return
  }
  const mobile = phone.startsWith('91') ? phone : `91${phone}`
  try {
    await fetch('https://control.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': authKey,
      },
      body: JSON.stringify({
        template_id: Deno.env.get('MSG91_TEMPLATE_ID') || '',
        short_url: '0',
        recipients: [{ mobiles: mobile, var: message }],
      }),
    })
  } catch (e) {
    // Fallback: MSG91 transactional SMS API
    try {
      await fetch(`https://control.msg91.com/api/sendhttp.php?authkey=${authKey}&mobiles=${mobile}&message=${encodeURIComponent(message)}&sender=${senderId}&route=4&country=91`, {
        method: 'GET',
      })
    } catch (err) {
      console.error('SMS send failed:', err)
    }
  }
}

export function verifyAgentSecret(req: Request): boolean {
  const secret = Deno.env.get('AGENT_SECRET')
  if (!secret) return false
  return req.headers.get('x-agent-secret') === secret
}

export async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) throw new Error('Unauthorized')
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  if (error || !user) throw new Error('Unauthorized')
  return user
}

export function maskPhone(encrypted: string, key: string): string {
  const phone = decryptPII(encrypted, key)
  if (phone.length < 4) return '+91 XXXXX XXXXX'
  return `+91 ${phone.slice(0, 2)}XXX X${phone.slice(-4)}`
}
