// Place search from the web (mocked OpenStreetMap + Wikipedia): nearby search, details, Wikipedia summary,
// add to a trip, search by name; the added place shows in the trip and in its GPX export.
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome') });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL', deviceScaleFactor: 2, acceptDownloads: true });
const calls = { overpass: 0, nominatim: [], wiki: 0 };
await ctx.route(/overpass-api\.de/, r => { calls.overpass++; r.fulfill({ contentType: 'application/json', body: JSON.stringify({ elements: [
  { type: 'node', id: 1, lat: 32.55, lon: 35.34, tags: { tourism: 'viewpoint', name: 'תצפית הגלבוע', wheelchair: 'yes' } },
  { type: 'node', id: 2, lat: 32.53, lon: 35.40, tags: { natural: 'spring', name: 'עין חרוד', 'name:he': 'מעיין חרוד', fee: 'yes', dog: 'leashed', wikipedia: 'he:מעיין חרוד' } },
  { type: 'node', id: 3, lat: 32.6, lon: 35.3, tags: { tourism: 'viewpoint' } } ] }) }); });
await ctx.route(/nominatim\.openstreetmap\.org/, r => { calls.nominatim.push(r.request().url()); r.fulfill({ contentType: 'application/json', body: JSON.stringify([{ osm_type: 'node', osm_id: 9, lat: '30.61', lon: '34.80', name: 'מצפה רמון', display_name: 'מצפה רמון, ישראל', type: 'viewpoint', category: 'tourism', extratags: {}, namedetails: { name: 'מצפה רמון' } }]) }); });
await ctx.route(/wikipedia\.org/, r => { calls.wiki++; r.fulfill({ contentType: 'application/json', body: JSON.stringify({ title: 'מעיין חרוד', extract: 'מעיין בעמק חרוד למרגלות הגלבוע.', content_urls: { desktop: { page: 'https://he.wikipedia.org/wiki/x' } } }) }); });
await ctx.route(/open-meteo|osrm|openfreemap|fonts\./, r => r.abort());
const p = await ctx.newPage(); const errors = [];
p.on('pageerror', e => errors.push(e.message));
await p.goto(BASE); await p.waitForTimeout(1000);
const iso = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv-SE'); };
const tid = await p.evaluate(([s, e]) => { const k = JSON.parse(localStorage.getItem('campil-v1')); Object.assign(k.state.trips[0], { start: s, end: e, example: false }); localStorage.setItem('campil-v1', JSON.stringify(k)); return k.state.trips[0].id; }, [iso(5), iso(6)]);
await p.goto(BASE + '#/explore'); await p.reload(); await p.waitForTimeout(800);
console.log('defaults to the upcoming trip as the search point:', (await p.getByLabel('ליד').inputValue()).startsWith('trip:'));
await p.getByRole('button', { name: 'חיפוש', exact: true }).click(); await p.waitForTimeout(800);
const items = p.getByRole('list', { name: 'תוצאות' }).locator(':scope > li');
console.log('nearby results, unnamed places dropped:', (await items.count()) === 2, '| one request:', calls.overpass === 1);
console.log('Hebrew name preferred:', (await items.allInnerTexts()).some(x => x.includes('מעיין חרוד')));
await items.filter({ hasText: 'מעיין חרוד' }).locator('button').first().click(); await p.waitForTimeout(200);
const card = items.filter({ hasText: 'מעיין חרוד' });
const txt = await card.innerText();
console.log('details labelled as OSM, not verified:', txt.includes('OpenStreetMap — לא אומת') && txt.includes('בתשלום (לפי OSM)') && txt.includes('כלבים: מותר ברצועה'));
await card.getByRole('button', { name: /ויקיפדיה/ }).click(); await p.waitForTimeout(500);
console.log('Wikipedia summary with licence and link:', (await card.innerText()).includes('למרגלות הגלבוע') && (await card.innerText()).includes('CC BY-SA'));
await card.getByRole('button', { name: /^הוספה ל/ }).click(); await p.waitForTimeout(400);
console.log('added to the trip:', (await card.getByRole('button', { name: 'בטיול' }).count()) === 1);
await p.screenshot({ path: `${OUT}/explore.png`, fullPage: true });
// by name — on submit only
await p.getByRole('radio', { name: /לפי שם/ }).click(); await p.getByLabel('שם המקום').fill('מצפה רמון'); await p.waitForTimeout(300);
console.log('no request while typing:', calls.nominatim.length === 0);
await p.getByRole('button', { name: 'חיפוש', exact: true }).click(); await p.waitForTimeout(600);
console.log('search by name:', calls.nominatim.length === 1 && calls.nominatim[0].includes('countrycodes=il') && (await items.first().innerText()).includes('מצפה רמון'));
// in the trip
await p.goto(BASE + `#/trip/${tid}`); await p.waitForTimeout(1200);
console.log('trip shows the added place:', (await p.getByRole('region', { name: 'מקומות שהוספתם מהחיפוש' }).innerText()).includes('מעיין חרוד'));
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await b.close();
