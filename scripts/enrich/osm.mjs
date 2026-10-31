// Content enrichment, step 2: named outdoor places from OpenStreetMap (© OpenStreetMap contributors, ODbL),
// for the categories Wikidata covers poorly: campsites, beaches, waterfalls, viewpoints, picnic sites, trails.
// One query per category, a descriptive User-Agent, a pause between queries. Runs in GitHub Actions only.
import { writeFileSync } from 'node:fs';
import { regionOf } from './regions.mjs';

const UA = 'CampIL-data-refresh/1.0 (https://github.com/danielbutbika-png/campil; family trip planner)';
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const OUT = process.argv[2] || '/tmp/places.osm.json';
const BB = '29.45,34.2,33.45,35.95';

export const OSM_CATS = {
  campsite: ['nwr["tourism"="camp_site"]["name"]'],
  caravan: ['nwr["tourism"="caravan_site"]["name"]'],
  birding: ['nwr["leisure"="bird_hide"]["name"]'],
  picnic: ['nwr["leisure"="picnic_site"]["name"]', 'nwr["tourism"="picnic_site"]["name"]'],
  beach: ['nwr["natural"="beach"]["name"]', 'nwr["leisure"="beach_resort"]["name"]'],
  waterfall: ['nwr["waterway"="waterfall"]["name"]'],
  spring: ['nwr["natural"="spring"]["name"]'],
  viewpoint: ['nwr["tourism"="viewpoint"]["name"]'],
  cave: ['nwr["natural"="cave_entrance"]["name"]'],
  visitor_center: ['nwr["tourism"="information"]["information"="visitor_centre"]["name"]'],
  trail: ['relation["route"="hiking"]["name"]', 'relation["route"="foot"]["name"]'],
  bicycle: ['relation["route"="mtb"]["name"]', 'relation["route"="bicycle"]["name"]'],
  attraction: ['nwr["tourism"="attraction"]["name"]', 'nwr["tourism"="theme_park"]["name"]', 'nwr["tourism"="zoo"]["name"]'],
};
const yes = v => (v == null ? undefined : /^(yes|designated|permissive|true)$/i.test(v) ? true : /^no$/i.test(v) ? false : undefined);

async function run(q, tries = 3) {
  for (let i = 0; i < tries; i++) {
    const r = await fetch(OVERPASS, { method: 'POST', headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(q) });
    if (r.ok) return (await r.json()).elements;
    const wait = Number(r.headers.get('retry-after')) || 0; console.error(`  HTTP ${r.status}, retry ${i + 1}${wait ? ` after ${wait}s` : ''}`); if (wait) await new Promise(res => setTimeout(res, Math.min(wait, 120) * 1000)); await new Promise(res => setTimeout(res, 15000 * (i + 1)));
  }
  return null;
}

const out = new Map(); const failed = [];
for (const [cat, sels] of Object.entries(OSM_CATS)) {
  process.stdout.write(`${cat}… `);
  const els = await run(`[out:json][timeout:120];(${sels.map(s => `${s}(${BB});`).join('')});out center tags;`).catch(e => { console.error(e.message); return null; });
  if (!els) { failed.push(cat); console.log('FAILED'); continue; }
  let n = 0;
  for (const e of els) {
    const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon; if (!lat || !lon) continue;
    const region = regionOf(lat, lon); if (!region) continue;
    const t = e.tags ?? {};
    const he = t['name:he'] || (/[֐-׿]/.test(t.name) ? t.name : undefined); if (!he) continue; // Hebrew name required
    const id = `${e.type[0]}${e.id}`;
    const cur = out.get(id) ?? { osm: id, he, en: t['name:en'], lat: Math.round(lat * 1e5) / 1e5, lon: Math.round(lon * 1e5) / 1e5, region, cats: [] };
    if (!cur.cats.includes(cat)) cur.cats.push(cat);
    if (t.wikidata) cur.qid = t.wikidata;
    const web = t.website || t['contact:website']; if (web) cur.web = web;
    // facilities only as mapped — never inferred
    const f = { toilets: yes(t.toilets), water: yes(t.drinking_water), shower: yes(t.shower), power: yes(t.power_supply), fee: yes(t.fee), wheelchair: t.wheelchair, dog: t.dog, tents: yes(t.tents), caravans: yes(t.caravans), fire: yes(t.openfire ?? t.fireplace), bbq: yes(t.bbq), shelter: yes(t.shelter), backcountry: yes(t.backcountry) };
    const fac = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined)); if (Object.keys(fac).length) cur.fac = fac;
    if (t.opening_hours) cur.hours = t.opening_hours; // shown only as "according to OSM", with the official link
    if (t.operator) cur.operator = t.operator;
    if (t.distance) cur.km = parseFloat(t.distance) || undefined;
    if (t.osmc_symbol || t['osmc:symbol']) cur.mark = t['osmc:symbol'] || t.osmc_symbol;
    out.set(id, cur); n++;
  }
  console.log(n);
  await new Promise(res => setTimeout(res, 8000));
}
const list = [...out.values()];
writeFileSync(OUT, JSON.stringify({ source: '© OpenStreetMap contributors (ODbL)', fetchedAt: new Date().toISOString(), failed, count: list.length, places: list }));
console.log(`wrote ${list.length} → ${OUT}`);
