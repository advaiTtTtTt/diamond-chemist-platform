import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, jsonResponse, getAdminClient, verifyAdmin } from '../_shared/print-utils.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    await verifyAdmin(req)
    const { job_id } = await req.json()
    const supabase = getAdminClient()

    const { data: job, error } = await supabase
      .from('print_jobs')
      .update({ status: 'PAID', error_log: null, printed_at: null })
      .eq('id', job_id)
      .eq('status', 'ERROR')
      .select()
      .single()

    if (error || !job) throw new Error('Job not found or not in ERROR status')
    return jsonResponse({ success: true, job })
  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : 400
    return jsonResponse({ error: err.message }, status)
  }
})
