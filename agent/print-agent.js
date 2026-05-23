/* eslint-disable */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';
import sharp from 'sharp';
import ptp from 'pdf-to-printer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const AGENT_SECRET = process.env.AGENT_SECRET;
const PRINTER_NAME = process.env.PRINTER_NAME || '';
const TEMP_DIR = process.env.TEMP_DIR || path.join(__dirname, 'temp');
const AGENT_VERSION = process.env.AGENT_VERSION || '1.0.0';
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

if (!SUPABASE_URL || !AGENT_SECRET) {
  console.error('Missing SUPABASE_URL or AGENT_SECRET in .env');
  process.exit(1);
}

fs.mkdirSync(TEMP_DIR, { recursive: true });

async function agentFetch(fn, body = {}) {
  const res = await fetch(`${FUNCTIONS_URL}/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-agent-secret': AGENT_SECRET,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function updateStatus(jobId, status, error_log = null) {
  await agentFetch('agent-update-status', {
    job_id: jobId,
    status,
    error_log,
    agent_version: AGENT_VERSION,
  });
}

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buf);
  return buf;
}

async function convertDocxToPdf(docxPath, pdfPath) {
  const result = await mammoth.convertToHtml({ path: docxPath });
  // mammoth doesn't output PDF directly — use simple HTML wrap + print as doc
  // For production: use libreoffice CLI if available
  const html = `<html><body style="font-family:Arial;padding:40px">${result.value}</body></html>`;
  const htmlPath = docxPath.replace(/\.docx$/i, '.html');
  fs.writeFileSync(htmlPath, html);
  // Fallback: save as docx and let printer handle if supported
  fs.copyFileSync(docxPath, pdfPath.replace('.pdf', '.docx'));
  throw new Error('DOCX conversion requires LibreOffice. Install LibreOffice or upload PDF.');
}

async function convertImageToPdf(imagePath, pdfPath, paperSize) {
  const sizes = { A4: [2480, 3508], A3: [3508, 4961], LETTER: [2550, 3300] };
  const [w, h] = sizes[paperSize.toUpperCase()] || sizes.A4;
  await sharp(imagePath)
    .resize(w, h, { fit: 'inside', background: { r: 255, g: 255, b: 255 } })
    .png()
    .toFile(imagePath.replace(/\.[^.]+$/, '_norm.png'));
  // pdf-to-printer can print images on Windows via SumatraPDF
  return imagePath.replace(/\.[^.]+$/, '_norm.png');
}

async function printFile(filePath, options) {
  const printOpts = {
    printer: PRINTER_NAME || undefined,
    copies: options.copies || 1,
    sides: options.sides || 'one-sided',
    monochrome: options.colorModel === 'gray',
    paperSize: options.paperSize || 'A4',
  };
  try {
    await ptp.print(filePath, printOpts);
  } catch (err) {
    if (process.platform !== 'win32') {
      const { execSync } = await import('child_process');
      const cmd = `lp -d "${PRINTER_NAME}" -n ${printOpts.copies} "${filePath}"`;
      execSync(cmd);
      return;
    }
    throw err;
  }
}

function cleanupTemp(...files) {
  for (const f of files) {
    try { if (f && fs.existsSync(f)) fs.unlinkSync(f); } catch { /* ignore */ }
  }
}

async function processJob(job) {
  const tempBase = path.join(TEMP_DIR, job.id);
  let localPath = `${tempBase}_file`;
  let printPath = null;

  try {
    console.log(`Processing ${job.pickup_code}...`);
    await updateStatus(job.id, 'PRINTING');

    const ext = job.file_type === 'pdf' ? '.pdf' :
      job.file_type === 'docx' ? '.docx' : '.img';
    localPath += ext;
    await downloadFile(job.signed_url, localPath);

    printPath = localPath;
    if (job.file_type === 'docx') {
      printPath = `${tempBase}.pdf`;
      try {
        await convertDocxToPdf(localPath, printPath);
      } catch (convErr) {
        throw new Error(`DOCX conversion failed: ${convErr.message}`);
      }
    } else if (job.file_type === 'image') {
      printPath = await convertImageToPdf(localPath, `${tempBase}.pdf`, job.paper_size);
    }

    const printOptions = {
      printer: PRINTER_NAME,
      copies: job.copies,
      sides: job.sides === 'double' ? 'two-sided-long-edge' : 'one-sided',
      colorModel: job.colour_mode === 'colour' ? 'color' : 'gray',
      paperSize: (job.paper_size || 'a4').toUpperCase(),
    };

    await printFile(printPath, printOptions);
    await updateStatus(job.id, 'READY');
    console.log(`✓ ${job.pickup_code} printed successfully`);
  } catch (err) {
    console.error(`✗ ${job.pickup_code}:`, err.message);
    await updateStatus(job.id, 'ERROR', err.message);
  } finally {
    cleanupTemp(localPath, printPath);
  }
}

async function pollAndPrint() {
  try {
    const { jobs } = await agentFetch('agent-poll', {
      agent_version: AGENT_VERSION,
      printer_name: PRINTER_NAME,
      hostname: os.hostname(),
    });
    for (const job of jobs || []) {
      await processJob(job);
    }
  } catch (err) {
    console.error('Poll error:', err.message);
  }
}

console.log('Diamond Chemist Print Agent running...');
console.log(`Printer: ${PRINTER_NAME || '(default)'}`);
console.log('Watching for new print jobs...');
setInterval(pollAndPrint, 5000);
pollAndPrint();
