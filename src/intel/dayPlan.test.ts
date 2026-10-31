import { describe, it, expect } from 'vitest';
import { dayPlan, planInputs, whatChanged } from './dayPlan';
import type { FitContext } from './placeFit';
import type { Place, PlaceDb } from '../services/placesDb';
import type { DayWx } from '../services/weather';

const P = (id: string, c: Place['c'], dLat: number, extra: Partial<Place> = {}): Place => ({ id, he: id, lat: 32.96 + dLat, lon: 35.72, r: 'golan', c, wiki: 'x', src: ['wd'], ...extra });
const db: PlaceDb = { sources: {}, attribution: '', count: 6, places: [
  P('stream', ['stream', 'waterfall'], 0.01), P('park', ['park', 'picnic'], 0.02), P('view', ['viewpoint'], 0.03),
  P('ruins', ['archaeological'], 0.04), P('camp', ['campsite'], 0.005), P('far', ['park'], 1.5), P('bare', ['park'], 0.01, { wiki: undefined }),
] };
const day = (date: string, o: Partial<DayWx> = {}): DayWx => ({ date, tMax: 24, tMin: 14, precip: 0, wind: 10, gusts: 20, code: 1, ...o });
const ctx = (days: DayWx[]): FitContext => ({ base: { lat: 32.96, lon: 35.72, label: 'החניון' }, start: '2026-11-10', end: '2026-11-11', adults: 2, children: 2, interests: ['water', 'family'], days, forecastState: 'forecast' });

describe('day plan', () => {
  it('morning + afternoon per day, no repeats, never a campsite, nothing outside the radius or without content', () => {
    const plan = dayPlan(db, ctx([day('2026-11-10'), day('2026-11-11')]), { start: '2026-11-10', days: 2 });
    const ids = plan.flatMap(d => d.picks.map(p => p.p.id));
    expect(plan[0].picks.map(p => p.slot)).toEqual(['morning', 'afternoon']);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain('camp'); expect(ids).not.toContain('far'); expect(ids).not.toContain('bare');
  });
  it('a heavy-rain day rules the waterfall out, says why, and still plans the day', () => {
    const plan = dayPlan(db, ctx([day('2026-11-10', { precip: 30, precipProb: 95 })]), { start: '2026-11-10', days: 1 });
    expect(plan[0].picks.map(p => p.p.id)).not.toContain('stream');
    expect(plan[0].excluded.map(e => e.p.id)).toContain('stream');
    expect(plan[0].excluded[0].reason).toMatch(/שיטפון/);
    expect(plan[0].picks.length).toBeGreaterThan(0);
  });
  it('a hot day starts early and keeps the afternoon for a cooler kind of place', () => {
    const plan = dayPlan(db, ctx([day('2026-11-10', { tMax: 37, feelsMax: 38 })]), { start: '2026-11-10', days: 1 });
    expect(plan[0].hot).toBe(true); expect(plan[0].picks[0].time).toBe('07:30');
    const aft = plan[0].picks.find(p => p.slot === 'afternoon');
    if (aft) expect(aft.p.c.some(c => ['park', 'spring', 'waterfall', 'stream', 'lake', 'cave', 'forest', 'beach', 'zoo', 'attraction', 'visitor_center', 'botanical'].includes(c))).toBe(true);
  });
  it('what changed: dates, people, forecast per day', () => {
    const a = planInputs(ctx([day('2026-11-10')]), '2026-11-10', '2026-11-11');
    const b = planInputs({ ...ctx([day('2026-11-10', { precip: 20 })]), children: 0 }, '2026-11-10', '2026-11-12');
    const ch = whatChanged(a, b);
    expect(ch.join(' ')).toMatch(/תאריכי/); expect(ch.join(' ')).toMatch(/ילדים 2 → 0/); expect(ch.join(' ')).toMatch(/10\/11: נוח → גשם/);
  });
});
