-- Remove Razorpay demo / mock products (fake prices — not from chemist inventory).
-- Run BEFORE upload_chemist_db.sql if demo products were previously seeded.

DELETE FROM public.products
WHERE name IN (
  'Crocin Advance',
  'Benadryl DR',
  'Digene Tablets',
  'Electral Powder',
  'Cetirizine 10mg',
  'Limcee Vitamin C',
  'Dolo 650',
  'Volini Gel',
  'Vicks VapoRub',
  'Band-Aid Washproof',
  'Savlon Antiseptic Liquid',
  'Pudin Hara Pearls',
  'Eno Fruit Salt',
  'Revital H',
  'Classmate Notebook'
);

-- Also remove any other legacy mock entries not in chemist purchase data
DELETE FROM public.products
WHERE brand IN ('GSK', 'J&J', 'Abbott', 'FDC', 'Generic', 'Micro Labs', 'Sun Pharma', 'P&G', 'ITC', 'Dabur')
  AND name IN (
    'Crocin Advance', 'Benadryl DR', 'Digene Tablets', 'Electral Powder',
    'Cetirizine 10mg', 'Limcee Vitamin C', 'Dolo 650', 'Volini Gel',
    'Vicks VapoRub', 'Band-Aid Washproof', 'Savlon Antiseptic Liquid',
    'Pudin Hara Pearls', 'Eno Fruit Salt', 'Revital H', 'Classmate Notebook'
  );
