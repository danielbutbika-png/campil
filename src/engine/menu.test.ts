import { describe, it, expect } from 'vitest';
import { planMenu, grillTotals, appetite, dietGroups } from './menu';
import { shoppingList } from './planner';
import { RECIPE_BY_ID } from '../data/recipes';
import type { Trip, DietPrefs } from '../lib/types';

const fallback: DietPrefs = { kosher: true, vegetarian: false, vegan: false, allergies: [] };
const fams = [{ id: 'A', name: 'משפחה א', color: '#000' }, { id: 'B', name: 'משפחה ב', color: '#111' }];
const ps: any[] = [
  { id: 'a1', name: 'א1', role: 'adult', age: 40, gender: 'm', familyId: 'A' }, { id: 'a2', name: 'א2', role: 'adult', age: 38, gender: 'f', familyId: 'A' },
  { id: 'a3', name: 'א3', role: 'child', age: 10, gender: 'f', familyId: 'A' },
  { id: 'b1', name: 'ב1', role: 'adult', age: 41, gender: 'm', familyId: 'B' }, { id: 'b2', name: 'ב2', role: 'child', age: 2, gender: 'm', familyId: 'B' },
];
const base = { start: '2026-11-05', end: '2026-11-07', kind: 'camping', adults: 3, children: 2, participants: ps, families: fams } as unknown as Trip;

describe('shared menu by family diet', () => {
  it('portions follow age', () => {
    expect(appetite(ps[0])).toBe(1); expect(appetite(ps[2])).toBe(0.8); expect(appetite(ps[4])).toBe(0.4);
    expect(dietGroups(base, fallback).map(g => g.eq)).toEqual([2.8, 1.4]);
  });
  it('meat family gets a BBQ, vegetarian family a vegetarian grill alternative, no dairy at a kosher meat meal', () => {
    const t = { ...base, diets: { A: { style: 'meat', kashrut: 'kosher', allergies: [] }, B: { style: 'vegetarian', kashrut: 'none', allergies: [] } } } as Trip;
    const m = planMenu(t, fallback);
    const bbq = m.find(s => s.recipeId === 'bbq')!;
    expect(bbq.servings).toBe(3); expect(bbq.eq).toBe(2.8);
    expect(bbq.alt).toMatchObject({ recipeId: 'veg-grill', servings: 2, eq: 1.4, who: 'משפחה ב' });
    const g = grillTotals({ ...t, meals: m, grill: { meats: ['pargiot', 'kebab'], veg: ['halloumi', 'corn'] } }, fallback);
    expect(g.meatKg).toBe(1); // 2.8 × 350 g = 980 g
    expect(g.lines.find(l => l.item.id === 'pargiot')!.qty).toBeCloseTo(490);
    expect(g.lines.some(l => l.item.id === 'halloumi')).toBe(false); // kosher meat meal → parve only
    // every alternative is something the vegetarians eat, and never dairy next to meat
    for (const s of m.filter(s => s.alt)) {
      const a = RECIPE_BY_ID[s.alt!.recipeId!]; const r = RECIPE_BY_ID[s.recipeId!];
      expect(a.vegetarian || a.vegan).toBe(true);
      expect(r.kashrut === 'meat' && a.kashrut === 'dairy').toBe(false);
    }
    // no dairy snack after a meat dinner on the same evening
    const d0 = m.filter(s => s.day === 0); const snack = d0.find(s => s.type === 'snack')!;
    expect([snack.recipeId, snack.alt?.recipeId].some(id => id && RECIPE_BY_ID[id].kashrut === 'dairy')).toBe(false);
  });
  it('a vegan family only gets vegan dishes; allergies are respected', () => {
    const t = { ...base, diets: { A: { style: 'meat', kashrut: 'none', allergies: [] }, B: { style: 'vegan', kashrut: 'none', allergies: ['גלוטן'] } } } as Trip;
    const m = planMenu(t, fallback);
    for (const s of m) {
      const forB = [s.recipeId, s.alt?.recipeId].map(id => id && RECIPE_BY_ID[id]).filter(Boolean).find(r => (r as any).vegan && !(r as any).allergens.includes('גלוטן'));
      const mainOk = s.recipeId && RECIPE_BY_ID[s.recipeId].vegan && !RECIPE_BY_ID[s.recipeId].allergens.includes('גלוטן');
      expect(!!(mainOk || (s.alt && forB))).toBe(true);
    }
  });
  it('shopping list includes grill meat totals', () => {
    const t = { ...base, diets: { A: { style: 'meat', kashrut: 'kosher', allergies: [] }, B: { style: 'meat', kashrut: 'kosher', allergies: [] } }, grill: { meats: ['pargiot'], veg: ['corn'] } } as Trip;
    const m = planMenu(t, fallback);
    const line = shoppingList(m, t, fallback).find(l => l.name === 'פרגיות')!;
    expect(line.label).toBe('1.5 ק״ג'); // 4.2 eq × 350 g = 1470 g → 1.5 kg
  });
});

import { drinkPlan } from './drinks';
describe('shopping list: tidy quantities and drinks', () => {
  it('whole items read as plain counts, garlic in heads, meat in kg', () => {
    const t = { ...base, diets: { A: { style: 'meat', kashrut: 'none', allergies: [] }, B: { style: 'meat', kashrut: 'none', allergies: [] } }, grill: { meats: ['entrecote', 'pargiot'], veg: ['corn'] } } as Trip;
    const list = shoppingList(planMenu(t, fallback), t, fallback);
    const onion = list.find(l => l.name === 'בצל'); if (onion) expect(onion.label).toMatch(/^\d+$/);
    const garlic = list.find(l => l.name === 'שום')!; expect(garlic.unit).toMatch(/ראש/);
    expect(list.find(l => l.name === 'אנטריקוט')!.unit).toBe('גר׳'); // 4.2 eq × 175 g = 735 g
    expect(list.find(l => l.name === 'אנטריקוט')!.shop).toBe('meat');
  });
  it('drinks: water by recommendation, alcohol only for adults 18+ and not on day trips', () => {
    const t = { ...base, regionId: 'golan' } as Trip; // 5 people, 3 days, 2 nights, 3 adults
    const d = drinkPlan(t, {});
    expect(d.water.total).toBe(45); expect(d.lines[0].qty).toBe(5); // 45 L → 5 six-packs of 1.5 L
    expect(d.adults).toBe(3);
    expect(d.lines.find(l => l.name.startsWith('בירה'))!.qty).toBe(12); // 2 × 3 adults × 2 evenings
    expect(d.lines.find(l => l.name.startsWith('יין'))!.qty).toBe(2);
    expect(drinkPlan({ ...t, regionId: 'arava' }, {}).water.liters).toBe(5);
    expect(drinkPlan({ ...t, kind: 'day', end: t.start }, {}).lines.some(l => l.shop === 'alcohol')).toBe(false);
    expect(drinkPlan({ ...t, drinks: { alcohol: false } }, {}).lines.some(l => l.shop === 'alcohol')).toBe(false);
  });
});
