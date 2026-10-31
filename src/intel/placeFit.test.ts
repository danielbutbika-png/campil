import { describe, it, expect } from 'vitest';
import { fitScore, placeConditions, type FitContext } from './placeFit';
import type { Place } from '../services/placesDb';
import type { DayWx } from '../services/weather';

const stream: Place = { id: 'wd:Q1', he: 'נחל זוויתן', lat: 32.96, lon: 35.72, r: 'golan', c: ['stream', 'nature_reserve'], wiki: 'x', img: { thumb: '', page: '', license: 'CC BY-SA 4.0', author: 'a' }, src: ['wd'] };
const park: Place = { id: 'wd:Q2', he: 'פארק', lat: 32.97, lon: 35.70, r: 'golan', c: ['park', 'picnic'], src: ['wd'] };
const bare: Place = { id: 'osm:n1', he: 'תצפית', lat: 32.9, lon: 35.7, r: 'golan', c: ['viewpoint'], src: ['osm'] };
const day = (o: Partial<DayWx>): DayWx => ({ date: '2026-11-10', tMax: 22, tMin: 12, precip: 0, wind: 10, gusts: 20, code: 1, ...o });
const base: FitContext = { base: { lat: 32.96, lon: 35.71, label: 'החניון' }, start: '2026-11-10', end: '2026-11-12', adults: 2, children: 2, interests: ['water', 'family'], days: [day({})], forecastState: 'forecast' };

describe('place fit (transparent score)', () => {
  it('scenario 3 — heavy rain: a stream is excluded with the reason, not scored; a park is still scored', () => {
    const rain = { ...base, days: [day({ precip: 25, precipProb: 90 })] };
    const f = fitScore(stream, rain);
    expect(f.score).toBeNull();
    expect(f.excluded).toMatch(/שיטפון/);
    expect(fitScore(park, rain).score).toBeGreaterThan(0);
  });
  it('scenario 4 — composition: with children a picnic park fits better than without, and the reason says why', () => {
    const withKids = fitScore(park, base), adults = fitScore(park, { ...base, children: 0 });
    expect(withKids.score!).toBeGreaterThan(adults.score!);
    expect(withKids.parts.find(p => p.id === 'group')!.why).toMatch(/ילדים/);
  });
  it('scenario 2 — dates beyond the forecast: no weather points and the exact wording', () => {
    const f = fitScore(park, { ...base, days: [], forecastState: 'too_far' });
    const w = f.parts.find(p => p.id === 'weather')!;
    expect(w.pts).toBe(0); expect(w.why).toBe('עדיין אין תחזית אמינה לתאריך זה');
  });
  it('scenario 5 — missing information is never positive', () => {
    const f = fitScore(bare, { ...base, base: undefined });
    expect(f.parts.find(p => p.id === 'info')!.pts).toBe(0);
    expect(f.parts.find(p => p.id === 'distance')!.pts).toBe(0);
    expect(f.summary).toMatch(/לבדוק/);
  });
  it('score is the sum of its parts and stays within 0–100', () => {
    const f = fitScore(stream, base);
    expect(f.score).toBe(f.parts.reduce((s, p) => s + p.pts, 0));
    expect(f.score!).toBeLessThanOrEqual(100);
  });
  it('conditions: heat on an exposed place, wind at a campsite; nothing on a calm day', () => {
    expect(placeConditions(bare, [day({ tMax: 38, feelsMax: 39 })]).map(c => c.id)).toContain('heat');
    expect(placeConditions({ ...park, c: ['campsite'] }, [day({ gusts: 65 })]).map(c => c.id)).toContain('wind');
    expect(placeConditions(park, [day({})])).toEqual([]);
  });
});

describe('official IMS warnings', () => {
  const flood = { area: 'north' as const, type: 'flood' as const, title: 'אזהרה כתומה - שיטפונות בנחלי הגולן', text: '', pubDate: '', link: 'https://ims.gov.il' };
  it('a flood warning for the area rules out a stream, with the official title and credit', () => {
    const f = fitScore(stream, { ...base, alerts: [flood], alertsChecked: true });
    expect(f.score).toBeNull(); expect(f.excluded).toMatch(/אזהרה רשמית/); expect(f.excluded).toMatch(/השירות המטאורולוגי/);
  });
  it('the same warning does not touch a place in another area, or a park', () => {
    expect(fitScore({ ...stream, r: 'eilat' }, { ...base, alerts: [flood] }).score).not.toBeNull();
    expect(fitScore(park, { ...base, alerts: [flood] }).score).not.toBeNull();
  });
  it('a sea warning (country-wide) rules out a beach anywhere', () => {
    const sea = { ...flood, area: 'country' as const, type: 'sea' as const, title: 'ים גבוה ומסוכן לרחצה' };
    expect(fitScore({ ...park, r: 'sharon', c: ['beach'] }, { ...base, alerts: [sea] }).score).toBeNull();
  });
  it('could not check → said in the explanation, never assumed clear', () => {
    expect(fitScore(park, { ...base, alertsChecked: false }).summary).toMatch(/לא הצלחנו לבדוק אזהרות רשמיות/);
  });
});

describe('flood-prone by the curated catalogue', () => {
  it('a reserve linked to a catalogue site with flood risk (Yehudiya) is ruled out by a flood warning', () => {
    const yehudiya: Place = { id: 'wd:Q9', he: 'שמורת יער יהודיה', lat: 32.94, lon: 35.71, r: 'golan', c: ['nature_reserve', 'forest'], site: 'yehudiya', src: ['wd'] };
    const flood = { area: 'north' as const, type: 'flood' as const, title: 'שיטפונות', text: '', pubDate: '', link: '' };
    expect(fitScore(yehudiya, { ...base, alerts: [flood] }).score).toBeNull();
    expect(fitScore(yehudiya, { ...base, days: [day({ precip: 25, precipProb: 90 })] }).score).toBeNull();
  });
});
