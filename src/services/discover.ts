// CampIL Discover — real places around a destination and along the drive to it, from OpenStreetMap (live, ODbL)
// merged with the CampIL place database. Free sources only (no billing, no API keys). What OSM does not have —
// ratings, reviews, verified kashrut — is never filled in: the UI says "check with the business".
// Requests are cached per area (3 days) and de-duplicated in flight, so the public Overpass server is used gently.
import { haversineKm } from '../lib/util';
import { loadPlaces, nearby as dbNearby, CAT_HE, type Place, type PlaceCat } from './placesDb';

export type DiscCat = 'cart' | 'cafe' | 'breakfast' | 'restaurant' | 'trail' | 'view' | 'water' | 'picnic' | 'family' | 'visitor' | 'heritage';
export const DISC_HE: Record<DiscCat, string> = {
  cart: 'עגלת קפה', cafe: 'בית קפה', breakfast: 'מאפייה / ארוחת בוקר', restaurant: 'מסעדה', trail: 'מסלול', view: 'תצפית',
  water: 'מעיין / נחל / מפל', picnic: 'חניון פיקניק', family: 'אטרקציה משפחתית', visitor: 'מרכז מבקרים', heritage: 'אתר מורשת',
};
export const FOOD: DiscCat[] = ['cart', 'cafe', 'breakfast', 'restaurant'];
export const NATURE: DiscCat[] = ['trail', 'view', 'water', 'picnic'];

export interface DiscPlace {
  id: string; name: string; lat: number; lon: number; cat: DiscCat; source: 'osm' | 'campil';
  /** why the category was given (for coffee carts: the evidence, since OSM has no "coffee cart" type) */
  catWhy?: string; catSure: boolean;
  osmUrl?: string; place?: Place;
  hours?: string; website?: string; phone?: string; cuisine?: string[];
  kosher?: 'yes' | 'only' | 'no'; vegetarian?: 'yes' | 'only' | 'no'; vegan?: 'yes' | 'only' | 'no';
  outdoor?: boolean; indoor?: boolean; wheelchair?: string; takeaway?: boolean; dogs?: string; km?: number; image?: string;
  addr?: string;
  /** the exact kind for CampIL database places ("גן לאומי", "מעיין") */
  label?: string;
}

// ── coffee carts: OSM has no tag for them; evidence = the name, or a street-vendor / mobile / kiosk tag ──
export const CART_WORDS = /עגל[הת]|קפה\s*ב(טבע|שטח|דרך)|קפה\s*שטח|קרוואן\s*קפה|coffee\s*(cart|truck|trailer|van|bike)|mobile\s*coffee|food\s*truck/i;
export function coffeeKind(t: Record<string, string>): { cat: 'cart' | 'cafe' | 'breakfast' | null; why?: string; sure: boolean } {
  const name = `${t.name ?? ''} ${t['name:he'] ?? ''} ${t['name:en'] ?? ''}`;
  if (CART_WORDS.test(name)) return { cat: 'cart', why: 'השם מעיד על עגלת קפה / קפה בשטח', sure: true };
  if (t.street_vendor === 'yes' || t.mobile === 'yes' || t.vending || (t.shop === 'kiosk' && /קפה|coffee/i.test(name)))
    return { cat: 'cart', why: 'מסומן במפה כדוכן נייד / רחוב', sure: false };
  if (t.amenity === 'cafe') return { cat: 'cafe', why: t.building === 'no' || t.shelter === 'yes' ? 'בית קפה בלי מבנה — ייתכן עגלה, לא אומת' : undefined, sure: true };
  if (t.shop === 'bakery' || /breakfast/.test(t.cuisine ?? '')) return { cat: 'breakfast', sure: true };
  return { cat: null, sure: false };
}
const diet = (v?: string) => (v === 'yes' || v === 'only' || v === 'no' ? v : undefined);
const yes = (v?: string) => (v == null ? undefined : v === 'yes' || v === 'designated');

/** OSM element → a discover place (or null when it is not one of ours). Pure — tested. */
export function fromOsm(el: any): DiscPlace | null {
  const t: Record<string, string> = el.tags ?? {};
  const lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon; if (lat == null || lon == null) return null;
  const name = t['name:he'] || t.name; if (!name) return null;
  let cat: DiscCat | null = null; let catWhy: string | undefined; let catSure = true;
  const ck = coffeeKind(t);
  if (ck.cat) { cat = ck.cat; catWhy = ck.why; catSure = ck.sure; }
  else if (t.amenity === 'restaurant' || t.amenity === 'fast_food') cat = 'restaurant';
  else if (t.route === 'hiking' || t.route === 'foot') cat = 'trail';
  else if (t.tourism === 'viewpoint') cat = 'view';
  else if (t.natural === 'spring' || t.waterway === 'waterfall') cat = 'water';
  else if (t.tourism === 'picnic_site' || t.leisure === 'picnic_site') cat = 'picnic';
  else if (t.tourism === 'information' && t.information === 'visitor_centre') cat = 'visitor';
  else if (t.tourism === 'zoo' || t.tourism === 'theme_park' || t.leisure === 'playground' && t.name || t.tourism === 'attraction' || t.leisure === 'water_park') cat = 'family';
  else if (t.historic) cat = 'heritage';
  if (!cat) return null;
  const type = el.type ?? 'node';
  return {
    id: `osm:${type[0]}${el.id}`, name, lat, lon, cat, catWhy, catSure, source: 'osm', osmUrl: `https://www.openstreetmap.org/${type}/${el.id}`,
    hours: t.opening_hours, website: t.website || t['contact:website'] || t['contact:facebook'] || t['contact:instagram'], phone: t.phone || t['contact:phone'],
    cuisine: t.cuisine?.split(';').map(s => s.trim()).filter(Boolean), kosher: diet(t['diet:kosher']), vegetarian: diet(t['diet:vegetarian']), vegan: diet(t['diet:vegan']),
    outdoor: yes(t.outdoor_seating), indoor: yes(t.indoor_seating), wheelchair: t.wheelchair, takeaway: yes(t.takeaway), dogs: t.dog,
    km: t.distance ? parseFloat(t.distance) || undefined : undefined, addr: [t['addr:street'], t['addr:housenumber'], t['addr:city']].filter(Boolean).join(' ') || undefined,
  };
}

const SEL: Record<DiscCat, string[]> = {
  cart: ['nwr["amenity"="cafe"]', 'nwr["shop"="kiosk"]["name"~"קפה|coffee",i]', 'nwr["amenity"="fast_food"]["name"~"עגל|coffee",i]', 'nwr["street_vendor"="yes"]["name"]'],
  cafe: ['nwr["amenity"="cafe"]'],
  breakfast: ['nwr["shop"="bakery"]', 'nwr["cuisine"~"breakfast"]'],
  restaurant: ['nwr["amenity"="restaurant"]', 'nwr["amenity"="fast_food"]'],
  trail: ['relation["route"~"^(hiking|foot)$"]["name"]'],
  view: ['nwr["tourism"="viewpoint"]["name"]'],
  water: ['nwr["natural"="spring"]["name"]', 'nwr["waterway"="waterfall"]["name"]'],
  picnic: ['nwr["tourism"="picnic_site"]["name"]', 'nwr["leisure"="picnic_site"]["name"]'],
  family: ['nwr["tourism"~"^(zoo|theme_park|attraction)$"]["name"]', 'nwr["leisure"="water_park"]["name"]'],
  visitor: ['nwr["tourism"="information"]["information"="visitor_centre"]["name"]'],
  heritage: ['nwr["historic"~"^(archaeological_site|castle|ruins|fort|monument)$"]["name"]'],
};

const inflight = new Map<string, Promise<any[]>>();
async function overpass(q: string, key: string): Promise<any[]> {
  try { const c = localStorage.getItem(key); if (c) { const v = JSON.parse(c); if (Date.now() - v.at < 3 * 864e5) return v.els; } } catch { /* ignore */ }
  if (inflight.has(key)) return inflight.get(key)!;
  const p = (async () => {
    const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).catch(() => null);
    if (!r?.ok) throw new Error(r?.status === 429 ? 'שירות המפה עמוס כרגע — נסו שוב בעוד דקה.' : 'לא הצלחנו לחפש במפה (צריך חיבור לאינטרנט).');
    const els = (await r.json()).elements as any[];
    try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), els })); } catch { /* quota */ }
    return els;
  })().finally(() => inflight.delete(key));
  inflight.set(key, p); return p;
}

/** Around a point, within `km` (≤ 30 for the public server). */
export async function searchAround(at: { lat: number; lon: number }, km: number, cats: DiscCat[]): Promise<DiscPlace[]> {
  const r = Math.round(Math.min(km, 30) * 1000); const sels = [...new Set(cats.flatMap(c => SEL[c]))];
  const q = `[out:json][timeout:25];(${sels.map(s => `${s}(around:${r},${at.lat.toFixed(4)},${at.lon.toFixed(4)});`).join('')});out center tags 400;`;
  const els = await overpass(q, `campil-disc-a-${at.lat.toFixed(3)},${at.lon.toFixed(3)},${r},${cats.slice().sort().join(',')}`);
  return withDb(els.map(fromOsm).filter((x): x is DiscPlace => !!x && cats.includes(x.cat)), at, km, cats);
}
/** Along a driving route (a buffer around the road line). */
export async function searchAlong(coords: [number, number][], bufferKm: number, cats: DiscCat[]): Promise<DiscPlace[]> {
  const pts = thinLine(coords, 40); const line = pts.map(([lon, lat]) => `${lat.toFixed(4)},${lon.toFixed(4)}`).join(',');
  const r = Math.round(bufferKm * 1000); const sels = [...new Set(cats.flatMap(c => SEL[c]))];
  const q = `[out:json][timeout:30];(${sels.map(s => `${s}(around:${r},${line});`).join('')});out center tags 400;`;
  const els = await overpass(q, `campil-disc-l-${line.length}-${line.slice(0, 40)}-${r},${cats.slice().sort().join(',')}`);
  return els.map(fromOsm).filter((x): x is DiscPlace => !!x && cats.includes(x.cat));
}
export function thinLine(c: [number, number][], n: number): [number, number][] { if (c.length <= n) return c; const step = (c.length - 1) / (n - 1); return Array.from({ length: n }, (_, i) => c[Math.round(i * step)]); }

// CampIL database categories → discover categories (nature places come with articles, images, sources)
const DB_MAP: Partial<Record<PlaceCat, DiscCat>> = { trail: 'trail', viewpoint: 'view', spring: 'water', waterfall: 'water', picnic: 'picnic', visitor_center: 'visitor', zoo: 'family', attraction: 'family', archaeological: 'heritage', castle: 'heritage', national_park: 'family', botanical: 'family' };
/** Add CampIL database places and drop OSM duplicates of them (same name within 500 m). */
async function withDb(osm: DiscPlace[], at: { lat: number; lon: number }, km: number, cats: DiscCat[]): Promise<DiscPlace[]> {
  const db = await loadPlaces().catch(() => null); if (!db) return osm;
  const ours: DiscPlace[] = dbNearby(db, at, km).map(({ p }): DiscPlace | null => { const cat = p.c.map(c => DB_MAP[c]).find(Boolean) as DiscCat | undefined; return cat && cats.includes(cat) ? { id: p.id, name: p.he, lat: p.lat, lon: p.lon, cat, catSure: true, source: 'campil' as const, place: p, label: CAT_HE[p.c[0]], image: p.img?.thumb, hours: p.hours, website: p.web, km: p.km } : null; }).filter((x): x is DiscPlace => !!x);
  const dup = (o: DiscPlace) => ours.some(d => haversineKm(d, o) < 0.5 && (d.name.includes(o.name) || o.name.includes(d.name) || (d.place?.osm && o.id === 'osm:' + d.place.osm)));
  return [...ours, ...osm.filter(o => !dup(o))];
}
