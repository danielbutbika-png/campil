// Visual trunk loading by real dimensions (not just litres).
// The trunk is a box measured by the family: depth (seat back → tailgate), width (narrowest, between the wheel
// arches) and height up to the bottom of the rear window — the sight line, which nothing may cross.
// Items are placed heaviest/largest first, low and against the seat back, with an extreme-point heuristic.
// It's a planning sketch, not a guarantee: real trunks have curves, and soft bags squeeze.
import type { Box, GearItem, Trip } from '../lib/types';

export interface Trunk { depth: number; width: number; height: number } // cm
export interface PackInput { id: string; name: string; dims?: [number, number, number] | null; qty?: number; weightKg?: number; soft?: boolean; needOnWay?: boolean }
export interface Placed { key: string; id: string; name: string; x: number; y: number; z: number; d: number; w: number; h: number; weightKg?: number; soft?: boolean; order: number }
export interface Unplaced { key: string; id: string; name: string; reason: 'too-big' | 'no-room' | 'too-tall' }
export interface PackResult { placed: Placed[]; unplaced: Unplaced[]; unknown: { id: string; name: string }[]; usedPct: number; maxZ: number }

const perms = ([a, b, c]: [number, number, number]): [number, number, number][] =>
  [[a, b, c], [a, c, b], [b, a, c], [b, c, a], [c, a, b], [c, b, a]];

const overlaps = (p: Placed, x: number, y: number, z: number, d: number, w: number, h: number) =>
  x < p.x + p.d && p.x < x + d && y < p.y + p.w && p.y < y + w && z < p.z + p.h && p.z < z + h;

/** Share of the base resting on the floor or on tops of items below (≥ 70% needed). */
function support(placed: Placed[], x: number, y: number, z: number, d: number, w: number) {
  if (z === 0) return 1;
  let a = 0;
  for (const p of placed) {
    if (p.z + p.h !== z) continue;
    const ox = Math.max(0, Math.min(x + d, p.x + p.d) - Math.max(x, p.x)), oy = Math.max(0, Math.min(y + w, p.y + p.w) - Math.max(y, p.y));
    a += ox * oy;
  }
  return a / (d * w);
}

type Unit = PackInput & { key: string; dims: [number, number, number] };
const volOf = (u: Unit) => u.dims[0] * u.dims[1] * u.dims[2];
// Several loading orders (heavy/large first, longest first, biggest footprint first); the plan that leaves the
// least volume outside wins, then the lowest load. Heavy items stay first in every order.
const ORDERS: ((a: Unit, b: Unit) => number)[] = [
  (a, b) => volOf(b) - volOf(a),
  (a, b) => Math.max(...b.dims) - Math.max(...a.dims) || volOf(b) - volOf(a),
  (a, b) => b.dims[0] * b.dims[1] - a.dims[0] * a.dims[1] || volOf(b) - volOf(a),
  (a, b) => Number(!!a.soft) - Number(!!b.soft) || volOf(b) - volOf(a),
];

export function packTrunk(trunk: Trunk, items: PackInput[]): PackResult {
  const volIn = (r: PackResult) => r.unplaced.reduce((n, u) => n + items.find(i => i.id === u.id)!.dims!.reduce((a, b) => a * b, 1), 0);
  // fewer items left out; then fewer rigid/heavy ones (a soft bag can still be squeezed in); then less volume; then lower
  const rigidOut = (r: PackResult) => r.unplaced.filter(u => { const i = items.find(x => x.id === u.id)!; return !i.soft || !!i.weightKg; }).length;
  const key = (r: PackResult) => [r.unplaced.length, rigidOut(r), volIn(r), r.maxZ];
  const better = (a: PackResult, b: PackResult | null) => { if (!b) return true; const x = key(a), y = key(b); for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] < y[i]; return false; };
  let best: PackResult | null = null;
  for (const order of ORDERS) { const r = packOnce(trunk, items, order); if (better(r, best)) best = r; }
  // refinement: whatever was left out gets a try at being loaded first (long items often fit only along the seat back)
  for (let round = 0; round < 2 && best!.unplaced.some(u => u.reason === 'no-room'); round++) {
    for (const u of best!.unplaced.filter(x => x.reason === 'no-room')) for (const order of ORDERS) {
      const r = packOnce(trunk, items, (a, b) => Number(b.id === u.id) - Number(a.id === u.id) || order(a, b), u.id);
      if (better(r, best)) best = r;
    }
  }
  return best!;
}

function packOnce(trunk: Trunk, items: PackInput[], order: (a: Unit, b: Unit) => number, first?: string): PackResult {
  const units: Unit[] = [];
  const unknown: { id: string; name: string }[] = [];
  for (const it of items) {
    if (!it.dims || !it.dims.every(x => x > 0)) { unknown.push({ id: it.id, name: it.name }); continue; }
    for (let i = 0; i < (it.qty ?? 1); i++) units.push({ ...it, key: `${it.id}#${i}`, dims: it.dims });
  }
  // heavy first (low, against the seat back), then large; things needed on the way last (near the tailgate)
  units.sort((a, b) => Number(b.id === first) - Number(a.id === first) || Number(!!a.needOnWay) - Number(!!b.needOnWay) || (b.weightKg ?? 0) - (a.weightKg ?? 0) || order(a, b));

  const placed: Placed[] = []; const unplaced: Unplaced[] = [];
  let points: [number, number, number][] = [[0, 0, 0]];
  for (const u of units) {
    // orientations: flattest first (stable, keeps the sight line clear); a tall item may stand only if it must
    const os = perms(u.dims).sort((a, b) => a[2] - b[2] || b[0] - a[0]);
    const fitsEmpty = os.filter(([d, w, h]) => d <= trunk.depth && w <= trunk.width && h <= trunk.height);
    if (!fitsEmpty.length) {
      // lying down it fits the floor, but on its smallest side it still rises above the window line
      const tooTall = Math.max(...u.dims) <= Math.max(trunk.depth, trunk.width) && os.some(([d, w]) => d <= trunk.depth && w <= trunk.width);
      unplaced.push({ key: u.key, id: u.id, name: u.name, reason: tooTall ? 'too-tall' : 'too-big' }); continue;
    }
    // items needed on the way prefer the tailgate end: search points from the back
    const pts = [...points].sort((a, b) => a[2] - b[2] || (u.needOnWay ? b[0] - a[0] : a[0] - b[0]) || a[1] - b[1]);
    let spot: Placed | null = null;
    outer: for (const [x, y, z] of pts) for (const [d, w, h] of fitsEmpty) for (const X of u.needOnWay ? [trunk.depth - d, x] : [x]) {
      if (X < 0 || X + d > trunk.depth || y + w > trunk.width || z + h > trunk.height) continue;
      if (placed.some(p => overlaps(p, X, y, z, d, w, h))) continue;
      if (support(placed, X, y, z, d, w) < 0.7) continue;
      if (u.weightKg && z > 0 && placed.some(p => p.soft && p.z + p.h === z && X < p.x + p.d && p.x < X + d && y < p.y + p.w && p.y < y + w)) continue; // nothing heavy on soft bags
      spot = { key: u.key, id: u.id, name: u.name, x: X, y, z, d, w, h, weightKg: u.weightKg, soft: u.soft, order: 0 };
      break outer;
    }
    if (!spot) { unplaced.push({ key: u.key, id: u.id, name: u.name, reason: 'no-room' }); continue; }
    placed.push(spot);
    points.push([spot.x + spot.d, spot.y, spot.z], [spot.x, spot.y + spot.w, spot.z], [spot.x, spot.y, spot.z + spot.h]);
    points = points.filter(([x, y, z]) => x < trunk.depth && y < trunk.width && z < trunk.height);
  }
  // loading order: bottom layer first, from the seat back towards the tailgate
  placed.sort((a, b) => a.z - b.z || a.x - b.x || a.y - b.y).forEach((p, i) => (p.order = i + 1));
  const vol = placed.reduce((s, p) => s + p.d * p.w * p.h, 0);
  return { placed, unplaced, unknown, usedPct: Math.round((vol / (trunk.depth * trunk.width * trunk.height)) * 100), maxZ: Math.max(0, ...placed.map(p => p.z + p.h)) };
}

export const UNPLACED_HE: Record<Unplaced['reason'], string> = {
  'too-big': 'גדול מרצפת תא המטען בכל כיוון',
  'too-tall': 'בכל כיוון שנכנס לרצפה הוא גבוה מקו החלון',
  'no-room': 'לא נשאר מקום מתחת לקו החלון',
};

const has = (s: string, ...w: string[]) => w.some(x => s.includes(x));
/** What goes in the trunk: the trip's boxes and its big loose items (with the dimensions the family entered). */
export function trunkInputs(boxes: Box[], inventory: GearItem[], trip?: Trip | null): PackInput[] {
  const packing = trip?.packing.filter(p => !p.removed) ?? [];
  const going = (g: GearItem) => (trip ? packing.some(p => p.inventoryId === g.id) : g.available !== false);
  const usedBoxes = boxes.filter(b => !trip || packing.some(p => p.boxId === b.id));
  return [
    ...usedBoxes.map(b => ({ id: b.id, name: b.name, dims: b.dims ?? null, weightKg: b.weightKg, soft: b.kind === 'bag' })),
    ...inventory.filter(g => !g.boxId && g.big && going(g)).map(g => ({ id: g.id, name: g.name, dims: g.dims ?? null, qty: g.qty, weightKg: g.weightKg, soft: has(g.name, 'מזרן', 'שק', 'מחצלת'), needOnWay: has(g.name, 'צידנית', 'מים', 'קרחומים') })),
  ];
}
