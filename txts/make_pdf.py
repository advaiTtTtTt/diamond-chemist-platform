#!/usr/bin/env python3
"""Generate a clean, styled PDF from chemist_guide_hindi.txt using fpdf2."""
import sys, os, urllib.request, shutil
sys.path.insert(0, '/home/advait/.local/lib/python3.12/site-packages')
from fpdf import FPDF

TXT = '/home/advait/Downloads/Dimond Chemist/txts/chemist_guide_hindi.txt'
OUT = '/home/advait/Downloads/Dimond Chemist/txts/chemist_guide_hindi.pdf'
FONT_DIR = '/tmp/noto_fonts'
os.makedirs(FONT_DIR, exist_ok=True)

REGULAR = os.path.join(FONT_DIR, 'NotoSansDevanagari-Regular.ttf')
if not os.path.exists(REGULAR):
    print("Downloading font...")
    urllib.request.urlretrieve(
        'https://github.com/google/fonts/raw/main/ofl/notosansdevanagari/NotoSansDevanagari%5Bwdth%2Cwght%5D.ttf',
        REGULAR
    )
BOLD = os.path.join(FONT_DIR, 'NotoSansDevanagari-Bold.ttf')
if not os.path.exists(BOLD):
    shutil.copy(REGULAR, BOLD)

# Replace emoji with ASCII tags (fpdf2 handles Unicode but not all emoji)
EMOJI_MAP = {
    '🔴': '[!] ', '✅': '[OK] ', '💰': '[Rs] ',
    '🤖': '[AUTO] ', '⚠️': '[!!] ', '🌐': '[Web] ',
    '📧': '[Email] ', '🏥': '[+]',
}
def clean(line):
    for e, r in EMOJI_MAP.items():
        line = line.replace(e, r)
    return line.rstrip('\n')

with open(TXT, 'r', encoding='utf-8') as f:
    lines = [clean(l) for l in f.readlines()]

# ── PDF class ──────────────────────────────────────────────────────────────
class PDF(FPDF):
    def header(self):
        self.set_font('noto_b', size=11)
        self.set_text_color(25, 80, 50)
        self.cell(0, 9, 'Diamond Chemist — Online Orders Marg-Darshika', align='C', new_x='LMARGIN', new_y='NEXT')
        self.set_draw_color(25, 80, 50)
        self.set_line_width(0.4)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(2)

    def footer(self):
        self.set_y(-14)
        self.set_font('noto', size=8)
        self.set_text_color(160, 160, 160)
        self.cell(0, 8, f'Page {self.page_no()}  |  Diamond Chemist  |  Sirf Dukaan ke Upayog Ke Liye', align='C')

pdf = PDF('P', 'mm', 'A4')
pdf.set_margins(20, 20, 20)
pdf.set_auto_page_break(True, margin=20)
pdf.add_font('noto',   '', REGULAR)
pdf.add_font('noto_b', '', BOLD)
pdf.add_page()

W = pdf.w - pdf.l_margin - pdf.r_margin   # usable width

def rule(color=(200, 200, 200), weight=0.2):
    pdf.set_draw_color(*color)
    pdf.set_line_width(weight)
    pdf.line(pdf.l_margin, pdf.get_y(), pdf.l_margin + W, pdf.get_y())
    pdf.ln(2)

def text(s, font='noto', size=9, color=(50,50,50), ln_after=5, indent=0):
    pdf.set_font(font, size=size)
    pdf.set_text_color(*color)
    if indent:
        pdf.set_x(pdf.l_margin + indent)
    safe_w = W - indent
    if safe_w < 10:
        safe_w = W
    pdf.multi_cell(safe_w, ln_after, s, new_x='LMARGIN', new_y='NEXT')

print("Building PDF...")

for raw in lines:
    s = raw.strip()

    # ── section dividers ──────────────────────────────────────────────────
    if s.startswith('===='):
        rule((25, 80, 50), 0.4)
        continue
    if s.startswith('----'):
        rule((180, 180, 180), 0.2)
        continue
    if s == '':
        pdf.ln(2)
        continue

    # ── table rows ────────────────────────────────────────────────────────
    if s.startswith('|'):
        cols = [c.strip() for c in s.strip('|').split('|')]
        if all(set(c) <= {'-', ' '} for c in cols):
            continue                          # separator row
        widths = [68, 54, 54]
        pdf.set_font('noto', size=8)
        is_head = cols and cols[0].lower() in ('situation', 'header')
        fill_c  = (220, 240, 225) if is_head else (248, 252, 248)
        pdf.set_fill_color(*fill_c)
        pdf.set_text_color(30, 30, 30)
        for i, col in enumerate(cols[:3]):
            w = widths[i] if i < len(widths) else 40
            pdf.cell(w, 7, col[:30], border=1, fill=True)
        pdf.ln()
        continue

    # ── SITUATION headings ────────────────────────────────────────────────
    if s.upper().startswith('SITUATION'):
        pdf.ln(3)
        pdf.set_fill_color(230, 248, 236)
        pdf.set_font('noto_b', size=10)
        pdf.set_text_color(20, 90, 50)
        pdf.cell(W, 8, s, fill=True, new_x='LMARGIN', new_y='NEXT')
        pdf.ln(1)
        continue

    # ── colored marker prefixes ───────────────────────────────────────────
    if s.startswith('[!]'):
        text(s, 'noto_b', 9, (170, 30, 30))
        continue
    if s.startswith('[OK]') or s.startswith('[AUTO]'):
        text(s, 'noto_b', 9, (25, 120, 60))
        continue
    if s.startswith('[!!]'):
        text(s, 'noto_b', 9, (160, 90, 0))
        continue
    if s.startswith('[Rs]') or s.startswith('[Web]') or s.startswith('[Email]'):
        text(s, 'noto_b', 9, (40, 60, 160))
        continue

    # ── ALL-CAPS section titles ───────────────────────────────────────────
    if s.isupper() and len(s) > 5:
        pdf.ln(2)
        text(s, 'noto_b', 10, (25, 80, 50))
        continue

    # ── indented body (leading spaces) ────────────────────────────────────
    indent = len(raw) - len(raw.lstrip(' '))
    text(raw.rstrip(), 'noto', 9, (50, 50, 50), 5, indent=min(indent, 12))

pdf.output(OUT)
print(f"\nDone! PDF saved to:\n{OUT}")
