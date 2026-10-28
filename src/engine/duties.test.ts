import { describe, it, expect } from 'vitest';
import { setDuty, dutySummary, autoSplit, dutyKey } from './duties';
import { diffTrip } from '../lib/cloud/model';

const fams = [{ id: 'a', name: 'א', color: '#000' }, { id: 'b', name: 'ב', color: '#111' }] as any;
const lines = [{ key: 'בשר|ק״ג', name: 'בשר', qty: 2, unit: 'ק״ג', shop: 'meat', label: '2 ק״ג', recipes: [] }, { key: 'לחם|יח׳', name: 'לחם', qty: 3, unit: 'יח׳', shop: 'bakery', label: '3', recipes: [] }, { key: 'מלח|יח׳', name: 'מלח', qty: 1, unit: 'יח׳', shop: 'pantry', label: '1', recipes: [] }] as any;
const trip = (p: any = {}) => ({ id: 't', families: fams, participants: [], packing: [], tasks: [{ id: 'k1', text: 'גז', done: false }], meals: [{ id: 'm1', day: 0, type: 'dinner', recipeId: 'r' }, { id: 'm2', day: 1, type: 'breakfast', recipeId: 'r' }, { id: 'm3', day: 1, type: 'snack', recipeId: null }], schedule: [], pantry: { 'מלח|יח׳': true }, ...p }) as any;

describe('duties between families', () => {
  it('sets and clears a duty', () => {
    const d = setDuty({}, 'meal:m1', { familyId: 'a' });
    expect(d).toEqual({ 'meal:m1': { familyId: 'a' } });
    expect(setDuty({ duties: d }, 'meal:m1', { familyId: undefined })).toEqual({});
  });
  it('summarises per family and what nobody took', () => {
    const t = trip({ duties: { 'meal:m1': { familyId: 'a', done: true }, 'shop:בשר|ק״ג': { familyId: 'b', done: true }, 'task:k1': { familyId: 'b' } } });
    const s = dutySummary(t, lines);
    expect(s.rows.find(r => r.family.id === 'a')).toMatchObject({ meals: 1, mealsDone: 1, shop: 0 });
    expect(s.rows.find(r => r.family.id === 'b')).toMatchObject({ shop: 1, bought: 1, tasks: 1, tasksDone: 0 });
    expect(s.unassigned).toMatchObject({ meals: 1, shop: 1, tasks: 0 }); // salt is at home; the empty snack isn't a meal to prepare
  });
  it('quick split keeps existing choices, splits shopping by section and meals in rotation', () => {
    const d = autoSplit(trip({ duties: { [dutyKey.shop('לחם|יח׳')]: { familyId: 'a' } } }), lines);
    expect(d[dutyKey.shop('בשר|ק״ג')].familyId).toBe('a');
    expect(d[dutyKey.shop('לחם|יח׳')].familyId).toBe('a'); // kept
    expect(d[dutyKey.shop('מלח|יח׳')]).toBeUndefined(); // at home — nothing to buy
    expect([d['meal:m1'].familyId, d['meal:m2'].familyId]).toEqual(['a', 'b']);
  });
  it('syncs each duty as its own key', () => {
    const base = trip({ duties: { 'meal:m1': { familyId: 'a' } } });
    const p = diffTrip(base, { ...base, duties: { 'meal:m1': { familyId: 'a' }, 'shop:x': { familyId: 'b' } } });
    expect(p).toEqual([{ path: ['duties', 'shop:x'], value: { familyId: 'b' } }]);
  });
});
