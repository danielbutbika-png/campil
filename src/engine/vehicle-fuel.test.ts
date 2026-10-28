import { describe, it, expect } from 'vitest';
import { brandOf, placeAlong, thin, filterBrands } from '../services/fuel';
import { findVehicle, VEHICLES } from '../data/vehicles';
import { parseLookup } from '../services/vehicleSearch';
import { capacityFor, planLoad } from './loading';
import seed from '../data/seed.json';
import type { Box, GearItem } from '../lib/types';

describe('fuel brands', () => {
  it('reads brand from OSM tags', () => {
    expect(brandOf({ brand: 'Paz' })).toBe('paz');
    expect(brandOf({ name: 'פז מחלף גומא' })).toBe('paz');
    expect(brandOf({ brand: 'Sonol' })).toBe('sonol');
    expect(brandOf({ operator: 'דור אלון' })).toBe('doralon');
    expect(brandOf({ name: 'Delek' })).toBe('delek');
    expect(brandOf({ brand: 'Ten' })).toBe('ten');
    expect(brandOf({ name: 'תחנת דלק הכפר' })).toBe('other');
  });
  it('filters by preferred brands; empty = all', () => {
    const l = [{ brand: 'paz' }, { brand: 'sonol' }] as any;
    expect(filterBrands(l, []).length).toBe(2);
    expect(filterBrands(l, ['sonol']).length).toBe(1);
  });
  it('places a station along the route', () => {
    const route: [number, number][] = [[34.8, 32.0], [34.9, 32.0], [35.0, 32.0]];
    const p = placeAlong({ lat: 32.01, lon: 34.9 }, route);
    expect(Math.round(p.alongKm)).toBe(9); expect(p.offKm).toBeLessThan(1.2);
    expect(thin(Array.from({ length: 500 }, (_, i) => [i, i] as [number, number]), 60).length).toBe(60);
  });
});

describe('vehicles', () => {
  it('every catalogue value has a source link', () => { for (const v of VEHICLES) { expect(v.sourceUrl).toMatch(/^https:\/\//); expect(v.liters5).toBeGreaterThan(200); } });
  it('finds models by Hebrew alias', () => { expect(findVehicle('קודיאק')?.liters5).toBe(910); expect(findVehicle('hyundai tucson hybrid')?.liters5).toBe(616); expect(findVehicle('פיאט 500')).toBeNull(); });
  it('7-seat capacity follows the passenger count', () => {
    const k = findVehicle('kodiaq')!;
    expect(capacityFor(k, undefined, 5).liters).toBe(910);
    expect(capacityFor(k, undefined, 6).liters).toBe(340);
    expect(capacityFor(findVehicle('sorento'), undefined, 7).liters).toBeNull();
    expect(capacityFor(findVehicle('tucson'), undefined, 6).warn).toContain('5');
  });
  it('parses a web lookup answer and rejects guesses', () => {
    const ok = parseLookup({ content: [{ type: 'text', text: 'Here: {"model":"Chery Tiggo 8","seats":7,"liters5":889,"liters7":193,"litersFolded":null,"source":"Chery","sourceUrl":"https://example.com/spec","note":null}' }] }, 'tiggo 8');
    expect(ok.liters5).toBe(889); expect(ok.liters7).toBe(193); expect(ok.method).toBe('web');
    expect(() => parseLookup({ content: [{ type: 'text', text: '{"error":"not_found"}' }] }, 'x')).toThrow();
    expect(() => parseLookup({ content: [{ type: 'text', text: '{"model":"x","liters5":500,"sourceUrl":""}' }] }, 'x')).toThrow();
  });
});

describe('loading plan', () => {
  const boxes = seed.boxes as Box[]; const inv = seed.items as GearItem[];
  it('sums measured boxes, flags stackable bases and items without volume', () => {
    const p = planLoad({ spec: findVehicle('kodiaq'), boxes, inventory: inv, trip: null });
    expect(p.capacity).toBe(910);
    expect(p.used).toBe([117 * 23 * 25, 45 * 35 * 30, 45 * 35 * 35, 45 * 35 * 25, 65 * 40 * 35].reduce((s, x) => s + Math.round(x / 1000), 0));
    expect(p.stackable[0].length).toBe(3);
    expect(p.unknown.length).toBeGreaterThan(0);
    expect(p.rows[0].zone).toBe('floor-back');
    expect(p.rows.at(-1)!.zone).toBe('door');
  });
  it('warns when the measured gear exceeds a small trunk', () => {
    const tight = planLoad({ spec: findVehicle('corolla cross'), boxes, inventory: inv, trip: null });
    expect(tight.pct).toBe(77); expect(tight.advice.find(a => a.id === 'tight')).toBeTruthy();
    const p = planLoad({ manualLiters: 250, boxes, inventory: inv, trip: null });
    expect(p.pct!).toBeGreaterThan(100); expect(p.advice[0].level).toBe('danger');
  });
});
