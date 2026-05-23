-- Print-on-Demand feature tables and policies

CREATE TABLE IF NOT EXISTS print_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colour_mode TEXT NOT NULL CHECK (colour_mode IN ('bw', 'colour')),
  sides TEXT NOT NULL CHECK (sides IN ('single', 'double')),
  paper_size TEXT NOT NULL CHECK (paper_size IN ('a4', 'a3', 'letter')),
  price_per_page NUMERIC(6,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (colour_mode, sides, paper_size)
);

CREATE TABLE IF NOT EXISTS print_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_code TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'image')),
  page_count INTEGER NOT NULL DEFAULT 1 CHECK (page_count > 0 AND page_count <= 200),
  copies INTEGER NOT NULL DEFAULT 1 CHECK (copies >= 1 AND copies <= 50),
  colour_mode TEXT NOT NULL DEFAULT 'bw' CHECK (colour_mode IN ('bw', 'colour')),
  sides TEXT NOT NULL DEFAULT 'single' CHECK (sides IN ('single', 'double')),
  paper_size TEXT NOT NULL DEFAULT 'a4' CHECK (paper_size IN ('a4', 'a3', 'letter')),
  price_per_page NUMERIC(6,2) NOT NULL,
  total_amount NUMERIC(8,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT'
    CHECK (status IN ('PENDING_PAYMENT', 'PAID', 'PRINTING', 'READY', 'COLLECTED', 'CANCELLED', 'ERROR')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ,
  printed_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ,
  agent_version TEXT,
  error_log TEXT
);

CREATE TABLE IF NOT EXISTS print_agent_heartbeat (
  id TEXT PRIMARY KEY DEFAULT 'default',
  last_seen TIMESTAMPTZ DEFAULT now(),
  agent_version TEXT,
  printer_name TEXT,
  hostname TEXT,
  jobs_printed_today INTEGER DEFAULT 0
);

INSERT INTO print_agent_heartbeat (id) VALUES ('default') ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(status);
CREATE INDEX IF NOT EXISTS idx_print_jobs_pickup ON print_jobs(pickup_code);
CREATE INDEX IF NOT EXISTS idx_print_jobs_paid_at ON print_jobs(paid_at);
CREATE INDEX IF NOT EXISTS idx_print_jobs_created ON print_jobs(created_at);

-- Seed pricing (Indian market rates)
INSERT INTO print_pricing (colour_mode, sides, paper_size, price_per_page) VALUES
  ('bw', 'single', 'a4', 2.00),
  ('bw', 'double', 'a4', 1.50),
  ('colour', 'single', 'a4', 10.00),
  ('colour', 'double', 'a4', 8.00),
  ('bw', 'single', 'a3', 4.00),
  ('colour', 'single', 'a3', 18.00),
  ('bw', 'single', 'letter', 2.00),
  ('colour', 'single', 'letter', 10.00)
ON CONFLICT (colour_mode, sides, paper_size) DO NOTHING;

ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read print pricing" ON print_pricing
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role full print_jobs" ON print_jobs
  FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket (run in Supabase dashboard if migration cannot create buckets)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('print-files', 'print-files', false);
