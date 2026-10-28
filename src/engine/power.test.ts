import { describe, it, expect } from 'vitest';
import { batteryWh, dailyWh, runtime } from './power';

describe('power calculator', () => {
  it('converts mAh to Wh only with a voltage', () => {
    expect(batteryWh({ name: 'סוללה', mah: 20000, volts: 3.7 })).toBe(74);
    expect(batteryWh({ name: 'סוללה', mah: 20000 })).toBeNull();
    expect(batteryWh({ name: 'תחנה', wh: 300, count: 2 })).toBe(600);
  });
  it('sums daily use of devices', () => {
    expect(dailyWh([{ name: 'מאוורר', watts: 5, hoursPerDay: 8 }, { name: 'פנס', watts: 3, hoursPerDay: 4, count: 2 }])).toBe(64);
  });
  it('gives a range, not a single number, and reports batteries it cannot count', () => {
    const r = runtime([{ name: 'א', mah: 20000, volts: 3.7 }, { name: 'ב', mah: 10000 }], [{ name: 'מאוורר', watts: 5, hoursPerDay: 8 }]);
    expect(r.totalWh).toBe(74); expect(r.usable).toEqual([44.4, 62.9]);
    expect(r.days).toEqual([1.1, 1.6]); expect(r.missing).toEqual(['ב']);
    expect(runtime([{ name: 'א', wh: 100 }], []).days).toBeNull();
  });
});
