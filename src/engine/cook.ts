// "What can we cook from what we have?" — matches the recipe book against ingredients and gear the user marked.
// Salt, oil and spices are treated as pantry basics so they don't block a match (and are listed as assumed).
import { RECIPES, type Recipe } from '../data/recipes';
import type { FamilyDiet, GearItem } from '../lib/types';
import { eats } from './menu';

export const BASICS = ['מלח', 'פלפל שחור', 'שמן', 'שמן זית', 'סוכר', 'תבלינים', 'מים'];
const isBasic = (n: string) => BASICS.some(b => n === b || n.startsWith(b + ' '));

export const allIngredients = () => [...new Set(RECIPES.flatMap(r => r.ingredients.map(i => i.name)).filter(n => !isBasic(n)))].sort((a, b) => a.localeCompare(b, 'he'));
export const allGear = () => [...new Set(RECIPES.flatMap(r => r.gear))].sort((a, b) => a.localeCompare(b, 'he'));

/** Gear the family owns that matches a recipe's gear words (e.g. "גזייה" ↔ "כירת גז / גזייה"). */
export function gearFromInventory(inv: GearItem[]): string[] {
  const names = inv.filter(g => g.available !== false && g.status !== 'buy').map(g => g.name);
  return allGear().filter(w => { const stem = w.split(' ')[0].replace(/[יה]$/, ''); return stem.length > 2 && names.some(n => n.includes(stem)); });
}

export interface CookMatch { recipe: Recipe; missingIng: string[]; missingGear: string[]; have: number; total: number; status: 'ready' | 'almost' | 'far'; assumed: string[] }
export function whatCanICook(haveIng: string[], haveGear: string[], diet?: FamilyDiet, maxMissing = 2): CookMatch[] {
  const I = new Set(haveIng), G = new Set(haveGear);
  return RECIPES.filter(r => !r.grill && (!diet || eats(diet, r)))
    .map(r => {
      const need = r.ingredients.filter(i => !isBasic(i.name)).map(i => i.name);
      const missingIng = need.filter(n => !I.has(n));
      const missingGear = r.gear.filter(g => !G.has(g));
      const have = need.length - missingIng.length;
      const status: CookMatch['status'] = !missingIng.length && !missingGear.length ? 'ready' : missingIng.length + missingGear.length <= maxMissing ? 'almost' : 'far';
      return { recipe: r, missingIng, missingGear, have, total: need.length, status, assumed: r.ingredients.filter(i => isBasic(i.name)).map(i => i.name) };
    })
    .filter(m => m.have > 0 || m.status === 'ready')
    .sort((a, b) => ['ready', 'almost', 'far'].indexOf(a.status) - ['ready', 'almost', 'far'].indexOf(b.status) || a.missingIng.length - b.missingIng.length || b.have - a.have);
}
