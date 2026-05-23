-- Ensure the products table has a unique constraint on the name column 
-- so we can UPSERT (update if exists, insert if new) based on the medicine name.

-- 1. Create the products table if it doesn't exist (it should already, but just in case)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    discount_price NUMERIC,
    image TEXT,
    category TEXT NOT NULL,
    stock INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add a unique constraint to the 'name' column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'unique_product_name'
    ) THEN
        ALTER TABLE public.products ADD CONSTRAINT unique_product_name UNIQUE (name);
    END IF;
END $$;

-- 3. Ensure Row Level Security allows Admins to insert/update
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Note: In a production app, you'd restrict INSERT/UPDATE to authenticated Admins only.
-- For this prototype where you manage it, we'll allow public reads, and authenticated updates.
CREATE POLICY "Allow public read access on products" ON public.products
    FOR SELECT USING (true);

-- (If the policy already exists, this might error harmlessly, or you can drop it first)
DROP POLICY IF EXISTS "Allow admin inserts" ON public.products;
CREATE POLICY "Allow admin inserts" ON public.products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admin updates" ON public.products;
CREATE POLICY "Allow admin updates" ON public.products
    FOR UPDATE USING (auth.role() = 'authenticated');
