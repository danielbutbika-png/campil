// Driving route (OSRM public server) and fuel stations along it (OpenStreetMap via Overpass).
import { haversineKm } from '../lib/util';

export type BrandId = 'paz' | 'delek' | 'sonol' | 'doralon' | 'ten' | 'other';
export const BRANDS: { id: BrandId; name: string; color: string; re: RegExp }[] = [
  { id: 'paz', name: 'פז', color: '#f5b400', re: /\bpaz\b|^פז|פז\b|yellow/i },
  { id: 'delek', name: 'דלק', color: '#d7262e', re: /\bdelek\b|^דלק$|חברת דלק|דלק ישראל|מנטה/i },
  { id: 'sonol', name: 'סונול', color: '#1f5fae', re: /sonol|סונול/i },
  { id: 'doralon', name: 'דור אלון', color: '#0a8f4f', re: /dor ?alon|דור ?אלון|alonit|אלונית/i },
  { id: 'ten', name: 'טן', color: '#6a3fa0', re: /^ten$|\bten\b|^טן$|טן דלקים/i },
  { id: 'other', name: 'אחר / לא מסומן', color: '#6b6b6b', re: /$^/ },
];
export const BRAND_BY_ID = Object.fromEntries(BRANDS.map(b => [b.id, b])) as Record<BrandId, (typeof BRANDS)[number]>;

/** Brand from OSM tags: brand → brand:he → operator → name. */
export function brandOf(tags: Record<string, string>): BrandId {
  for (const k of ['brand', 'brand:he', 'brand:en', 'operator', 'name', 'name:he', 'name:en']) {
    const v = tags[k]; if (!v) continue;
    const b = BRANDS.find(x => x.id !== 'other' && x.re.test(v.trim()));
    if (b) return b.id;
  }
  return 'other';
}

export interface Route { coords: [number, number][]; km: number; minutes: number | null; source: 'osrm' | 'straight' }
export interface FuelStation { id: string; name: string; brand: BrandId; lat: number; lon: number; alongKm?: number; offKm?: number; url: string; open24?: boolean; shop?: boolean }

export async function fetchRoute(from: { lat: number; lon: number }, to: { lat: number; lon: number }): Promise<Route> {
  try {
    const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=simplified&geometries=geojson`);
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json(); const rt = j.routes?.[0]; if (!rt) throw new Error('no route');
    return { coords: rt.geometry.coordinates, km: rt.distance / 1000, minutes: Math.round(rt.duration / 60), source: 'osrm' };
  } catch {
    return { coords: [[from.lon, from.lat], [to.lon, to.lat]], km: haversineKm(from, to), minutes: null, source: 'straight' };
  }
}

/** Evenly thin a polyline to at most n vertices (Overpass `around` accepts a vertex list). */
export function thin(coords: [number, number][], n = 60) {
  if (coords.length <= n) return coords;
  const step = (coords.length - 1) / (n - 1);
  return Array.from({ length: n }, (_, i) => coords[Math.round(i * step)]);
}

export function placeAlong(st: { lat: number; lon: number }, coords: [number, number][]) {
  let best = Infinity, bi = 0;
  coords.forEach(([lon, lat], i) => { const d = haversineKm(st, { lat, lon }); if (d < best) { best = d; bi = i; } });
  let along = 0; for (let i = 1; i <= bi; i++) along += haversineKm({ lat: coords[i - 1][1], lon: coords[i - 1][0] }, { lat: coords[i][1], lon: coords[i][0] });
  return { alongKm: along, offKm: best };
}

function toStations(j: any): FuelStation[] {
  return j.elements.map((el: any) => {
    const t = el.tags || {}; const lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon;
    return { id: `${el.type}/${el.id}`, name: t['name:he'] || t.name || t.brand || 'תחנת דלק', brand: brandOf(t), lat, lon, url: `https://www.openstreetmap.org/${el.type}/${el.id}`, open24: t.opening_hours === '24/7' ? true : undefined, shop: t.shop ? true : undefined };
  }).filter((s: FuelStation) => s.lat && s.lon);
}

async function overpass(q: string, key: string) {
  try {
    const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    if (!r.ok) throw new Error(String(r.status));
    const out = toStations(await r.json());
    try { localStorage.setItem(key, JSON.stringify(out)); } catch { /* quota */ }
    return out;
  } catch {
    const c = localStorage.getItem(key); if (c) return JSON.parse(c) as FuelStation[];
    throw new Error('לא הצלחנו לטעון תחנות דלק מ-OpenStreetMap. בדקו את החיבור ונסו שוב.');
  }
}

export async function fuelAlongRoute(route: Route, bufferKm = 2): Promise<FuelStation[]> {
  const pts = thin(route.coords).map(([lon, lat]) => `${lat.toFixed(4)},${lon.toFixed(4)}`).join(',');
  const q = `[out:json][timeout:40];nwr["amenity"="fuel"](around:${Math.round(bufferKm * 1000)},${pts});out center 300;`;
  const list = await overpass(q, `campil-fuel-r-${route.coords[0]}-${route.coords.at(-1)}-${bufferKm}`);
  return list.map(s => ({ ...s, ...placeAlong(s, route.coords) })).sort((a, b) => a.alongKm! - b.alongKm!);
}

export async function fuelInBox(bbox: number[]): Promise<FuelStation[]> {
  const [w, s, e, n] = bbox;
  return overpass(`[out:json][timeout:30];nwr["amenity"="fuel"](${s},${w},${n},${e});out center 300;`, `campil-fuel-b-${bbox.join(',')}`);
}

export const filterBrands = (list: FuelStation[], brands: BrandId[]) => (brands.length ? list.filter(s => brands.includes(s.brand)) : list);

export const navApps = (lat: number, lon: number) => [
  { name: 'Waze', url: `https://waze.com/ul?ll=${lat},${lon}&navigate=yes` },
  { name: 'Google Maps', url: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving` },
  { name: 'Apple Maps', url: `https://maps.apple.com/?daddr=${lat},${lon}&dirflg=d` },
];
