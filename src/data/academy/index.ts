// The Academy library: knots (interactive) + the field guides, in categories, searchable by everyday need.
import { GUIDES } from '../guides';
import { KNOTS } from './knots';
import type { AcademyCategory, Level } from './types';

export interface Lesson { id: string; kind: 'knot' | 'guide'; title: string; sub: string; category: AcademyCategory; level: Level; minutes: number; text: string; to: string }

const GUIDE_META: Record<string, { category: AcademyCategory; level: Level; needs: string }> = {
  'first-night': { category: 'family', level: 1, needs: 'לילה ראשון באוהל ילדים פחד חושך שינה' },
  heat: { category: 'safety', level: 1, needs: 'חום שרב עומס חום מכת חום מים צל' },
  floods: { category: 'safety', level: 2, needs: 'שיטפון גשם נחל ערוץ התרעה' },
  wind: { category: 'shelter', level: 2, needs: 'רוח אוהל הקמה יתדות עיגון חבלים' },
  'leave-no-trace': { category: 'nature', level: 1, needs: 'ניקיון זבל שמירת טבע להשאיר נקי' },
  'trail-marks': { category: 'navigation', level: 1, needs: 'סימון שבילים צבעים ניווט מסלול' },
  emergency: { category: 'safety', level: 1, needs: 'חירום מדא 101 עזרה פציעה טלפון' },
};

export const LESSONS: Lesson[] = [
  ...KNOTS.map(k => ({ id: k.id, kind: 'knot' as const, title: k.he, sub: k.en, category: 'knots' as AcademyCategory, level: k.level, minutes: 5, to: `/academy/knot/${k.id}`,
    text: [k.he, k.en, k.purpose, ...k.uses, ...k.needs].join(' ') })),
  ...GUIDES.filter(g => GUIDE_META[g.id]).map(g => ({ id: g.id, kind: 'guide' as const, title: g.title, sub: g.blurb, category: GUIDE_META[g.id].category, level: GUIDE_META[g.id].level, minutes: g.minutes, to: `/guide/${g.id}`,
    text: [g.title, g.blurb, GUIDE_META[g.id].needs, ...g.body.map(b => [b.h, b.p, ...(b.list ?? [])].filter(Boolean).join(' '))].join(' ') })),
];

// ── search by need ──
const strip = (s: string) => s.replace(/[֑-ׇ]/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').toLowerCase();
const STOP = new Set(['אני', 'רוצה', 'איך', 'מה', 'של', 'את', 'עם', 'על', 'זה', 'כדי', 'שלא', 'לא', 'יש', 'צריך', 'אפשר', 'או', 'גם', 'כל', 'קשר']);
/** Hebrew prefix letters (ו, ה, ב, ל, מ, ש, כ) are dropped from longer words so "לאוהל" finds "אוהל". */
const stems = (w: string) => { const out = [w]; let x = w; while (x.length > 3 && 'והבלמשכ'.includes(x[0])) { x = x.slice(1); out.push(x); } return out; };
export const tokens = (q: string) => strip(q).split(/\s+/).filter(w => w.length > 1 && !STOP.has(w));

export function searchLessons(q: string, list = LESSONS): Lesson[] {
  const ts = tokens(q); if (!ts.length) return [];
  const scored = list.map(l => {
    const hay = strip(l.text); const words = new Set(hay.split(/\s+/).flatMap(stems));
    let score = 0;
    for (const t of ts) { const st = stems(t); if (st.some(s => words.has(s))) score += 3; else if (st.some(s => s.length > 2 && hay.includes(s))) score += 1; }
    if (strip(l.title).includes(strip(q).trim())) score += 5;
    return { l, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  return scored.map(x => x.l);
}
