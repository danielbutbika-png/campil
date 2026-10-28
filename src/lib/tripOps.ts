// Operations on whole trips.
import type { Trip } from './types';
import { addDays, diffDays, uid } from './util';

/** A fresh copy to plan again: same plan and lists, nothing packed or done, new dates, NOT shared
 *  (a copy must never write into the original's shared document). The lessons noted last time travel with it. */
export function duplicateTrip(t: Trip, today: string): Trip {
  const len = diffDays(t.start, t.end); const start = addDays(today, 14);
  return {
    ...t, id: uid('trip-'), name: `${t.name} (עותק)`, createdAt: new Date().toISOString(), start, end: addDays(start, len),
    status: 'planning', rating: undefined, notes: undefined, example: false, shared: undefined, offline: undefined, packingSig: undefined,
    duties: {}, pantry: {},
    packing: t.packing.map(p => ({ ...p, packed: false, packedQty: undefined, packedBy: undefined, packedAt: undefined, brings: undefined })),
    tasks: t.tasks.map(k => ({ ...k, done: false, doneBy: undefined, doneAt: undefined })),
    lessons: t.lessons, lessonsFrom: t.lessons ? t.name : undefined,
  };
}

/** The most recent real trip that ended within `days` days (for the "after the trip" home mode). */
export function recentlyEnded(trips: Trip[], today: string, days = 7): Trip | undefined {
  return trips.filter(t => !t.example && t.end < today && diffDays(t.end, today) <= days).sort((a, b) => b.end.localeCompare(a.end))[0];
}
