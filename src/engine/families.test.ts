import { describe, it, expect } from 'vitest';
import { generatePacking } from './packing';
import { itemFamily, visibleIn, myFamily, normalizeFamilies } from '../lib/families';
import { describeChanges } from '../lib/cloud/notify';
import seed from '../data/seed.json';
import { flagsFor } from './weatherRules';
import type { Trip, GearItem, Settings, PersonalTemplateItem } from '../lib/types';

const settings: Settings = { familyName: '', vehicle: '', diet: { kosher: true, vegetarian: false, vegan: false, allergies: [] }, theme: 'system', fuelBrands: [], fuelBufferKm: 2, waterLitersPerPersonDay: 3 };
function initial(p: Partial<Trip>) {
  const trip = { id: 't', name: 'x', createdAt: '', start: '2026-11-05', end: '2026-11-07', memberIds: [], pets: false, kind: 'camping', lodging: 'tent', vehicle: '', regionId: 'golan', siteIds: [],
    interests: [], difficulty: 'easy', budget: 'any', packing: [], meals: [], pantry: {}, schedule: [], tasks: [], status: 'planning', ...p } as unknown as Trip;
  const ctx = { trip, inventory: (seed.items as GearItem[]).map(g => ({ ...g, available: true })), template: seed.personalTemplate as PersonalTemplateItem[], settings, flags: flagsFor([]), wxSource: 'season' as const };
  return { trip, ctx };
}

const fams = [{ id: 'A', name: 'משפחת בוטביקה', color: '#000' }, { id: 'B', name: 'משפחת כהן', color: '#111' }];
const ps: any[] = [
  { id: 'a1', name: 'אבי', role: 'adult', age: 40, gender: 'm', familyId: 'A' },
  { id: 'a2', name: 'מיכל', role: 'adult', age: 38, gender: 'f', familyId: 'A' },
  { id: 'b1', name: 'יוסי', role: 'adult', age: 41, gender: 'm', familyId: 'B' },
  { id: 'b2', name: 'נועה', role: 'child', age: 7, gender: 'f', familyId: 'B' },
  { id: 'b3', name: 'תום', role: 'child', age: 2, gender: 'm', familyId: 'B' },
];

describe('group trips: families', () => {
  const { trip, ctx } = initial({ families: fams, participants: ps, adults: 3, children: 2, childAges: [7, 2] });
  const items = generatePacking(ctx).map(p => ({ ...p }));
  const t = { ...trip, packing: items };

  it('personal items belong to the person\'s family; organiser gear to family A', () => {
    const noa = items.find(p => p.assignee === 'b2')!;
    expect(itemFamily(t, noa)).toBe('B');
    expect(itemFamily(t, items.find(p => p.source === 'inventory')!)).toBe('A');
  });
  it('other families get their own basic gear sized to them', () => {
    const bags = items.find(p => p.name === 'שק שינה / שמיכה' && p.familyId === 'B')!;
    expect(bags.qty).toBe(3);
    expect(items.some(p => p.name === 'חיתולים ומגבונים לתינוק' && p.familyId === 'B')).toBe(true);
    expect(items.some(p => p.name === 'חיתולים ומגבונים לתינוק' && p.familyId === 'A')).toBe(false);
  });
  it('a family sees its own items and shared items only', () => {
    const forB = items.filter(p => visibleIn(t, p, 'B'));
    expect(forB.some(p => p.assignee === 'a1')).toBe(false);
    expect(forB.some(p => p.source === 'inventory')).toBe(false);
    expect(forB.some(p => p.assignee === 'b1')).toBe(true);
    expect(forB.some(p => p.name === 'מים לשתייה')).toBe(true); // shared
  });
  it('partners are not notified about another family\'s private gear', () => {
    const joinedB = { ...t, shared: { cloudId: 'x', role: 'editor' as const, joinedAt: '', familyId: 'B' } };
    expect(myFamily(joinedB)).toBe('B');
    const aItem = items.find(p => p.assignee === 'a1')!; const water = items.find(p => p.name === 'מים לשתייה')!;
    const next = { ...joinedB, packing: joinedB.packing.map(p => (p.id === aItem.id || p.id === water.id ? { ...p, packed: true, packedBy: 'מיכל' } : p)) };
    const ch = describeChanges(joinedB, next, 'מיכל', p => visibleIn(next, p, 'B'));
    expect(ch.map(c => c.text)).toEqual(['ארז/ה: מים לשתייה']);
  });
  it('participants without a family join the first one', () => {
    expect(normalizeFamilies(fams, [{ id: 'x', name: 'x', role: 'adult' }])[0].familyId).toBe('A');
    expect(normalizeFamilies(undefined, ps)[0].familyId).toBeUndefined();
  });
});
