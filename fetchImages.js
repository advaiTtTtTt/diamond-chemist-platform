import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { Readable } from 'stream';
import google from 'googlethis';

// Configuration
const CSV_FILE = 'database by chemist .csv';
const OUTPUT_CSV = 'Medicine_Images_Results.csv';
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'medicines');
const LIMIT = 0; // Set to 0 or remove limit to run on all items

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

async function downloadImage(url, filepath) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Unexpected response ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));
    return true;
  } catch (err) {
    console.error(`  [!] Failed to download ${url}:`, err.message);
    return false;
  }
}

function sanitizeFilename(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '.jpg';
}

async function run() {
  console.log('Reading CSV...');
  const fileContent = fs.readFileSync(CSV_FILE, 'utf-8');
  const lines = fileContent.split('\n');
  const validCsvData = lines.slice(4).join('\n'); // Skip first 4 lines

  const medicines = [];

  await new Promise((resolve) => {
    const s = new Readable();
    s.push(validCsvData);
    s.push(null);
    s.pipe(csv())
      .on('data', (row) => {
        if (row.Medicine) medicines.push(row.Medicine);
      })
      .on('end', resolve);
  });

  const uniqueMeds = [...new Set(medicines)];
  const medsToProcess = LIMIT > 0 ? uniqueMeds.slice(0, LIMIT) : uniqueMeds;

  console.log(`Found ${uniqueMeds.length} unique medicines. Processing ${medsToProcess.length}...`);

  const results = [];

  for (let i = 0; i < medsToProcess.length; i++) {
    const medName = medsToProcess[i];
    console.log(`\n[${i + 1}/${medsToProcess.length}] Searching for: ${medName}`);

    try {
      // Use googlethis to search for images
      const options = {
        page: 0,
        safe: false,
        additional_params: {
          hl: 'en'
        }
      };

      const images = await google.image(`${medName} medicine pack india`, options);

      if (images && images.length > 0) {
        let success = false;
        let filename = sanitizeFilename(medName);
        let filepath = path.join(IMAGES_DIR, filename);

        // Try up to 3 images if the first fails to download (e.g. 403 Forbidden)
        for (let j = 0; j < Math.min(3, images.length); j++) {
          const imgUrl = images[j].url;
          console.log(`  Attempting download from: ${imgUrl}`);
          success = await downloadImage(imgUrl, filepath);
          if (success) {
            results.push({ Medicine: medName, ImagePath: `/images/medicines/${filename}`, Status: 'Success' });
            console.log(`  ✓ Saved to ${filename}`);
            break;
          }
        }

        if (!success) {
          console.log(`  ✗ Failed to download any images for ${medName}`);
          results.push({ Medicine: medName, ImagePath: '', Status: 'Download Failed' });
        }
      } else {
        console.log(`  ✗ No image results found`);
        results.push({ Medicine: medName, ImagePath: '', Status: 'Not Found' });
      }
    } catch (err) {
      console.log(`  ✗ Search Error: ${err.message}`);
      results.push({ Medicine: medName, ImagePath: '', Status: 'Error' });
    }

    // Sleep to avoid rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }

  // Save results
  const headers = 'Medicine,ImagePath,Status\n';
  const csvLines = results.map(r => `"${r.Medicine}","${r.ImagePath}","${r.Status}"`).join('\n');
  fs.writeFileSync(OUTPUT_CSV, headers + csvLines);

  console.log(`\n============================`);
  console.log(`Finished! Results saved to ${OUTPUT_CSV}`);
  console.log(`To run for all medicines, change LIMIT to 0 in fetchImages.js`);
}

run().catch(console.error);
