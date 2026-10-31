// Content enrichment, step 1: real places from Wikidata (CC0), by category, inside the app's regions.
// Runs in GitHub Actions (workflow "Data refresh"), never in the browser bundle and never on a schedule of its own.
// Polite use: one query at a time, a descriptive User-Agent, results cached in the output file.
// Output: src/data/places.wd.json — every place carries its Wikidata id, so each fact can be traced and re-checked.
import { writeFileSync } from 'node:fs';
import { regionOf } from './regions.mjs';

const UA = 'CampIL-data-refresh/1.0 (https://github.com/danielbutbika-png/campil; family trip planner)';
const SPARQL = 'https://query.wikidata.org/sparql';
const OUT = process.argv[2] || '/tmp/places.wd.json';

// category → Wikidata classes (instance of, or subclass of) — the app's 30 requested categories map onto these
export const CATEGORIES = {
  nature_reserve: ['Q179049'],            // nature reserve
  national_park: ['Q46169'],              // national park
  spring: ['Q124714'],                    // spring
  waterfall: ['Q34038'],                  // waterfall
  stream: ['Q47521', 'Q1437299'],         // stream, wadi
  lake: ['Q23397', 'Q131681'],            // lake, reservoir
  beach: ['Q40080'],                      // beach
  cave: ['Q35509'],                       // cave
  viewpoint: ['Q6017969'],                // scenic viewpoint
  archaeological: ['Q839954', 'Q15661340'], // archaeological site, tell (ancient mound)
  castle: ['Q23413', 'Q57821'],           // castle, fortification
  forest: ['Q4421'],                      // forest
  park: ['Q22698'],                       // park
  campsite: ['Q832778'],                  // campsite
  trail: ['Q2143825'],                    // hiking trail
  visitor_center: ['Q1192811'],           // visitor center
  observatory: ['Q62832'],                // observatory (stargazing)
  zoo: ['Q43501', 'Q2281788'],            // zoo, wildlife park
  peak: ['Q8502'],                        // mountain
  botanical: ['Q167346'],                 // botanical garden
};

const box = `SERVICE wikibase:box { ?p wdt:P625 ?coord . bd:serviceParam wikibase:cornerSouthWest "Point(34.2 29.45)"^^geo:wktLiteral . bd:serviceParam wikibase:cornerNorthEast "Point(35.95 33.45)"^^geo:wktLiteral . }`;
const query = classes => `SELECT ?p ?he ?en ?coord ?web ?img ?hewiki ?enwiki ?heritage WHERE {
  VALUES ?cls { ${classes.map(c => 'wd:' + c).join(' ')} }
  ?p wdt:P31/wdt:P279* ?cls .
  ${box}
  ?p rdfs:label ?he . FILTER(lang(?he) = "he")
  OPTIONAL { ?p rdfs:label ?en . FILTER(lang(?en) = "en") }
  OPTIONAL { ?p wdt:P856 ?web }
  OPTIONAL { ?p wdt:P18 ?img }
  OPTIONAL { ?hewiki schema:about ?p; schema:isPartOf <https://he.wikipedia.org/> }
  OPTIONAL { ?enwiki schema:about ?p; schema:isPartOf <https://en.wikipedia.org/> }
  OPTIONAL { ?p wdt:P1435 ?heritage }
}`;

async function run(q, tries = 3) {
  for (let i = 0; i < tries; i++) {
    const r = await fetch(SPARQL, { method: 'POST', headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'query=' + encodeURIComponent(q) });
    if (r.ok) return (await r.json()).results.bindings;
    console.error(`  HTTP ${r.status}, retry ${i + 1}`); await new Promise(res => setTimeout(res, 5000 * (i + 1)));
  }
  throw new Error('query failed');
}

const places = new Map();
for (const [cat, classes] of Object.entries(CATEGORIES)) {
  process.stdout.write(`${cat}… `);
  const rows = await run(query(classes));
  let n = 0;
  for (const b of rows) {
    const qid = b.p.value.split('/').pop();
    const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(b.coord.value); if (!m) continue;
    const lon = +m[1], lat = +m[2];
    const region = regionOf(lat, lon); if (!region) continue; // outside the app's regions
    const cur = places.get(qid) ?? { qid, he: b.he.value, en: b.en?.value, lat: Math.round(lat * 1e5) / 1e5, lon: Math.round(lon * 1e5) / 1e5, region, cats: [] };
    if (!cur.cats.includes(cat)) cur.cats.push(cat);
    if (b.web && !cur.web) cur.web = b.web.value;
    if (b.img && !cur.img) cur.img = decodeURIComponent(b.img.value.split('/').pop());
    if (b.hewiki && !cur.hewiki) cur.hewiki = decodeURIComponent(b.hewiki.value.split('/').pop());
    if (b.enwiki && !cur.enwiki) cur.enwiki = decodeURIComponent(b.enwiki.value.split('/').pop());
    if (b.heritage) cur.heritage = true;
    places.set(qid, cur); n++;
  }
  console.log(n);
  await new Promise(res => setTimeout(res, 1500));
}

// images: license and author from Wikimedia Commons — an image is kept only with a free license we can attribute
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const withImg = [...places.values()].filter(p => p.img);
for (let i = 0; i < withImg.length; i += 40) {
  const batch = withImg.slice(i, i + 40);
  const u = `${COMMONS}?action=query&format=json&prop=imageinfo&iiprop=extmetadata|url&iiurlwidth=640&titles=${encodeURIComponent(batch.map(p => 'File:' + p.img).join('|'))}`;
  const r = await fetch(u, { headers: { 'User-Agent': UA } }); if (!r.ok) continue;
  const pages = Object.values((await r.json()).query?.pages ?? {});
  for (const p of batch) {
    const pg = pages.find(x => x.title?.replace(/^File:/, '').replace(/_/g, ' ') === p.img.replace(/_/g, ' '));
    const ii = pg?.imageinfo?.[0]; const md = ii?.extmetadata ?? {};
    const lic = md.LicenseShortName?.value ?? '';
    if (!ii || !/^(CC0|CC BY|CC-BY|Public domain|PD)/i.test(lic)) { delete p.img; continue; }
    p.image = { file: p.img, thumb: ii.thumburl, page: ii.descriptionurl, license: lic, author: (md.Artist?.value ?? '').replace(/<[^>]+>/g, '').trim().slice(0, 120) };
    delete p.img;
  }
  await new Promise(res => setTimeout(res, 500));
}
for (const p of places.values()) delete p.img;

const list = [...places.values()].sort((a, b) => a.region.localeCompare(b.region) || a.he.localeCompare(b.he, 'he'));
writeFileSync(OUT, JSON.stringify({ source: 'Wikidata (CC0) + Wikimedia Commons licences', fetchedAt: new Date().toISOString(), count: list.length, places: list }, null, 0));
console.log(`wrote ${list.length} places → ${OUT}`);
