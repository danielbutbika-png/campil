import { describe, it, expect } from 'vitest';
import { searchLessons, LESSONS } from './index';
import { KNOTS, KNOT_SAFETY } from './knots';
import { KNOT_ART } from './knotArt';

const top = (q: string) => searchLessons(q)[0]?.id;

describe('CampIL Academy', () => {
  it('finds the right knot from an everyday need', () => {
    expect(top('אני רוצה למתוח חבל לאוהל')).toBe('tautline');
    expect(top('לחבר שני חבלים')).toBe('square');
    expect(top('לולאה שלא נסגרת בקצה החבל')).toBe('bowline');
    expect(top('שהחבל לא יחליק מהחור בברזנט')).toBe('figure8');
    expect(top('מה עושים בשיטפון')).toBe('floods');
    expect(searchLessons('')).toEqual([]);
  });
  it('every knot is complete: illustration for every step, mistakes, 3-question quiz with a valid answer', () => {
    for (const k of KNOTS) {
      const art = KNOT_ART[k.id]; expect(art?.length).toBeGreaterThan(0);
      for (const s of k.steps) expect(art[s.frame]).toBeDefined();
      expect(k.mistakes.length).toBeGreaterThanOrEqual(2); expect(k.notFor.length).toBeGreaterThan(0);
      expect(k.quiz).toHaveLength(3);
      for (const q of k.quiz) expect(q.options[q.correct]).toBeDefined();
    }
  });
  it('no knot claims life-safety use, and the safety note says so', () => {
    expect(KNOT_SAFETY).toMatch(/לא לטיפוס/);
    for (const k of KNOTS) expect(k.notFor.join(' ')).toMatch(/אדם/);
  });
  it('the library lists knots and guides with categories', () => {
    expect(LESSONS.filter(l => l.kind === 'knot')).toHaveLength(KNOTS.length);
    expect(LESSONS.filter(l => l.kind === 'guide').length).toBeGreaterThanOrEqual(7);
  });
});
