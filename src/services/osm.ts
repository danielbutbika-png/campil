// Live points from OpenStreetMap via the public Overpass API (ODbL — attribution shown in the UI).
// Facilities are read only from explicit OSM tags; missing tags are shown as "לא ידוע".
export interface OsmPlace {
  id: string; name: string; kind: 'camp_site' | 'caravan_site' | 'picnic_site' | 'viewpoint' | 'spring'; lat: number; lon: number;
  toilets?: boolean; water?: boolean; shower?: boolean; fee?: boolean; operator?: string; website?: string; url: string;
}
const ENDPOINT = 'https://overpass-api.de/api/interpreter';
const yes = (v?: string) => (v == null ? undefined : v === 'yes' ? true : v === 'no' ? false : undefined);

export async function fetchOsm(bbox: number[], kinds: OsmPlace['kind'][] = ['camp_site', 'picnic_site']): Promise<OsmPlace[]> {
  const [w, s, e, n] = bbox; const b = `${s},${w},${n},${e}`;
  const parts = kinds.map(k => k === 'spring' ? `nwr["natural"="spring"]["name"](${b});` : `nwr["tourism"="${k}"](${b});`).join('');
  const q = `[out:json][timeout:25];(${parts});out center 200;`;
  const key = `campil-osm-${b}-${kinds.join(',')}`;
  try {
    const r = await fetch(ENDPOINT, { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json();
    const out: OsmPlace[] = j.elements.map(toPlace).filter((p: OsmPlace) => p.lat && p.name);
    try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), out })); } catch { /* quota */ }
    return out;
  } catch (err) {
    const c = localStorage.getItem(key);
    if (c) return JSON.parse(c).out;
    throw new Error('לא הצלחנו לטעון נתונים מ-OpenStreetMap. בדקו את החיבור ונסו שוב.');
  }
}
export function toPlace(el: any): OsmPlace {
  const t = el.tags || {}; const lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon;
  const kind = t.natural === 'spring' ? 'spring' : t.tourism;
  return { id: `${el.type}/${el.id}`, name: t['name:he'] || t.name || '', kind, lat, lon, toilets: yes(t.toilets), water: yes(t.drinking_water), shower: yes(t.shower), fee: yes(t.fee), operator: t.operator, website: t.website || t['contact:website'], url: `https://www.openstreetmap.org/${el.type}/${el.id}` };
}
export const OSM_KIND_HE: Record<OsmPlace['kind'], string> = { caravan_site: 'חניון קרוואנים', camp_site: 'חניון לינה', picnic_site: 'חניון יום / פיקניק', viewpoint: 'תצפית', spring: 'מעיין' };
