import { describe, it, expect } from 'vitest';
import { impliedBy, typeGear, typeTasks, typeChecks, typeQuestions, scale } from './tripTypes';
import { TRIP_TYPES } from '../data/tripTypes';
import { generatePacking } from './packing';
import { buildTasks } from './planner';
import { flagsFor } from './weatherRules';
import { GUIDES } from '../data/guides';
import seed from '../data/seed.json';
import type { Member, Trip } from '../lib/types';

const members = seed.members as Member[];
const base: Trip = {
  id: 't', name: 'x', createdAt: '', start: '2026-11-05', end: '2026-11-07', adults: 2, children: 2, childAges: [10, 6],
  memberIds: [], participants: members, pets: false, kind: 'camping', lodging: 'tent', vehicle: '', regionId: 'golan', siteIds: [],
  interests: ['family'], difficulty: 'easy', budget: 'any', packing: [], meals: [], pantry: {}, schedule: [], tasks: [], status: 'planning',
};
const pack = (t: Trip) => generatePacking({ trip: t, inventory: [], template: [], settings: { familyName: '', vehicle: '', diet: { kosher: false, vegetarian: false, vegan: false, allergies: [] }, theme: 'system', fuelBrands: [], fuelBufferKm: 2 }, flags: flagsFor([]) } as any);

describe('trip type engine', () => {
  it('the catalog has 30 distinct types, each with a name and blurb, guides that exist', () => {
    expect(TRIP_TYPES).toHaveLength(30);
    expect(new Set(TRIP_TYPES.map(t => t.id)).size).toBe(30);
    const ids = GUIDES.map(g => g.id);
    for (const t of TRIP_TYPES) { expect(t.name && t.blurb).toBeTruthy(); for (const g of t.guides ?? []) expect(ids).toContain(g); }
  });
  it('safety-related checks always defer to a source or the operator — never state a place is open/safe', () => {
    for (const t of TRIP_TYPES) for (const c of t.checks ?? []) expect(c.text).toMatch(/לבדוק|לברר|לוודא|רק |לפי|כפופים|מידע|מכסים|לא קוטפים|נסיעה רק|רחצה רק/);
  });
  it('combining types implies settings without dropping existing interests', () => {
    expect(impliedBy(['family_camping', 'water_hike'], base)).toMatchObject({ kind: 'camping', lodging: 'tent', interests: expect.arrayContaining(['family', 'camping', 'water']) });
    expect(impliedBy(['picnic'], base).kind).toBe('day');
    expect(impliedBy(['dogs'], base).pets).toBe(true);
    expect(impliedBy(['day_hike', 'family_camping'], base).kind).toBe('camping'); // camping wins over day
  });
  it('merges gear once per item, scaled to people', () => {
    const g = typeGear({ types: ['streams', 'water_hike', 'kinneret'], kind: 'camping' });
    expect(g.filter(x => x.name === 'נעלי מים לכל משתתף')).toHaveLength(1);
    expect(g.find(x => x.name === 'נעלי מים לכל משתתף')!.reason).toContain('נחלים ומעיינות + מסלול רטוב + כנרת');
    expect(scale('perPerson', members, 3, 1)).toBe(members.length);
    expect(scale('perChild', members, 3, 1)).toBe(members.filter(m => m.role === 'child').length);
  });
  it('packing gets the types\' gear; a question answer overrides the count', () => {
    const p = pack({ ...base, types: ['water_hike', 'cycling'], typeAnswers: { bikes: 3 } });
    expect(p.find(x => x.name === 'נעלי מים לכל משתתף')?.qty).toBe(members.length);
    expect(p.find(x => x.name === 'קסדה לכל רוכב')?.qty).toBe(3);
    expect(pack(base).some(x => x.name === 'נעלי מים לכל משתתף')).toBe(false); // no types → nothing added
  });
  it('tasks, checks and questions come from the selected types', () => {
    const t = { ...base, types: ['offroad', 'cycling'] as any };
    expect(buildTasks([], t, []).map(k => k.text)).toEqual(expect.arrayContaining(typeTasks(t).map(k => k.text)));
    expect(typeChecks(t).length).toBeGreaterThan(1);
    expect(typeQuestions(t).map(q => q.id)).toEqual(['bikes']);
  });
});
