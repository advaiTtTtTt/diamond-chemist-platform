import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getAdminClient } from '../_shared/print-utils.ts'

serve(async (req) => {
  // Only allow POST
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  
  try {
    const supabase = getAdminClient()
    
    // Find files older than 48 hours that are finished
    const twoDaysAgo = new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    const { data: jobs, error } = await supabase
      .from('print_jobs')
      .select('id, file_path')
      .in('status', ['COLLECTED', 'CANCELLED', 'ERROR'])
      .lt('created_at', twoDaysAgo)
      .not('file_path', 'is', null)
      
    if (error) throw error
    if (!jobs || jobs.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No files to clean up' }), { headers: { 'Content-Type': 'application/json' } })
    }

    let deleted = 0
    for (const job of jobs) {
      if (!job.file_path) continue
      
      const { error: rmErr } = await supabase.storage.from('print-files').remove([job.file_path])
      if (!rmErr) {
        await supabase.from('print_jobs').update({ file_path: null }).eq('id', job.id)
        deleted++
      }
    }

    return new Response(JSON.stringify({ success: true, deleted }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
})
