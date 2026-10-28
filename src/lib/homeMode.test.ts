import { describe, it, expect } from 'vitest';
import { homeMode, tripDay } from './homeMode';

const trip = (start: string, end: string, example = false) => ({ start, end, example } as any);

describe('home mode', () => {
  it('plans when there is no trip or only the example', () => {
    expect(homeMode(undefined, '2026-10-28')).toBe('plan');
    expect(homeMode(trip('2026-10-29', '2026-10-31', true), '2026-10-28')).toBe('plan');
  });
  it('prepares within a week of the start', () => {
    expect(homeMode(trip('2026-11-04', '2026-11-06'), '2026-10-28')).toBe('prep');
    expect(homeMode(trip('2026-10-28', '2026-10-30'), '2026-10-27')).toBe('prep');
    expect(homeMode(trip('2026-11-05', '2026-11-06'), '2026-10-28')).toBe('plan');
  });
  it('is in the field from the first to the last day', () => {
    expect(homeMode(trip('2026-10-28', '2026-10-30'), '2026-10-28')).toBe('field');
    expect(homeMode(trip('2026-10-26', '2026-10-28'), '2026-10-28')).toBe('field');
    expect(homeMode(trip('2026-10-26', '2026-10-27'), '2026-10-28')).toBe('plan');
  });
  it('numbers trip days from 0', () => {
    expect(tripDay(trip('2026-10-27', '2026-10-29'), '2026-10-28')).toBe(1);
    expect(tripDay(trip('2026-10-27', '2026-10-29'), '2026-10-30')).toBeNull();
  });
});
