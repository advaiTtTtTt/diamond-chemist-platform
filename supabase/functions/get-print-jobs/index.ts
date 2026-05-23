import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import {
  corsHeaders, jsonResponse, getAdminClient, verifyAdmin, decryptPII,
} from '../_shared/print-utils.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    await verifyAdmin(req)
    const ENCRYPTION_KEY = Deno.env.get('PII_ENCRYPTION_KEY')!
    const supabase = getAdminClient()

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
    const url = new URL(req.url)
    const status = body.status || url.searchParams.get('status')
    const search = body.search || url.searchParams.get('search')

    let query = supabase.from('print_jobs').select('*').order('created_at', { ascending: false }).limit(200)
    if (status && status !== 'all') query = query.eq('status', status.toUpperCase())
    if (search) query = query.ilike('pickup_code', `%${search.toUpperCase()}%`)

    const { data: jobs, error } = await query
    if (error) throw error

    const decrypted = (jobs || []).map(j => ({
      ...j,
      customer_phone: decryptPII(j.customer_phone, ENCRYPTION_KEY),
    }))

    const today = new Date().toISOString().slice(0, 10)
    const todayJobs = decrypted.filter(j => j.created_at?.startsWith(today))
    const stats = {
      todayJobs: todayJobs.length,
      pendingPickup: decrypted.filter(j => j.status === 'READY').length,
      todayRevenue: todayJobs.filter(j => ['PAID','PRINTING','READY','COLLECTED'].includes(j.status))
        .reduce((s, j) => s + Number(j.total_amount), 0),
      printsToday: todayJobs.filter(j => ['PRINTING','READY','COLLECTED'].includes(j.status)).length,
    }

    const { data: heartbeat } = await supabase.from('print_agent_heartbeat').select('*').eq('id', 'default').single()

    return jsonResponse({ jobs: decrypted, stats, agent: heartbeat })
  } catch (err) {
    const status = err.message === 'Unauthorized' ? 401 : 400
    return jsonResponse({ error: err.message }, status)
  }
})
