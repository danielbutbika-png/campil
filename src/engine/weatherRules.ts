// Weather → recommendations. Every recommendation names the measured value that triggered it.
// Thresholds are the app's own planning heuristics (documented in README) — not official warnings.
import type { DayWx } from '../services/weather';
import type { Trip, Site } from '../lib/types';
import { fmtDate, shortDay } from '../lib/util';

export const T = {
  rainProb: 40, rainMm: 1, coldNight: 12, veryColdNight: 5, warmNight: 20,
  heat: 32, extremeHeat: 36, gusts: 40, severeGusts: 60, uv: 8,
} as const;

export type Severity = 'info' | 'advice' | 'warning' | 'danger';
export interface Rec { id: string; kind: 'rain' | 'cold' | 'heat' | 'wind' | 'uv' | 'warm_night' | 'flood' | 'ok'; severity: Severity; title: string; reason: string; actions: string[] }
export interface WxFlags { rain: boolean; cold: boolean; veryCold: boolean; heat: boolean; extremeHeat: boolean; wind: boolean; severeWind: boolean; uv: boolean; warmNight: boolean; known: boolean; minT?: number; maxT?: number }

const dl = (d: DayWx) => `${shortDay(d.date)} ${fmtDate(d.date)}`;
const maxBy = (a: DayWx[], f: (d: DayWx) => number) => a.reduce((m, d) => (f(d) > f(m) ? d : m), a[0]);
const minBy = (a: DayWx[], f: (d: DayWx) => number) => a.reduce((m, d) => (f(d) < f(m) ? d : m), a[0]);

export function flagsFor(days: DayWx[]): WxFlags {
  if (!days.length) return { rain: false, cold: false, veryCold: false, heat: false, extremeHeat: false, wind: false, severeWind: false, uv: false, warmNight: false, known: false };
  const minT = Math.min(...days.map(d => d.tMin)), maxT = Math.max(...days.map(d => d.tMax));
  const g = Math.max(...days.map(d => d.gusts));
  return {
    known: true, minT, maxT,
    rain: days.some(d => (d.precipProb ?? 0) >= T.rainProb || d.precip >= T.rainMm),
    cold: minT <= T.coldNight, veryCold: minT <= T.veryColdNight,
    heat: maxT >= T.heat, extremeHeat: maxT >= T.extremeHeat,
    wind: g >= T.gusts, severeWind: g >= T.severeGusts,
    uv: days.some(d => (d.uv ?? 0) >= T.uv), warmNight: days.some(d => d.tMin >= T.warmNight),
  };
}

export function recommend(days: DayWx[], trip: Pick<Trip, 'kind' | 'lodging' | 'children' | 'childAges'>, sites: Site[] = []): Rec[] {
  if (!days.length) return [];
  const out: Rec[] = [];
  const f = flagsFor(days);
  const tent = trip.kind !== 'day' && trip.lodging !== 'caravan';
  const young = trip.childAges.some(a => a < 6) || (trip.children > 0 && !trip.childAges.length);

  if (f.rain) {
    const d = maxBy(days, x => (x.precipProb ?? 0) * 10 + x.precip);
    out.push({ id: 'rain', kind: 'rain', severity: 'advice', title: 'צפוי גשם',
      reason: `${dl(d)}: סיכוי ${d.precipProb ?? '—'}% לגשם, ${d.precip.toFixed(1)} מ״מ`,
      actions: ['מעיל גשם ושכבות לכל משתתף', 'כיסוי עמיד למים לציוד ושקיות אטומות לבגדים', tent ? 'לבדוק את יריעת האוהל ולהקים בנקודה גבוהה ומנוקזת' : 'לתכנן חלופה מקורה לחלק מהיום', 'לבדוק חלופות לפעילויות בחוץ'] });
    const risky = sites.filter(s => s.floodRisk);
    if (risky.length) out.push({ id: 'flood', kind: 'flood', severity: 'danger', title: 'סיכון שיטפונות בנחלים',
      reason: `גשם בתחזית + ${risky.map(s => s.name).join(', ')} ${risky.length > 1 ? 'הם ערוצים' : 'הוא ערוץ'} שעלול להיות מוצף`,
      actions: ['לא להיכנס לערוצי נחלים כשיש תחזית גשם באזור או במעלה הנחל', 'לבדוק התרעות רשמיות לפני היציאה', 'להחזיק מסלול חלופי'] });
  }
  if (f.cold && trip.kind !== 'day') {
    const d = minBy(days, x => x.tMin);
    out.push({ id: 'cold', kind: 'cold', severity: f.veryCold ? 'warning' : 'advice', title: f.veryCold ? 'לילה קר מאוד' : 'לילה קר',
      reason: `מינימום ${Math.round(d.tMin)}° בלילה של ${dl(d)}`,
      actions: ['לבדוק שטמפרטורת הנוחות של שקי השינה מתאימה', 'בידוד מהקרקע מתחת למזרנים', 'שכבות חמות, כובע חם וגרביים לשינה', ...(young ? ['שמיכה נוספת לילדים הקטנים'] : [])] });
  }
  if (f.heat) {
    const d = maxBy(days, x => x.feelsMax ?? x.tMax);
    out.push({ id: 'heat', kind: 'heat', severity: f.extremeHeat ? 'danger' : 'warning', title: f.extremeHeat ? 'עומס חום כבד' : 'יום חם',
      reason: `מקסימום ${Math.round(d.tMax)}°${d.feelsMax != null ? ` (מורגש ${Math.round(d.feelsMax)}°)` : ''} ב${dl(d)}`,
      actions: ['פעילות בשעות הבוקר המוקדמות ואחרי 16:00', 'מים לכל משתתף, צל והגנה מהשמש', 'להעדיף מסלולי מים ומסלולים מוצלים',
        ...(sites.some(s => s.exposed) ? [`זהירות: ${sites.filter(s => s.exposed).map(s => s.name).join(', ')} חשוף לשמש`] : []),
        ...(f.extremeHeat ? ['לשקול לדחות את הטיול או להחליף יעד לאזור קריר יותר'] : [])] });
  }
  if (f.warmNight && tent && !f.heat) {
    const d = maxBy(days, x => x.tMin);
    out.push({ id: 'warm_night', kind: 'warm_night', severity: 'info', title: 'לילה חם באוהל', reason: `מינימום ${Math.round(d.tMin)}° ב${dl(d)}`, actions: ['מאווררים טעונים', 'לפתוח פתחי אוורור באוהל', 'שמיכה דקה במקום שמיכה חמה'] });
  }
  if (f.wind) {
    const d = maxBy(days, x => x.gusts);
    out.push({ id: 'wind', kind: 'wind', severity: f.severeWind ? 'danger' : 'warning', title: f.severeWind ? 'רוחות חזקות מאוד' : 'משבי רוח חזקים',
      reason: `משבים עד ${Math.round(d.gusts)} קמ״ש ב${dl(d)}`,
      actions: tent ? ['לבדוק אם האתר מתאים ללינה באוהל בתנאים אלה', 'עיגון כל החבלים ויתדות ספייר', 'לפרק Tarp והצללה בזמן משבים', ...(f.severeWind ? ['לשקול לינה חלופית או דחייה'] : [])] : ['להימנע מתצפיות חשופות ומצוקים', 'לקבע ציוד קל'] });
  }
  if (f.uv) {
    const d = maxBy(days, x => x.uv ?? 0);
    out.push({ id: 'uv', kind: 'uv', severity: 'advice', title: 'קרינת UV גבוהה', reason: `מדד UV ${Math.round(d.uv ?? 0)} ב${dl(d)}`, actions: ['קרם הגנה ומריחה חוזרת', 'כובע רחב ומשקפי שמש', 'צל בשעות הצהריים'] });
  }
  if (!out.length) out.push({ id: 'ok', kind: 'ok', severity: 'info', title: 'תנאים נוחים לטיול',
    reason: `טווח ${Math.round(f.minT!)}°–${Math.round(f.maxT!)}°, ללא גשם או רוח חריגים בתחזית`, actions: ['ציוד רגיל לפי העונה'] });
  return out;
}
