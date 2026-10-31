// The extended place database (public/data/places.json): real places from Wikidata and OpenStreetMap, built by
// scripts/enrich in GitHub Actions. Loaded only when a screen needs it (~110 KB gzip), then kept by the service
// worker for offline use. Every place carries its source ids; fields are present only when a source has them.
import type { RegionId } from '../lib/types';
import { haversineKm } from '../lib/util';

export type PlaceCat =
  | 'nature_reserve' | 'national_park' | 'spring' | 'waterfall' | 'stream' | 'lake' | 'beach' | 'cave' | 'viewpoint'
  | 'archaeological' | 'castle' | 'forest' | 'park' | 'campsite' | 'caravan' | 'picnic' | 'trail' | 'bicycle' | 'visitor_center'
  | 'observatory' | 'zoo' | 'peak' | 'botanical' | 'birding' | 'attraction';
export interface PlaceImage { thumb: string; page: string; license: string; author: string }
/** Facilities exactly as mapped in OpenStreetMap — true / false when tagged, absent when nobody mapped it. */
export interface PlaceFacilities { toilets?: boolean; water?: boolean; shower?: boolean; power?: boolean; fee?: boolean; wheelchair?: string; dog?: string; tents?: boolean; caravans?: boolean; fire?: boolean; bbq?: boolean; shelter?: boolean; backcountry?: boolean }
export interface Place {
  id: string; he: string; en?: string; lat: number; lon: number; r: RegionId; c: PlaceCat[];
  qid?: string; osm?: string; web?: string; wiki?: string; img?: PlaceImage; her?: boolean;
  fac?: PlaceFacilities; hours?: string; op?: string; km?: number; mark?: string; site?: string; /** inside another place (e.g. a campsite in a national park) */ in?: string; src: ('wd' | 'osm')[];
}
export interface PlaceDb { sources: { wikidata?: string; osm?: string }; attribution: string; count: number; places: Place[] }

export const CAT_HE: Record<PlaceCat, string> = {
  nature_reserve: 'שמורת טבע', national_park: 'גן לאומי', spring: 'מעיין', waterfall: 'מפל', stream: 'נחל', lake: 'אגם / מאגר', beach: 'חוף',
  cave: 'מערה', viewpoint: 'תצפית', archaeological: 'אתר ארכיאולוגי', castle: 'מבצר', forest: 'יער', park: 'פארק', campsite: 'חניון לינה',
  caravan: 'חניון קרוואנים', picnic: 'חניון יום / פיקניק', trail: 'שביל / מסלול', bicycle: 'מסלול אופניים', visitor_center: 'מרכז מבקרים',
  observatory: 'מצפה כוכבים', zoo: 'גן חיות / ספארי', peak: 'פסגה', botanical: 'גן בוטני', birding: 'צפרות', attraction: 'אטרקציה',
};
/** Groups for filters (the brief's categories, as far as the sources carry them). */
export const CAT_GROUPS: { id: string; label: string; cats: PlaceCat[] }[] = [
  { id: 'nature', label: 'שמורות וגנים', cats: ['nature_reserve', 'national_park'] },
  { id: 'water', label: 'מים: מעיינות, מפלים, נחלים', cats: ['spring', 'waterfall', 'stream', 'lake'] },
  { id: 'beach', label: 'חופים', cats: ['beach'] },
  { id: 'views', label: 'תצפיות ופסגות', cats: ['viewpoint', 'peak'] },
  { id: 'trail', label: 'מסלולים ושבילים', cats: ['trail', 'bicycle'] },
  { id: 'sleep', label: 'לינה: חניונים וקרוואנים', cats: ['campsite', 'caravan'] },
  { id: 'picnic', label: 'חניוני יום ופיקניק', cats: ['picnic'] },
  { id: 'heritage', label: 'מורשת וארכיאולוגיה', cats: ['archaeological', 'castle'] },
  { id: 'parks', label: 'פארקים ויערות', cats: ['park', 'forest', 'botanical'] },
  { id: 'family', label: 'אטרקציות ומרכזי מבקרים', cats: ['attraction', 'zoo', 'visitor_center'] },
  { id: 'special', label: 'מערות, צפרות וכוכבים', cats: ['cave', 'birding', 'observatory'] },
];

let db: Promise<PlaceDb> | null = null;
let byId: Map<string, Place> | null = null;
/** Load once per session; the service worker serves it offline after the first load. */
export function loadPlaces(): Promise<PlaceDb> {
  if (!db) db = fetch(`${import.meta.env.BASE_URL}data/places.json`).then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then((d: PlaceDb) => { byId = new Map(d.places.map(p => [p.id, p])); return d; })
    .catch(e => { db = null; throw new Error('מאגר המקומות לא נטען — צריך חיבור לאינטרנט בפעם הראשונה.' + (e?.message ? '' : '')); });
  return db;
}
export const placeById = async (id: string) => { await loadPlaces(); return byId!.get(id) ?? null; };
export const placeForSite = async (siteId: string) => (await loadPlaces()).places.find(p => p.site === siteId) ?? null;

const norm = (s: string) => s.replace(/["'״׳()\-–,.]/g, ' ').replace(/\s+/g, ' ').trim();
/** Name search. Several places can share a name (a reserve and an ancient site, two springs) — all are returned,
 *  each with its region and category, so the user picks the right one. */
export function searchPlaces(d: PlaceDb, q: string, limit = 20): Place[] {
  const k = norm(q); if (k.length < 2) return [];
  const score = (p: Place) => { const n = norm(p.he); const e = (p.en ?? '').toLowerCase(); return n === k ? 0 : n.startsWith(k) ? 1 : n.includes(k) ? 2 : e.includes(k.toLowerCase()) ? 3 : 9; };
  return d.places.map(p => ({ p, s: score(p) })).filter(x => x.s < 9).sort((a, b) => a.s - b.s || richness(b.p) - richness(a.p)).slice(0, limit).map(x => x.p);
}
/** How much we can show about a place (an article, an image, mapped facilities, a curated entry). */
export const richness = (p: Place) => (p.wiki ? 2 : 0) + (p.img ? 1 : 0) + (p.fac ? 1 : 0) + (p.site ? 2 : 0) + (p.web ? 1 : 0);
/** Same name, different place: the names the user has to choose between. */
export const sameNameCount = (d: PlaceDb, p: Place) => d.places.filter(x => x.id !== p.id && norm(x.he) === norm(p.he)).length;

export interface Near { p: Place; km: number }
/** Places within `km` (air distance — never shown as driving distance), nearest first. */
export function nearby(d: PlaceDb, at: { lat: number; lon: number }, km: number, cats?: PlaceCat[], exclude?: string): Near[] {
  return d.places.filter(p => p.id !== exclude && (!cats?.length || p.c.some(c => cats.includes(c))))
    .map(p => ({ p, km: haversineKm(at, p) })).filter(x => x.km <= km).sort((a, b) => a.km - b.km);
}

export const wikiUrl = (title: string) => `https://he.wikipedia.org/wiki/${encodeURIComponent(title)}`;
export const osmUrl = (osm: string) => `https://www.openstreetmap.org/${({ n: 'node', w: 'way', r: 'relation' } as const)[osm[0] as 'n' | 'w' | 'r']}/${osm.slice(1)}`;
export const wikidataUrl = (qid: string) => `https://www.wikidata.org/wiki/${qid}`;

/** Hebrew Wikipedia summary for a known article title (CC BY-SA — shown with a link to the article). */
export async function wikiExtract(title: string): Promise<{ extract: string; url: string } | null> {
  const k = `campil-wx-${title}`;
  try { const c = localStorage.getItem(k); if (c) return JSON.parse(c); } catch { /* ignore */ }
  const r = await fetch(`https://he.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`); if (!r.ok) return null;
  const s = await r.json(); if (!s.extract) return null;
  const v = { extract: s.extract as string, url: (s.content_urls?.desktop?.page as string) ?? wikiUrl(title) };
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* quota */ }
  return v;
}

export interface Amenity { kind: 'toilets' | 'water' | 'picnic' | 'shelter' | 'parking' | 'bbq'; lat: number; lon: number; m: number }
export const AMENITY_HE: Record<Amenity['kind'], string> = { toilets: 'שירותים', water: 'מי שתייה', picnic: 'שולחנות פיקניק', shelter: 'סככת צל', parking: 'חניה', bbq: 'מתקן מנגל' };
/** Mapped amenities around a point (OpenStreetMap, live, cached). "Not mapped" is not "not there". */
export async function amenitiesNear(lat: number, lon: number, meters = 600): Promise<Amenity[]> {
  const k = `campil-am-${lat.toFixed(4)},${lon.toFixed(4)},${meters}`;
  try { const c = localStorage.getItem(k); if (c) { const v = JSON.parse(c); if (Date.now() - v.at < 14 * 864e5) return v.list; } } catch { /* ignore */ }
  const a = `(around:${meters},${lat},${lon})`;
  const q = `[out:json][timeout:20];(nwr["amenity"="toilets"]${a};nwr["amenity"="drinking_water"]${a};nwr["leisure"="picnic_table"]${a};nwr["tourism"="picnic_site"]${a};nwr["amenity"="shelter"]${a};nwr["amenity"="parking"]${a};nwr["amenity"="bbq"]${a};);out center tags 120;`;
  const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).catch(() => null);
  if (!r?.ok) throw new Error('המתקנים לא נטענו — שירות המפה לא זמין או שאין חיבור. נסו שוב מאוחר יותר.');
  const kindOf = (t: Record<string, string>): Amenity['kind'] | null => t.amenity === 'toilets' ? 'toilets' : t.amenity === 'drinking_water' ? 'water' : t.leisure === 'picnic_table' || t.tourism === 'picnic_site' ? 'picnic' : t.amenity === 'shelter' ? 'shelter' : t.amenity === 'parking' ? 'parking' : t.amenity === 'bbq' ? 'bbq' : null;
  const list: Amenity[] = ((await r.json()).elements as any[]).map(e => { const kind = kindOf(e.tags ?? {}); const la = e.lat ?? e.center?.lat, lo = e.lon ?? e.center?.lon; return kind && la ? { kind, lat: la, lon: lo, m: Math.round(haversineKm({ lat, lon }, { lat: la, lon: lo }) * 1000) } : null; }).filter(Boolean) as Amenity[];
  try { localStorage.setItem(k, JSON.stringify({ at: Date.now(), list })); } catch { /* quota */ }
  return list;
}
