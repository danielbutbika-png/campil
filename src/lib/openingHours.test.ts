import { describe, it, expect } from 'vitest';
import { openAt } from './openingHours';
// 2026-11-02 is a Monday, 2026-11-06 a Friday
describe('opening_hours (simple forms only)', () => {
  it('a Fri–Sat coffee cart is closed on Monday and open Friday morning', () => {
    expect(openAt('Fr-Sa 07:00-13:00', '2026-11-02', '09:10')).toBe(false);
    expect(openAt('Fr-Sa 07:00-13:00', '2026-11-06', '09:10')).toBe(true);
    expect(openAt('Fr-Sa 07:00-13:00', '2026-11-06', '14:00')).toBe(false);
  });
  it('several rules, lists, off, 24/7', () => {
    expect(openAt('Mo-Th 08:00-16:00; Fr 08:00-13:00; Sa off', '2026-11-06', '12:00')).toBe(true);
    expect(openAt('Mo,We 10:00-12:00,16:00-20:00', '2026-11-02', '17:00')).toBe(true);
    expect(openAt('24/7', '2026-11-02', '03:00')).toBe(true);
  });
  it('anything complex is "unknown", never a guess', () => {
    expect(openAt('Mo-Fr 08:00-17:00; PH off', '2026-11-02', '09:00')).toBeNull();
    expect(openAt('sunrise-sunset', '2026-11-02', '09:00')).toBeNull();
    expect(openAt(undefined, '2026-11-02', '09:00')).toBeNull();
  });
});
