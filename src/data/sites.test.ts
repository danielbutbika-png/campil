import { describe, it, expect } from 'vitest';
import { SITES } from './sites';
import { REGION_BY_ID } from './regions';

describe('site catalogue', () => {
  it('has unique ids, known regions and coordinates inside Israel', () => {
    const ids = new Set<string>();
    for (const s of SITES) {
      expect(ids.has(s.id), s.id).toBe(false); ids.add(s.id);
      expect(REGION_BY_ID[s.region], s.id).toBeTruthy();
      expect(s.lat).toBeGreaterThan(29.4); expect(s.lat).toBeLessThan(33.4);
      expect(s.lon).toBeGreaterThan(34.2); expect(s.lon).toBeLessThan(35.95);
      expect(s.officialUrl).toMatch(/^https?:\/\//);
      expect(s.verified).toBe(false);
    }
  });
  it('includes the guide places, credited and unverified', () => {
    const g = SITES.filter(s => s.sourceNote.includes('110 טיולים'));
    expect(g.length).toBeGreaterThanOrEqual(70);
    expect(g.every(s => s.desc.length > 20)).toBe(true);
  });
  it('does not duplicate a place already in the catalogue by name', () => {
    const names = SITES.map(s => s.name.replace(/^(שמורת|גן לאומי)\s+/, ''));
    expect(new Set(names).size).toBe(names.length);
  });
});
