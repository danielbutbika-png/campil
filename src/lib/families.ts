// Group trips: several households (families) on one trip. Shared gear is visible to everyone;
// a family's own gear (its people's personal items, its own equipment) is visible only to that family.
import { useState } from 'react';
import type { Trip, PackItem, Family, Member } from './types';

export const FAMILY_COLORS = ['#2f6b3f', '#d66a2a', '#3c6e9f', '#a0522d', '#7a6a9e', '#2c8c99', '#c0392b', '#8a6d3b'];

export const isGroup = (t: Pick<Trip, 'families'>) => (t.families?.length ?? 0) > 1;
export const familyById = (t: Pick<Trip, 'families'>, id?: string | null) => t.families?.find(f => f.id === id);

/** Which family owns an item; null = shared with everyone. */
export function itemFamily(t: Pick<Trip, 'families' | 'participants'>, p: PackItem): string | null {
  if (!isGroup(t)) return null;
  if (p.familyId !== undefined) return p.familyId || null;
  if (p.assignee) return t.participants.find(m => m.id === p.assignee)?.familyId ?? t.families![0].id;
  if (p.source === 'inventory') return t.families![0].id; // the organiser's own gear store
  return null;
}

/** The family this device belongs to in a trip. */
export function myFamily(t: Pick<Trip, 'families' | 'shared'>): string | null {
  if (!isGroup(t)) return null;
  const f = t.shared?.familyId;
  return f && familyById(t, f) ? f : t.families![0].id;
}

/** Organiser (or anyone on an unshared trip) may look at every family; partners see only their own. */
export const canSeeAll = (t: Pick<Trip, 'shared'>) => !t.shared || t.shared.role === 'owner';

export type View = 'all' | string;
export const visibleIn = (t: Trip, p: PackItem, view: View) => {
  if (!isGroup(t) || view === 'all') return true;
  const f = itemFamily(t, p);
  return f === null || f === view;
};
/** Whether this device should hear about changes to this item. */
export const concernsMe = (t: Trip, p: PackItem) => visibleIn(t, p, myFamily(t) ?? 'all');

const KEY = 'campil-family-view';
const readView = (id: string) => { try { return JSON.parse(localStorage.getItem(KEY) ?? '{}')[id] as string | undefined; } catch { return undefined; } };
const saveView = (id: string, v: string) => { try { const o = JSON.parse(localStorage.getItem(KEY) ?? '{}'); o[id] = v; localStorage.setItem(KEY, JSON.stringify(o)); } catch { /* storage blocked */ } };

/** The family filter shown in gear/tasks screens, remembered per trip on this device. */
export function useFamilyView(t: Trip): [View, (v: View) => void, View[]] {
  const mine = myFamily(t);
  const options: View[] = !isGroup(t) ? ['all'] : canSeeAll(t) ? [...t.families!.map(f => f.id), 'all'] : [mine!];
  const [v, setV] = useState<View>(() => { const r = readView(t.id); return r && options.includes(r) ? r : mine ?? 'all'; });
  const cur = options.includes(v) ? v : options[0];
  return [cur, x => { setV(x); saveView(t.id, x); }, options];
}

export function newFamily(i: number, name?: string): Family {
  return { id: 'fam-' + Math.random().toString(36).slice(2, 9), name: name ?? `משפחה ${i + 1}`, color: FAMILY_COLORS[i % FAMILY_COLORS.length] };
}

/** Make sure every participant points at an existing family (first family by default). */
export function normalizeFamilies(families: Family[] | undefined, ps: Member[]): Member[] {
  if (!families || families.length < 2) return ps.map(p => (p.familyId ? { ...p, familyId: undefined } : p));
  const ids = new Set(families.map(f => f.id));
  return ps.map(p => (p.familyId && ids.has(p.familyId) ? p : { ...p, familyId: families[0].id }));
}

/** The items this device works with: shared + my family's (everything on a one-family trip). */
export const myPacking = (t: Trip) => t.packing.filter(p => concernsMe(t, p));
