// Field mode: "prepare for no signal" saves forecast + map area within OpenFreeMap's offline terms
// (≤ 3,000 tiles, ≤ 4 parallel requests); afterwards the map style is served with no network.
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome') });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL' });
await ctx.route(/overpass|osrm|nominatim/, r => r.abort());
await ctx.route(/open-meteo/, r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ daily: { time: [], temperature_2m_max: [], temperature_2m_min: [] }, hourly: { time: [] } }) }));
let inflight = 0, maxInflight = 0, tileReqs = 0;
const style = { version: 8, glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf', sprite: 'https://tiles.openfreemap.org/sprites/test', sources: { openmaptiles: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' } },
  layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#eee' } }, { id: 'lbl', type: 'symbol', source: 'openmaptiles', 'source-layer': 'place', layout: { 'text-field': '{name}', 'text-font': ['Noto Sans Regular'] } }] };
await ctx.route(/tiles\.openfreemap\.org/, async r => {
  const u = r.request().url();
  if (u.endsWith('/styles/positron')) return r.fulfill({ contentType: 'application/json', body: JSON.stringify(style), headers: { 'access-control-allow-origin': '*' } });
  if (u.endsWith('/planet')) return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ tiles: ['https://tiles.openfreemap.org/planet/test/{z}/{x}/{y}.pbf'], minzoom: 0, maxzoom: 14 }), headers: { 'access-control-allow-origin': '*' } });
  if (/\/planet\/test\//.test(u)) { tileReqs++; inflight++; maxInflight = Math.max(maxInflight, inflight); await new Promise(res => setTimeout(res, 5)); inflight--; return r.fulfill({ body: Buffer.alloc(200), headers: { 'access-control-allow-origin': '*', 'content-type': 'application/x-protobuf' } }); }
  return r.fulfill({ body: Buffer.alloc(10), headers: { 'access-control-allow-origin': '*' } });
});
const p = await ctx.newPage(); const errors = [];
p.on('pageerror', e => errors.push(e.message));
await p.goto(BASE); await p.waitForTimeout(1500);
const tid = await p.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips[0].id);
await p.goto(BASE + `#/trip/${tid}`); await p.waitForTimeout(1200);
await p.getByRole('button', { name: 'הכנת הטיול לשימוש ללא קליטה' }).click();
await p.waitForFunction(id => !!JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(t => t.id === id).offline, tid, { timeout: 120000 });
const prep = await p.evaluate(id => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(t => t.id === id).offline, tid);
await p.getByRole('heading', { name: 'מוכנים לשטח בלי קליטה?' }).scrollIntoViewIfNeeded(); await p.screenshot({ path: `${OUT}/field-ready.png` });
console.log('prepared:', JSON.stringify({ tiles: prep.tiles, zooms: prep.zooms, forecast: prep.forecast }));
console.log('within 3,000 tiles:', prep.tiles > 100 && prep.tiles <= 3000, '| tile requests', tileReqs);
console.log('at most 4 parallel requests:', maxInflight <= 4, `(max ${maxInflight})`);
await ctx.setOffline(true);
const styleOffline = await p.evaluate(async () => !!(await caches.match('https://tiles.openfreemap.org/styles/positron', { ignoreVary: true })));
console.log('map style available offline:', styleOffline);
await p.goto(BASE + '#/map'); await p.reload(); await p.waitForTimeout(2500);
console.log('map screen opens offline:', (await p.locator('.maplibregl-canvas').count()) > 0);
await p.screenshot({ path: `${OUT}/field-map-offline.png` });
console.log('errors:', errors.length ? errors.join(' | ').slice(0, 300) : 'none');
await b.close();
