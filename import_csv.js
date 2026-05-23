import fs from 'fs';

const csvFile = fs.readFileSync('database by chemist .csv', 'utf-8');

const lines = csvFile.split(/\r?\n/);
let headerLineIdx = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"Medicine"') && lines[i].includes('"Pack"')) {
    headerLineIdx = i;
    break;
  }
}

const products = [];
let idCounter = 1000;

for (let i = headerLineIdx + 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Basic split by comma that respects quotes
  const parts = [];
  let currentPart = '';
  let inQuotes = false;
  for (let j = 0; j < line.length; j++) {
    const c = line[j];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      parts.push(currentPart);
      currentPart = '';
    } else {
      currentPart += c;
    }
  }
  parts.push(currentPart);

  if (parts.length >= 6) {
    const name = parts[0];
    const pack = parts[1];
    const expiry = parts[4];
    const mrp = parseFloat(parts[5]);
    
    if (name && !isNaN(mrp)) {
      products.push({
        id: idCounter++,
        name: name.trim(),
        desc: `Pack: ${pack || 'N/A'}, Expiry: ${expiry || 'N/A'}`,
        price: Math.ceil(mrp),
        brand: 'Diamond Chemist',
        category: 'Medicines',
        popular: false
      });
    }
  }
}

const jsContent = `// Auto-generated from chemist database
export const CHEMIST_PRODUCTS = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync('src/data/chemistProducts.js', jsContent);
console.log(`Successfully parsed ${products.length} products.`);
