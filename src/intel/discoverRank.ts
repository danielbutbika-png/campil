// Ranking for Discover: a transparent 0–100 fit for one trip — never stars (the open data has none), never guessed
// kashrut or opening hours. Every point comes with a reason; what is unknown is listed as "check with the business".
import type { DiscPlace, DiscCat } from '../services/discover';
import type { Detour } from '../services/detour';
import type { DayWx } from '../services/weather';
import type { OfficialAlert } from '../services/officialAlerts';
import type { Trip } from '../lib/types';
import { conflictingAlert } from '../services/officialAlerts';
import { haversineKm } from '../lib/util';

export interface DiscCtx {
  base: { lat: number; lon: number; label: string } | null;
  children: number; people: number;
  kosher: 'none' | 'kosher' | 'mehadrin'; vegetarian: boolean; vegan: boolean; allergies: string[];
  day?: DayWx; alerts: OfficialAlert[];
}
export interface DiscFit { score: number | null; excluded?: string; why: string[]; check: string[]; km?: number; detour?: Detour | null }

/** The diets in a trip, strictest first (any family that keeps kosher → kosher matters for a shared meal). */
export function discCtxFor(t: Trip, base: DiscCtx['base'], day: DayWx | undefined, alerts: OfficialAlert[]): DiscCtx {
  const diets = Object.values(t.diets ?? {});
  const k = diets.some(d => d.kashrut === 'mehadrin') ? 'mehadrin' : diets.some(d => d.kashrut === 'kosher') ? 'kosher' : 'none';
  return { base, children: t.participants.filter(p => p.role === 'child').length, people: t.participants.length, kosher: k,
    vegetarian: diets.some(d => d.style === 'vegetarian'), vegan: diets.some(d => d.style === 'vegan'), allergies: [...new Set(diets.flatMap(d => d.allergies))], day, alerts };
}

const OUTDOOR: DiscCat[] = ['trail', 'view', 'water', 'picnic', 'cart'];
const KIDS_OK: DiscCat[] = ['family', 'picnic', 'visitor', 'cart', 'cafe', 'breakfast', 'restaurant', 'water'];

export function discFit(p: DiscPlace, c: DiscCtx, detour?: Detour | null): DiscFit {
  const why: string[] = [], check: string[] = []; let s = 0;
  const km = c.base ? haversineKm(c.base, p) : undefined;
  // official warnings first: a conflicting one rules the place out
  const nat = p.cat === 'water' ? ['spring', 'stream'] as const : p.cat === 'view' ? ['viewpoint'] as const : p.cat === 'picnic' ? ['picnic'] as const : p.cat === 'trail' ? ['trail'] as const : [];
  const off = conflictingAlert([...nat], p.cat === 'water', c.alerts);
  if (off) return { score: null, excluded: `לא מומלץ — אזהרה רשמית בתוקף: ${off.title}`, why, check, km, detour };
  const d = c.day; const rain = !!d && (d.precip >= 10 || ((d.precipProb ?? 0) >= 70 && d.precip >= 5)); const hot = !!d && (d.feelsMax ?? d.tMax) >= 33; const windy = !!d && d.gusts >= 50;
  if (rain && p.cat === 'water') return { score: null, excluded: 'לא מומלץ ביום הזה: צפוי גשם — סכנת שיטפון בנחלים ובמפלים.', why, check, km, detour };

  // 1. distance / detour (30)
  if (detour) { const x = detour.extraMin; s += x <= 3 ? 30 : x <= 8 ? 24 : x <= 15 ? 16 : x <= 25 ? 8 : 2; why.push(x <= 3 ? 'כמעט בלי סטייה מהמסלול' : `סטייה של כ-${x} דק׳ מהמסלול`); }
  else if (km != null) { s += km <= 3 ? 30 : km <= 8 ? 24 : km <= 15 ? 16 : km <= 30 ? 8 : 2; why.push(`${km < 10 ? km.toFixed(1) : Math.round(km)} ק״מ בקו אווירי`); }

  // 2. who is coming (20)
  if (c.children) { if (KIDS_OK.includes(p.cat)) { s += 20; why.push('סוג מקום שמתאים בדרך כלל למשפחות'); } else { s += 8; check.push('התאמה לגיל הילדים — לבדוק אורך וקושי'); } }
  else s += 15;

  // 3. food needs (20) — only as tagged in the map; unknown is never a yes
  const food = ['cart', 'cafe', 'breakfast', 'restaurant'].includes(p.cat);
  if (food) {
    let f = 12;
    if (c.kosher !== 'none') { if (p.kosher === 'yes' || p.kosher === 'only') { f += 8; why.push('מסומן במפה ככשר — לבדוק תעודה מול העסק'); } else if (p.kosher === 'no') { f -= 12; why.push('מסומן במפה כלא כשר'); } else check.push('כשרות — יש לבדוק מול העסק'); }
    if (c.vegan) { if (p.vegan === 'yes' || p.vegan === 'only') { f += 4; why.push('מסומן עם אפשרות טבעונית'); } else check.push('אפשרות טבעונית — לבדוק'); }
    else if (c.vegetarian) { if (p.vegetarian === 'yes' || p.vegetarian === 'only') { f += 4; why.push('מסומן עם אפשרות צמחונית'); } else check.push('אפשרות צמחונית — לבדוק'); }
    if (c.allergies.length) check.push(`אלרגיות (${c.allergies.join(', ')}) — לבדוק מול העסק`);
    s += Math.max(0, Math.min(20, f));
  } else s += 12;

  // 4. weather that day (15) — no forecast: no points
  if (!d) check.push('אין תחזית ליום הזה');
  else if (rain && OUTDOOR.includes(p.cat)) { s += 3; why.push('צפוי גשם — פעילות בחוץ'); }
  else if (rain) { s += 15; why.push('מקום מקורה — מתאים ליום גשום'); }
  else if (hot && OUTDOOR.includes(p.cat) && p.cat !== 'water') { s += 5; why.push('עומס חום — רק בבוקר המוקדם'); }
  else if (windy && (p.cat === 'view' || p.cat === 'picnic')) { s += 6; why.push('רוח חזקה — מקום חשוף'); }
  else { s += 15; }

  // 5. information (15)
  const info = (p.place?.wiki ? 4 : 0) + (p.image ? 3 : 0) + (p.hours ? 3 : 0) + (p.website ? 3 : 0) + (p.source === 'campil' ? 2 : 0) + (p.phone ? 1 : 0);
  s += Math.min(15, info * 1.5);
  if (!p.hours && food) check.push('שעות פעילות — לא ידוע, לבדוק לפני ההגעה');
  if (p.cat === 'cart') check.push('עגלות קפה פועלות לעתים רק בימים מסוימים ועשויות לזוז — לבדוק פעילות לפני ההגעה');
  if (p.cat === 'cart' && !p.catSure) check.push('לא בטוח שזו עגלת קפה — הסיווג לפי תיוג במפה');
  return { score: Math.round(Math.max(0, Math.min(100, s))), why, check, km, detour };
}
