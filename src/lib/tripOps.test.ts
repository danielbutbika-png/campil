import { describe, it, expect } from 'vitest';
import { duplicateTrip, recentlyEnded } from './tripOps';

const t = (p: any = {}) => ({ id: 'a', name: 'כנרת', start: '2026-10-01', end: '2026-10-03', status: 'done', rating: 4, packing: [{ id: 'p', packed: true, packedQty: 2, brings: { f: 2 } }], tasks: [{ id: 'k', done: true }], shared: { cloudId: 'X', role: 'owner' }, duties: { 'meal:1': { familyId: 'f' } }, pantry: { a: true }, lessons: 'עוד שמיכה', ...p }) as any;

describe('trip operations', () => {
  it('a copy is fresh, dated two weeks ahead, and never linked to the shared original', () => {
    const n = duplicateTrip(t(), '2026-10-28');
    expect(n.id).not.toBe('a'); expect(n.shared).toBeUndefined();
    expect([n.start, n.end]).toEqual(['2026-11-11', '2026-11-13']);
    expect(n.status).toBe('planning'); expect(n.rating).toBeUndefined();
    expect(n.packing[0]).toMatchObject({ packed: false, packedQty: undefined, brings: undefined });
    expect(n.tasks[0].done).toBe(false); expect(n.duties).toEqual({}); expect(n.pantry).toEqual({});
    expect([n.lessons, n.lessonsFrom]).toEqual(['עוד שמיכה', 'כנרת']);
  });
  it('finds the trip that ended in the last week, ignoring the example', () => {
    const trips = [t({ id: 'old', end: '2026-10-10' }), t({ id: 'ex', end: '2026-10-27', example: true }), t({ id: 'r', end: '2026-10-25' }), t({ id: 'now', end: '2026-10-29' })];
    expect(recentlyEnded(trips, '2026-10-28')?.id).toBe('r');
    expect(recentlyEnded([trips[0]], '2026-10-28')).toBeUndefined();
  });
});
