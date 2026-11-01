import { describe, it, expect } from 'vitest';
import { orderStops, timeline, STAY_MIN } from './dayBuilder';
import type { DiscPlace } from '../services/discover';

const P = (id: string, cat: DiscPlace['cat'], dLat: number): DiscPlace => ({ id, name: id, lat: 32.9 + dLat, lon: 35.7, cat, catSure: true, source: 'osm' });
const base = { lat: 32.9, lon: 35.7 };
const S = (p: DiscPlace) => ({ p, stay: STAY_MIN[p.cat] });

describe('build my day', () => {
  it('coffee first, the restaurant around lunch, back to base at the end', () => {
    const order = orderStops(base, [S(P('rest', 'restaurant', 0.05)), S(P('trail', 'trail', 0.1)), S(P('cart', 'cart', 0.02)), S(P('view', 'view', 0.12))]);
    expect(order[0].p.id).toBe('cart');
    const rows = timeline(order, base, '09:00');
    const lunch = rows.find(r => r.stop?.p.id === 'rest')!;
    expect(lunch.at >= '11:30' && lunch.at <= '14:30').toBe(true);
    expect(rows[0].kind).toBe('leave'); expect(rows.at(-1)!.kind).toBe('return');
  });
  it('drive times from routing are used; without them each leg is an estimate', () => {
    const order = [S(P('a', 'view', 0.05)), S(P('b', 'trail', 0.1))];
    const real = timeline(order, base, '09:00', [10, 15, 20]);
    expect(real[1].at).toBe('09:10'); expect(real[1].driveEstimated).toBe(false); expect(real.at(-1)!.drive).toBe(20);
    expect(timeline(order, base, '09:00')[1].driveEstimated).toBe(true);
  });
  it('changing a stay length moves everything after it', () => {
    const order = [S(P('a', 'view', 0.05)), S(P('b', 'trail', 0.1))];
    const a = timeline(order, base, '09:00', [10, 10, 10]); const b = timeline([{ ...order[0], stay: 80 }, order[1]], base, '09:00', [10, 10, 10]);
    expect(b[2].at > a[2].at).toBe(true);
  });
});
