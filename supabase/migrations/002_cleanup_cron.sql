-- Rate limiting table for print tracking
CREATE TABLE IF NOT EXISTS public.tracking_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip TEXT NOT NULL,
    attempted_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (default deny for safety)
ALTER TABLE public.tracking_attempts ENABLE ROW LEVEL SECURITY;

-- Allow Edge Function to read and write (Service Role)
CREATE POLICY "Service role full tracking_attempts" ON public.tracking_attempts
  FOR ALL USING (true) WITH CHECK (true);

-- Create the pg_cron extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the cleanup edge function every 6 hours
-- NOTE: Requires the project URL and anon key to be set if invoking directly, 
-- but normally you would use the local net.http_post to hit the edge function 
-- or use a direct SQL query to clean the database table (but deleting from storage requires API).
-- As per spec, we'll schedule a POST request. The user will need to adjust the URL if deployed.
SELECT cron.schedule(
  'cleanup-print-files-cron',
  '0 */6 * * *',
  $$
    SELECT net.http_post(
        url:='https://' || current_setting('request.jwt.claim.iss', true) || '/functions/v1/cleanup-print-files',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('request.jwt.claim.anon', true) || '"}'::jsonb,
        body:='{}'::jsonb
    )
  $$
);

-- Clean up old tracking attempts every hour
SELECT cron.schedule(
  'cleanup-tracking-attempts',
  '0 * * * *',
  $$
    DELETE FROM tracking_attempts WHERE attempted_at < now() - interval '1 hour';
  $$
);
