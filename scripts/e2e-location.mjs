// Editing the trip's location: pick a new place from the database, the region follows, forecast/recommendations use
// it; stops can be added; clearing returns to the region. Nothing else in the plan changes.
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome') });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL', deviceScaleFactor: 2 });
await ctx.route(/open-meteo|overpass|osrm|nominatim|openfreemap|fonts\.|wikipedia|wikimedia|ims-alerts/, r => r.abort());
const p = await ctx.newPage(); const errors = [];
p.on('pageerror', e => errors.push(e.message));
await p.goto(BASE); await p.waitForTimeout(1000);
const tid = await p.evaluate(() => { const k = JSON.parse(localStorage.getItem('campil-v1')); const t = k.state.trips[0]; Object.assign(t, { example: false, regionId: 'golan', dest: { lat: 32.99, lon: 35.69, label: 'קצרין' } }); localStorage.setItem('campil-v1', JSON.stringify(k)); return t.id; });
await p.goto(BASE + `#/trip/${tid}`); await p.reload(); await p.waitForTimeout(1200);
const before = await p.evaluate(id => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(x => x.id === id), tid);
await p.getByRole('button', { name: 'עריכת פרטי הטיול' }).click(); await p.waitForTimeout(400);
const loc = p.getByRole('group', { name: 'מיקום הטיול' });
console.log('edit screen shows the current location:', (await loc.getByText('קצרין').count()) >= 1);
await loc.getByRole('combobox').fill('עין גדי'); await p.waitForTimeout(800);
const opts = p.getByRole('listbox', { name: 'הצעות' });
console.log('suggestions as you type, with region and type:', (await opts.getByRole('option').count()) >= 1 && (await opts.innerText()).includes('מדבר יהודה'));
await opts.getByRole('option').first().click(); await p.waitForTimeout(300);
console.log('picked location shown before saving:', (await loc.getByText('עין גדי').count()) >= 1);
await p.getByRole('button', { name: 'שמירה ועדכון ההמלצות' }).click(); await p.waitForTimeout(600);
const after = await p.evaluate(id => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(x => x.id === id), tid);
console.log('saved: new location, region follows it:', after.dest?.label?.includes('עין גדי') && after.regionId === 'judean_desert');
console.log('nothing else in the plan changed:', after.packing.length === before.packing.length && after.meals.length === before.meals.length && after.tasks.length === before.tasks.length && after.start === before.start);
console.log('toast says the location changed:', (await p.getByText(/מיקום הטיול עודכן/).count()) >= 1);
await p.screenshot({ path: `${OUT}/location-saved.png` });
// clear → back to the region / lodging site
await p.getByRole('button', { name: 'עריכת פרטי הטיול' }).click(); await p.waitForTimeout(400);
await p.getByRole('button', { name: 'ניקוי המיקום' }).click(); await p.waitForTimeout(200);
await p.getByRole('button', { name: 'שמירה ועדכון ההמלצות' }).click(); await p.waitForTimeout(500);
console.log('clearing the location keeps the region:', await p.evaluate(id => { const t = JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(x => x.id === id); return !t.dest && t.regionId === 'judean_desert'; }, tid));
// wizard: free text "where to" → region, location, name, and what is around
await p.goto(BASE + '#/new'); await p.waitForTimeout(900);
const box = p.getByRole('combobox', { name: 'לאן מטיילים?' });
await box.fill('עמק המעיינות'); await p.waitForTimeout(900);
const sug = p.getByRole('listbox', { name: 'הצעות' });
console.log('typing "עמק המעיינות" suggests it with its region:', (await sug.getByRole('option').first().innerText()).includes('עמק המעיינות') && (await sug.getByRole('option').first().innerText()).includes('גליל תחתון ועמקים'));
await box.press('Enter'); await p.waitForTimeout(1200);
const st = p.getByRole('status').filter({ hasText: 'התחזית, המרחקים וההמלצות' });
console.log('Enter picks it: region and location filled in:', (await st.count()) === 1 && (await st.innerText()).includes('גליל תחתון ועמקים'));
console.log('trip name filled in (was empty):', (await p.locator('#tname').inputValue()).includes('עמק המעיינות'));
console.log('what is around is offered (not added):', (await p.getByText(/מה יש בסביבה/).count()) === 1);
await p.screenshot({ path: `${OUT}/whereto.png`, fullPage: true });
await p.getByRole('button', { name: /^המשך/ }).click(); await p.waitForTimeout(600);
console.log('next step has the region already chosen:', (await p.locator('#region-list').inputValue()) === 'lower_galilee');
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await b.close();
