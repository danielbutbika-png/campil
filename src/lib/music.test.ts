import { describe, it, expect } from 'vitest';
import { compose, MOODS, rng } from './music';

describe('original music (composition)', () => {
  it('is deterministic per trip: same seed → same notes; another trip → another tune', () => {
    const a = compose('adventure', 'טיול לגולן'), b = compose('adventure', 'טיול לגולן'), c = compose('adventure', 'סופ״ש במדבר');
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(JSON.stringify(a.events)).not.toBe(JSON.stringify(c.events));
  });
  it('every mood makes a loop of reasonable length, with an intro bar of pad only', () => {
    for (const m of MOODS) {
      const { events, seconds } = compose(m.id, 'x');
      expect(seconds).toBeGreaterThan(25); expect(seconds).toBeLessThan(60);
      expect(events.filter(e => e.t < seconds / 16 - 1e-6).every(e => e.voice === 'pad')).toBe(true);
      expect(events.every(e => e.t >= 0 && e.t < seconds && e.dur > 0 && e.vel > 0 && e.vel <= 1)).toBe(true);
    }
  });
  it('calm has no drums; adventure and happy do', () => {
    expect(compose('calm', 'x').events.some(e => ['kick', 'clap'].includes(e.voice))).toBe(false);
    expect(compose('adventure', 'x').events.some(e => e.voice === 'kick')).toBe(true);
  });
  it('the random generator is in [0,1)', () => { const r = rng('s'); for (let i = 0; i < 1000; i++) { const v = r(); expect(v >= 0 && v < 1).toBe(true); } });
});
