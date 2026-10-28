// Offline: after one online visit, the app (service worker) opens with no network, shows saved trips and keeps edits.
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL' });
await ctx.route(/open-meteo|overpass|osrm|nominatim/, r => r.abort());
const p = await ctx.newPage(); const errors = [];
p.on('pageerror', e => errors.push(e.message));
await p.goto(BASE); await p.waitForTimeout(2500);
const sw = await p.evaluate(async () => !!(await navigator.serviceWorker?.getRegistration()));
const tid = await p.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips[0].id);
await p.goto(BASE + `#/trip/${tid}/gear`); await p.waitForTimeout(1500); // warm caches for this route
await ctx.setOffline(true);
await p.reload(); await p.waitForTimeout(2500); await p.screenshot({ path: `${OUT}/off-gear.png` }); console.log("offline url", p.url(), (await p.locator("main").innerText().catch(()=>"(no main)")).slice(0,200).replace(/\n/g," "));
const banner = await p.getByText('אין חיבור לאינטרנט').count();
const items = await p.locator('input[type=checkbox][aria-label$="ארוז"]').count();
await p.locator('input[type=checkbox][aria-label$="ארוז"]').first().check(); await p.waitForTimeout(300);
await p.goto(BASE + `#/trip/${tid}/meals`); await p.waitForTimeout(800);
const meals = await p.getByRole('heading', { name: 'תפריט הטיול' }).count();
await p.goto(BASE + '#/map'); await p.waitForTimeout(2500);
const mapText = (await p.locator('main').innerText()).slice(0, 120).replace(/\n/g, ' ');
await p.screenshot({ path: `${OUT}/off-map.png` });
await ctx.setOffline(false); await p.reload(); await p.waitForTimeout(1500);
const kept = await p.evaluate(id => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(t => t.id === id).packing.filter(x => x.packed).length, tid);
console.log(JSON.stringify({ serviceWorker: sw, offlineBanner: banner > 0, gearItemsOffline: items, mealsOffline: meals > 0, mapOffline: mapText, packedKeptAfterReconnect: kept }));
console.log('errors:', errors.length ? errors.join(' | ').slice(0, 400) : 'none');
await b.close();
