import { describe, it, expect } from 'vitest';
import { proposalFor, applyProposal } from './actions';
import type { Trip, PackItem } from '../lib/types';
import type { Recommendation } from './engine';

const pk = (name: string, p: Partial<PackItem> = {}): PackItem => ({ id: name, name, category: 'misc', qty: 1, reason: '', source: 'rule', packed: false, ...p });
const ps = [1, 2, 3, 4].map(i => ({ id: `p${i}`, name: `x${i}`, role: 'adult' as const, gender: 'm' as const }));
const trip = (p: Partial<Trip> = {}): Trip => ({ id: 't', name: '', createdAt: '', start: '2026-11-05', end: '2026-11-06', adults: 4, children: 0, childAges: [], memberIds: [], participants: ps,
  pets: false, kind: 'camping', lodging: 'tent', vehicle: '', regionId: 'golan', siteIds: [], interests: [], difficulty: 'any', budget: 'any', packing: [], meals: [], pantry: {}, schedule: [], tasks: [], status: 'planning', ...p });
const rec = (id: string): Recommendation => ({ id, kind: id, level: 'warn', title: '', why: '', evidence: [], source: { kind: 'auto', label: '' }, updatedAt: 0, certainty: 'high', priority: 0, engine: 'rules', sig: '' });

describe('actions behind recommendations — preview, then only what was approved', () => {
  it('charge → one task per item, the evening before; only the approved lines are added', () => {
    const t = trip({ packing: [pk('פנס ראש'), pk('מטען נייד', { category: 'power' }), pk('כיסא')] });
    const p = proposalFor(rec('charge'), t)!;
    expect(p.items.map(i => i.label)).toEqual(['לטעון: פנס ראש', 'לטעון: מטען נייד']);
    const patch = applyProposal(t, p, [p.items[0].id]);
    expect(patch.tasks).toHaveLength(1); expect(patch.tasks![0]).toMatchObject({ text: 'לטעון: פנס ראש', dueOffsetDays: -1, done: false });
  });
  it('no duplicate proposal when the task already exists', () => {
    const t = trip({ packing: [pk('פנס ראש')], tasks: [{ id: 'k', when: '', text: 'לטעון: פנס ראש', done: false, dueOffsetDays: -1 }] });
    expect(proposalFor(rec('charge'), t)).toBeUndefined();
  });
  it('food → servings brought up to the number of people, portions scaled', () => {
    const t = trip({ meals: [{ id: 'm', day: 0, type: 'dinner', recipeId: 'shakshuka', servings: 2, eq: 2 }] });
    const p = proposalFor(rec('food-count'), t)!;
    expect(p.items[0].detail).toBe('2 → 4 סועדים');
    expect(applyProposal(t, p, ['m']).meals![0]).toMatchObject({ servings: 4, eq: 4 });
    expect(applyProposal(t, p, []).meals![0].servings).toBe(2); // nothing approved — nothing changes
  });
  it('forecast → concrete gear, skipping what the list already has', () => {
    const t = trip({ packing: [pk('מעיל גשם')] });
    const p = proposalFor(rec('wx-rain'), t)!;
    expect(p.items.map(i => i.label)).not.toContain('מעיל גשם לכל משתתף');
    const patch = applyProposal(t, p, p.items.map(i => i.id));
    expect(patch.packing!.slice(1).every(x => x.source === 'manual' && x.reason.includes('תחזית'))).toBe(true);
  });
  it('recommendations without a safe change have no action', () => {
    expect(proposalFor(rec('flood'), trip())).toBeUndefined();
    expect(proposalFor(rec('site-x'), trip())).toBeUndefined();
  });
});
