// Gear warehouse: sizes, weights, owners, periodic checks and trip assignment.
// Only what the family entered is used — missing sizes/weights are reported as missing, never guessed.
import type { GearItem, Trip } from '../lib/types';
import { addMonths } from '../lib/util';

/** Litres per unit: the entered volume, or computed from entered dimensions. */
export function unitLiters(g: Pick<GearItem, 'volumeL' | 'dims'>): number | null {
  if (g.volumeL) return g.volumeL;
  if (g.dims && g.dims.every(x => x > 0)) return Math.round((g.dims[0] * g.dims[1] * g.dims[2]) / 100) / 10;
  return null;
}

export type CheckState = { state: 'none' } | { state: 'never' } | { state: 'ok' | 'due'; next: string };
/** Is a periodic check due? 'none' = no schedule set; 'never' = schedule set but never checked. */
export function checkState(g: Pick<GearItem, 'lastChecked' | 'checkEveryMonths'>, today: string): CheckState {
  if (!g.checkEveryMonths) return { state: 'none' };
  if (!g.lastChecked) return { state: 'never' };
  const next = addMonths(g.lastChecked, g.checkEveryMonths);
  return { state: next <= today ? 'due' : 'ok', next };
}
export const needsCheck = (g: GearItem, today: string) => g.status === 'check' || ['due', 'never'].includes(checkState(g, today).state);

/** Upcoming / ongoing trips whose packing list includes this inventory item. */
export function tripsUsing(itemId: string, trips: Trip[], today: string) {
  return trips.filter(t => t.status === 'planning' && t.end >= today && t.packing.some(p => p.inventoryId === itemId && !p.removed))
    .sort((a, b) => a.start.localeCompare(b.start));
}

export interface WarehouseStats { items: number; units: number; weightKg: number; weighed: number; liters: number; sized: number; due: number; borrowed: number }
/** Totals over what was entered, plus how much is still missing — so totals are never presented as complete. */
export function warehouseStats(inv: GearItem[], today: string): WarehouseStats {
  const s: WarehouseStats = { items: inv.length, units: 0, weightKg: 0, weighed: 0, liters: 0, sized: 0, due: 0, borrowed: 0 };
  for (const g of inv) {
    s.units += g.qty;
    if (g.weightKg != null) { s.weightKg += g.weightKg * g.qty; s.weighed++; }
    const l = unitLiters(g); if (l != null) { s.liters += l * g.qty; s.sized++; }
    if (needsCheck(g, today)) s.due++;
    if (g.borrowedFrom?.trim()) s.borrowed++;
  }
  s.weightKg = Math.round(s.weightKg * 10) / 10; s.liters = Math.round(s.liters);
  return s;
}
