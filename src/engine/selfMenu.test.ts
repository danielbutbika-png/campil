import { describe, it, expect } from 'vitest';
import { portions, suggested, foodQty, fromFood, addFood, updateFood, mealsOfDay, keepFoods } from './selfMenu';
import { FOOD_BY_ID } from '../data/foods';
import { mergePacking } from './packing';
import type { Member, MealSlot, PackItem } from '../lib/types';

const ps: Member[] = [{ id: 'a', name: 'א', role: 'adult', gender: 'm' }, { id: 'b', name: 'ב', role: 'adult', gender: 'f' }, { id: 'c', name: 'ג', role: 'child', gender: 'f' }];
const trip = { start: '2026-11-05', end: '2026-11-07', kind: 'camping' as const, adults: 2, children: 1, participants: ps };
const diet = { kosher: false, vegetarian: false, vegan: false, allergies: [] };

describe('self-built menu', () => {
  it('portions: adults count 1, a child of unknown age a typical share', () => {
    expect(portions(trip, diet)).toBe(2.6); // child without age → typical 8 → 60%
  });
  it('recommended quantity follows the people, rounded the way you buy it', () => {
    const pasta = fromFood(FOOD_BY_ID['pasta']); // 100 g per adult
    expect(foodQty(pasta, portions(trip, diet))).toBe(300); // 260 → 300 g
    expect(suggested(1.5, 'יח׳', 2.6)).toBe(4); // pitas: 3.9 → 4
    expect(foodQty({ ...pasta, qty: 500 }, 2.6)).toBe(500); // the user's number wins
  });
  it('adds foods to a meal (creating it), edits and removes them', () => {
    let m: MealSlot[] = addFood([], 1, 'dinner', fromFood(FOOD_BY_ID['rice']), 3);
    expect(m).toHaveLength(1); expect(m[0].items).toHaveLength(1);
    m = addFood(m, 1, 'dinner', fromFood(FOOD_BY_ID['tomato']), 3);
    expect(m).toHaveLength(1); expect(m[0].items).toHaveLength(2);
    m = updateFood(m, m[0].id, m[0].items![0].id, { qty: 400 }); expect(m[0].items![0].qty).toBe(400);
    m = updateFood(m, m[0].id, m[0].items![0].id, null); expect(m[0].items).toHaveLength(1);
  });
  it('which meals a day has', () => {
    expect(mealsOfDay(trip, 0)).toEqual(['lunch', 'dinner', 'snack']);
    expect(mealsOfDay(trip, 2)).toEqual(['breakfast', 'lunch', 'snack']);
    expect(mealsOfDay({ ...trip, kind: 'day', end: trip.start }, 0)).toEqual(['lunch', 'snack']);
  });
  it('rebuilding the automatic menu keeps foods added by hand', () => {
    const prev = addFood([], 0, 'lunch', fromFood(FOOD_BY_ID['watermelon']), 3);
    const next: MealSlot[] = [{ id: 'n1', day: 0, type: 'lunch', recipeId: 'x', servings: 3 }];
    const out = keepFoods(next, prev);
    expect(out[0].recipeId).toBe('x'); expect(out[0].items![0].name).toContain('אבטיח');
  });
});

describe('gear list edits survive a recalculation', () => {
  const gen: PackItem = { id: 'g1', name: 'פנס', category: 'power', qty: 2, reason: 'r', source: 'rule', packed: false };
  it('a quantity set by hand is kept', () => {
    const out = mergePacking([{ ...gen, qty: 5, qtyEdited: true }], [{ ...gen, id: 'new', qty: 3 }]);
    expect(out[0].qty).toBe(5);
  });
  it('without a hand edit the new quantity applies', () => {
    expect(mergePacking([gen], [{ ...gen, id: 'new', qty: 3 }])[0].qty).toBe(3);
  });
});
