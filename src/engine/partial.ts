// Partial quantities: a family brings part of a shared item (5 of 10 water bottles), or part is packed so far.
import type { PackItem } from '../lib/types';

/** Units each family committed to bring, the total, and what's still missing. */
export function coverage(p: Pick<PackItem, 'qty' | 'brings'>) {
  const brought = Object.values(p.brings ?? {}).reduce((n, x) => n + (x > 0 ? x : 0), 0);
  return { need: p.qty, brought, missing: Math.max(0, p.qty - brought), covered: brought >= p.qty };
}
/** Set one family's share (0 removes it), never above what's still needed from them. */
export function setShare(p: Pick<PackItem, 'qty' | 'brings'>, famId: string, units: number): Record<string, number> {
  const others = Object.entries(p.brings ?? {}).filter(([k]) => k !== famId).reduce((n, [, x]) => n + x, 0);
  const v = Math.max(0, Math.min(Math.round(units), Math.max(0, p.qty - others)));
  const next = { ...(p.brings ?? {}) }; if (v) next[famId] = v; else delete next[famId];
  return next;
}
/** Packed units so far, and the patch for packing `n` units (n ≥ qty → fully packed). */
export const packedUnits = (p: Pick<PackItem, 'qty' | 'packed' | 'packedQty'>) => (p.packed ? p.qty : Math.min(p.packedQty ?? 0, p.qty));
export function packUnits(p: Pick<PackItem, 'qty'>, n: number): Partial<PackItem> {
  const v = Math.max(0, Math.round(n));
  if (v >= p.qty) return { packed: true, packedQty: undefined };
  return { packed: false, packedQty: v || undefined };
}
