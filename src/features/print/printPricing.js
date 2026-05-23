const MIN_CHARGE = 10;

export function billablePages(pageCount, sides) {
  if (sides === 'double') return Math.ceil(pageCount / 2);
  return pageCount;
}

export function calculatePrintTotal(pricePerPage, pageCount, copies, sides) {
  const sheets = billablePages(pageCount, sides) * copies;
  let total = pricePerPage * sheets;
  if (total < MIN_CHARGE) total = MIN_CHARGE;
  return Math.round(total * 100) / 100;
}

export function formatSettingsLabel(settings) {
  const mode = settings.colour_mode === 'colour' ? 'Colour' : 'B&W';
  const side = settings.sides === 'double' ? 'Double-sided' : 'Single-sided';
  const size = settings.paper_size.toUpperCase();
  return `${mode}, ${size}, ${side}`;
}

export const ACCEPTED_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
};

export const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.jpg', '.jpeg', '.png', '.webp'];
export const MAX_FILE_SIZE = 25 * 1024 * 1024;

export const DEFAULT_PRICING = [
  { colour_mode: 'bw', sides: 'single', paper_size: 'a4', price_per_page: 2 },
  { colour_mode: 'bw', sides: 'double', paper_size: 'a4', price_per_page: 1.5 },
  { colour_mode: 'colour', sides: 'single', paper_size: 'a4', price_per_page: 10 },
  { colour_mode: 'colour', sides: 'double', paper_size: 'a4', price_per_page: 8 },
  { colour_mode: 'bw', sides: 'single', paper_size: 'a3', price_per_page: 4 },
  { colour_mode: 'colour', sides: 'single', paper_size: 'a3', price_per_page: 18 },
  { colour_mode: 'bw', sides: 'single', paper_size: 'letter', price_per_page: 2 },
  { colour_mode: 'colour', sides: 'single', paper_size: 'letter', price_per_page: 10 },
];

export function getPriceFromList(pricing, colour_mode, sides, paper_size) {
  const row = pricing.find(
    p => p.colour_mode === colour_mode && p.sides === sides && p.paper_size === paper_size
  );
  return row ? Number(row.price_per_page) : null;
}

export function maskPhoneDisplay(phone) {
  if (!phone || phone.length < 4) return '+91 XXXXX XXXXX';
  return `+91 ${phone.slice(0, 2)}XXX X${phone.slice(-4)}`;
}
