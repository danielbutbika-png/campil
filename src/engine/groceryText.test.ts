import { describe, it, expect } from 'vitest';
import { parseLine, parseList, sectionOf, toMenuFood } from './groceryText';

const p = (s: string) => parseLine(s)!;
describe('free-text shopping lines', () => {
  it('quantity and unit before or after the item; weights become grams', () => {
    expect(p('2 קילו עוף')).toMatchObject({ name: 'עוף', qty: 2000, unit: 'גר׳', shop: 'meat' });
    expect(p('פיתות 20')).toMatchObject({ name: 'פיתות', qty: 20, unit: 'יח׳', shop: 'bakery' });
    expect(p('500 גרם גבינה צהובה')).toMatchObject({ name: 'גבינה צהובה', qty: 500, unit: 'גר׳', shop: 'cold' });
    expect(p('1.5 ליטר חלב')).toMatchObject({ name: 'חלב', qty: 1500, unit: 'מ״ל', shop: 'cold' });
  });
  it('Hebrew number words, halves and packages', () => {
    expect(p('חצי קילו פלפלים')).toMatchObject({ name: 'פלפלים', qty: 500, unit: 'גר׳', shop: 'fresh' });
    expect(p('קילו וחצי עגבניות')).toMatchObject({ name: 'עגבניות', qty: 1500, unit: 'גר׳' });
    expect(p('שלוש חבילות פסטה')).toMatchObject({ name: 'פסטה', qty: 3, unit: 'חבילות', shop: 'dry' });
    expect(p('שישייה מים')).toMatchObject({ name: 'מים', qty: 1, unit: 'שישיות', shop: 'drinks' });
    expect(p('ביצים x2')).toMatchObject({ name: 'ביצים', qty: 2 });
  });
  it('sections by keyword, specific words first', () => {
    expect(sectionOf('שוקולד מריר')).toBe('dry');
    expect(sectionOf('שוקיים')).toBe('meat');
    expect(sectionOf('חלות')).toBe('bakery');
    expect(sectionOf('חלב')).toBe('cold');
    expect(sectionOf('בירה')).toBe('alcohol');
    expect(sectionOf('פחמים למנגל')).toBe('other');
    expect(sectionOf('והעגבניות')).toBe('fresh');
    expect(sectionOf('משהו מוזר')).toBe('other');
  });
  it('a list: one item per line or comma; bullets and numbering ignored', () => {
    const l = parseList('- 2 קילו עוף\n1. פיתות 20, חומוס;\n\n• 3 חבילות פסטה');
    expect(l.map(x => x.name)).toEqual(['עוף', 'פיתות', 'חומוס', 'פסטה']);
  });
  it('no quantity: a known food follows the number of people; anything else is one unit', () => {
    expect(toMenuFood(p('חומוס'))).toMatchObject({ foodId: 'hummus', per: 60 });
    expect(toMenuFood(p('מלוואח'))).toMatchObject({ name: 'מלוואח', qty: 1, unit: 'יח׳', shop: 'other' });
    expect(toMenuFood(p('2 קילו עוף'))).toMatchObject({ name: 'עוף', qty: 2000, unit: 'גר׳', shop: 'meat' });
  });
});
