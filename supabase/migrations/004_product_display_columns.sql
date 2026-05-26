-- Migration: Add missing product display columns
-- Run this in the Supabase SQL Editor to add columns needed for proper product card display

-- Add brand column (defaults to 'Diamond Chemist')
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'Diamond Chemist';

-- Add unit column (e.g. '10 tablets', '100ml')
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT '1 unit';

-- Add description column for product details
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- Add icon column (Tabler icon class name, e.g. 'ti-pill')
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'ti-pill';

-- Add popular flag for featured products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false;

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;
