// Content enrichment, step 3: merge Wikidata + OpenStreetMap into one place list the app loads on demand.
// Quality gates: inside an app region, a Hebrew name, duplicates merged (shared Wikidata id, or same name ≤ 1 km),
// links to the curated catalogue, and a report of what was merged and dropped. Nothing is invented: a field is
// present only when a source has it, and every place keeps its source ids.
// Usage: node scripts/enrich/merge.mjs <places.wd.json> <places.osm.json|-> <out.json> [report.md]
import { readFileSync, writeFileSync } from 'node:fs';

const [wdPath, osmPath, outPath = 'public/data/places.json', repPath] = process.argv.slice(2);
const wd = JSON.parse(readFileSync(wdPath, 'utf8'));
const osm = osmPath && osmPath !== '-' ? JSON.parse(readFileSync(osmPath, 'utf8')) : { places: [], fetchedAt: null };
const sites = [...readFileSync('src/data/sites.ts', 'utf8').matchAll(/id: '([^']+)', name: '([^']+)', region: '(\w+)', type: '\w+', lat: ([\d.]+), lon: ([\d.]+)/g)].map(m => ({ id: m[1], name: m[2], region: m[3], lat: +m[4], lon: +m[5] }));

const km = (a, b) => { const R = 6371, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r; const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
// name key: drop generic prefixes and punctuation, so "שמורת טבע עין אפק" and "עין אפק" match
const GENERIC = /^(שמורת טבע|שמורת|גן לאומי|גן|פארק|חוף|מעיין|חניון לילה|חניון|מפל|מערת|תצפית|נקודת תצפית|יער|אתר|מצפה)\s+/;
export const nameKey = s => s.replace(/["'״׳()\-–,.]/g, ' ').replace(/\s+/g, ' ').trim().replace(GENERIC, '').replace(GENERIC, '').trim();
const sameName = (a, b) => { const x = nameKey(a), y = nameKey(b); return x.length > 1 && y.length > 1 && (x === y || (Math.min(x.length, y.length) >= 4 && (x.includes(y) || y.includes(x)))); };

// Wikidata categories that are only worth showing with a Wikipedia article (otherwise thousands of minor entries)
const NEEDS_ARTICLE = new Set(['stream', 'peak', 'archaeological', 'park', 'castle', 'forest', 'lake']);
const keepWd = p => p.hewiki || p.image || p.web || p.cats.some(c => !NEEDS_ARTICLE.has(c));

const out = []; const byQid = new Map(); const log = { merged: [], droppedWd: 0, siteLinks: 0 };
for (const p of wd.places) {
  if (!keepWd(p)) { log.droppedWd++; continue; }
  const r = { id: 'wd:' + p.qid, he: p.he, en: p.en, lat: p.lat, lon: p.lon, r: p.region, c: [...p.cats], qid: p.qid, web: p.web, wiki: p.hewiki, img: p.image && { thumb: p.image.thumb, page: p.image.page, license: p.image.license, author: p.image.author }, her: p.heritage || undefined, src: ['wd'] };
  out.push(r); byQid.set(p.qid, r);
}
for (const o of osm.places) {
  let t = o.qid ? byQid.get(o.qid) : undefined;
  if (!t) t = out.find(x => km(x, o) <= 1 && sameName(x.he, o.he));
  if (t) { // same place: add what OSM knows, keep Wikidata's identity and position
    log.merged.push(`${o.he} (${o.osm}) → ${t.he} (${t.id})`);
    t.osm = o.osm; for (const c of o.cats) if (!t.c.includes(c)) t.c.push(c);
    if (o.fac) t.fac = o.fac; if (o.hours) t.hours = o.hours; if (!t.web && o.web) t.web = o.web; if (o.operator) t.op = o.operator; if (o.km) t.km = o.km; if (o.mark) t.mark = o.mark;
    if (!t.src.includes('osm')) t.src.push('osm');
    continue;
  }
  out.push({ id: 'osm:' + o.osm, he: o.he, en: o.en, lat: o.lat, lon: o.lon, r: o.region, c: [...o.cats], osm: o.osm, qid: o.qid, web: o.web, fac: o.fac, hours: o.hours, op: o.operator, km: o.km, mark: o.mark, src: ['osm'] });
}
// link to the curated catalogue (the catalogue keeps its own text; the place adds sources, image and facilities)
for (const s of sites) {
  // prefer the reserve / park entity over a single monument with the same name, then one with an article, then nearest
  const rank = x => (x.c.some(c => ['nature_reserve', 'national_park', 'campsite', 'beach', 'spring', 'viewpoint'].includes(c)) ? 0 : 2) + (x.wiki ? 0 : 1) + km(x, s) / 4;
  const m = out.filter(x => !x.site && km(x, s) <= 2 && sameName(x.he, s.name)).sort((a, b) => rank(a) - rank(b))[0];
  if (m) { m.site = s.id; log.siteLinks++; }
}
const clean = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && !(Array.isArray(v) && !v.length)));
const list = out.map(clean).sort((a, b) => a.r.localeCompare(b.r) || a.he.localeCompare(b.he, 'he'));
writeFileSync(outPath, JSON.stringify({ sources: { wikidata: wd.fetchedAt, osm: osm.fetchedAt }, attribution: 'Wikidata (CC0) · © OpenStreetMap contributors (ODbL) · תמונות: Wikimedia Commons, לפי הרישיון של כל תמונה', count: list.length, places: list }));
const rep = [`# מיזוג מקומות — ${new Date().toISOString().slice(0, 10)}`, '', `- Wikidata: ${wd.places.length} → נשמרו ${wd.places.length - log.droppedWd} (${log.droppedWd} נחלים/פסגות/אתרים בלי ערך בוויקיפדיה, בלי תמונה ובלי אתר — לא נכללו)`, `- OpenStreetMap: ${osm.places.length}, מתוכם ${log.merged.length} מוזגו עם מקום קיים (אותו מזהה Wikidata, או אותו שם עד 1 ק״מ)`, `- קישורים לקטלוג CampIL: ${log.siteLinks} מתוך ${sites.length}`, `- **סה״כ מקומות:** ${list.length}`, '', '## דוגמאות מיזוג (כפילויות שזוהו)', '', ...log.merged.slice(0, 40).map(x => `- ${x}`)];
if (repPath) writeFileSync(repPath, rep.join('\n'));
console.log(rep.slice(0, 7).join('\n'));
