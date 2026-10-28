import { describe, it, expect } from 'vitest';
import { planB } from './planB';

const site = (id: string, p: any = {}) => ({ id, name: id, region: 'golan', type: 'trail', lat: 33, lon: 35.7, tags: [], ...p }) as any;
const f = (p: any = {}) => ({ known: true, rain: false, wind: false, extremeHeat: false, ...p }) as any;
const cat = [site('nahal', { floodRisk: true }), site('ridge', { exposed: true, lat: 33.05 }), site('forest', { lat: 33.01 }), site('spring', { type: 'spring', tags: ['water'], lat: 33.02 }), site('far', { region: 'arava' }), site('camp', { lodging: true, floodRisk: true })];

describe('weather plan B', () => {
  it('rain + flood-prone planned place → nearby non-flood alternatives in the same region', () => {
    const r = planB([cat[0]], cat, f({ rain: true }), true);
    expect(r).toHaveLength(1); expect(r[0].reason).toBe('flood');
    expect(r[0].alternatives.map(a => a.site.id)).toEqual(['forest', 'spring', 'ridge']);
  });
  it('wind avoids exposed places; heat prefers water', () => {
    expect(planB([cat[1]], cat, f({ wind: true }), true)[0].alternatives.every(a => !a.site.exposed)).toBe(true);
    expect(planB([cat[2]], cat, f({ extremeHeat: true }), true)[0].alternatives.map(a => a.site.id)).toEqual(['spring']);
  });
  it('nothing without a real forecast, nothing for booked lodging, nothing when weather is fine', () => {
    expect(planB([cat[0]], cat, f({ rain: true }), false)).toEqual([]);
    expect(planB([cat[5]], cat, f({ rain: true }), true)).toEqual([]);
    expect(planB([cat[0], cat[1]], cat, f(), true)).toEqual([]);
  });
});
