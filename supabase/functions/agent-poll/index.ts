import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import {
  corsHeaders, jsonResponse, getAdminClient, verifyAgentSecret,
} from '../_shared/print-utils.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  if (!verifyAgentSecret(req)) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  try {
    const { agent_version, printer_name, hostname } = await req.json().catch(() => ({}))
    const supabase = getAdminClient()

    // Update heartbeat
    const today = new Date().toISOString().slice(0, 10)
    const { data: hb } = await supabase.from('print_agent_heartbeat').select('*').eq('id', 'default').single()
    let jobsToday = hb?.jobs_printed_today || 0
    if (hb?.last_seen && !hb.last_seen.startsWith(today)) jobsToday = 0

    await supabase.from('print_agent_heartbeat').upsert({
      id: 'default',
      last_seen: new Date().toISOString(),
      agent_version: agent_version || 'unknown',
      printer_name: printer_name || hb?.printer_name,
      hostname: hostname || hb?.hostname,
      jobs_printed_today: jobsToday,
    })

    const { data: jobs, error } = await supabase
      .from('print_jobs')
      .update({ 
        status: 'PRINTING',
        agent_version: agent_version 
      })
      .eq('status', 'PAID')
      .order('paid_at', { ascending: true })
      .limit(5)
      .select('id, pickup_code, file_name, file_path, file_type, page_count, copies, colour_mode, sides, paper_size')

    if (error) throw error

    const result = []
    for (const job of jobs || []) {
      const { data: signed, error: signErr } = await supabase.storage
        .from('print-files')
        .createSignedUrl(job.file_path, 60)
      if (signErr) continue
      result.push({ ...job, signed_url: signed.signedUrl })
    }

    return jsonResponse({ jobs: result })
  } catch (err) {
    return jsonResponse({ error: err.message }, 400)
  }
})
