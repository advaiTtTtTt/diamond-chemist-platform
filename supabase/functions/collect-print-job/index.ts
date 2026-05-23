import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import {
  corsHeaders, jsonResponse, getAdminClient, verifyAdmin, decryptPII, maskPhone,
} from '../_shared/print-utils.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    await verifyAdmin(req)
    const ENCRYPTION_KEY = Deno.env.get('PII_ENCRYPTION_KEY')!
    const { pickup_code } = await req.json()
    if (!pickup_code?.trim()) throw new Error('Pickup code required')

    const code = pickup_code.trim().toUpperCase()
    const supabase = getAdminClient()

    const { data: job, error } = await supabase
      .from('print_jobs')
      .select('*')
      .eq('pickup_code', code)
      .maybeSingle()

    if (error || !job) throw new Error('Job not found')

    if (job.status !== 'READY') {
      return jsonResponse({
        error: `Cannot collect — current status: ${job.status}`,
        current_status: job.status,
        job,
      }, 400)
    }

    const { data: updated, error: updateErr } = await supabase
      .from('print_jobs')
      .update({ status: 'COLLECTED', collected_at: new Date().toISOString() })
      .eq('id', job.id)
      .select()
      .single()

    if (updateErr) throw updateErr

    return jsonResponse({
      success: true,
      job: {
        ...updated,
        customer_phone_display: maskPhone(updated.customer_phone, ENCRYPTION_KEY),
        customer_phone: decryptPII(updated.customer_phone, ENCRYPTION_KEY),
      },
    })
  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : 400
    return jsonResponse({ error: err.message }, status)
  }
})
