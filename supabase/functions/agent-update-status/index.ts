import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import {
  corsHeaders, jsonResponse, getAdminClient, verifyAgentSecret,
  decryptPII, sendSms,
} from '../_shared/print-utils.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  if (!verifyAgentSecret(req)) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  try {
    const ENCRYPTION_KEY = Deno.env.get('PII_ENCRYPTION_KEY')
    if (!ENCRYPTION_KEY) throw new Error('PII_ENCRYPTION_KEY not configured')

    const { job_id, status, error_log, agent_version } = await req.json()
    if (!job_id || !status) throw new Error('job_id and status required')
    if (!['PRINTING', 'READY', 'ERROR'].includes(status)) throw new Error('Invalid status')

    const supabase = getAdminClient()
    const updates: Record<string, unknown> = { status, error_log: error_log || null }
    if (status === 'PRINTING') updates.agent_version = agent_version
    if (status === 'READY') updates.printed_at = new Date().toISOString()
    if (status === 'ERROR') updates.error_log = error_log || 'Print failed'

    const { data: job, error } = await supabase
      .from('print_jobs')
      .update(updates)
      .eq('id', job_id)
      .select()
      .single()

    if (error || !job) throw new Error('Job not found')

    if (status === 'READY') {
      const { data: hb } = await supabase.from('print_agent_heartbeat').select('jobs_printed_today').eq('id', 'default').single()
      await supabase.from('print_agent_heartbeat').update({
        jobs_printed_today: (hb?.jobs_printed_today || 0) + 1,
      }).eq('id', 'default')

      const phone = decryptPII(job.customer_phone, ENCRYPTION_KEY)
      await sendSms(
        phone,
        `Your prints are ready at Diamond Chemist! Show code ${job.pickup_code} to collect. Open till 10PM.`
      )
    }

    if (status === 'ERROR') {
      const phone = decryptPII(job.customer_phone, ENCRYPTION_KEY)
      await sendSms(
        phone,
        `Hi ${job.customer_name}, sorry — your print job (${job.pickup_code}) failed due to a printer issue. Please contact Diamond Chemist. You will receive a full refund within 24 hours. - Diamond Chemist`
      )
      const adminPhone = Deno.env.get('ADMIN_PHONE')
      if (adminPhone) {
        await sendSms(adminPhone, `PRINT ERROR: Job ${job.pickup_code} failed. File: ${job.file_name}. Error: ${error_log || 'Unknown error'}`)
      }
    }

    return jsonResponse({ success: true })
  } catch (err) {
    return jsonResponse({ error: err.message }, 400)
  }
})
