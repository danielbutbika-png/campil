import { describe, it, expect } from 'vitest';
import { detoursFrom } from './detour';

describe('detour from a routing matrix', () => {
  // start, end, stopA (right on the road), stopB (a side trip)
  const dur = [[0, 3600, 1200, 1500], [3600, 0, 2400, 2700], [1200, 2400, 0, 600], [1500, 2700, 600, 0]];
  const dist = [[0, 100000, 33000, 40000], [100000, 0, 67000, 75000], [33000, 67000, 0, 8000], [40000, 75000, 8000, 0]];
  it('a stop on the road adds ~0 minutes; a side trip adds the extra driving', () => {
    const [a, b] = detoursFrom(dur, dist);
    expect(a).toEqual({ extraMin: 0, extraKm: 0, toStopMin: 20 });
    expect(b!.extraMin).toBe(10); expect(b!.extraKm).toBe(15); expect(b!.toStopMin).toBe(25);
  });
  it('missing routes → null for that stop', () => {
    expect(detoursFrom([[0, 3600, null as any], [3600, 0, 1], [1, 1, 0]], [[0, 1, 1], [1, 0, 1], [1, 1, 0]])[0]).toBeNull();
  });
});
