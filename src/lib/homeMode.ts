// The home screen adapts to where you are in the trip cycle:
// planning (no trip soon) → preparing (a real trip within a week) → in the field (the trip is happening today).
import type { Trip } from './types';
import { diffDays, todayISO } from './util';

export type HomeMode = 'plan' | 'prep' | 'field' | 'after';
export const HOME_MODE_HE: Record<HomeMode, string> = { plan: 'תכנון', prep: 'הכנות', field: 'בשטח', after: 'אחרי הטיול' };
export const PREP_WINDOW_DAYS = 7;

/** Automatic mode for the nearest trip. Example trips never switch the home screen. */
export function homeMode(t: Trip | undefined, today = todayISO()): HomeMode {
  if (!t || t.example) return 'plan';
  if (t.start <= today && today <= t.end) return 'field';
  const d = diffDays(today, t.start);
  return d >= 0 && d <= PREP_WINDOW_DAYS ? 'prep' : 'plan';
}

/** 0-based day of the trip for `today` (matches ScheduleItem.day), or null outside the trip. */
export function tripDay(t: Pick<Trip, 'start' | 'end'>, today = todayISO()): number | null {
  if (today < t.start || today > t.end) return null;
  return diffDays(t.start, today);
}
