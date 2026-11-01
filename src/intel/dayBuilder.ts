// "Build my day": order the chosen stops, time them, and return to base. Pure — the routing legs come in from the
// caller (OSRM); without them, drive times are estimated from air distance and marked as estimates.
import type { DiscPlace, DiscCat } from '../services/discover';
import { haversineKm } from '../lib/util';

export const STAY_MIN: Record<DiscCat, number> = { cart: 30, cafe: 45, breakfast: 45, restaurant: 75, trail: 120, view: 20, water: 60, picnic: 60, family: 90, visitor: 45, heritage: 60 };
export interface DayStop { p: DiscPlace; stay: number }
export interface DayRow { kind: 'leave' | 'stop' | 'return'; at: string; drive?: number; driveEstimated?: boolean; stop?: DayStop; ends?: string }

const toMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
export const hhmm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.round(m % 60)).padStart(2, '0')}`;
/** Air distance → minutes at ~45 km/h with a 1.35 road factor (an estimate, labelled as one). */
export const estDrive = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => Math.max(3, Math.round((haversineKm(a, b) * 1.35) / 45 * 60));

/** Suggested order: coffee/breakfast first, a restaurant around lunch, the rest nearest-next. */
export function orderStops(base: { lat: number; lon: number }, stops: DayStop[], start = '09:00'): DayStop[] {
  const morning = stops.filter(s => ['cart', 'breakfast', 'cafe'].includes(s.p.cat));
  const lunch = stops.filter(s => s.p.cat === 'restaurant');
  const rest = stops.filter(s => !morning.includes(s) && !lunch.includes(s));
  const nn = (from: { lat: number; lon: number }, list: DayStop[]) => { const out: DayStop[] = []; const left = [...list]; let cur = from; while (left.length) { left.sort((a, b) => haversineKm(cur, a.p) - haversineKm(cur, b.p)); const n = left.shift()!; out.push(n); cur = n.p; } return out; };
  const seq = [...nn(base, morning)]; let cur: { lat: number; lon: number } = seq.at(-1)?.p ?? base;
  const others = nn(cur, rest);
  // put lunch where the clock first reaches 12:30
  let t = toMin(start); let prev: { lat: number; lon: number } = base; for (const s of seq) { t += estDrive(prev, s.p) + s.stay; prev = s.p; }
  const out = [...seq]; let lunchDone = false;
  for (const s of others) {
    if (!lunchDone && lunch.length && t >= toMin('12:30')) { out.push(...lunch); lunchDone = true; }
    out.push(s); t += estDrive(prev, s.p) + s.stay; prev = s.p;
  }
  if (!lunchDone) out.push(...lunch);
  return out;
}

/** Timed rows for a given order. `legs` = drive minutes base→1→2…→base from OSRM, when available. */
export function timeline(stops: DayStop[], base: { lat: number; lon: number }, start = '09:00', legs?: number[] | null): DayRow[] {
  const rows: DayRow[] = [{ kind: 'leave', at: start }]; let t = toMin(start); let prev: { lat: number; lon: number } = base;
  stops.forEach((s, i) => {
    const real = legs?.[i]; const drive = real ?? estDrive(prev, s.p); t += drive;
    rows.push({ kind: 'stop', at: hhmm(t), drive, driveEstimated: real == null, stop: s, ends: hhmm(t + s.stay) }); t += s.stay; prev = s.p;
  });
  const back = legs?.[stops.length] ?? estDrive(prev, base); t += back;
  rows.push({ kind: 'return', at: hhmm(t), drive: back, driveEstimated: legs?.[stops.length] == null });
  return rows;
}
