import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, jsonResponse, getAdminClient, verifyAdmin } from '../_shared/print-utils.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    await verifyAdmin(req)
    const { job_id } = await req.json()
    if (!job_id) throw new Error('job_id required')

    const supabase = getAdminClient()
    const { data: job, error } = await supabase.from('print_jobs').select('file_path').eq('id', job_id).single()
    if (error || !job) throw new Error('Job not found')

    const { data: signed, error: signErr } = await supabase.storage
      .from('print-files')
      .createSignedUrl(job.file_path, 60)

    if (signErr) throw signErr
    return jsonResponse({ url: signed.signedUrl })
  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : 400
    return jsonResponse({ error: err.message }, status)
  }
})
