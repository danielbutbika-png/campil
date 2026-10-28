// "Prepare for the field": save what a trip needs on this device before losing signal.
// The app itself is precached by the service worker; trip data lives in local storage already.
// This adds: the forecast, and the map of the trip area — within OpenFreeMap's terms for offline
// downloads (each download ≤ 3,000 tiles or 50 MB, ≤ 4 parallel requests, attribution kept).
import type { Trip } from './types';
import { fetchForecast, cacheForecast } from '../services/weather';

export const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
export const OFFLINE_CACHE = 'campil-offline-map';
export const MAP_LIMITS = { tiles: 3000, bytes: 50 * 1024 * 1024, parallel: 4 };
export const MAP_TERMS_URL = 'https://openfreemap.org';

export interface Prepared { at: number; forecast: boolean; tiles: number; bytes: number; zooms: [number, number]; radiusKm: number; skipped?: string }
export type Step = 'app' | 'forecast' | 'map';
export interface Progress { step: Step; done: number; total: number }

// ── tile math (Web Mercator) ──
const lon2x = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * 2 ** z);
const lat2y = (lat: number, z: number) => { const r = (lat * Math.PI) / 180; return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z); };
/** Tiles covering a circle around a point, zoom by zoom, nearest first, until the cap. */
export function tilesAround(lat: number, lon: number, radiusKm: number, zMin: number, zMax: number, cap = MAP_LIMITS.tiles) {
  const dLat = radiusKm / 111, dLon = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  const out: { z: number; x: number; y: number }[] = [];
  for (let z = zMin; z <= zMax; z++) {
    const x0 = lon2x(lon - dLon, z), x1 = lon2x(lon + dLon, z), y0 = lat2y(lat + dLat, z), y1 = lat2y(lat - dLat, z);
    const n = (x1 - x0 + 1) * (y1 - y0 + 1);
    if (out.length + n > cap) return { tiles: out, zMax: z - 1 };
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) out.push({ z, x, y });
  }
  return { tiles: out, zMax };
}

async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<void>, signal?: AbortSignal) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { if (signal?.aborted) throw new DOMException('aborted', 'AbortError'); await fn(items[i++]); } }));
}

/** Download style, sprites, label fonts and tiles of the area into a cache the service worker serves offline. */
async function saveMap(lat: number, lon: number, onTile: (done: number, total: number) => void, signal?: AbortSignal) {
  const cache = await caches.open(OFFLINE_CACHE);
  const get = async (url: string) => { const r = await fetch(url, { signal, mode: 'cors' }); if (!r.ok) throw new Error(`${r.status} ${url}`); await cache.put(url, r.clone()); return r; };
  const style = await (await get(MAP_STYLE)).json();
  const srcUrl = Object.values<any>(style.sources).find(s => s.url)?.url as string;
  const tilejson = await (await get(srcUrl)).json();
  const template: string = tilejson.tiles[0];
  if (style.sprite) for (const suf of ['.json', '.png', '@2x.json', '@2x.png']) await get(String(style.sprite) + suf).catch(() => {});
  // label fonts: Latin, Hebrew, punctuation ranges for every font stack the style uses
  const stacks = new Set<string>();
  for (const l of style.layers ?? []) { const f = l.layout?.['text-font']; if (Array.isArray(f) && f.every((x: unknown) => typeof x === 'string')) stacks.add(f.join(',')); }
  for (const s of stacks) for (const r of ['0-255', '1280-1535', '8192-8447']) await get(String(style.glyphs).replace('{fontstack}', encodeURIComponent(s)).replace('{range}', r)).catch(() => {});
  // the whole country at low zoom + the trip area in detail, within the provider's cap
  const country = tilesAround(31.4, 35.0, 230, 5, 8, 400).tiles;
  const area = tilesAround(lat, lon, 20, 9, 14, MAP_LIMITS.tiles - country.length);
  const list = [...country, ...area.tiles];
  let done = 0, bytes = 0, stopped = '';
  await pool(list, MAP_LIMITS.parallel, async t => {
    if (bytes > MAP_LIMITS.bytes) { stopped = 'הגענו למגבלת 50MB של ספק המפות'; return; }
    const url = template.replace('{z}', String(t.z)).replace('{x}', String(t.x)).replace('{y}', String(t.y));
    if (!(await cache.match(url))) { const r = await get(url).catch(() => null); if (r) bytes += Number(r.headers.get('content-length')) || (await r.clone().arrayBuffer()).byteLength; }
    onTile(++done, list.length);
  }, signal);
  return { tiles: done, bytes, zooms: [5, area.zMax] as [number, number], radiusKm: 20, skipped: stopped || undefined };
}

export async function prepareTrip(t: Trip, point: { lat: number; lon: number } | null, onProgress: (p: Progress) => void, signal?: AbortSignal): Promise<Prepared> {
  if (!navigator.onLine) throw new Error('צריך חיבור לאינטרנט כדי להכין את הטיול. עשו את זה בבית, לפני היציאה.');
  onProgress({ step: 'app', done: 0, total: 1 });
  await navigator.serviceWorker?.ready.catch(() => undefined);
  onProgress({ step: 'app', done: 1, total: 1 });
  let forecast = false;
  if (point) {
    onProgress({ step: 'forecast', done: 0, total: 1 });
    try { cacheForecast(await fetchForecast(point.lat, point.lon)); forecast = true; } catch { /* keep the last saved one */ }
    onProgress({ step: 'forecast', done: 1, total: 1 });
  }
  const map = point ? await saveMap(point.lat, point.lon, (done, total) => onProgress({ step: 'map', done, total }), signal) : { tiles: 0, bytes: 0, zooms: [0, 0] as [number, number], radiusKm: 0 };
  return { at: Date.now(), forecast, ...map };
}

/** Is the map style available (online, or saved by "prepare")? Decides between the real map and the plain fallback. */
export async function mapStyleAvailable(): Promise<boolean> {
  if (navigator.onLine) return true;
  try { return !!(await caches.match(MAP_STYLE, { ignoreVary: true })); } catch { return false; }
}
