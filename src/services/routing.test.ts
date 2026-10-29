import { describe, it, expect, vi, afterEach } from 'vitest';
import { chainWays, driveRoute, trailsNear, climbOf, trailToTrack } from './routing';

afterEach(() => vi.unstubAllGlobals());
const P = (lat: number, lon: number) => ({ lat, lon });

describe('routing', () => {
  it('chains a relation\'s ways into one line, flipping reversed pieces', () => {
    const line = chainWays([[P(0, 0), P(0, 1)], [P(0, 2), P(0, 1)], [P(0, 2), P(0, 3)]]);
    expect(line.map(p => p.lon)).toEqual([0, 1, 2, 3]);
  });
  it('driving route: one request for all stops, legs named by stop', async () => {
    const f = vi.fn(async () => ({ ok: true, json: async () => ({ code: 'Ok', routes: [{ distance: 123456, duration: 5400, geometry: { coordinates: [[35, 32], [35.2, 32.3], [35.4, 32.6]] }, legs: [{ distance: 60000, duration: 2700 }, { distance: 63456, duration: 2700 }] }] }) }));
    vi.stubGlobal('fetch', f);
    const r = await driveRoute([{ ...P(32, 35), name: 'הבית' }, { ...P(32.3, 35.2), name: 'א' }, { ...P(32.6, 35.4), name: 'הבית' }]);
    expect(f).toHaveBeenCalledTimes(1);
    expect(r.km).toBe(123.5); expect(r.minutes).toBe(90);
    expect(r.legs[0]).toMatchObject({ from: 'הבית', to: 'א', km: 60, minutes: 45 });
  });
  it('driving route: a readable error when the service is down', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('net'); }));
    await expect(driveRoute([P(32, 35), P(33, 35)])).rejects.toThrow('לא זמין');
  });
  it('trails: named marked routes, nearest first, with the mapped length', async () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {} });
    const way = (a: number, b: number) => ({ type: 'way', geometry: [{ lat: 32, lon: a }, { lat: 32, lon: b }] });
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ elements: [
      { type: 'relation', id: 1, tags: { route: 'hiking', name: 'שביל רחוק', colour: 'red' }, members: [way(35.05, 35.06)] },
      { type: 'relation', id: 2, tags: { route: 'hiking', 'name:he': 'שביל קרוב', colour: 'blue' }, members: [way(35.0, 35.01), way(35.02, 35.01)] },
    ] }) })));
    const t = await trailsNear({ lat: 32, lon: 35, name: 'יעד' });
    expect(t.map(x => x.name)).toEqual(['שביל קרוב', 'שביל רחוק']);
    expect(t[0].km).toBeCloseTo(1.9, 1); expect(t[0].fromKm).toBe(0);
    expect(t[0].osmUrl).toBe('https://www.openstreetmap.org/relation/2');
  });
  it('climb is an estimate from a terrain model, marked as such', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ elevation: [100, 150, 120] }) })));
    const c = await climbOf([P(32, 35), P(32, 35.01), P(32, 35.02)]);
    expect(c).toMatchObject({ gain: 50, loss: 30 });
    const tr = trailToTrack({ id: 'r', name: 'ש', km: 2, points: [P(32, 35), P(32, 35.02)], fromKm: 0, osmUrl: 'u', near: 'x' }, c);
    expect(tr.climbEst).toBe(true); expect(tr.source).toContain('OpenStreetMap');
  });
});
