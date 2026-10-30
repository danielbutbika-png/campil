// Self-built menu: foods added to meals by hand, with a recommended quantity from the number and ages of the
// people on the trip (adult-portion equivalents, see menu.appetite). Pure functions.
import type { DietPrefs, MealSlot, MealType, MenuFood } from '../lib/types';
import { dietGroups, type MenuTrip } from './menu';
import { tripLength, uid } from '../lib/util';
import type { Food } from '../data/foods';

/** Everyone on the trip, in adult portions (a child counts as part of one). */
export const portions = (t: MenuTrip, fallback: DietPrefs) => Math.round(dietGroups(t, fallback).reduce((s, g) => s + g.eq, 0) * 10) / 10;

/** Rounded the way you buy it: whole units up, grams / ml up to 50. */
export function roundBuy(q: number, unit: string) {
  if (unit === 'יח׳') return Math.max(1, Math.ceil(q - 1e-9));
  return Math.max(50, Math.ceil(q / 50) * 50);
}
export const suggested = (per: number, unit: string, eq: number) => roundBuy(per * eq, unit);
/** The quantity for this meal: the user's number if set, otherwise the recommendation. */
export const foodQty = (i: MenuFood, eq: number) => (i.qty != null ? i.qty : i.per != null ? suggested(i.per, i.unit, eq) : 0);

export const fromFood = (x: Food): MenuFood => ({ id: uid('mf'), name: x.name, unit: x.unit, shop: x.shop, foodId: x.id, per: x.per });
export const custom = (name: string, qty: number, unit: string): MenuFood => ({ id: uid('mf'), name: name.trim(), unit, shop: 'dry', qty });

/** Which meals a day has: a day trip — lunch and a snack; camping — dinner from the first day, breakfast until the last. */
export function mealsOfDay(t: Pick<MenuTrip, 'start' | 'end' | 'kind'>, d: number): MealType[] {
  const { days } = tripLength(t.start, t.end);
  if (t.kind === 'day' || days === 1) return ['lunch', 'snack'];
  const out: MealType[] = [];
  if (d > 0) out.push('breakfast');
  out.push('lunch');
  if (d < days - 1) out.push('dinner');
  out.push('snack');
  return out;
}

/** Add a food to a meal (creating the meal if the self-built menu doesn't have it yet). */
export function addFood(meals: MealSlot[], day: number, type: MealType, item: MenuFood, people: number): MealSlot[] {
  const s = meals.find(m => m.day === day && m.type === type);
  if (s) return meals.map(m => (m === s ? { ...m, items: [...(m.items ?? []), item] } : m));
  return [...meals, { id: uid('ml'), day, type, recipeId: null, servings: people, items: [item] }];
}
export const updateFood = (meals: MealSlot[], slotId: string, itemId: string, p: Partial<MenuFood> | null): MealSlot[] =>
  meals.map(m => (m.id !== slotId ? m : { ...m, items: p ? (m.items ?? []).map(i => (i.id === itemId ? { ...i, ...p } : i)) : (m.items ?? []).filter(i => i.id !== itemId) }));

/** A rebuilt automatic menu keeps the foods added by hand: same day and meal → moved over; otherwise the old meal stays (without its dish). */
export function keepFoods(next: MealSlot[], prev: MealSlot[]): MealSlot[] {
  const out = next.map(m => ({ ...m }));
  for (const p of prev) {
    if (!p.items?.length) continue;
    const n = out.find(m => m.day === p.day && m.type === p.type);
    if (n) n.items = [...(n.items ?? []), ...p.items]; else out.push({ ...p, recipeId: null, alt: undefined });
  }
  return out;
}
