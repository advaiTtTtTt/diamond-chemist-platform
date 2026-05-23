-- 1. Ensure UI columns exist in the database (they might be missing from the original simplified schema)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "desc" TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false;

-- 1.5 Ensure unique constraint on name exists
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

-- 2. Insert the 15 Demo Products for Razorpay Review
INSERT INTO public.products (id, name, brand, category, price, "desc", icon, unit, popular, stock)
VALUES 
  (gen_random_uuid(), 'Crocin Advance', 'GSK', 'Medicines', 28, 'Pain relief & fever reduction', 'ti-pill', 'Strip of 15', true, 100),
  (gen_random_uuid(), 'Benadryl DR', 'J&J', 'Cold & Flu', 115, 'Dry cough relief syrup', 'ti-bottle', '100ml Bottle', true, 50),
  (gen_random_uuid(), 'Digene Tablets', 'Abbott', 'Stomach', 24, 'Antacid tablets for acidity', 'ti-pill', 'Strip of 15', false, 200),
  (gen_random_uuid(), 'Electral Powder', 'FDC', 'Vitamins', 21, 'ORS powder for hydration', 'ti-activity', '21.8g Sachet', true, 300),
  (gen_random_uuid(), 'Cetirizine 10mg', 'Generic', 'Medicines', 18, 'Anti-allergy medication', 'ti-pill', 'Strip of 10', true, 150),
  (gen_random_uuid(), 'Limcee Vitamin C', 'Abbott', 'Vitamins', 25, 'Chewable Vitamin C 500mg', 'ti-activity', 'Strip of 15', true, 100),
  (gen_random_uuid(), 'Dolo 650', 'Micro Labs', 'Medicines', 30, 'Fever and pain relief', 'ti-pill', 'Strip of 15', true, 250),
  (gen_random_uuid(), 'Volini Gel', 'Sun Pharma', 'Pain Relief', 95, 'Pain relief gel for sprains', 'ti-spray', '30g Tube', false, 80),
  (gen_random_uuid(), 'Vicks VapoRub', 'P&G', 'Cold & Flu', 85, 'Relief from cold and cough', 'ti-medical-cross', '50g Jar', false, 120),
  (gen_random_uuid(), 'Band-Aid Washproof', 'J&J', 'First Aid', 10, 'Waterproof bandage', 'ti-medical-cross', 'Pack of 5', true, 500),
  (gen_random_uuid(), 'Savlon Antiseptic Liquid', 'ITC', 'First Aid', 75, 'Antiseptic liquid for wounds', 'ti-bottle', '200ml', false, 60),
  (gen_random_uuid(), 'Pudin Hara Pearls', 'Dabur', 'Stomach', 35, 'Relief from stomach ache', 'ti-pill', 'Strip of 10', false, 100),
  (gen_random_uuid(), 'Eno Fruit Salt', 'GSK', 'Stomach', 9, 'Fast relief from acidity', 'ti-activity', '5g Sachet', true, 400),
  (gen_random_uuid(), 'Revital H', 'Sun Pharma', 'Vitamins', 300, 'Daily health supplement', 'ti-activity', 'Bottle of 30', false, 40),
  (gen_random_uuid(), 'Classmate Notebook', 'ITC', 'Stationery', 60, 'Ruled notebook', 'ti-pencil', '172 Pages', true, 200)
ON CONFLICT (name) DO UPDATE 
SET brand = EXCLUDED.brand, category = EXCLUDED.category, price = EXCLUDED.price, "desc" = EXCLUDED."desc", icon = EXCLUDED.icon, unit = EXCLUDED.unit, popular = EXCLUDED.popular, stock = EXCLUDED.stock;
