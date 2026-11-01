// "On the way" means a small detour in driving time, not just closeness on the map. One OSRM table request gives
// start→stop and stop→end for every candidate; extra = start→stop + stop→end − start→end. Without routing data
// the caller gets null and shows air distance, labelled as such.
export interface Detour { extraMin: number; extraKm: number; toStopMin: number }
interface Pt { lat: number; lon: number }

/** Pure: the detour of each stop from a durations/distances matrix laid out as [start, end, ...stops]. */
export function detoursFrom(dur: number[][], dist: number[][]): (Detour | null)[] {
  const base = dur[0][1], baseKm = dist[0][1];
  return dur.slice(2).map((_, i) => {
    const s = i + 2; const a = dur[0][s], b = dur[s][1];
    if (a == null || b == null || base == null) return null;
    return { extraMin: Math.max(0, Math.round((a + b - base) / 60)), extraKm: Math.max(0, Math.round((dist[0][s] + dist[s][1] - baseKm) / 100) / 10), toStopMin: Math.round(a / 60) };
  });
}

const cache = new Map<string, Promise<(Detour | null)[] | null>>();
/** Detours for up to 60 stops between `from` and `to` (OSRM public server; one request). null = routing unavailable. */
export function detours(from: Pt, to: Pt, stops: Pt[]): Promise<(Detour | null)[] | null> {
  const pts = [from, to, ...stops.slice(0, 60)];
  const key = pts.map(p => `${p.lon.toFixed(4)},${p.lat.toFixed(4)}`).join(';');
  if (!cache.has(key)) cache.set(key, fetch(`https://router.project-osrm.org/table/v1/driving/${key}?annotations=duration,distance`).then(r => (r.ok ? r.json() : null)).then(j => (j?.code === 'Ok' ? detoursFrom(j.durations, j.distances) : null)).catch(() => null));
  return cache.get(key)!;
}
