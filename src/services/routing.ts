// Automatic routes, from free open services only:
//  • driving — OSRM public demo server (OpenStreetMap roads): home → every stop in order → home. On request, never in a loop.
//  • walking — marked hiking routes mapped in OpenStreetMap (Overpass `route=hiking|foot` relations) near each stop.
//  • climb — Open-Meteo elevation (≈90 m terrain model) sampled along a chosen trail: an estimate, labelled as such.
// Nothing here says a trail is open, marked on the ground or safe — the UI says to check with the operator.
import { simplify, stats, distKm, type GpxPoint, type GpxTrack } from '../engine/gpx';

export interface Pt { lat: number; lon: number; name?: string }
export interface DriveRoute { coords: [number, number][]; km: number; minutes: number; legs: { from: string; to: string; km: number; minutes: number }[]; stops: string[]; at: string; source: 'osrm' }

async function getJSON(url: string, init?: RequestInit) {
  const r = await fetch(url, init); if (!r.ok) throw new Error(String(r.status)); return r.json();
}

/** One request for the whole day: up to 25 points (OSRM demo limit is generous; we keep it small). */
export async function driveRoute(pts: Pt[]): Promise<DriveRoute> {
  if (pts.length < 2) throw new Error('צריך לפחות שתי נקודות');
  const path = pts.slice(0, 25).map(p => `${p.lon.toFixed(5)},${p.lat.toFixed(5)}`).join(';');
  let j: any;
  try { j = await getJSON(`https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson&steps=false`); }
  catch { throw new Error('שירות חישוב המסלול לא זמין כרגע (צריך חיבור לאינטרנט). נסו שוב בעוד רגע.'); }
  const rt = j.routes?.[0]; if (j.code !== 'Ok' || !rt) throw new Error('לא נמצא מסלול נסיעה בין הנקודות');
  const raw: GpxPoint[] = rt.geometry.coordinates.map(([lon, lat]: [number, number]) => ({ lat, lon }));
  const coords = simplify(raw, 30).map(p => [+p.lon.toFixed(5), +p.lat.toFixed(5)] as [number, number]);
  const name = (i: number) => pts[i].name ?? `נקודה ${i + 1}`;
  return {
    coords, km: Math.round(rt.distance / 100) / 10, minutes: Math.round(rt.duration / 60),
    legs: rt.legs.map((l: any, i: number) => ({ from: name(i), to: name(i + 1), km: Math.round(l.distance / 100) / 10, minutes: Math.round(l.duration / 60) })),
    stops: pts.map((_, i) => name(i)), at: new Date().toISOString(), source: 'osrm',
  };
}

export interface Trail { id: string; name: string; ref?: string; colour?: string; network?: string; km: number; points: GpxPoint[]; fromKm: number; osmUrl: string; near: string }

/** Join a relation's ways into one line: start anywhere, then keep adding the way whose end is closest, flipping it if needed. */
export function chainWays(ways: GpxPoint[][]): GpxPoint[] {
  const left = ways.filter(w => w.length > 1).map(w => [...w]);
  if (!left.length) return [];
  const out = left.shift()!;
  while (left.length) {
    const end = out[out.length - 1], start = out[0];
    let best = 0, how: 'end' | 'endRev' | 'start' | 'startRev' = 'end', d = Infinity;
    left.forEach((w, i) => {
      const c: [number, typeof how][] = [[distKm(end, w[0]), 'end'], [distKm(end, w[w.length - 1]), 'endRev'], [distKm(start, w[w.length - 1]), 'start'], [distKm(start, w[0]), 'startRev']];
      for (const [k, h] of c) if (k < d) { d = k; best = i; how = h; }
    });
    const w = left.splice(best, 1)[0];
    if (how === 'end') out.push(...w.slice(1)); else if (how === 'endRev') out.push(...w.reverse().slice(1));
    else if (how === 'start') out.unshift(...w.slice(0, -1)); else out.unshift(...w.reverse().slice(0, -1));
  }
  return out;
}

const COLOUR_HE: Record<string, string> = { red: 'אדום', blue: 'כחול', green: 'ירוק', black: 'שחור', orange: 'כתום', purple: 'סגול' };
export const colourHe = (c?: string) => (c ? COLOUR_HE[c.toLowerCase()] ?? c : undefined);

function cache<T>(key: string, f: () => Promise<T>): Promise<T> {
  return f().then(v => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* quota */ } return v; }, err => {
    try { const c = localStorage.getItem(key); if (c) return JSON.parse(c) as T; } catch { /* ignore */ }
    throw err;
  });
}

/** Marked walking routes within `km` of a stop (one Overpass request per stop, cached for use without signal). */
export function trailsNear(stop: Pt & { name: string }, km = 2): Promise<Trail[]> {
  const r = Math.round(km * 1000);
  const q = `[out:json][timeout:25];relation["route"~"^(hiking|foot)$"](around:${r},${stop.lat},${stop.lon});out geom tags 12;`;
  return cache(`campil-trails-${stop.lat.toFixed(3)},${stop.lon.toFixed(3)},${r}`, async () => {
    const j = await getJSON('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    return (j.elements as any[]).map((el): Trail | null => {
      const t = el.tags ?? {};
      const ways: GpxPoint[][] = (el.members ?? []).filter((m: any) => m.type === 'way' && m.geometry?.length).map((m: any) => m.geometry.map((g: any) => ({ lat: g.lat, lon: g.lon })));
      const line = chainWays(ways); if (line.length < 2) return null;
      const total = ways.reduce((a, w) => a + stats(w).km, 0); // the mapped length, not counting gaps between pieces
      const fromKm = Math.min(...line.map(p => distKm(p, stop)));
      const pts = simplify(line, 10);
      return {
        id: `relation/${el.id}`, name: t['name:he'] || t.name || t.ref || (t.osmc_symbol || t.colour ? `שביל ${colourHe(t.colour) ?? ''}`.trim() : 'שביל ללא שם'),
        ref: t.ref, colour: t.colour, network: t.network, km: Math.round(total * 10) / 10, points: pts.length > 1500 ? simplify(line, 30) : pts,
        fromKm: Math.round(fromKm * 10) / 10, osmUrl: `https://www.openstreetmap.org/relation/${el.id}`, near: stop.name,
      };
    }).filter((x): x is Trail => !!x && x.km >= 0.3 && x.km <= 120).sort((a, b) => a.fromKm - b.fromKm || a.km - b.km);
  }).catch(() => { throw new Error('לא הצלחנו לטעון שבילים מ-OpenStreetMap. בדקו את החיבור ונסו שוב.'); });
}

/** Elevation along a line (≤100 samples, one request) → climb and descent. Returns null when unavailable. */
export async function climbOf(points: GpxPoint[]): Promise<{ gain: number; loss: number; samples: number } | null> {
  if (points.length < 2) return null;
  const n = Math.min(100, points.length); const step = (points.length - 1) / (n - 1);
  const s = Array.from({ length: n }, (_, i) => points[Math.round(i * step)]);
  try {
    const j = await getJSON(`https://api.open-meteo.com/v1/elevation?latitude=${s.map(p => p.lat.toFixed(5)).join(',')}&longitude=${s.map(p => p.lon.toFixed(5)).join(',')}`);
    const e: number[] = j.elevation; if (!Array.isArray(e) || e.length !== n) return null;
    let gain = 0, loss = 0; for (let i = 1; i < n; i++) { const d = e[i] - e[i - 1]; if (d > 0) gain += d; else loss -= d; }
    return { gain: Math.round(gain), loss: Math.round(loss), samples: n };
  } catch { return null; }
}

/** A chosen trail as the trip's track (same shape as an imported GPX file). */
export function trailToTrack(t: Trail, climb: { gain: number; loss: number } | null): GpxTrack {
  return { name: t.name, points: t.points, waypoints: [], km: t.km, gain: climb?.gain, loss: climb?.loss, climbEst: !!climb, source: `OpenStreetMap · ${t.osmUrl}`, importedAt: new Date().toISOString() };
}
