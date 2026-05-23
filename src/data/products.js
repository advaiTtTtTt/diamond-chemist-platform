// ─── PRODUCT CATALOG ───
import { CHEMIST_PRODUCTS } from './chemistProducts';

export const CATEGORIES = [
  { name: 'Medicines', icon: 'ti-pill' },
  { name: 'Pain Relief', icon: 'ti-flame' },
  { name: 'Cold & Flu', icon: 'ti-snowflake' },
  { name: 'Stomach Care', icon: 'ti-heart-rate-monitor' },
  { name: 'Vitamins', icon: 'ti-pill' },
  { name: 'First Aid', icon: 'ti-first-aid-kit' },
  { name: 'Skin Care', icon: 'ti-leaf' },
  { name: 'Baby Care', icon: 'ti-baby-carriage' },
  { name: 'Devices', icon: 'ti-device-heart-monitor' },
  { name: 'Stationery', icon: 'ti-pencil' },
];

const baseProducts = [
  { id:1, name:'Dolo 650', desc:'Paracetamol 650mg – Fever & pain relief', price:32, brand:'Micro Labs', category:'Pain Relief', popular:true },
  { id:2, name:'Crocin Advance', desc:'500mg Paracetamol – Fast fever action', price:28, brand:'GSK', category:'Pain Relief', popular:true },
  { id:3, name:'Cetirizine 10mg', desc:'Antihistamine – Allergy & cold relief', price:15, brand:'Cipla', category:'Cold & Flu', popular:true },
  { id:4, name:'Pan 40', desc:'Pantoprazole – Acidity & gastric relief', price:65, brand:'Alkem', category:'Stomach Care', popular:true },
  { id:5, name:'Azithral 500', desc:'Azithromycin 500mg – Antibiotic', price:105, brand:'Alembic', category:'Cold & Flu', popular:false },
  { id:6, name:'Vitamin C 500mg', desc:'Immunity booster – Chewable tablets', price:120, brand:'Limcee', category:'Vitamins', popular:true },
  { id:7, name:'B-Complex Forte', desc:'Energy & nerve health supplement', price:45, brand:'Abbott', category:'Vitamins', popular:false },
  { id:8, name:'Calcium + D3', desc:'Bone health supplement tablets', price:180, brand:'Shelcal', category:'Vitamins', popular:false },
  { id:9, name:'Dettol Antiseptic', desc:'100ml – Wound cleaning liquid', price:55, brand:'Reckitt', category:'First Aid', popular:false },
  { id:10, name:'Band-Aid Pack', desc:'Adhesive bandages – Assorted 10 strips', price:40, brand:'J&J', category:'First Aid', popular:false },
  { id:11, name:'Vaseline Body Lotion', desc:'Intensive Care – 200ml moisturizer', price:175, brand:'Vaseline', category:'Skin Care', popular:false },
  { id:12, name:'Himalaya Baby Cream', desc:'Gentle moisturizing baby cream 100ml', price:85, brand:'Himalaya', category:'Baby Care', popular:false },
  { id:13, name:'Gripe Water', desc:'Digestive relief for infants 130ml', price:75, brand:'Woodwards', category:'Baby Care', popular:false },
  { id:14, name:'Digital Thermometer', desc:'Fast reading clinical thermometer', price:150, brand:'Dr. Morepen', category:'Devices', popular:true },
  { id:15, name:'Pulse Oximeter', desc:'Blood oxygen & pulse rate monitor', price:650, brand:'Dr. Trust', category:'Devices', popular:false },
  { id:16, name:'Classmate Notebook', desc:'Single line, 172 pages, soft cover', price:45, brand:'Classmate', category:'Stationery', popular:true },
  { id:17, name:'Reynolds Trimax Pen', desc:'Blue gel pen, smooth writing', price:50, brand:'Reynolds', category:'Stationery', popular:true },
  { id:18, name:'A4 Printer Paper (Rim)', desc:'500 sheets, 75 GSM white paper', price:350, brand:'JK Copier', category:'Stationery', popular:false },
  { id:19, name:'Fevicol MR', desc:'Adhesive glue 100g', price:35, brand:'Pidilite', category:'Stationery', popular:false },
  { id:20, name:'Geometry Box', desc:'Mathematical drawing instruments', price:120, brand:'Camel', category:'Stationery', popular:false },
];

export const PRODUCTS = [...baseProducts, ...CHEMIST_PRODUCTS];

export const QUICK_SEARCHES = ['Fever', 'Cold', 'Stomach', 'Vitamin', 'Baby', 'First Aid'];

// ─── AI SEARCH KEYWORD MAP ───
export const SEARCH_KEYWORDS = {
  'fever': ['Dolo 650', 'Crocin Advance', 'Digital Thermometer'],
  'cold': ['Cetirizine 10mg', 'Crocin Advance'],
  'cough': ['Cetirizine 10mg'],
  'pain': ['Dolo 650', 'Crocin Advance'],
  'stomach': ['Pan 40', 'Gripe Water'],
  'acidity': ['Pan 40'],
  'vitamin': ['Vitamin C 500mg', 'B-Complex Forte', 'Calcium + D3'],
  'immunity': ['Vitamin C 500mg'],
  'wound': ['Dettol Antiseptic', 'Band-Aid Pack'],
  'baby': ['Himalaya Baby Cream', 'Gripe Water'],
  'skin': ['Vaseline Body Lotion', 'Himalaya Baby Cream'],
  'allergy': ['Cetirizine 10mg'],
  'infection': ['Azithral 500', 'Dettol Antiseptic'],
  'bone': ['Calcium + D3'],
  'energy': ['B-Complex Forte', 'Vitamin C 500mg'],
  'thermometer': ['Digital Thermometer'],
  'oximeter': ['Pulse Oximeter'],
  'bandage': ['Band-Aid Pack'],
  'lotion': ['Vaseline Body Lotion'],
  'pen': ['Reynolds Trimax Pen'],
  'notebook': ['Classmate Notebook'],
  'book': ['Classmate Notebook'],
  'paper': ['A4 Printer Paper (Rim)'],
  'glue': ['Fevicol MR'],
  'geometry': ['Geometry Box']
};
