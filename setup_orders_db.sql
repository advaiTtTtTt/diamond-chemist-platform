-- 1. Create the orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_info JSONB NOT NULL,
    items JSONB NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Received',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone (public) to insert a new order (so guests can checkout)
DROP POLICY IF EXISTS "Allow public inserts" ON public.orders;
CREATE POLICY "Allow public inserts" ON public.orders
    FOR INSERT WITH CHECK (true);

-- 4. Allow authenticated Admins to view all orders
DROP POLICY IF EXISTS "Allow admin reads" ON public.orders;
CREATE POLICY "Allow admin reads" ON public.orders
    FOR SELECT USING (auth.role() = 'authenticated');

-- 5. Allow authenticated Admins to update order statuses
DROP POLICY IF EXISTS "Allow admin updates" ON public.orders;
CREATE POLICY "Allow admin updates" ON public.orders
    FOR UPDATE USING (auth.role() = 'authenticated');
