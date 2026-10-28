import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL', deviceScaleFactor: 2 });
const errors = [];
await ctx.route(/open-meteo|fonts\./, r => r.abort());
await ctx.route(/nominatim/, r => r.fulfill({ json: [{ lat: '32.79', lon: '35.53', name: 'טבריה', display_name: 'טבריה, ישראל' }] }));
await ctx.route(/overpass-api/, r => r.fulfill({ json: { elements: [
  { type: 'node', id: 21, lat: 32.80, lon: 35.56, tags: { tourism: 'camp_site', name: 'חוף לדוגמה (fixture)', toilets: 'yes', drinking_water: 'yes', shower: 'yes', fee: 'yes' } },
  { type: 'node', id: 22, lat: 32.85, lon: 35.6, tags: { tourism: 'camp_site', name: 'חניון לילה חינמי (fixture)', toilets: 'yes', fee: 'no' } },
] } }));
const p = await ctx.newPage();
p.on('pageerror', e => errors.push(e.message));
await p.goto(BASE); await p.waitForTimeout(1000);
await p.screenshot({ path: `${OUT}/50-home-camp-button.png` });
await p.getByRole('button', { name: 'מקום לקמפינג' }).click(); await p.waitForTimeout(400);
await p.fill('input[aria-label="מקום לחיפוש"]', 'טבריה'); await p.getByRole('button', { name: 'חיפוש', exact: true }).click(); await p.waitForTimeout(2500);
console.log('results:', await p.locator('article').count());
await p.screenshot({ path: `${OUT}/51-camp-results.png`, fullPage: true });
await p.getByRole('button', { name: 'ללא תשלום' }).click(); await p.waitForTimeout(200);
console.log('after free filter:', await p.locator('article').count());
const waze = await p.locator('article a', { hasText: 'Waze' }).first().getAttribute('href');
console.log('waze link:', waze);
await p.locator('article').first().getByRole('button', { name: 'הוספה לטיול' }).click(); await p.waitForTimeout(300);
await p.locator('[role=dialog] li button').first().click(); await p.waitForTimeout(1200);
console.log('trip dest:', await p.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('campil-v1')).state.trips[0].dest)));
await p.getByRole('heading', { name: 'מקום הלינה' }).scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
await p.screenshot({ path: `${OUT}/52-trip-campsite.png` });
console.log('errors:', errors.length ? errors.join('\n') : 'none');
await b.close();
