-- 1. Create the prescriptions storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prescriptions', 'prescriptions', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public inserts (so anyone can upload a prescription during checkout)
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'prescriptions');

-- 3. Allow public viewing (so the admin can see the uploaded prescription later)
DROP POLICY IF EXISTS "Allow public view" ON storage.objects;
CREATE POLICY "Allow public view" ON storage.objects 
FOR SELECT USING (bucket_id = 'prescriptions');
