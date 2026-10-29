import { describe, it, expect } from 'vitest';
import { recommend, flagsFor } from './weatherRules';
import { generatePacking, readiness, mergePacking } from './packing';
import { scoreSite } from './scoring';
import { planMeals, shoppingList, buildSchedule } from './planner';
import { availability } from '../services/weather';
import { tripLength } from '../lib/util';
import { withCounts } from '../lib/store';
import seed from '../data/seed.json';
import { SITE_BY_ID } from '../data/sites';
import type { DayWx } from '../services/weather';
import type { Trip, GearItem, Member, Settings, PersonalTemplateItem } from '../lib/types';

const day = (date: string, o: Partial<DayWx> = {}): DayWx => ({ date, tMax: 26, tMin: 16, precip: 0, precipProb: 0, wind: 10, gusts: 20, uv: 6, code: 1, ...o });
const members = seed.members as Member[];
const trip: Trip = {
  id: 't', name: 'x', createdAt: '', start: '2026-11-05', end: '2026-11-08', adults: 2, children: 3, childAges: [12, 11, 6],
  memberIds: members.map(m => m.id), participants: members, pets: false, kind: 'camping', lodging: 'tent', vehicle: '', regionId: 'golan', siteIds: [],
  interests: ['water', 'family'], difficulty: 'easy', budget: 'any', packing: [], meals: [], pantry: {}, schedule: [], tasks: [], status: 'planning',
};
const settings: Settings = { familyName: '', vehicle: '', diet: { kosher: true, vegetarian: false, vegan: false, allergies: [] }, theme: 'system', fuelBrands: [], fuelBufferKm: 2 };

describe('dates', () => {
  it('counts days and nights', () => expect(tripLength('2026-11-05', '2026-11-08')).toEqual({ days: 4, nights: 3 }));
  it('forecast availability', () => {
    expect(availability('2026-10-25', '2026-10-27', '2026-10-22')).toBe('forecast');
    expect(availability('2026-11-05', '2026-11-09', '2026-10-22')).toBe('partial');
    expect(availability('2026-12-20', '2026-12-22', '2026-10-22')).toBe('too_far');
    expect(availability('2026-10-01', '2026-10-02', '2026-10-22')).toBe('past');
  });
});

describe('weather rules', () => {
  it('rain recommendation names the value', () => {
    const r = recommend([day('2026-11-05', { precipProb: 70, precip: 6.2 })], trip);
    expect(r[0].kind).toBe('rain'); expect(r[0].reason).toContain('70%'); expect(r[0].reason).toContain('6.2');
  });
  it('flood danger only with rain + flood-prone site', () => {
    const r = recommend([day('2026-11-05', { precipProb: 80, precip: 10 })], trip, [SITE_BY_ID['ein-gedi']]);
    expect(r.some(x => x.kind === 'flood' && x.severity === 'danger')).toBe(true);
    expect(recommend([day('2026-11-05')], trip, [SITE_BY_ID['ein-gedi']]).some(x => x.kind === 'flood')).toBe(false);
  });
  it('cold night shows the minimum', () => {
    const r = recommend([day('2026-11-05', { tMin: 4 })], trip);
    const c = r.find(x => x.kind === 'cold')!; expect(c.severity).toBe('warning'); expect(c.reason).toContain('4°');
  });
  it('extreme heat suggests changing plans', () => {
    const r = recommend([day('2026-07-05', { tMax: 39, feelsMax: 41 })], trip, [SITE_BY_ID['masada']]);
    const h = r.find(x => x.kind === 'heat')!; expect(h.severity).toBe('danger'); expect(h.actions.join()).toContain('מצדה');
  });
  it('wind targets tents', () => { const r = recommend([day('2026-11-05', { gusts: 65 })], trip); expect(r.find(x => x.kind === 'wind')!.severity).toBe('danger'); });
  it('calm weather → single ok card', () => expect(recommend([day('2026-11-05')], trip).map(r => r.kind)).toEqual(['ok']));
});

describe('packing', () => {
  const inv = (seed.items as GearItem[]).map(g => ({ ...g, available: true }));
  const ctx = (flags = flagsFor([day('2026-11-05', { tMin: 8, tMax: 22 })]), t: Trip = trip) => ({ trip: t, members, inventory: inv, template: seed.personalTemplate as PersonalTemplateItem[], settings, flags, wxSource: 'forecast' as const });
  it('no-food trip: no cooking gear or food, but drinking water stays', () => {
    const p = generatePacking(ctx(undefined, { ...trip, noFood: true }));
    expect(p.some(x => x.category === 'kitchen')).toBe(false);
    expect(p.some(x => x.name === 'מים לשתייה')).toBe(true);
    expect(generatePacking(ctx()).some(x => x.category === 'kitchen')).toBe(true);
  });
  it('scales daily clothing by nights', () => {
    const p = generatePacking(ctx());
    const u = p.find(x => x.name === 'תחתונים' && x.assignee === 'm1')!;
    expect(u.qty).toBe(2 + 2); // base 2 + (3 nights - 1)
    expect(p.filter(x => x.name === 'תחתונים').length).toBe(members.length);
  });
  it('skips fans on a cold trip, includes them on hot nights', () => {
    expect(generatePacking(ctx()).some(x => x.name.includes('FS-6P'))).toBe(false);
    expect(generatePacking(ctx(flagsFor([day('2026-07-05', { tMin: 24, tMax: 34 })]))).some(x => x.name.includes('FS-6P'))).toBe(true);
  });
  it('a child without an age gets child items, not adult hygiene items', () => {
    const t = withCounts({ ...trip, participants: [{ id: 'a', name: 'אמא', role: 'adult', gender: 'f' }, { id: 'k', name: 'ילד', role: 'child', gender: 'm' }] }) as Trip;
    expect(t.adults).toBe(1); expect(t.children).toBe(1);
    const p = generatePacking(ctx(undefined, t));
    expect(p.some(x => x.name.includes('גילוח'))).toBe(false);
    expect(p.some(x => x.name.includes('היגיינה נשית'))).toBe(true);
  });
  it('gender and age of participants drive personal and hygiene items', () => {
    const boys = withCounts({ ...trip, participants: [{ id: 'a', name: 'אבא', role: 'adult', age: 40, gender: 'm' }, { id: 'b', name: 'בן', role: 'child', age: 4, gender: 'm' }] }) as Trip;
    const p = generatePacking(ctx(undefined, boys));
    expect(p.some(x => x.name.includes('היגיינה נשית'))).toBe(false);
    expect(p.some(x => x.name.includes('גומיות'))).toBe(false);
    expect(p.find(x => x.name.includes('גילוח'))!.reason).toContain('1');
    expect(p.filter(x => x.name === 'תחתונים').length).toBe(2);
    expect(p.find(x => x.name === 'חולצה ארוכה' && x.assignee === 'b')!.reason).toContain('גיל 4');
    const girls = withCounts({ ...trip, participants: [{ id: 'c', name: 'אמא', role: 'adult', age: 38, gender: 'f' }, { id: 'd', name: 'בת', role: 'child', age: 13, gender: 'f' }] }) as Trip;
    const q = generatePacking(ctx(undefined, girls));
    expect(q.find(x => x.name.includes('היגיינה נשית'))!.reason).toContain('2');
    expect(q.some(x => x.name.includes('גילוח'))).toBe(false);
    expect(girls.adults).toBe(1); expect(girls.childAges).toEqual([13]);
  });
  it('flags shortfall when more people than plates', () => {
    const p = generatePacking(ctx(undefined, { ...trip, adults: 4 }));
    const plates = p.find(x => x.name.includes('צלחות'))!; expect(plates.qty).toBe(7); expect(plates.missing).toBe(true);
  });
  it('water: 3 L per person by default (5 in the desert), or the user own amount', () => {
    expect(generatePacking(ctx()).find(x => x.name === 'מים לשתייה')!.qty).toBe(Math.ceil((3 * 5 * 4) / 9));
    expect(generatePacking(ctx(undefined, { ...trip, regionId: 'arava' })).find(x => x.name === 'מים לשתייה')!.qty).toBe(Math.ceil((5 * 5 * 4) / 9));
    const p = generatePacking({ ...ctx(), settings: { ...settings, waterLitersPerPersonDay: 4 } });
    expect(p.find(x => x.name === 'מים לשתייה')!.qty).toBe(Math.ceil((4 * 5 * 4) / 9));
  });
  it('day trip leaves tent and bedding at home', () => {
    const p = generatePacking(ctx(undefined, { ...trip, kind: 'day', end: trip.start }));
    expect(p.some(x => x.category === 'tents')).toBe(false); expect(p.some(x => x.name === 'פיג׳מה')).toBe(false);
  });
  it('readiness and merge keep packed state', () => {
    const a = generatePacking(ctx()); a[0].packed = true;
    const b = mergePacking(a, generatePacking(ctx()));
    expect(b[0].packed).toBe(true); expect(readiness(b).done).toBe(1);
  });
});

describe('scoring', () => {
  it('penalises exposed sites in heat and explains why', () => {
    const f = flagsFor([day('2026-07-05', { tMax: 37 })]);
    const s = scoreSite(SITE_BY_ID['masada'], { ...trip, start: '2026-07-05' }, f);
    expect(s.warnings.join()).toContain('חשוף');
    const w = scoreSite(SITE_BY_ID['tel-dan'], { ...trip, start: '2026-07-05', regionId: 'hula' }, f);
    expect(w.score).toBeGreaterThan(s.score);
  });
});

describe('meals & schedule', () => {
  it('plans meals respecting allergies and builds a shopping list', () => {
    const m = planMeals(trip, { kosher: true, vegetarian: false, vegan: false, allergies: ['ביצים'] });
    expect(m.length).toBeGreaterThan(6);
    const list = shoppingList(m);
    expect(list.some(l => l.name === 'ביצים')).toBe(false);
    expect(list.every(l => l.qty > 0)).toBe(true);
  });
  it('day trip visits every chosen place; no meals when there is no food', () => {
    const d = { ...trip, kind: 'day' as const, end: trip.start };
    const s = buildSchedule(d, [], [{ name: 'א' }, { name: 'ב' }, { name: 'ג' }]);
    expect(['א', 'ב', 'ג'].every(n => s.some(x => x.title === n))).toBe(true);
    expect(s.at(-1)!.title).toBe('חזרה הביתה');
    expect(buildSchedule({ ...d, noFood: true }, [], [{ name: 'א' }]).some(x => x.kind === 'meal')).toBe(false);
  });
  it('schedule moves activities early on hot days', () => {
    const s = buildSchedule(trip, [day('2026-11-06', { tMax: 35 })], []);
    expect(s.some(x => x.day === 1 && x.time === '06:30')).toBe(true);
  });
});
