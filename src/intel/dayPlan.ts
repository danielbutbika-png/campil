// Day-by-day suggestions for a trip: morning + afternoon near the base, scored with placeFit for that day's weather,
// diverse, never repeated, with alternatives and the places ruled out (and why). A proposal only — the schedule
// changes only after the user approves (ScheduleTab → DayIdeas). Pure: the same inputs give the same plan.
import type { DayWx } from '../services/weather';
import type { Place, PlaceCat, PlaceDb } from '../services/placesDb';
import { nearby } from '../services/placesDb';
import { fitScore, type Fit, type FitContext } from './placeFit';
import { addDays, haversineKm } from '../lib/util';

export interface Pick { p: Place; fit: Fit; slot: 'morning' | 'afternoon'; time: string; km: number }
export interface DayIdea { day: number; date: string; wx?: DayWx; hot: boolean; picks: Pick[]; alts: Pick[]; excluded: { p: Place; reason: string }[] }

const NOT_A_DAY_OUT: PlaceCat[] = ['campsite', 'caravan', 'stream', 'peak'];       // places to sleep / map features, not outings
const COOL: PlaceCat[] = ['park', 'beach', 'visitor_center', 'attraction', 'zoo', 'botanical', 'spring', 'lake', 'cave', 'forest'];
export const SLOT_HE = { morning: 'בוקר', afternoon: 'אחר הצהריים' } as const;

export function dayPlan(db: PlaceDb, ctx: FitContext, opts: { start: string; days: number; radiusKm?: number; exclude?: string[] }): DayIdea[] {
  if (!ctx.base) return [];
  const radius = opts.radiusKm ?? 30;
  const pool = nearby(db, ctx.base, radius).filter(x => !opts.exclude?.includes(x.p.id) && !x.p.c.every(c => NOT_A_DAY_OUT.includes(c)) && (x.p.wiki || x.p.img || x.p.site || x.p.fac || x.p.web));
  const used = new Set<string>();
  const out: DayIdea[] = [];
  for (let d = 0; d < opts.days; d++) {
    const date = addDays(opts.start, d);
    const wx = ctx.days?.find(w => w.date === date);
    const hot = !!wx && (wx.feelsMax ?? wx.tMax) >= 33;
    const dayCtx: FitContext = { ...ctx, days: wx ? [wx] : [] };
    const scored = pool.map(x => ({ x, fit: fitScore(x.p, dayCtx) }));
    const excluded = scored.filter(s => s.fit.score == null).slice(0, 3).map(s => ({ p: s.x.p, reason: s.fit.excluded! }));
    const ok = scored.filter(s => s.fit.score != null && !used.has(s.x.p.id)).sort((a, b) => b.fit.score! - a.fit.score! || a.x.km - b.x.km);
    const picks: Pick[] = [];
    const morning = ok[0];
    if (morning) picks.push({ p: morning.x.p, fit: morning.fit, slot: 'morning', time: hot ? '07:30' : '09:30', km: morning.x.km });
    const after = ok.find(s => s !== morning && (!morning || (s.x.p.c[0] !== morning.x.p.c[0] && haversineKm(s.x.p, morning.x.p) <= 25)) && (!hot || s.x.p.c.some(c => COOL.includes(c))));
    if (after) picks.push({ p: after.x.p, fit: after.fit, slot: 'afternoon', time: hot ? '16:30' : '14:30', km: after.x.km });
    picks.forEach(k => used.add(k.p.id));
    const alts = ok.filter(s => !picks.some(k => k.p.id === s.x.p.id)).slice(0, 2).map(s => ({ p: s.x.p, fit: s.fit, slot: 'morning' as const, time: '', km: s.x.km }));
    out.push({ day: d, date, wx, hot, picks, alts, excluded });
  }
  return out;
}

/** What the plan rests on — when it changes, the screen says what changed (and the plan itself is never changed). */
export interface PlanInputs { start: string; end: string; people: number; children: number; interests: string; base: string; wx: string; alerts: string }
export function planInputs(ctx: FitContext, start: string, end: string): PlanInputs {
  return {
    start, end, people: ctx.adults + ctx.children, children: ctx.children, interests: [...ctx.interests].sort().join(','),
    base: ctx.base ? `${ctx.base.label}` : '',
    wx: (ctx.days ?? []).map(d => `${d.date}:${d.precip >= 5 ? 'גשם' : (d.feelsMax ?? d.tMax) >= 33 ? 'חם' : d.gusts >= 50 ? 'רוח' : 'נוח'}`).join('|'),
    alerts: (ctx.alerts ?? []).map(a => a.title).sort().join('|'),
  };
}
export function whatChanged(prev: PlanInputs, now: PlanInputs): string[] {
  const out: string[] = [];
  if (prev.start !== now.start || prev.end !== now.end) out.push('תאריכי הטיול השתנו');
  if (prev.people !== now.people || prev.children !== now.children) out.push(`הרכב המשתתפים השתנה (${prev.people} → ${now.people}${prev.children !== now.children ? `, ילדים ${prev.children} → ${now.children}` : ''})`);
  if (prev.interests !== now.interests) out.push('ההעדפות או סוג הטיול השתנו');
  if (prev.base !== now.base) out.push(`מקום הלינה השתנה (${prev.base || '—'} → ${now.base || '—'})`);
  if (prev.wx !== now.wx) {
    const a = new Map(prev.wx.split('|').map(x => x.split(':') as [string, string])), b = now.wx.split('|').map(x => x.split(':'));
    const days = b.filter(([d, v]) => a.get(d) && a.get(d) !== v).map(([d, v]) => `${d.slice(8, 10)}/${d.slice(5, 7)}: ${a.get(d)} → ${v}`);
    out.push(days.length ? `התחזית השתנתה — ${days.join(', ')}` : 'התחזית התעדכנה');
  }
  if (prev.alerts !== now.alerts) out.push(now.alerts ? 'יש אזהרה רשמית חדשה או שהשתנתה' : 'אזהרה רשמית הוסרה');
  return out;
}
