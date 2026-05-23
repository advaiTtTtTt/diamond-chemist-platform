import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import {
  corsHeaders, jsonResponse, getAdminClient, encryptPII,
  generatePickupCode, fetchPrice, calculateTotal,
} from '../_shared/print-utils.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const ENCRYPTION_KEY = Deno.env.get('PII_ENCRYPTION_KEY')
    if (!ENCRYPTION_KEY) throw new Error('PII_ENCRYPTION_KEY not configured')

    const body = await req.json()
    const {
      customer_name, customer_phone, file_path, file_name, file_type,
      page_count, copies, colour_mode, sides, paper_size, notes,
    } = body

    if (!customer_name?.trim() || customer_name.length < 2) throw new Error('Valid name required')
    if (!/^\d{10}$/.test(customer_phone || '')) throw new Error('Valid 10-digit phone required')
    if (!file_path || !file_name || !file_type) throw new Error('File details required')
    if (!['pdf', 'docx', 'image'].includes(file_type)) throw new Error('Invalid file type')
    const pages = Number(page_count)
    const copyCount = Number(copies)
    if (!pages || pages < 1 || pages > 200) throw new Error('Page count must be 1–200')
    if (!copyCount || copyCount < 1 || copyCount > 50) throw new Error('Copies must be 1–50')
    if (!['bw', 'colour'].includes(colour_mode)) throw new Error('Invalid colour mode')
    if (!['single', 'double'].includes(sides)) throw new Error('Invalid sides')
    if (!['a4', 'a3', 'letter'].includes(paper_size)) throw new Error('Invalid paper size')

    const supabase = getAdminClient()

    // Rate limit: 3 jobs per phone per hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
    const { data: recentJobs } = await supabase
      .from('print_jobs')
      .select('customer_phone')
      .gte('created_at', oneHourAgo)
    const encryptedPhone = encryptPII(customer_phone, ENCRYPTION_KEY)
    const phoneJobCount = (recentJobs || []).filter(j => j.customer_phone === encryptedPhone).length
    if (phoneJobCount >= 3) throw new Error('Too many print jobs. Please try again in an hour.')

    if (!file_path.startsWith('incoming/')) throw new Error('Invalid file path')
    const { data: fileBlob, error: dlErr } = await supabase.storage
      .from('print-files')
      .download(file_path)
    if (dlErr || !fileBlob) throw new Error('Uploaded file not found. Please re-upload.')

    const pricePerPage = await fetchPrice(supabase, colour_mode, sides, paper_size)
    const { total } = calculateTotal(pricePerPage, pages, copyCount, sides)
    const pickup_code = await generatePickupCode(supabase)

    const keyId = Deno.env.get('RAZORPAY_KEY_ID')
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!keyId || !keySecret) throw new Error('Razorpay not configured')

    const auth = btoa(`${keyId}:${keySecret}`)
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(total * 100),
        currency: 'INR',
        receipt: `print_${Date.now()}`,
      }),
    })
    const rzpData = await rzpRes.json()
    if (!rzpRes.ok) throw new Error(rzpData.error?.description || 'Failed to create payment order')

    const jobId = crypto.randomUUID()
    const finalPath = `${jobId}/${file_name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const { error: uploadErr } = await supabase.storage
      .from('print-files')
      .upload(finalPath, fileBlob, { upsert: true })
    if (uploadErr) throw new Error('Failed to store print file')
    await supabase.storage.from('print-files').remove([file_path])

    const { data: job, error: insertErr } = await supabase.from('print_jobs').insert({
      id: jobId,
      pickup_code,
      customer_name: customer_name.trim(),
      customer_phone: encryptedPhone,
      file_name,
      file_path: finalPath,
      file_type,
      page_count: pages,
      copies: copyCount,
      colour_mode,
      sides,
      paper_size,
      notes: notes || null,
      price_per_page: pricePerPage,
      total_amount: total,
      status: 'PENDING_PAYMENT',
      razorpay_order_id: rzpData.id,
    }).select().single()

    if (insertErr) throw insertErr

    return jsonResponse({
      job_id: job.id,
      pickup_code: job.pickup_code,
      razorpay_order_id: rzpData.id,
      razorpay_key_id: keyId,
      total_amount: total,
      amount_paise: rzpData.amount,
    })
  } catch (err) {
    return jsonResponse({ error: err.message }, 400)
  }
})
