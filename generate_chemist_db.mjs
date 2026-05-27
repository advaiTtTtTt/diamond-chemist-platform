/**
 * Generates upload_chemist_db.sql from database by chemist .csv
 * Merges duplicate medicine names (sums stock, uses highest MRP).
 */
import fs from 'fs';

const CSV_PATH = 'database by chemist .csv';
const OUT_PATH = 'upload_chemist_db.sql';

function parseCsvLine(line) {
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (const c of line) {
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ',' && !inQuotes) {
      parts.push(current);
      current = '';
    } else current += c;
  }
  parts.push(current);
  return parts;
}

function escSql(str) {
  return (str || '').replace(/'/g, "''");
}

function assignCategory(name) {
  const n = name.toLowerCase();
  if (/soap|cream|lotion|ointment|gel|face wash|shampoo|skin|derma|acne|fungal|candid|ketocon|moistur|sunban|cutimax|emolene|caladryl|betnovate|fucibet|panderm|sebamed|cetaphil/.test(n)) return 'Skin Care';
  if (/electral|vitamin|calcium|b-complex|supradyn|neurobion|shelcal|ensure|bournvita|horlicks|protein|iron|folic|d3|zinc|revital|zerolac|simyl|enerzal|powder/.test(n) && !/mycoderm|talc/.test(n)) return 'Vitamins';
  if (/bandage|plaster|betadine|dettol|savlon|cotton|gauze|spirit|povidone|first aid/.test(n)) return 'First Aid';
  if (/notebook|pen\b|pencil|register|stationery|classmate/.test(n)) return 'Stationery';
  if (/syrup|syp\b|cough|cold|inhaler|lozenge|nasal|drop|benadryl|ascoril|ambrolite|colicaid|neeri/.test(n)) return 'Medicines';
  if (/gel\b|volini|pain|diclofenac|aceclofenac|nimesulide|combiflam|spasm|myoril|vetory|everflam|carriago/.test(n)) return 'Medicines';
  return 'Medicines';
}

function assignIcon(category) {
  if (category === 'Skin Care') return 'ti-spray';
  if (category === 'Vitamins') return 'ti-activity';
  if (category === 'First Aid') return 'ti-medical-cross';
  if (category === 'Stationery') return 'ti-pencil';
  return 'ti-pill';
}

const csv = fs.readFileSync(CSV_PATH, 'utf-8');
const lines = csv.split(/\r?\n/);
let headerIdx = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"Medicine"') && lines[i].includes('"MRP"')) {
    headerIdx = i;
    break;
  }
}

const merged = new Map();

for (let i = headerIdx + 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const parts = parseCsvLine(line);
  if (parts.length < 7) continue;

  const name = parts[0].trim();
  const pack = parts[1].trim();
  const mrp = parseFloat(parts[5]);
  const qty = parseInt(parts[6], 10);

  if (!name || Number.isNaN(mrp)) continue;

  const key = name.toUpperCase();
  const existing = merged.get(key);
  if (existing) {
    existing.stock += Number.isNaN(qty) ? 0 : qty;
    existing.price = Math.max(existing.price, Math.ceil(mrp));
  } else {
    merged.set(key, {
      name,
      pack,
      price: Math.ceil(mrp),
      stock: Number.isNaN(qty) ? 0 : qty,
      category: assignCategory(name),
    });
  }
}

const products = [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));

const rows = products.map(p => {
  const icon = assignIcon(p.category);
  return `  (gen_random_uuid(), '${escSql(p.name)}', 'Diamond Chemist', '${p.category}', ${p.price}, '', '${icon}', '${escSql(p.pack)}', false, ${p.stock})`;
});

const sql = `-- Auto-generated from "${CSV_PATH}" (${products.length} unique products, duplicates merged)
-- Run this in Supabase SQL editor to load real chemist inventory.
-- Prices are MRP from purchase records (rounded up).

INSERT INTO public.products (id, name, brand, category, price, "desc", icon, unit, popular, stock)
VALUES 
${rows.join(',\n')}
ON CONFLICT (name) DO UPDATE 
SET brand = EXCLUDED.brand, category = EXCLUDED.category, price = EXCLUDED.price, icon = EXCLUDED.icon, unit = EXCLUDED.unit, stock = EXCLUDED.stock;
`;

fs.writeFileSync(OUT_PATH, sql);
console.log(`Wrote ${OUT_PATH} — ${products.length} products`);
