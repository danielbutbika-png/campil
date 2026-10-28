import { describe, it, expect } from 'vitest';
import { whatCanICook, allIngredients, gearFromInventory } from './cook';
import { RECIPE_BY_ID } from '../data/recipes';

const shak = RECIPE_BY_ID['shakshuka'];
const need = shak.ingredients.map(i => i.name);

describe('what can we cook', () => {
  it('a recipe is ready when every ingredient and tool is there', () => {
    const r = whatCanICook(need, shak.gear).find(m => m.recipe.id === 'shakshuka')!;
    expect(r.status).toBe('ready'); expect(r.missingIng).toEqual([]);
  });
  it('"almost" lists what is missing (ingredients and tools count together)', () => {
    const r = whatCanICook(need.slice(1), shak.gear).find(m => m.recipe.id === 'shakshuka')!;
    expect(r.status).toBe('almost'); expect(r.missingIng).toEqual([need[0]]);
    const g = whatCanICook(need, [shak.gear[0]]).find(m => m.recipe.id === 'shakshuka')!;
    expect(g.status).toBe('almost'); expect(g.missingGear).toEqual(shak.gear.slice(1));
    expect(whatCanICook(need.slice(2), []).find(m => m.recipe.id === 'shakshuka')!.status).toBe('far');
  });
  it('ready recipes come first; vegan diet filters out eggs', () => {
    const list = whatCanICook(need, shak.gear);
    expect(list[0].status).toBe('ready');
    expect(whatCanICook(need, shak.gear, { style: 'vegan', kashrut: 'none', allergies: [] }).some(m => m.recipe.id === 'shakshuka')).toBe(false);
  });
  it('basics like salt and oil are not asked for', () => {
    expect(allIngredients()).not.toContain('מלח');
  });
  it('finds owned gear from the inventory by name', () => {
    expect(gearFromInventory([{ id: 'g', name: 'כירת גז / גזייה', category: 'kitchen', qty: 1, status: 'have' } as any])).toContain('גזייה');
  });
});
