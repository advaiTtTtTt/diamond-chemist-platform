import fs from 'fs';

// Read the current file
const filePath = './src/data/chemistProducts.js';
let content = fs.readFileSync(filePath, 'utf8');

// Extract the array content using regex
const match = content.match(/export const CHEMIST_PRODUCTS = (\[[\s\S]*\]);/);
if (!match) {
  console.error("Could not find array in chemistProducts.js");
  process.exit(1);
}

let products;
try {
  // Use Function to safely evaluate the array string
  products = new Function('return ' + match[1])();
} catch (e) {
  console.error("Failed to parse array", e);
  process.exit(1);
}

const assignCategory = (name) => {
  const n = name.toLowerCase();
  
  if (/dolo|paracetamol|ibuprofen|diclofenac|gel|volini|moov|spray|pain|aceclofenac|nimesulide|crocin|combiflam|spasm|myoril|zerodol|ketorolac|tramadol/.test(n)) return 'Pain Relief';
  
  if (/cetirizine|syrup|cough|cold|levocetirizine|azithromycin|amoxicillin|vicks|inhaler|lozenges|strepsils|alex|benadryl|kof|montelukast|fexofenadine|sinarest|cheston|mox|antibiotic|cef/.test(n)) return 'Cold & Flu';
  
  if (/digene|pan\b|pantoprazole|antacid|rabeprazole|omeprazole|domperidone|ondem|acidity|gelusil|eno|pudin|gas|laxative|cremaffin|dulcolax|loperamide|ranitidine|gastro|mucaine/.test(n)) return 'Stomach Care';
  
  if (/vitamin|zinc|calcium|b-complex|multivitamin|d3|supradyn|neurobion|iron|folic|shelcal|revive|calci|b12|ferrous|protein|ensure|bournvita|horlicks/.test(n)) return 'Vitamins';
  
  if (/bandage|cotton|savlon|dettol|betadine|tape|plaster|gauze|spirit|hydrogen peroxide|povidone|iodine|dressing/.test(n)) return 'First Aid';
  
  if (/cream|lotion|soap|face|wash|ointment|fungal|itch|candid|luliconazole|ketoconazole|salicylic|aloe|moisturizer|sunban|derma|skin|acne|shampoo/.test(n)) return 'Skin Care';
  
  if (/baby|diaper|wipes|pampers|huggies|mamypoko|cerelac|lactogen|powder|rash|pediatric|kids/.test(n)) return 'Baby Care';
  
  if (/meter|machine|test|strip|thermometer|bp|pulse|oximeter|glucometer|accu-chek|syringe|needle/.test(n)) return 'Devices';
  
  return 'Medicines'; // Default
};

let stats = {
  'Pain Relief': 0, 'Cold & Flu': 0, 'Stomach Care': 0, 'Vitamins': 0,
  'First Aid': 0, 'Skin Care': 0, 'Baby Care': 0, 'Devices': 0, 'Medicines': 0
};

products = products.map(p => {
  const newCat = assignCategory(p.name);
  p.category = newCat;
  stats[newCat]++;
  return p;
});

console.log("Categorization Stats:", stats);

// Format the new file content
const newContent = `export const CHEMIST_PRODUCTS = ${JSON.stringify(products, null, 2)};\n`;
fs.writeFileSync(filePath, newContent, 'utf8');

console.log("Successfully updated chemistProducts.js with new categories!");
