// Place names for "where are you going?": valleys, geographic areas, mountain ranges and Israeli localities from
// Wikidata (CC0), with Hebrew alternative names, each assigned to an app region by point-in-polygon.
// Output (compact): public/data/gazetteer.json — [{ n, a?, lat, lon, r, k, q }]. Runs in GitHub Actions.
import { writeFileSync } from 'node:fs';
import { regionOf } from './regions.mjs';

const UA = 'CampIL-data-refresh/1.0 (https://github.com/danielbutbika-png/campil; family trip planner)';
const SPARQL = 'https://query.wikidata.org/sparql';
const OUT = process.argv[2] || '/tmp/gazetteer.json';
const box = `SERVICE wikibase:box { ?p wdt:P625 ?coord . bd:serviceParam wikibase:cornerSouthWest "Point(34.2 29.45)"^^geo:wktLiteral . bd:serviceParam wikibase:cornerNorthEast "Point(35.95 33.45)"^^geo:wktLiteral . }`;
const labels = `?p rdfs:label ?he . FILTER(lang(?he) = "he") OPTIONAL { ?p skos:altLabel ?alt . FILTER(lang(?alt) = "he") }`;
// kind → query body (areas inside the box; localities by country = Israel, then filtered by the regions)
const Q = {
  valley: `VALUES ?cls { wd:Q39816 } ?p wdt:P31/wdt:P279* ?cls . ${box}`,
  area: `VALUES ?cls { wd:Q82794 wd:Q1620908 wd:Q15642541 } ?p wdt:P31 ?cls . ${box}`, // geographic region, historical region, human-geographic territorial entity
  range: `VALUES ?cls { wd:Q46831 wd:Q1437459 wd:Q75520 } ?p wdt:P31 ?cls . ${box}`, // mountain range, ridge, plateau
  desert: `VALUES ?cls { wd:Q8514 } ?p wdt:P31/wdt:P279* ?cls . ${box}`,
  locality: `?p wdt:P17 wd:Q801; wdt:P31/wdt:P279* wd:Q486972; wdt:P625 ?coord .`,
};
async function run(q) {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(SPARQL, { method: 'POST', headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'query=' + encodeURIComponent(q) }).catch(() => null);
    if (r?.ok) return (await r.json()).results.bindings;
    console.error(`  HTTP ${r?.status}, retry ${i + 1}`); await new Promise(res => setTimeout(res, 10000 * (i + 1)));
  }
  return null;
}
const out = new Map(); const failed = [];
for (const [k, body] of Object.entries(Q)) {
  process.stdout.write(`${k}… `);
  const rows = await run(`SELECT ?p ?he ?alt ?coord WHERE { ${body} ${labels} }`);
  if (!rows) { failed.push(k); console.log('FAILED'); continue; }
  for (const b of rows) {
    const qid = b.p.value.split('/').pop(); const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(b.coord.value); if (!m) continue;
    const lon = +m[1], lat = +m[2]; const r = regionOf(lat, lon); if (!r) continue;
    const cur = out.get(qid) ?? { n: b.he.value, lat: Math.round(lat * 1e4) / 1e4, lon: Math.round(lon * 1e4) / 1e4, r, k, q: qid, a: [] };
    if (b.alt?.value && b.alt.value !== cur.n && !cur.a.includes(b.alt.value) && cur.a.length < 6) cur.a.push(b.alt.value);
    out.set(qid, cur);
  }
  console.log(rows.length);
  await new Promise(res => setTimeout(res, 2000));
}
const list = [...out.values()].map(x => (x.a.length ? x : (delete x.a, x)));
writeFileSync(OUT, JSON.stringify({ source: 'Wikidata (CC0)', fetchedAt: new Date().toISOString(), failed, count: list.length, names: list }));
console.log(`gazetteer: ${list.length} names${failed.length ? ' · failed: ' + failed.join(',') : ''}`);
