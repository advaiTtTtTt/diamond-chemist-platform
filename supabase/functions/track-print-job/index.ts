import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, jsonResponse, getAdminClient, maskPhone } from '../_shared/print-utils.ts'



serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
    const supabase = getAdminClient()
    const { count } = await supabase
      .from('tracking_attempts')
      .select('*', { count: 'exact' })
      .eq('ip', clientIP)
      .gte('attempted_at', new Date(Date.now() - 600000).toISOString())
    if (count && count >= 3) {
      return jsonResponse({ error: 'Too many attempts. Wait 10 minutes.' }, 429)
    }
    await supabase.from('tracking_attempts').insert({ ip: clientIP })

    const { pickup_code } = await req.json()
    const code = (pickup_code || '').trim().toUpperCase()
    if (!code || !/^PRN-[A-Z0-9]{4}$/.test(code)) {
      throw new Error('Invalid pickup code format')
    }

    const { data: job, error } = await supabase
      .from('print_jobs')
      .select('id, pickup_code, customer_name, file_name, page_count, copies, colour_mode, sides, paper_size, total_amount, status, created_at, paid_at, printed_at, collected_at, error_log')
      .eq('pickup_code', code)
      .maybeSingle()

    if (error || !job) throw new Error('Code not found. Please check and try again.')

    const ENCRYPTION_KEY = Deno.env.get('PII_ENCRYPTION_KEY')
    const { data: full } = await supabase.from('print_jobs').select('customer_phone').eq('id', job.id).single()

    return jsonResponse({
      job: {
        ...job,
        customer_phone_masked: ENCRYPTION_KEY && full
          ? maskPhone(full.customer_phone, ENCRYPTION_KEY)
          : '+91 XXXXX XXXXX',
      },
    })
  } catch (err) {
    return jsonResponse({ error: err.message }, 400)
  }
})
