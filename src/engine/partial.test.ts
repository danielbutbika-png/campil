import { describe, it, expect } from 'vitest';
import { coverage, setShare, packedUnits, packUnits } from './partial';
import { diffTrip } from '../lib/cloud/model';

describe('partial quantities', () => {
  it('sums what families bring and what is missing', () => {
    expect(coverage({ qty: 10, brings: { a: 5 } })).toEqual({ need: 10, brought: 5, missing: 5, covered: false });
    expect(coverage({ qty: 10, brings: { a: 5, b: 5 } }).covered).toBe(true);
    expect(coverage({ qty: 4 }).missing).toBe(4);
  });
  it('caps a family share at what others left, and 0 removes it', () => {
    expect(setShare({ qty: 10, brings: { b: 7 } }, 'a', 5)).toEqual({ b: 7, a: 3 });
    expect(setShare({ qty: 10, brings: { a: 5, b: 2 } }, 'a', 0)).toEqual({ b: 2 });
    expect(setShare({ qty: 10 }, 'a', -3)).toEqual({});
  });
  it('packs part of an item and completes when all units are packed', () => {
    expect(packUnits({ qty: 10 }, 5)).toEqual({ packed: false, packedQty: 5 });
    expect(packUnits({ qty: 10 }, 10)).toEqual({ packed: true, packedQty: undefined });
    expect(packUnits({ qty: 10 }, 0)).toEqual({ packed: false, packedQty: undefined });
    expect(packedUnits({ qty: 10, packed: false, packedQty: 5 })).toBe(5);
    expect(packedUnits({ qty: 10, packed: true })).toBe(10);
  });
  it('syncs each family share as its own field (no overwrite between families)', () => {
    const base: any = { id: 't', packing: [{ id: 'w', name: 'מים', qty: 10, brings: { a: 5 } }], tasks: [], schedule: [], meals: [] };
    const next: any = { ...base, packing: [{ ...base.packing[0], brings: { a: 5, b: 3 } }] };
    const patches = diffTrip(base, next).filter(p => p.path[0] === 'packing');
    expect(patches).toEqual([{ path: ['packing', 'w', 'brings', 'b'], value: 3 }]);
  });
});
