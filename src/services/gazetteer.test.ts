import { describe, it, expect } from 'vitest';
import { suggest, type GazName } from './gazetteer';
import type { Place } from './placesDb';

const names: GazName[] = [
  { n: 'בקעת בית שאן', a: ['עמק בית שאן'], lat: 32.48, lon: 35.51, r: 'lower_galilee', k: 'valley', q: 'Q1' },
  { n: 'עמק יזרעאל', lat: 32.6, lon: 35.24, r: 'lower_galilee', k: 'valley', q: 'Q2' },
  { n: 'קצרין', lat: 32.99, lon: 35.69, r: 'golan', k: 'locality', q: 'osm:n1' },
  { n: 'עין גדי', lat: 31.45, lon: 35.38, r: 'judean_desert', k: 'locality', q: 'osm:n2' },
];
const places: Place[] = [{ id: 'wd:Q9', he: 'עין גדי', lat: 31.46, lon: 35.39, r: 'judean_desert', c: ['national_park'], wiki: 'x', src: ['wd'] }];

describe('where-to suggestions', () => {
  it('"עמק המעיינות" (everyday name) → the Beit She\'an valley, region lower Galilee & valleys', () => {
    const s = suggest('עמק המעיינות', names, places)[0];
    expect(s.label).toBe('עמק המעיינות'); expect(s.region).toBe('lower_galilee'); expect(s.lat).toBe(32.48);
  });
  it('alternative names match ("עמק בית שאן") and say so', () => {
    const s = suggest('עמק בית שאן', names, places)[0];
    expect(s.label).toBe('בקעת בית שאן'); expect(s.matched).toBe('עמק בית שאן');
  });
  it('prefix typing and a leading ל/ב/ה: "לקצר" → קצרין in the Golan', () => {
    const s = suggest('לקצר', names, places)[0]; expect(s.label).toBe('קצרין'); expect(s.region).toBe('golan');
  });
  it('the app regions are suggested: "גולן" → רמת הגולן region', () => {
    expect(suggest('גולן', names, places).some(s => s.id === 'region:golan')).toBe(true);
  });
  it('same name as a locality and a place: both offered, the place shows its type', () => {
    const l = suggest('עין גדי', names, places);
    expect(l.filter(s => s.label === 'עין גדי').map(s => s.kind).sort()).toEqual(['locality', 'place']);
  });
  it('nothing for one letter or nonsense', () => { expect(suggest('ע', names, places)).toEqual([]); expect(suggest('קקקקק', names, places)).toEqual([]); });
});
