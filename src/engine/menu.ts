// Shared menu for everyone on the trip, built from each family's diet:
// every meal has a main dish for as many people as possible, plus an alternative for those who don't eat it.
import { ageOf } from '../lib/people';
import type { DietPrefs, FamilyDiet, MealSlot, MealType, Member, Trip } from '../lib/types';
import { RECIPES, RECIPE_BY_ID, type Recipe, type Ingredient } from '../data/recipes';
import { GRILL_BY_ID, DEFAULT_GRILL, MEATS, VEG, type GrillItem } from '../data/grill';
import { tripLength, uid } from '../lib/util';

export type MenuTrip = Pick<Trip, 'start' | 'end' | 'kind' | 'adults' | 'children'> & Partial<Pick<Trip, 'participants' | 'families' | 'diets' | 'grill' | 'groceries'>>;
export interface DietGroup { key: string; name: string; people: Member[]; diet: FamilyDiet; eq: number }

export const STYLE_HE = { meat: 'אוכלים הכול', vegetarian: 'צמחוני', vegan: 'טבעוני' } as const;
export const KASHRUT_HE = { none: 'ללא הקפדה', kosher: 'כשר', mehadrin: 'כשר למהדרין' } as const;

export const dietFromSettings = (d: DietPrefs): FamilyDiet => ({ style: d.vegan ? 'vegan' : d.vegetarian ? 'vegetarian' : 'meat', kashrut: d.kosher ? 'kosher' : 'none', allergies: [...d.allergies] });

/** Portion size by age, as a share of an adult portion (planning estimate). */
export function appetite(m: Member) {
  const a = ageOf(m);
  return a < 4 ? 0.4 : a < 9 ? 0.6 : a < 13 ? 0.8 : 1;
}
export const APPETITE_NOTE = 'מנה מלאה למבוגר ולגיל 13+; גיל 9–12 כ-80%, 4–8 כ-60%, עד 4 כ-40% (הערכה — אפשר לשנות מספר סועדים בכל ארוחה)';

/** One group per family (or a single group for a one-family trip). */
export function dietGroups(t: MenuTrip, fallback: DietPrefs): DietGroup[] {
  const ps = t.participants?.length ? t.participants : Array.from({ length: Math.max(1, t.adults + t.children) }, (_, i) => ({ id: `p${i}`, name: '', role: i < t.adults ? 'adult' : 'child' } as Member));
  const base = dietFromSettings(fallback);
  const mk = (key: string, name: string, people: Member[]): DietGroup => ({ key, name, people, diet: t.diets?.[key] ?? base, eq: people.reduce((s, m) => s + appetite(m), 0) });
  if (t.families && t.families.length > 1) return t.families.map(f => mk(f.id, f.name, ps.filter(p => (p.familyId ?? t.families![0].id) === f.id))).filter(g => g.people.length);
  return [mk('all', '', ps)];
}

export function eats(d: FamilyDiet, r: Recipe) {
  if (d.style === 'vegan' && !r.vegan) return false;
  if (d.style === 'vegetarian' && !(r.vegetarian || r.vegan)) return false;
  return !r.allergens.some(a => d.allergies.includes(a));
}
export const anyKosher = (gs: DietGroup[]) => gs.some(g => g.diet.kashrut !== 'none');
export const anyMehadrin = (gs: DietGroup[]) => gs.some(g => g.diet.kashrut === 'mehadrin');
/** In a meal eaten together, a kosher table doesn't mix a meat dish with a dairy dish. */
const clash = (a: Recipe, b: Recipe) => (a.kashrut === 'meat' && b.kashrut === 'dairy') || (a.kashrut === 'dairy' && b.kashrut === 'meat');

export function planMenu(t: MenuTrip, fallback: DietPrefs): MealSlot[] {
  const { days } = tripLength(t.start, t.end);
  const gs = dietGroups(t, fallback);
  const total = gs.reduce((s, g) => s + g.people.length, 0) || 1;
  const kosher = anyKosher(gs);
  const used = new Map<string, number>();
  const use = (r: Recipe | undefined) => { if (r) used.set(r.id, (used.get(r.id) ?? 0) + 1); return r; };
  const cover = (r: Recipe) => gs.filter(g => eats(g.diet, r));
  const slots: MealSlot[] = [];
  let bbqDone = false;

  // kosher: no dairy snack in the evening right after a meat dinner
  const choose = (type: MealType, noDairy = false): MealSlot => {
    const pool = RECIPES.filter(r => r.types.includes(type) && cover(r).length && !(noDairy && r.kashrut === 'dairy'));
    let main: Recipe | undefined;
    // the first dinner of a camping trip is a BBQ when anyone eats meat
    if (type === 'dinner' && !bbqDone && t.kind !== 'day' && gs.some(g => g.diet.style === 'meat')) { main = RECIPE_BY_ID.bbq; bbqDone = true; }
    else main = pool.map(r => ({ r, s: (cover(r).reduce((n, g) => n + g.people.length, 0) / total) * 10 - (used.get(r.id) ?? 0) * 4 }))
      .sort((a, b) => b.s - a.s)[0]?.r;
    use(main);
    if (!main) return { id: uid('m'), day: 0, type, recipeId: null, servings: total };
    const inMain = cover(main), out = gs.filter(g => !inMain.includes(g));
    const slot: MealSlot = { id: uid('m'), day: 0, type, recipeId: main.id, servings: inMain.reduce((n, g) => n + g.people.length, 0), eq: round1(inMain.reduce((n, g) => n + g.eq, 0)) };
    if (out.length) {
      const ok = (r: Recipe) => out.every(g => eats(g.diet, r)) && !(kosher && clash(main!, r)) && !(noDairy && r.kashrut === 'dairy');
      const pref = main.grill === 'meat' && ok(RECIPE_BY_ID['veg-grill']) ? RECIPE_BY_ID['veg-grill'] : undefined;
      const alt = pref ?? [...RECIPES.filter(r => r.types.includes(type) && ok(r)), ...RECIPES.filter(r => !r.types.includes(type) && ok(r))]
        .sort((a, b) => (used.get(a.id) ?? 0) - (used.get(b.id) ?? 0))[0];
      use(alt);
      slot.alt = { recipeId: alt?.id ?? null, servings: out.reduce((n, g) => n + g.people.length, 0), eq: round1(out.reduce((n, g) => n + g.eq, 0)), who: out.map(g => g.name || STYLE_HE[g.diet.style]).join(', ') };
    }
    return slot;
  };

  for (let d = 0; d < days; d++) {
    const types: MealType[] = t.kind === 'day' ? ['lunch', 'snack'] : d === 0 ? ['lunch', 'dinner', 'snack'] : d === days - 1 ? ['breakfast', 'lunch'] : ['breakfast', 'lunch', 'dinner', 'snack'];
    let meatDinner = false;
    for (const ty of types) {
      const s: MealSlot = { ...choose(ty, kosher && ty === "snack" && meatDinner), day: d };
      if (ty === 'dinner') meatDinner = [s.recipeId, s.alt?.recipeId].some(id => id && RECIPE_BY_ID[id]?.kashrut === 'meat');
      slots.push(s);
    }
  }
  return slots;
}
const round1 = (n: number) => Math.round(n * 10) / 10;

// ── grill ──
/** Grill items that fit a dish: vegan eaters get vegan items; a kosher meal with meat gets no dairy. */
export function grillItemsFor(kind: 'meat' | 'veg', t: MenuTrip, opts: { vegan?: boolean; noDairy?: boolean } = {}): GrillItem[] {
  const g = t.grill ?? DEFAULT_GRILL;
  const ids = kind === 'meat' ? g.meats : g.veg;
  let items = ids.map(id => GRILL_BY_ID[id]).filter(Boolean);
  if (kind === 'veg') items = items.filter(i => (!opts.vegan || i.vegan) && (!opts.noDairy || i.kashrut !== 'dairy'));
  if (!items.length) items = (kind === 'meat' ? MEATS.slice(0, 1) : VEG.filter(i => i.vegan).slice(0, 1));
  return items;
}
/** Per-adult-portion ingredients for the grilled part of a dish: the chosen items share one portion. */
export function grillIngredients(items: GrillItem[], withExtras = true): Ingredient[] {
  const n = items.length;
  return items.flatMap(i => [{ ...i.portion, qty: i.portion.qty / n }, ...(withExtras ? i.recipe.extra.map(e => ({ ...e, qty: e.qty / n })) : [])]);
}
export interface DishContext { vegan: boolean; noDairy: boolean }
export function dishContext(t: MenuTrip, fallback: DietPrefs, s: MealSlot, which: 'main' | 'alt'): DishContext {
  const gs = dietGroups(t, fallback);
  const main = s.recipeId ? RECIPE_BY_ID[s.recipeId] : null, alt = s.alt?.recipeId ? RECIPE_BY_ID[s.alt.recipeId] : null;
  const r = which === 'main' ? main : alt; const other = which === 'main' ? alt : main;
  const eaters = r ? gs.filter(g => (which === 'main' ? eats(g.diet, r) : !main || !eats(g.diet, main))) : [];
  return { vegan: eaters.some(g => g.diet.style === 'vegan'), noDairy: anyKosher(gs) && other?.kashrut === 'meat' };
}

/** Totals of grilled items over the whole trip, for the "how much meat" card. */
export function grillTotals(t: MenuTrip & { meals: MealSlot[] }, fallback: DietPrefs) {
  const out = new Map<string, { item: GrillItem; qty: number; unit: string }>();
  let meatMeals = 0, meatEq = 0;
  const add = (items: GrillItem[], eq: number) => { for (const it of items) { const o = out.get(it.id) ?? { item: it, qty: 0, unit: it.portion.unit }; o.qty += (it.portion.qty / items.length) * eq; out.set(it.id, o); } };
  for (const s of t.meals) {
    for (const which of ['main', 'alt'] as const) {
      const id = which === 'main' ? s.recipeId : s.alt?.recipeId; const r = id ? RECIPE_BY_ID[id] : null; if (!r?.grill) continue;
      const eq = which === 'main' ? s.eq ?? s.servings : s.alt!.eq ?? s.alt!.servings;
      const ctx = dishContext(t, fallback, s, which);
      if (r.grill === 'meat') { meatMeals++; meatEq += eq; }
      add(grillItemsFor(r.grill, t, ctx), eq);
    }
  }
  const meatG = [...out.values()].filter(o => o.item.kashrut === 'meat').reduce((s, o) => s + o.qty, 0);
  return { lines: [...out.values()], meatMeals, meatEq: round1(meatEq), meatKg: Math.round(meatG / 100) / 10 };
}
