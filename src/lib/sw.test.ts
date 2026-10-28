// The service worker's cleanup on update: drop this environment's old app caches only — never a saved offline
// map, runtime caches, or the other environment's caches (production and staging share the origin).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf8');
const line = src.split('\n').find(l => l.startsWith('const stale'))!;
const staleFor = (P: string, BUILD: string) => new Function('P', 'VERSION', `${line}\nreturn stale;`)(P, P + 'app-' + BUILD) as (k: string) => boolean;

describe('service worker cache cleanup', () => {
  const prod = staleFor('campil-', 'new1234567');
  const stg = staleFor('campil-stg-', 'new1234567');
  it('drops older app caches of its own environment', () => {
    expect(prod('campil-app-old0000000')).toBe(true);
    expect(prod('campil-0123456789')).toBe(true); // build cache from before the prefix change
    expect(stg('campil-stg-app-old0000000')).toBe(true);
  });
  it('keeps the current build, saved maps and runtime caches', () => {
    for (const k of ['campil-app-new1234567', 'campil-offline-map', 'campil-rt-map', 'campil-rt-fonts']) expect(prod(k)).toBe(false);
    for (const k of ['campil-stg-app-new1234567', 'campil-stg-offline-map']) expect(stg(k)).toBe(false);
  });
  it('never touches the other environment', () => {
    expect(prod('campil-stg-app-old0000000')).toBe(false);
    expect(prod('campil-stg-offline-map')).toBe(false);
    expect(stg('campil-app-old0000000')).toBe(false);
    expect(stg('campil-0123456789')).toBe(false);
    expect(stg('campil-offline-map')).toBe(false);
  });
});
