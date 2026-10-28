// Trip Type Engine — merges the modules of the selected trip types into what the other engines use.
import type { CategoryId, Member, Trip } from '../lib/types';
import { TRIP_TYPES, TYPE_BY_ID, type Qty, type TripType, type TripTypeId, type TypeCheck, type TypeQuestion } from '../data/tripTypes';
import { tripLength } from '../lib/util';

export const selectedTypes = (t: Pick<Trip, 'types'>): TripType[] => (t.types ?? []).map(id => TYPE_BY_ID[id]).filter(Boolean);
const names = (ts: TripType[]) => ts.map(x => x.name).join(' + ');

/** Settings the selected types imply (kind, lodging, pets, interests), merged into the current trip. */
export function impliedBy(types: TripTypeId[], cur: Pick<Trip, 'kind' | 'lodging' | 'pets' | 'interests'>): Partial<Trip> {
  const ts = types.map(id => TYPE_BY_ID[id]).filter(Boolean);
  const out: Partial<Trip> = {};
  const kinds = new Set(ts.map(x => x.implies?.kind).filter(Boolean));
  if (kinds.has('camping')) out.kind = 'camping'; else if (kinds.has('day')) out.kind = 'day';
  const lodging = ts.map(x => x.implies?.lodging).find(Boolean); if (lodging) out.lodging = lodging;
  if (ts.some(x => x.implies?.pets)) out.pets = true;
  const add = ts.flatMap(x => x.implies?.interests ?? []);
  if (add.length) out.interests = [...new Set([...cur.interests, ...add])];
  return out;
}

/** People count for a quantity rule, from a set of participants (a whole trip, or one family). */
export function scale(q: Qty, ps: Member[], days: number, families: number): number {
  if (typeof q === 'number') return q;
  switch (q) {
    case 'perPerson': return ps.length;
    case 'perAdult': return ps.filter(p => p.role !== 'child').length;
    case 'perChild': return ps.filter(p => p.role === 'child').length;
    case 'perFamily': return Math.max(1, families);
    case 'perDay': return days;
  }
}

export interface MergedGear { name: string; category: CategoryId; qty: Qty; qtyFrom?: string; why: string; unit?: string; perPeople: boolean }
/** Gear from all selected types, one line per name (largest quantity wins), with the types that asked for it. */
export function typeGear(t: Pick<Trip, 'types' | 'kind'>) {
  const m = new Map<string, MergedGear & { from: string[] }>();
  for (const ty of selectedTypes(t)) for (const g of ty.gear ?? []) {
    if (g.dayOnly && t.kind !== 'day') continue;
    const cur = m.get(g.name);
    if (cur) { cur.from.push(ty.name); continue; }
    m.set(g.name, { name: g.name, category: g.category, qty: g.qty, qtyFrom: g.qtyFrom, why: g.why, unit: g.unit, perPeople: typeof g.qty === 'string' && g.qty !== 'perDay' && g.qty !== 'perFamily', from: [ty.name] });
  }
  return [...m.values()].map(g => ({ ...g, reason: `סוג טיול: ${g.from.join(' + ')} — ${g.why}` }));
}

export function typeTasks(t: Pick<Trip, 'types'>) {
  const seen = new Set<string>(); const out: { when: string; text: string }[] = [];
  for (const ty of selectedTypes(t)) for (const k of ty.tasks ?? []) if (!seen.has(k.text)) { seen.add(k.text); out.push(k); }
  return out;
}
export function typeGuides(t: Pick<Trip, 'types'>, known: string[]) { return [...new Set(selectedTypes(t).flatMap(x => x.guides ?? []))].filter(id => known.includes(id)); }
export function typeChecks(t: Pick<Trip, 'types'>): (TypeCheck & { type: string })[] {
  const seen = new Set<string>(); const out: (TypeCheck & { type: string })[] = [];
  for (const ty of selectedTypes(t)) for (const c of ty.checks ?? []) if (!seen.has(c.text)) { seen.add(c.text); out.push({ ...c, type: ty.name }); }
  return out;
}
export function typeQuestions(t: Pick<Trip, 'types'>): (TypeQuestion & { type: string })[] {
  return selectedTypes(t).flatMap(x => (x.questions ?? []).map(q => ({ ...q, type: x.name })));
}
export const typesLabel = (t: Pick<Trip, 'types'>) => names(selectedTypes(t));
export { TRIP_TYPES };
export const tripDays = (t: Pick<Trip, 'start' | 'end'>) => tripLength(t.start, t.end).days;
