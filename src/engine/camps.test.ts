import { describe, it, expect, vi, afterEach } from 'vitest';
import { searchCamps, applyFacilities, geocode } from '../services/camps';

const osm = { elements: [
  { type: 'node', id: 1, lat: 30.571, lon: 34.861, tags: { tourism: 'camp_site', name: 'בארותיים', toilets: 'yes', fee: 'yes' } },
  { type: 'node', id: 2, lat: 30.6, lon: 34.9, tags: { tourism: 'camp_site', name: 'חניון לילה סהרונים', toilets: 'yes', drinking_water: 'no', fee: 'no' } },
] };
afterEach(() => vi.unstubAllGlobals());

describe('camp search', () => {
  it('resolves regions locally without network', async () => { expect((await geocode('מכתש רמון'))?.lat).toBeCloseTo(30.61); });
  it('merges catalogue + OSM, de-duplicates and sorts by distance', async () => {
    const f = vi.fn(async (url: string) => ({ ok: true, json: async () => osm }));
    vi.stubGlobal('fetch', f); vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {} });
    const r = await searchCamps({ query: 'מכתש רמון', radiusKm: 25 });
    expect(r.center?.label).toBe('מכתש רמון ומרכז הנגב');
    expect(r.results.some(x => x.source === 'catalog' && x.name.includes('בארותיים'))).toBe(false); // OSM has it within 400 m
    expect(r.results.map(x => x.km!)).toEqual([...r.results.map(x => x.km!)].sort((a, b) => a - b));
    expect(applyFacilities(r.results, ['free']).map(x => x.name)).toEqual(['חניון לילה סהרונים']);
    expect(applyFacilities(r.results, ['water']).length).toBe(0);
    expect(String(f.mock.calls[0][0])).toContain('overpass');
  });
  it('falls back to catalogue when OSM is down', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 504 })));
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {} });
    const r = await searchCamps({ center: { lat: 30.61, lon: 34.8, label: 'x' }, radiusKm: 25 });
    expect(r.osmError).toBeTruthy(); expect(r.results.some(x => x.name.includes('בארותיים'))).toBe(true);
  });
});
