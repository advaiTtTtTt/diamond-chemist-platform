/**
 * Syncs the products table in Supabase with ONLY the medicines from
 * "database by chemist .csv". Removes all mock/demo products.
 *
 * Usage: node sync_products_to_supabase.mjs
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://uhibnzahdqnjwtvooqpv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJzdWIiOiJ1aGlibnphaGRxbmp3dHZvb3FwdiIsImF1ZCI6InVoaWJuemFoZHFuand0dm9vcXB2IiwiaWF0IjoxNzE2ODAyODE5LCJleHAiOjIwMzIzNzg4MTl9.yma6FSW7pbjaj0E3MF8roBhTDxY8MxjV1MxGls8_hMw';
const CSV_PATH = 'database by chemist .csv';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ---------- CSV PARSER ----------
function parseCsvLine(line) {
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (const c of line) {
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ',' && !inQuotes) { parts.push(current); current = ''; }
    else current += c;
  }
  parts.push(current);
  return parts;
}

function assignCategory(name) {
  const n = name.toLowerCase();
  if (/soap|cream|lotion|ointment|gel|face wash|shampoo|skin|derma|acne|fungal|candid|ketocon|moistur|sunban|cutimax|emolene|caladryl|betnovate|fucibet|panderm|sebamed|cetaphil/.test(n)) return 'Skin Care';
  if (/electral|vitamin|calcium|b-complex|supradyn|neurobion|shelcal|ensure|bournvita|horlicks|protein|iron|folic|d3|zinc|revital|zerolac|simyl|enerzal|powder/.test(n) && !/mycoderm|talc/.test(n)) return 'Vitamins';
  if (/bandage|plaster|betadine|dettol|savlon|cotton|gauze|spirit|povidone|first aid/.test(n)) return 'First Aid';
  if (/notebook|pen\b|pencil|register|stationery|classmate/.test(n)) return 'Stationery';
  return 'Medicines';
}

function assignIcon(category) {
  if (category === 'Skin Care') return 'ti-spray';
  if (category === 'Vitamins') return 'ti-activity';
  if (category === 'First Aid') return 'ti-medical-cross';
  if (category === 'Stationery') return 'ti-pencil';
  return 'ti-pill';
}

// ---------- PARSE CSV ----------
const csv = fs.readFileSync(CSV_PATH, 'utf-8');
const lines = csv.split(/\r?\n/);
let headerIdx = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"Medicine"') && lines[i].includes('"MRP"')) { headerIdx = i; break; }
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
  if (/^total purchased|^computed values|^ computed/i.test(name)) continue;
  if (mrp <= 0) continue;

  const key = name.toUpperCase();
  const existing = merged.get(key);
  if (existing) {
    existing.stock += Number.isNaN(qty) ? 0 : qty;
    existing.price = Math.max(existing.price, Math.ceil(mrp));
  } else {
    merged.set(key, { name, pack, price: Math.ceil(mrp), stock: Number.isNaN(qty) ? 0 : qty, category: assignCategory(name) });
  }
}

const products = [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
console.log(`📋 Parsed ${products.length} unique products from CSV`);

// ---------- SYNC TO SUPABASE ----------
async function sync() {
  console.log('✅ Using service_role key to bypass RLS');

  // Step 2: Fetch existing products
  const { data: existing, error: fetchErr } = await supabase.from('products').select('id, name');
  if (fetchErr) { console.error('❌ Fetch failed:', fetchErr.message); process.exit(1); }
  console.log(`📦 Found ${existing.length} existing products in DB`);

  // Step 3: Build a set of CSV product names (uppercased for comparison)
  const csvNames = new Set(products.map(p => p.name.toUpperCase()));

  // Step 4: Delete products NOT in CSV
  const toDelete = existing.filter(p => !csvNames.has(p.name.toUpperCase()));
  if (toDelete.length > 0) {
    console.log(`🗑️  Deleting ${toDelete.length} mock/extra products...`);
    for (const p of toDelete) {
      console.log(`   - ${p.name}`);
    }
    const deleteIds = toDelete.map(p => p.id);
    // Delete in batches of 50
    for (let i = 0; i < deleteIds.length; i += 50) {
      const batch = deleteIds.slice(i, i + 50);
      const { error: delErr } = await supabase.from('products').delete().in('id', batch);
      if (delErr) console.error('   ⚠️ Delete error:', delErr.message);
    }
    console.log('✅ Mock products deleted');
  } else {
    console.log('✅ No mock products found to delete');
  }

  // Step 5: Upsert CSV products (insert new, update existing)
  const existingNames = new Set(existing.map(p => p.name.toUpperCase()));
  const toInsert = products.filter(p => !existingNames.has(p.name.toUpperCase()));
  const toUpdate = products.filter(p => existingNames.has(p.name.toUpperCase()));

  if (toUpdate.length > 0) {
    console.log(`🔄 Updating ${toUpdate.length} existing products...`);
    for (const p of toUpdate) {
      const icon = assignIcon(p.category);
      const { error } = await supabase.from('products')
        .update({ brand: 'Diamond Chemist', category: p.category, price: p.price, icon, unit: p.pack, stock: p.stock })
        .eq('name', p.name);
      if (error) console.error(`   ⚠️ Update failed for ${p.name}:`, error.message);
    }
    console.log('✅ Existing products updated');
  }

  if (toInsert.length > 0) {
    console.log(`➕ Inserting ${toInsert.length} new products...`);
    // Insert in batches of 50
    const rows = toInsert.map(p => ({
      name: p.name,
      brand: 'Diamond Chemist',
      category: p.category,
      price: p.price,
      desc: '',
      icon: assignIcon(p.category),
      unit: p.pack,
      popular: false,
      stock: p.stock,
    }));
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      const { error } = await supabase.from('products').insert(batch);
      if (error) console.error(`   ⚠️ Insert batch error:`, error.message);
    }
    console.log('✅ New products inserted');
  }

  // Final count
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log(`\n🎉 Done! Database now has ${count} products (all from chemist CSV)`);
}

sync().catch(e => console.error('Fatal:', e));
