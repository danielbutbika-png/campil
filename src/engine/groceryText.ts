// Free-text shopping lines → item, quantity, unit and supermarket section.
// "2 קילו עוף", "פיתות 20", "3 חבילות פסטה", "חצי קילו גבינה צהובה", "חומוס" … one item per line (or comma).
// No quantity + a known food → the amount recommended for the people on the trip (see selfMenu).
import { FOODS, type Food } from '../data/foods';
import { uid } from '../lib/util';
import type { MenuFood } from '../lib/types';

export interface ParsedItem { raw: string; name: string; qty?: number; unit: string; shop: string; food?: Food }

const WORD_NUM: Record<string, number> = {
  'חצי': 0.5, 'רבע': 0.25, 'אחד': 1, 'אחת': 1, 'שניים': 2, 'שתיים': 2, 'שני': 2, 'שתי': 2, 'שלוש': 3, 'שלושה': 3, 'ארבע': 4, 'ארבעה': 4,
  'חמש': 5, 'חמישה': 5, 'שש': 6, 'שישה': 6, 'שבע': 7, 'שבעה': 7, 'שמונה': 8, 'תשע': 9, 'תשעה': 9, 'עשר': 10, 'עשרה': 10, 'תריסר': 12,
};
const FRACTION: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3 };

// unit word → [canonical unit, factor]. Weights and volumes become grams / ml so they add up with the recipes.
const UNITS: [RegExp, string, number][] = [
  [/^(ק["״׳']?ג|קג|קילו(גרם)?|kg)$/i, 'גר׳', 1000],
  [/^(גרם|גר["׳']?|ג["׳']|g|gr)$/i, 'גר׳', 1],
  [/^(ליטר(ים)?|ל["׳']|l|lt)$/i, 'מ״ל', 1000],
  [/^(מ["״׳']?ל|מיליליטר|ml)$/i, 'מ״ל', 1],
  [/^(יח["׳']?|יחידה|יחידות)$/, 'יח׳', 1],
];
// packages are kept as said (plural form), e.g. "3 חבילות"
const PACKS: [RegExp, string][] = [
  [/^(חבילה|חבילות|חב["׳'])$/, 'חבילות'], [/^(קופסה|קופסא|קופסאות|קופסת|קופסות)$/, 'קופסאות'], [/^(בקבוק|בקבוקים)$/, 'בקבוקים'],
  [/^(שקית|שקיות)$/, 'שקיות'], [/^(מגש|מגשים)$/, 'מגשים'], [/^(צנצנת|צנצנות)$/, 'צנצנות'], [/^(שישיה|שישייה|שישיות)$/, 'שישיות'],
  [/^(קרטון|קרטונים)$/, 'קרטונים'], [/^(כיכר|כיכרות)$/, 'כיכרות'], [/^(ראש|ראשים)$/, 'ראשים'], [/^(אריזה|אריזות)$/, 'אריזות'],
  [/^(פחית|פחיות)$/, 'פחיות'], [/^(תבנית|תבניות)$/, 'תבניות'], [/^(צרור|צרורות)$/, 'צרורות'],
];

// [stem, section] — checked in order, first match wins (specific stems before general ones)
const STEMS: [string, string][] = [
  ['בירה', 'alcohol'], ['בירות', 'alcohol'], ['יין', 'alcohol'], ['ערק', 'alcohol'], ['וודקה', 'alcohol'], ['ויסקי', 'alcohol'],
  ['מים', 'drinks'], ['מיץ', 'drinks'], ['קולה', 'drinks'], ['סודה', 'drinks'], ['ספרייט', 'drinks'], ['פטל', 'drinks'], ['לימונדה', 'drinks'], ['שתיי', 'drinks'], ['משקה', 'drinks'], ['משקאות', 'drinks'], ['קפה', 'dry'], ['תה', 'dry'],
  ['פחם', 'other'], ['פחמים', 'other'], ['אלומיניום', 'other'], ['ניילון', 'other'], ['צלחות', 'other'], ['כוסות', 'other'], ['מפיות', 'other'], ['מגבונ', 'other'],
  ['סכו', 'other'], ['שקיות', 'other'], ['סבון', 'other'], ['גפרור', 'other'], ['מצית', 'other'], ['נייר', 'other'], ['סקוטש', 'other'], ['ספוג', 'other'], ['קיסמ', 'other'],
  ['שוקולד', 'dry'], ['טונה', 'dry'], ['שימור', 'dry'], ['תירס בשימורים', 'dry'],
  ['נקניקי', 'meat'], ['עוף', 'meat'], ['חזה', 'meat'], ['שוקי', 'meat'], ['כנפ', 'meat'], ['פרגי', 'meat'], ['בשר', 'meat'], ['טחון', 'meat'], ['קבב', 'meat'],
  ['המבורגר', 'meat'], ['שניצל', 'meat'], ['סטייק', 'meat'], ['אנטריקוט', 'meat'], ['צלע', 'meat'], ['כבד', 'meat'], ['הודו', 'meat'], ['דג', 'meat'], ['סלמון', 'meat'], ['קציצ', 'meat'],
  ['חלב', 'cold'], ['גבינ', 'cold'], ['קוטג', 'cold'], ['יוגורט', 'cold'], ['מעדנ', 'cold'], ['שמנת', 'cold'], ['חמאה', 'cold'], ['ביצ', 'cold'], ['לבנה', 'cold'], ['לבן', 'cold'],
  ['חומוס', 'cold'], ['טחינ', 'cold'], ['סלט', 'cold'], ['ממרח', 'cold'], ['טופו', 'cold'], ['נקניק', 'cold'], ['פסטרמה', 'cold'], ['מרגרינ', 'cold'], ['חציל במיונז', 'cold'],
  ['לחם', 'bakery'], ['פית', 'bakery'], ['לאפ', 'bakery'], ['חלה', 'bakery'], ['חלות', 'bakery'], ['לחמני', 'bakery'], ['בגט', 'bakery'], ['טורטי', 'bakery'], ['עוג', 'bakery'],
  ['קרואסון', 'bakery'], ['בורקס', 'bakery'], ['מאפ', 'bakery'], ['פיצה', 'bakery'],
  ['עגבני', 'fresh'], ['מלפפו', 'fresh'], ['בצל', 'fresh'], ['שום', 'fresh'], ['גזר', 'fresh'], ['פלפל', 'fresh'], ['תפוח', 'fresh'], ['תפו', 'fresh'], ['בננ', 'fresh'],
  ['אבטיח', 'fresh'], ['מלון', 'fresh'], ['לימונ', 'fresh'], ['ענב', 'fresh'], ['חסה', 'fresh'], ['כרוב', 'fresh'], ['חציל', 'fresh'], ['קישוא', 'fresh'], ['פטרוזיל', 'fresh'],
  ['כוסבר', 'fresh'], ['נענ', 'fresh'], ['שמיר', 'fresh'], ['אבוקדו', 'fresh'], ['בטט', 'fresh'], ['תירס', 'fresh'], ['פירות', 'fresh'], ['ירקות', 'fresh'], ['תות', 'fresh'],
  ['אגס', 'fresh'], ['אפרסק', 'fresh'], ['שזיפ', 'fresh'], ['קלמנטינ', 'fresh'], ['תפוז', 'fresh'], ['פטריות', 'fresh'], ['סלק', 'fresh'], ['צנונ', 'fresh'],
  ['פסטה', 'dry'], ['ספגטי', 'dry'], ['אורז', 'dry'], ['קוסקוס', 'dry'], ['פתיתים', 'dry'], ['קמח', 'dry'], ['סוכר', 'dry'], ['מלח', 'dry'], ['שמן', 'dry'], ['רוטב', 'dry'],
  ['קטשופ', 'dry'], ['מיונז', 'dry'], ['חרדל', 'dry'], ['תבלין', 'dry'], ['פפריקה', 'dry'], ['דגני', 'dry'], ['שיבולת', 'dry'], ['חטיפ', 'dry'], ['במבה', 'dry'], ['ביסלי', 'dry'],
  ['מרשמלו', 'dry'], ['אגוז', 'dry'], ['גרעינ', 'dry'], ['פופקורן', 'dry'], ['ריבה', 'dry'], ['דבש', 'dry'], ['סילאן', 'dry'], ['עדשים', 'dry'], ['שעועית', 'dry'], ['קרקר', 'dry'], ['ופל', 'dry'],
];
export const SECTION_OPTIONS = ['fresh', 'meat', 'cold', 'bakery', 'dry', 'drinks', 'alcohol', 'other'];

const clean = (s: string) => s.replace(/[״"׳']/g, '').trim();
/** Each word, also without the common prefixes (ו / ה / וה) — "והעגבניות" still matches "עגבני". */
const words = (s: string) => clean(s).split(/\s+/).filter(Boolean).flatMap(w => [w, ...(/^[וה]/.test(w) && w.length > 3 ? [w.slice(1)] : []), ...(/^וה/.test(w) && w.length > 4 ? [w.slice(2)] : [])]);

function findFood(name: string): Food | undefined {
  const n = clean(name);
  return FOODS.find(f => { const p = clean(f.name.split(/\s*[(/]/)[0]); return p.length >= 3 && (n === p || n.startsWith(p + ' ') || n.endsWith(' ' + p) || (n.length >= 3 && p.split(' ').includes(n))); });
}

/** Supermarket section for an item name. */
export function sectionOf(name: string): string {
  const f = findFood(name); if (f) return f.shop;
  const ws = words(name); const whole = clean(name);
  for (const [stem, shop] of STEMS) if (stem.includes(' ') ? whole.includes(stem) : ws.some(w => w.startsWith(stem))) return shop;
  return 'other';
}

function num(tok: string): number | undefined {
  const t = tok.replace(',', '.').replace(/^[x×]|[x×]$/i, '');
  if (FRACTION[t] != null) return FRACTION[t];
  if (/^\d+(\.\d+)?$/.test(t)) return Number(t);
  const m = t.match(/^(\d+)([½¼¾])$/); if (m) return Number(m[1]) + FRACTION[m[2]];
  if (/^\d+\/\d+$/.test(t)) { const [a, b] = t.split('/').map(Number); return b ? a / b : undefined; }
  return WORD_NUM[t];
}

/** One line: quantity (digits, ½, Hebrew number words), unit (weight / volume / packages) and the item. */
export function parseLine(raw: string): ParsedItem | null {
  let line = raw.replace(/^\s*(?:[-–•*·]|\d+[.)])\s+/, '').replace(/\s+/g, ' ').trim();
  if (!line) return null;
  const toks = line.split(' ');
  let qty: number | undefined; let unit: string | undefined; let factor = 1;
  const used = new Set<number>();
  for (let i = 0; i < toks.length; i++) {
    const n = num(toks[i]);
    if (n != null && qty == null) { qty = n; used.add(i); continue; }
    const t = toks[i].replace(/^[וב]/, m => (toks[i].length > 3 ? '' : m));
    const u = UNITS.find(([re]) => re.test(toks[i]) || re.test(t));
    if (u && !unit) { unit = u[1]; factor = u[2]; used.add(i); continue; }
    const p = PACKS.find(([re]) => re.test(toks[i]));
    if (p && !unit) { unit = p[1]; used.add(i); continue; }
    if (toks[i] === 'וחצי') { qty = (qty ?? 1) + 0.5; used.add(i); continue; }
  }
  // "קילו" alone = 1 kg; "חצי קילו" handled by the number pass
  if (unit && qty == null) qty = 1;
  const name = toks.filter((_, i) => !used.has(i)).join(' ').replace(/^(של|מ)\s+/, '').trim();
  if (!name) return null;
  const food = findFood(name);
  const q = qty != null ? Math.round(qty * factor * 100) / 100 : undefined;
  return { raw, name, qty: q, unit: unit ?? (q != null ? 'יח׳' : food?.unit ?? 'יח׳'), shop: sectionOf(name), food };
}

/** Lines, commas or semicolons separate items. */
export const parseList = (text: string): ParsedItem[] => text.split(/\n|[,;،]/).map(parseLine).filter((x): x is ParsedItem => !!x);

/** A parsed line as a menu food: a known food without a quantity follows the number of people. */
export function toMenuFood(p: ParsedItem): MenuFood {
  if (p.qty == null && p.food) return { id: uid('mf'), name: p.food.name, unit: p.food.unit, shop: p.shop, foodId: p.food.id, per: p.food.per };
  return { id: uid('mf'), name: p.name, unit: p.unit, shop: p.shop, qty: p.qty ?? 1, ...(p.food ? { foodId: p.food.id } : {}) };
}
