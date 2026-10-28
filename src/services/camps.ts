// Campsite search: catalogue + OpenStreetMap (Overpass) + place-name lookup (Nominatim).
import { toPlace, type OsmPlace } from './osm';
import { SITES } from '../data/sites';
import { REGIONS } from '../data/regions';
import { haversineKm } from '../lib/util';
import type { Site } from '../lib/types';

export interface CampResult {
  id: string; name: string; lat: number; lon: number; source: 'catalog' | 'osm';
  kind: string; km?: number; toilets?: boolean; water?: boolean; shower?: boolean; fee?: boolean;
  operator?: string; website?: string; url?: string; site?: Site;
}
export interface Center { lat: number; lon: number; label: string }
const IL = '29.45,34.2,33.45,35.95';
const OVERPASS = 'https://overpass-api.de/api/interpreter';

async function overpass(q: string): Promise<OsmPlace[]> {
  const r = await fetch(OVERPASS, { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  if (!r.ok) throw new Error(String(r.status));
  return (await r.json()).elements.map(toPlace).filter((p: OsmPlace) => p.lat && p.lon);
}

/** Resolve a place name (town, reserve, region) to coordinates. Regions resolve locally. */
export async function geocode(q: string): Promise<Center | null> {
  const reg = REGIONS.find(r => r.name.includes(q) || q.includes(r.short));
  if (reg) return { lat: reg.lat, lon: reg.lon, label: reg.name };
  const site = SITES.find(s => s.name.includes(q));
  if (site) return { lat: site.lat, lon: site.lon, label: site.name };
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=il&limit=1&accept-language=he&q=${encodeURIComponent(q)}`);
    if (!r.ok) return null;
    const j = await r.json(); if (!j[0]) return null;
    return { lat: +j[0].lat, lon: +j[0].lon, label: j[0].name || j[0].display_name.split(',')[0] };
  } catch { return null; }
}

const kinds = (day: boolean) => (day ? 'camp_site|caravan_site|picnic_site' : 'camp_site|caravan_site');
const esc = (s: string) => s.replace(/[\\"]/g, '').replace(/[.*+?^${}()|[\]]/g, '\\\\$&');

export async function searchCamps(opts: { query?: string; center?: Center | null; radiusKm: number; includeDay?: boolean }): Promise<{ center: Center | null; results: CampResult[]; osmError?: string }> {
  const q = (opts.query ?? '').trim();
  let center = opts.center ?? null;
  if (!center && q) center = await geocode(q);
  const k = kinds(!!opts.includeDay);
  const parts: string[] = [];
  if (center) parts.push(`nwr["tourism"~"^(${k})$"](around:${Math.round(opts.radiusKm * 1000)},${center.lat},${center.lon});`);
  if (q) parts.push(`nwr["tourism"~"^(${k})$"]["name"~"${esc(q)}",i](${IL});`);
  let osm: OsmPlace[] = []; let osmError: string | undefined;
  if (parts.length) {
    const key = `campil-camps-${parts.join('')}`;
    try { osm = await overpass(`[out:json][timeout:30];(${parts.join('')});out center 200;`); try { localStorage.setItem(key, JSON.stringify(osm)); } catch { /* quota */ } }
    catch { const c = localStorage.getItem(key); if (c) osm = JSON.parse(c); else osmError = 'OpenStreetMap לא זמין כרגע — מוצגות רק תוצאות מהקטלוג'; }
  }
  const cat = SITES.filter(s => (s.lodging || s.type === 'campsite') && ((q && (s.name.includes(q) || s.desc.includes(q))) || (center && haversineKm(center, s) <= opts.radiusKm)));
  const res: CampResult[] = [
    ...cat.map(s => ({ id: 'cat-' + s.id, name: s.name, lat: s.lat, lon: s.lon, source: 'catalog' as const, kind: 'לינה (קטלוג — לאמת)', website: s.officialUrl, site: s })),
    ...osm.map(p => ({ id: p.id, name: p.name || 'חניון ללא שם', lat: p.lat, lon: p.lon, source: 'osm' as const, kind: p.kind === 'camp_site' ? 'חניון לינה' : p.kind === 'caravan_site' ? 'חניון קרוואנים' : 'חניון יום', toilets: p.toilets, water: p.water, shower: p.shower, fee: p.fee, operator: p.operator, website: p.website, url: p.url })),
  ];
  // de-duplicate catalogue entries that OSM also has (same place within 400 m)
  const out = res.filter((r, i) => r.source === 'osm' || !res.some((o, j) => j !== i && o.source === 'osm' && haversineKm(o, r) < 0.4));
  if (center) for (const r of out) r.km = haversineKm(center, r);
  out.sort((a, b) => (a.km ?? 0) - (b.km ?? 0) || (a.source === 'catalog' ? -1 : 1));
  return { center, results: out, osmError };
}

export type Facility = 'toilets' | 'water' | 'shower' | 'free';
export function applyFacilities(list: CampResult[], f: Facility[]) {
  return list.filter(r => f.every(x => (x === 'free' ? r.fee === false : r[x] === true)));
}
