import { describe, it, expect } from 'vitest';
import { unitLiters, checkState, needsCheck, tripsUsing, warehouseStats } from './warehouse';
import { addMonths } from '../lib/util';

const item = (p: any = {}) => ({ id: 'g1', name: 'אוהל', category: 'shelter', qty: 1, status: 'have', ...p }) as any;

describe('warehouse', () => {
  it('uses entered volume first, otherwise computes from dimensions, otherwise unknown', () => {
    expect(unitLiters({ volumeL: 30, dims: [10, 10, 10] })).toBe(30);
    expect(unitLiters({ dims: [60, 20, 20] })).toBe(24);
    expect(unitLiters({ dims: [60, 0, 20] })).toBeNull();
    expect(unitLiters({})).toBeNull();
  });
  it('adds months without overflowing short months', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2026-10-28', 12)).toBe('2027-10-28');
  });
  it('knows when a periodic check is due', () => {
    expect(checkState(item(), '2026-10-28').state).toBe('none');
    expect(checkState(item({ checkEveryMonths: 6 }), '2026-10-28').state).toBe('never');
    expect(checkState(item({ checkEveryMonths: 6, lastChecked: '2026-04-28' }), '2026-10-28')).toEqual({ state: 'due', next: '2026-10-28' });
    expect(checkState(item({ checkEveryMonths: 6, lastChecked: '2026-05-01' }), '2026-10-28').state).toBe('ok');
    expect(needsCheck(item({ status: 'check' }), '2026-10-28')).toBe(true);
  });
  it('lists only upcoming trips that still pack the item', () => {
    const t = (id: string, start: string, end: string, packing: any[], status = 'planning') => ({ id, start, end, status, packing }) as any;
    const trips = [
      t('past', '2026-09-01', '2026-09-03', [{ inventoryId: 'g1' }]),
      t('later', '2026-12-01', '2026-12-03', [{ inventoryId: 'g1' }]),
      t('soon', '2026-11-01', '2026-11-03', [{ inventoryId: 'g1' }]),
      t('removed', '2026-11-05', '2026-11-06', [{ inventoryId: 'g1', removed: true }]),
      t('done', '2026-11-07', '2026-11-08', [{ inventoryId: 'g1' }], 'done'),
    ];
    expect(tripsUsing('g1', trips, '2026-10-28').map(x => x.id)).toEqual(['soon', 'later']);
  });
  it('totals only entered data and reports what is missing', () => {
    const s = warehouseStats([item({ qty: 2, weightKg: 1.5, dims: [10, 10, 10] }), item({ id: 'g2', owner: 'משפחתי' }), item({ id: 'g4', borrowedFrom: 'משפחת לוי' }), item({ id: 'g3', checkEveryMonths: 12 })], '2026-10-28');
    expect(s).toEqual({ items: 4, units: 5, weightKg: 3, weighed: 1, liters: 2, sized: 1, due: 1, borrowed: 1 });
  });
});
