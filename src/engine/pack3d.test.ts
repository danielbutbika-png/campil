import { describe, it, expect } from 'vitest';
import { packTrunk } from './pack3d';

const T = { depth: 100, width: 100, height: 50 };
const inside = (r: ReturnType<typeof packTrunk>) => r.placed.every(p => p.x >= 0 && p.y >= 0 && p.z >= 0 && p.x + p.d <= T.depth && p.y + p.w <= T.width && p.z + p.h <= T.height);
const noOverlap = (r: ReturnType<typeof packTrunk>) => r.placed.every((a, i) => r.placed.every((b, j) => i === j || !(a.x < b.x + b.d && b.x < a.x + a.d && a.y < b.y + b.w && b.y < a.y + a.w && a.z < b.z + b.h && b.z < a.z + a.h)));

describe('trunk packing by dimensions', () => {
  it('fills the floor with four boxes, all inside and not overlapping', () => {
    const r = packTrunk(T, [{ id: 'b', name: 'ארגז', dims: [50, 50, 30], qty: 4 }]);
    expect(r.placed).toHaveLength(4); expect(r.unplaced).toHaveLength(0);
    expect(inside(r) && noOverlap(r)).toBe(true);
    expect(r.placed.every(p => p.z === 0)).toBe(true);
  });
  it('lays a long item flat rather than standing it up past the window line', () => {
    const r = packTrunk(T, [{ id: 'tent', name: 'אוהל', dims: [25, 90, 25] }]);
    expect(r.placed[0].h).toBe(25);
  });
  it('rejects what cannot fit and explains why', () => {
    const r = packTrunk(T, [{ id: 'x', name: 'קרש', dims: [150, 20, 5] }, { id: 'y', name: 'עמוד', dims: [60, 60, 60] }]);
    expect(r.unplaced.map(u => u.reason).sort()).toEqual(['too-big', 'too-tall']);
  });
  it('reports "no room" once the space under the window line is full', () => {
    const r = packTrunk(T, [{ id: 'b', name: 'ארגז', dims: [50, 50, 25], qty: 9 }]);
    expect(r.placed).toHaveLength(8); expect(r.unplaced[0].reason).toBe('no-room');
    expect(r.maxZ).toBeLessThanOrEqual(50);
  });
  it('puts heavy items low and against the seat back, and never on soft bags', () => {
    const r = packTrunk(T, [
      { id: 'soft', name: 'תיק רך', dims: [100, 100, 20], soft: true },
      { id: 'heavy', name: 'מים', dims: [30, 30, 20], weightKg: 9 },
    ]);
    const heavy = r.placed.find(p => p.id === 'heavy')!;
    expect(heavy.z).toBe(0); expect(heavy.x).toBe(0);
    expect(r.placed.find(p => p.id === 'soft')).toBeUndefined(); // the bag no longer fits once the floor is used — it is reported, not squeezed
  });
  it('items needed on the way go to the tailgate end and are loaded last', () => {
    const r = packTrunk(T, [{ id: 'cool', name: 'צידנית', dims: [40, 40, 40], needOnWay: true }, { id: 'b', name: 'ארגז', dims: [40, 40, 30] }]);
    const cool = r.placed.find(p => p.id === 'cool')!;
    expect(cool.x + cool.d).toBe(T.depth);
  });
  it('fits a long bag along the seat back when a volume-first order would leave it out', () => {
    const r = packTrunk({ depth: 100, width: 120, height: 40 }, [
      { id: 'tent', name: 'אוהל', dims: [117, 23, 25], soft: true },
      { id: 'a', name: 'ארגז', dims: [75, 60, 35] }, { id: 'b', name: 'ארגז', dims: [75, 60, 35] },
    ]);
    expect(r.unplaced).toEqual([]);
  });
  it('lists items without dimensions separately instead of guessing', () => {
    const r = packTrunk(T, [{ id: 'm', name: 'מזרן', qty: 2 }]);
    expect(r.unknown).toEqual([{ id: 'm', name: 'מזרן' }]); expect(r.placed).toHaveLength(0);
  });
});
