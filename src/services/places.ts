// Place search from open web sources:
//  • by name — Nominatim (OpenStreetMap geocoder): one request per search, never autocomplete (usage policy)
//  • nearby — Overpass (OpenStreetMap): viewpoints, springs, waterfalls, beaches, reserves, picnic/camp sites, heritage…
//  • description — Hebrew Wikipedia summary (CC BY-SA) when the place has a Wikipedia article
// Everything is community / encyclopedic data: shown with its source, never as verified opening hours, prices or access.
export interface WebPlace {
  id: string; name: string; lat: number; lon: number; kind: string; label: string;
  tags: { website?: string; wikipedia?: string; fee?: boolean; wheelchair?: string; dog?: string; drinking_water?: boolean; opening_hours?: string; operator?: string };
  source: 'nominatim' | 'overpass'; osmUrl: string;
}
export interface WikiSummary { title: string; extract: string; url: string }

export type Category = 'viewpoint' | 'water' | 'nature' | 'picnic' | 'camp' | 'heritage' | 'peak';
export const CATEGORY_HE: Record<Category, string> = { viewpoint: 'תצפיות', water: 'מעיינות, מפלים וחופים', nature: 'שמורות ופארקים', picnic: 'חניוני יום ופיקניק', camp: 'חניוני לילה', heritage: 'מורשת וארכיאולוגיה', peak: 'פסגות' };
const Q: Record<Category, string[]> = {
  viewpoint: ['nwr["tourism"="viewpoint"]'],
  water: ['nwr["natural"="spring"]["name"]', 'nwr["waterway"="waterfall"]["name"]', 'nwr["natural"="beach"]["name"]'],
  nature: ['nwr["leisure"="nature_reserve"]["name"]', 'nwr["boundary"="protected_area"]["name"]', 'nwr["leisure"="park"]["name"]'],
  picnic: ['nwr["tourism"="picnic_site"]', 'nwr["leisure"="picnic_table"]["name"]'],
  camp: ['nwr["tourism"="camp_site"]', 'nwr["tourism"="caravan_site"]'],
  heritage: ['nwr["historic"~"archaeological_site|ruins|castle|monument"]["name"]'],
  peak: ['nwr["natural"="peak"]["name"]'],
};

const KIND_HE: Record<string, string> = {
  viewpoint: 'תצפית', spring: 'מעיין', waterfall: 'מפל', beach: 'חוף', nature_reserve: 'שמורת טבע', protected_area: 'שטח מוגן', park: 'פארק',
  picnic_site: 'חניון יום', picnic_table: 'שולחן פיקניק', camp_site: 'חניון לינה', caravan_site: 'חניון קרוואנים', archaeological_site: 'אתר ארכיאולוגי',
  ruins: 'שרידים', castle: 'מבצר', monument: 'אנדרטה', peak: 'פסגה', attraction: 'אטרקציה', museum: 'מוזיאון', village: 'יישוב', town: 'עיר', city: 'עיר',
  hamlet: 'יישוב', valley: 'עמק', stream: 'נחל', river: 'נהר', wood: 'יער', forest: 'יער', water: 'מקווה מים', cave_entrance: 'מערה',
};
const yes = (v?: string) => (v == null ? undefined : v === 'yes' ? true : v === 'no' ? false : undefined);
const tagsOf = (t: Record<string, string> = {}): WebPlace['tags'] => ({
  website: t.website || t['contact:website'], wikipedia: t.wikipedia, fee: yes(t.fee), wheelchair: t.wheelchair, dog: t.dog,
  drinking_water: yes(t.drinking_water), opening_hours: t.opening_hours, operator: t.operator,
});

function cache<T>(key: string, f: () => Promise<T>): Promise<T> {
  return f().then(v => { try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), v })); } catch { /* quota */ } return v; }, err => {
    try { const c = localStorage.getItem(key); if (c) return JSON.parse(c).v as T; } catch { /* ignore */ }
    throw err;
  });
}
async function getJSON(url: string, init?: RequestInit) {
  const r = await fetch(url, init); if (!r.ok) throw new Error(String(r.status)); return r.json();
}

/** Search by name (Israel only). One request per call — the UI calls it on submit, never per keystroke. */
export function searchByName(q: string): Promise<WebPlace[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=il&limit=15&extratags=1&namedetails=1&accept-language=he&q=${encodeURIComponent(q)}`;
  return cache(`campil-wp-n-${q}`, async () => (await getJSON(url)).map((r: any): WebPlace => ({
    id: `${r.osm_type}/${r.osm_id}`, name: r.namedetails?.['name:he'] || r.name || r.display_name.split(',')[0], lat: +r.lat, lon: +r.lon,
    kind: r.type, label: KIND_HE[r.type] ?? KIND_HE[r.category] ?? r.type, tags: tagsOf(r.extratags), source: 'nominatim',
    osmUrl: `https://www.openstreetmap.org/${r.osm_type}/${r.osm_id}`,
  })).filter((p: WebPlace) => p.name && isFinite(p.lat))).catch(() => { throw new Error('החיפוש לא זמין כרגע (צריך חיבור לאינטרנט). נסו שוב בעוד רגע.'); });
}

/** Named places of the chosen categories within `km` of a point (OpenStreetMap). */
export function searchNearby(lat: number, lon: number, km: number, cats: Category[]): Promise<WebPlace[]> {
  const r = Math.round(Math.min(km, 30) * 1000);
  const parts = cats.flatMap(c => Q[c]).map(s => `${s}(around:${r},${lat},${lon});`).join('');
  const q = `[out:json][timeout:25];(${parts});out center tags 150;`;
  return cache(`campil-wp-o-${lat.toFixed(3)},${lon.toFixed(3)},${r},${cats.join(',')}`, async () => {
    const j = await getJSON('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    return (j.elements as any[]).map((el): WebPlace => {
      const t = el.tags || {}; const kind = t.tourism || t.natural || t.waterway || t.leisure || t.boundary || t.historic || 'place';
      return { id: `${el.type}/${el.id}`, name: t['name:he'] || t.name || '', lat: el.lat ?? el.center?.lat, lon: el.lon ?? el.center?.lon, kind, label: KIND_HE[kind] ?? kind, tags: tagsOf(t), source: 'overpass', osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}` };
    }).filter(p => p.name && isFinite(p.lat));
  }).catch(() => { throw new Error('לא הצלחנו לטעון מקומות מ-OpenStreetMap. בדקו את החיבור ונסו שוב.'); });
}

/** Hebrew Wikipedia summary — from the place's wikipedia tag, or the nearest article within 1 km. */
export async function wikiSummary(p: Pick<WebPlace, 'lat' | 'lon' | 'tags' | 'name'>): Promise<WikiSummary | null> {
  return cache(`campil-wp-w-${p.lat.toFixed(4)},${p.lon.toFixed(4)}`, async () => {
    let title: string | undefined;
    const tag = p.tags.wikipedia; if (tag?.startsWith('he:')) title = tag.slice(3);
    if (!title) {
      const g = await getJSON(`https://he.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${p.lat}|${p.lon}&gsradius=1000&gslimit=3&format=json&origin=*`);
      const hits: any[] = g.query?.geosearch ?? [];
      title = (hits.find(h => p.name && (h.title.includes(p.name) || p.name.includes(h.title))) ?? null)?.title;
    }
    if (!title) return null;
    const s = await getJSON(`https://he.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (!s.extract) return null;
    return { title: s.title, extract: s.extract, url: s.content_urls?.desktop?.page ?? `https://he.wikipedia.org/wiki/${encodeURIComponent(title)}` };
  });
}
