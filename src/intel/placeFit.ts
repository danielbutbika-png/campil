// Recommendation scoring for a place on a specific trip — a documented formula (docs/data/SCORING.md), not a model.
// Score 0–100 = sum of six parts, each with its own maximum and the reason it got what it got.
// Hard filter first: a place that conflicts with the conditions (water/canyon on a heavy-rain day) is excluded,
// not scored low. Missing information never adds points. The score is a fit score, never a safety rating.
import type { DayWx } from '../services/weather';
import type { Place, PlaceCat } from '../services/placesDb';
import { richness } from '../services/placesDb';
import type { Interest, RegionId } from '../lib/types';
import { REGION_BY_ID } from '../data/regions';
import { haversineKm, seasonOf } from '../lib/util';
import { TYPE_BY_ID } from '../data/tripTypes';

export interface FitContext {
  base?: { lat: number; lon: number; label: string };   // where the family sleeps / starts the day
  start?: string; end?: string;                         // trip dates (ISO)
  adults: number; children: number; youngest?: number;  // composition
  interests: Interest[];
  accessible?: boolean;                                 // someone needs step-free access
  days?: DayWx[];                                       // forecast for the trip days, when available
  forecastState?: 'forecast' | 'partial' | 'too_far' | 'past' | 'none';
}
export interface FitPart { id: string; label: string; pts: number; max: number; why: string }
export interface Condition { id: 'heat' | 'wind' | 'rain' | 'uv' | 'flood'; level: 'warn' | 'danger'; day: string; text: string }
export interface Fit { score: number | null; parts: FitPart[]; excluded?: string; conditions: Condition[]; summary: string; km?: number }

const WATERY: PlaceCat[] = ['stream', 'waterfall', 'spring', 'cave'];
const EXPOSED: PlaceCat[] = ['viewpoint', 'peak', 'trail', 'archaeological', 'nature_reserve'];
const KID_FRIENDLY: PlaceCat[] = ['park', 'picnic', 'beach', 'zoo', 'attraction', 'visitor_center', 'botanical', 'spring', 'lake', 'national_park'];
const BY_INTEREST: Partial<Record<Interest, PlaceCat[]>> = {
  water: ['spring', 'waterfall', 'stream', 'lake'], beach: ['beach'], hiking: ['trail', 'nature_reserve', 'national_park', 'peak'],
  views: ['viewpoint', 'peak'], history: ['archaeological', 'castle'], forest: ['forest', 'park'], camping: ['campsite', 'caravan'],
  picnic: ['picnic', 'park'], kids: KID_FRIENDLY, family: KID_FRIENDLY, desert: ['nature_reserve', 'national_park', 'viewpoint'],
};
const DESERT: RegionId[] = ['judean_desert', 'central_negev', 'arava', 'eilat', 'north_negev'];

/** What the forecast means for this kind of place, day by day. Thresholds are fixed and documented. */
export function placeConditions(p: Place, days: DayWx[] = []): Condition[] {
  const out: Condition[] = [];
  const watery = p.c.some(c => WATERY.includes(c)) || DESERT.includes(p.r) && p.c.includes('nature_reserve');
  const exposed = p.c.some(c => EXPOSED.includes(c)) || DESERT.includes(p.r);
  const sleep = p.c.some(c => c === 'campsite' || c === 'caravan');
  for (const d of days) {
    const feels = d.feelsMax ?? d.tMax;
    if (watery && (d.precip >= 10 || (d.precipProb ?? 0) >= 70 && d.precip >= 5))
      out.push({ id: 'flood', level: 'danger', day: d.date, text: `צפוי גשם (${Math.round(d.precip)} מ״מ). בנחלים, מפלים, מערות ובמדבר — סכנת שיטפון, גם מגשם רחוק. לא לתכנן כניסה; לבדוק התרעות רשמיות.` });
    else if (d.precip >= 5 || (d.precipProb ?? 0) >= 60) out.push({ id: 'rain', level: 'warn', day: d.date, text: `סיכוי לגשם (${d.precipProb ?? '?'}%, ${Math.round(d.precip)} מ״מ) — שבילים חלקלקים, לבוש לגשם.` });
    if (feels >= 33 && exposed) out.push({ id: 'heat', level: feels >= 37 ? 'danger' : 'warn', day: d.date, text: `עומס חום (מורגש ${Math.round(feels)}°) במקום חשוף — רק בשעות הבוקר המוקדמות, הרבה מים, או חלופה מוצלת.` });
    if (d.gusts >= 50 && (exposed || sleep)) out.push({ id: 'wind', level: d.gusts >= 70 ? 'danger' : 'warn', day: d.date, text: `משבי רוח עד ${Math.round(d.gusts)} קמ״ש${sleep ? ' — לעגן אוהלים וציליות היטב, לשקול לינה מוגנת' : ' — זהירות בתצפיות ובמצוקים'}.` });
    if ((d.uv ?? 0) >= 9 && exposed) out.push({ id: 'uv', level: 'warn', day: d.date, text: `קרינת UV גבוהה מאוד (${Math.round(d.uv!)}) — כובע, קרם הגנה וצל.` });
  }
  return out;
}

/** The fit of one place for one trip, with every part explained. */
export function fitScore(p: Place, ctx: FitContext): Fit {
  const parts: FitPart[] = [];
  const conditions = placeConditions(p, ctx.days);
  const flood = conditions.find(c => c.id === 'flood');
  const km = ctx.base ? haversineKm(ctx.base, p) : undefined;
  if (flood) return { score: null, parts, conditions, excluded: `לא מומלץ בתנאים הצפויים: ${flood.text}`, summary: 'לא מומלץ בתנאים הצפויים — ראו אזהרה.', km };

  // 1. distance from where you sleep / start (air distance)
  const dist = km == null ? 0 : km <= 5 ? 20 : km <= 15 ? 16 : km <= 30 ? 11 : km <= 50 ? 6 : 0;
  parts.push({ id: 'distance', label: 'קרבה לבסיס', pts: dist, max: 20, why: km == null ? 'לא נקבע מקום לינה או יציאה — אין נקודות על קרבה' : `${km < 10 ? km.toFixed(1) : Math.round(km)} ק״מ בקו אווירי מ${ctx.base!.label}` });

  // 2. who is coming
  const kids = ctx.children > 0;
  const kidOk = p.c.some(c => KID_FRIENDLY.includes(c));
  const comp = kids ? (kidOk ? 20 : p.c.includes('peak') ? 4 : 8) : 15;
  parts.push({ id: 'group', label: 'התאמה להרכב', pts: comp, max: 20, why: kids ? (kidOk ? 'סוג מקום שמתאים בדרך כלל למשפחות עם ילדים' : 'אין לנו מידע על התאמה לילדים — לבדוק קושי ואורך לפני') : 'טיול מבוגרים — אין מגבלת גיל' });

  // 3. what you like / the trip type
  const want = new Set(ctx.interests.flatMap(i => BY_INTEREST[i] ?? []));
  const hit = p.c.filter(c => want.has(c));
  parts.push({ id: 'interest', label: 'התאמה לסוג הטיול', pts: hit.length ? 20 : want.size ? 4 : 10, max: 20, why: hit.length ? 'תואם את סוג הטיול וההעדפות שבחרתם' : want.size ? 'לא מהסוגים שבחרתם לטיול הזה' : 'לא נבחרו העדפות — ציון ניטרלי' });

  // 4. season (the region's recommended seasons)
  const reg = REGION_BY_ID[p.r]; const season = ctx.start ? seasonOf(ctx.start) : undefined;
  const inSeason = season && reg?.bestSeasons.includes(season);
  parts.push({ id: 'season', label: 'עונה', pts: !season ? 0 : inSeason ? 15 : 5, max: 15, why: !season ? 'אין תאריכים' : inSeason ? `${reg.name} מומלץ בעונה הזו` : `העונה פחות מומלצת ב${reg.name}: ${reg.climateNote}` });

  // 5. weather on the trip days (no forecast = no points, never assumed fine)
  const bad = conditions.filter(c => c.level === 'danger').length, warn = conditions.filter(c => c.level === 'warn').length;
  const noFc = !ctx.days?.length;
  parts.push({ id: 'weather', label: 'מזג אוויר', pts: noFc ? 0 : bad ? 2 : warn ? 9 : 15, max: 15, why: noFc ? (ctx.forecastState === 'too_far' ? 'עדיין אין תחזית אמינה לתאריך זה' : 'אין תחזית זמינה') : bad ? 'תנאים קשים צפויים — ראו אזהרות' : warn ? 'יש מה לשים לב אליו בתחזית' : 'התחזית לא מעלה בעיה מיוחדת לסוג המקום הזה' });

  // 6. how much verified information we have
  const rich = richness(p);
  parts.push({ id: 'info', label: 'איכות המידע', pts: Math.min(10, rich * 2), max: 10, why: rich >= 4 ? 'יש תיאור, תמונה או מתקנים ממקור מוכר' : rich ? 'מידע חלקי — לבדוק באתר הרשמי' : 'שם ומיקום בלבד' });

  if (ctx.accessible && p.fac?.wheelchair !== 'yes') parts.push({ id: 'access', label: 'נגישות', pts: 0, max: 0, why: p.fac?.wheelchair === 'no' ? 'מסומן במפה כלא נגיש' : 'אין מידע על נגישות — לבדוק לפני' });

  const score = Math.max(0, Math.min(100, parts.reduce((s, x) => s + x.pts, 0)));
  const best = parts.filter(x => x.max && x.pts / x.max >= 0.75).map(x => x.why);
  const summary = (best.length ? best.slice(0, 3).join('; ') + '.' : 'התאמה חלקית.') + ' יש לבדוק את מצב המקום והמסלול לפני היציאה.';
  return { score, parts, conditions, summary, km };
}

/** Scoring input from a trip: base point (lodging / destination), who is coming, what they like, the forecast. */
export function fitContextFor(t: import('../lib/types').Trip, days: DayWx[], state: FitContext['forecastState'], base: FitContext['base'] | null): FitContext {
  const kids = t.participants.filter(p => p.role === 'child');
  const ages = kids.map(p => p.age).filter((a): a is number => a != null);
  const implied = (t.types ?? []).flatMap(id => TYPE_BY_ID[id]?.implies?.interests ?? []);
  const inTrip = days.filter(d => (!t.start || d.date >= t.start) && (!t.end || d.date <= t.end));
  return {
    base: base ?? undefined, start: t.start, end: t.end, adults: t.participants.length - kids.length, children: kids.length,
    youngest: ages.length ? Math.min(...ages) : undefined, interests: [...new Set([...(t.interests ?? []), ...implied])],
    days: inTrip, forecastState: state,
  };
}
