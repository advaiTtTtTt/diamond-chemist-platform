import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import {
  corsHeaders, jsonResponse, getAdminClient, decryptPII,
  verifyRazorpaySignature, sendSms,
} from '../_shared/print-utils.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const ENCRYPTION_KEY = Deno.env.get('PII_ENCRYPTION_KEY')
    if (!ENCRYPTION_KEY) throw new Error('PII_ENCRYPTION_KEY not configured')

    const body = await req.json()
    let { job_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    // Razorpay webhook fallback
    if (body.event === 'payment.captured' && body.payload?.payment?.entity) {
      const entity = body.payload.payment.entity
      razorpay_order_id = entity.order_id
      razorpay_payment_id = entity.id
      razorpay_signature = body.payload.payment.entity.signature || ''
      const supabase = getAdminClient()
      const { data: job } = await supabase
        .from('print_jobs')
        .select('id')
        .eq('razorpay_order_id', razorpay_order_id)
        .maybeSingle()
      if (job) job_id = job.id
    }

    if (!job_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error('Missing payment details')
    }

    const valid = await verifyRazorpaySignature(
      razorpay_order_id, razorpay_payment_id, razorpay_signature
    )
    if (!valid) throw new Error('Invalid payment signature')

    const supabase = getAdminClient()
    const { data: job, error } = await supabase
      .from('print_jobs')
      .select('*')
      .eq('id', job_id)
      .eq('razorpay_order_id', razorpay_order_id)
      .single()

    if (error || !job) throw new Error('Print job not found')
    if (job.status === 'PAID' || job.status === 'PRINTING' || job.status === 'READY') {
      return jsonResponse({ success: true, already_paid: true })
    }

    const { error: updateErr } = await supabase.from('print_jobs').update({
      status: 'PAID',
      paid_at: new Date().toISOString(),
      razorpay_payment_id,
    }).eq('id', job_id)

    if (updateErr) throw updateErr

    const phone = decryptPII(job.customer_phone, ENCRYPTION_KEY)
    await sendSms(
      phone,
      `Hi ${job.customer_name}! Your print job is confirmed. Pickup code: ${job.pickup_code}. We'll SMS you when ready. - Diamond Chemist`
    )

    return jsonResponse({ success: true })
  } catch (err) {
    return jsonResponse({ error: err.message }, 400)
  }
})
