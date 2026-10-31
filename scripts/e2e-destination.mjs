// Destination intelligence: the place database, a rich destination page with sources, same-name disambiguation,
// facilities "unknown" when unmapped, weather & flood exclusion, transparent fit score, regional discovery,
// adding places to a trip with confirmation. External services are mocked or blocked — the page must stay honest.
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome') });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL', deviceScaleFactor: 2 });
const iso = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv-SE'); };
let rain = 0; // mm per day in the mocked forecast
await ctx.route(/open-meteo/, r => { const days = [...Array(16)].map((_, i) => iso(i));
  r.fulfill({ contentType: 'application/json', body: JSON.stringify({ daily: { time: days, temperature_2m_max: days.map(() => 24), temperature_2m_min: days.map(() => 14), apparent_temperature_max: days.map(() => 24), precipitation_sum: days.map(() => rain), precipitation_probability_max: days.map(() => (rain ? 90 : 5)), wind_speed_10m_max: days.map(() => 10), wind_gusts_10m_max: days.map(() => 20), uv_index_max: days.map(() => 5), weather_code: days.map(() => (rain ? 63 : 1)), sunrise: days.map(d => d + 'T06:00'), sunset: days.map(d => d + 'T17:00') }, hourly: { time: [] } }) }); });
await ctx.route(/overpass|osrm|nominatim|openfreemap|fonts\.|wikipedia|wikimedia/, r => r.abort());
const p = await ctx.newPage(); const errors = [];
p.on('pageerror', e => errors.push(e.message));
await p.goto(BASE); await p.waitForTimeout(1200);

// regional discovery
await p.goto(BASE + '#/places/golan'); await p.waitForTimeout(1500);
const items = await p.locator('li[data-place]').count();
console.log('regional list shows real places from the database:', items >= 20, items);
await p.getByRole('button', { name: 'מים: מעיינות, מפלים, נחלים' }).click(); await p.waitForTimeout(400);
console.log('category filter narrows the list:', (await p.locator('li[data-place]').count()) > 0 && (await p.locator('li[data-place]').count()) <= items);
await p.screenshot({ path: `${OUT}/places-golan.png`, fullPage: true });

// search with two places of the same name
await p.fill('input[aria-label="חיפוש מקום לפי שם"]', 'עין גדי'); await p.getByRole('button', { name: 'חיפוש' }).click(); await p.waitForTimeout(300);
const res = p.getByRole('region', { name: 'תוצאות חיפוש' });
console.log('search shows each same-name place with region and type:', (await res.getByRole('link', { name: /^עין גדי/ }).count()) >= 2 && (await res.innerText()).includes('אתר ארכיאולוגי'));

// destination page (scenario 1 + 5)
await p.goto(BASE + '#/place/' + encodeURIComponent('wd:Q1011544')); await p.waitForTimeout(1500);
console.log('destination page: name, region, type:', (await p.getByRole('heading', { name: 'עין גדי', level: 1 }).count()) === 1 && (await p.getByText('מדבר יהודה וים המלח').count()) > 0);
console.log('same-name note offers the other place:', (await p.getByRole('note').filter({ hasText: 'מקומות בשם' }).count()) === 1);
console.log('tabs: overview, around, trails, facilities, weather, sleeping, recommendations:', (await p.getByRole('tab').count()) === 7);
console.log('unverified facts say "לא ידוע" / not verified:', (await p.getByText('לא ידוע', { exact: false }).count()) >= 3 && (await p.getByText(/לא אומת מול המפעיל/).count()) >= 1);
console.log('wikipedia unavailable → honest message, nothing invented:', (await p.getByText(/התיאור מוויקיפדיה לא נטען|טוענים תיאור/).count()) >= 1);
console.log('sources listed with the Wikidata id:', (await p.getByRole('link', { name: 'Wikidata Q1011544' }).count()) === 1);
await p.screenshot({ path: `${OUT}/place-overview.png`, fullPage: true });
await p.getByRole('tab', { name: 'מתקנים' }).click(); await p.waitForTimeout(800);
console.log('facilities: unmapped = "לא ידוע", map service down = said so:', (await p.getByText('לא ידוע').count()) >= 5 && (await p.getByText(/המתקנים לא נטענו/).count()) === 1);
await p.getByRole('tab', { name: 'מה בסביבה' }).click(); await p.waitForTimeout(300);
console.log('around: radius choice and air-distance wording:', (await p.getByRole('button', { name: 'עד 20 ק״מ' }).count()) === 1 && (await p.getByText(/בקו אווירי/).count()) > 0);

// a trip with children, starting tomorrow, in the Golan; a stream there
const tid = await p.evaluate(([s, e]) => { const k = JSON.parse(localStorage.getItem('campil-v1')); const t = k.state.trips[0];
  Object.assign(t, { start: s, end: e, example: false, status: 'planning', regionId: 'golan', dest: { lat: 32.96, lon: 35.72, label: 'החניון' }, interests: ['water', 'family'] });
  localStorage.setItem('campil-v1', JSON.stringify(k)); return t.id; }, [iso(1), iso(2)]);
const stream = 'wd:Q7217846';
await p.goto(BASE + '#/place/' + encodeURIComponent(stream)); await p.reload(); await p.waitForTimeout(1500);
await p.getByRole('tab', { name: 'המלצות' }).click(); await p.waitForTimeout(800);
const fit = p.getByRole('region', { name: 'התאמה לטיול' });
const s1 = Number((await fit.innerText()).match(/(\d+)\/100/)?.[1]);
console.log('fit score 0–100 with "why?" and the formula parts:', s1 > 0 && s1 <= 100 && (await fit.getByText('למה?').count()) === 1);
await fit.getByText('איך חושב הציון').click();
console.log('score explained part by part, not a safety rating:', (await fit.locator('tr').count()) >= 6 && (await fit.getByText(/לא ציון בטיחות/).count()) === 1);
console.log('"ask CampIL" is labelled rules-based, not AI:', (await p.getByRole('region', { name: 'שאלו את CampIL' }).getByText('מבוסס כללים — בלי AI').count()) === 1);

// scenario 4: composition change → score changes
await p.evaluate(id => { const k = JSON.parse(localStorage.getItem('campil-v1')); const t = k.state.trips.find(x => x.id === id); t.participants = t.participants.filter(x => x.role !== 'child'); localStorage.setItem('campil-v1', JSON.stringify(k)); }, tid);
await p.reload(); await p.waitForTimeout(1200); await p.getByRole('tab', { name: 'המלצות' }).click(); await p.waitForTimeout(600);
const s2 = Number((await p.getByRole('region', { name: 'התאמה לטיול' }).innerText()).match(/(\d+)\/100/)?.[1]);
console.log('scenario 4 — no children → fit recomputed:', s2 !== s1, `${s1} → ${s2}`);

// scenario 3: heavy rain → the stream is not recommended, with the reason
rain = 30; await p.evaluate(() => localStorage.clear && Object.keys(localStorage).filter(k => k.startsWith('campil-fc')).forEach(k => localStorage.removeItem(k)));
const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL' });
const state = await p.evaluate(() => localStorage.getItem('campil-v1'));
await ctx2.addInitScript(s => { if (!localStorage.getItem('campil-v1')) localStorage.setItem('campil-v1', s); }, state);
await ctx2.route(/open-meteo/, r => { const days = [...Array(16)].map((_, i) => iso(i)); r.fulfill({ contentType: 'application/json', body: JSON.stringify({ daily: { time: days, temperature_2m_max: days.map(() => 16), temperature_2m_min: days.map(() => 9), precipitation_sum: days.map(() => 30), precipitation_probability_max: days.map(() => 95), wind_speed_10m_max: days.map(() => 20), wind_gusts_10m_max: days.map(() => 35), weather_code: days.map(() => 65) }, hourly: { time: [] } }) }); });
await ctx2.route(/overpass|osrm|nominatim|openfreemap|fonts\.|wikipedia|wikimedia/, r => r.abort());
const q = await ctx2.newPage(); q.on('pageerror', e => errors.push(e.message));
await q.goto(BASE + '#/place/' + encodeURIComponent(stream)); await q.waitForTimeout(1800);
await q.getByRole('tab', { name: 'מזג אוויר ואזהרות' }).click(); await q.waitForTimeout(800);
console.log('scenario 3 — rain: flood warning shown prominently, official sources linked:', (await q.getByText(/סכנת שיטפון/).count()) >= 1 && (await q.getByRole('link', { name: /השירות המטאורולוגי/ }).count()) >= 1);
await q.getByRole('tab', { name: 'המלצות' }).click(); await q.waitForTimeout(600);
console.log('scenario 3 — the stream is not recommended in these conditions:', (await q.getByText('לא מומלץ בתנאים').count()) >= 1);
await q.screenshot({ path: `${OUT}/place-rain.png`, fullPage: true });

// scenario 2: dates beyond the forecast
await p.evaluate(([id, s, e]) => { const k = JSON.parse(localStorage.getItem('campil-v1')); Object.assign(k.state.trips.find(x => x.id === id), { start: s, end: e }); k.state.trips.find(x => x.id === id).places = [{ id: 'wd:Q7217846', name: 'נחל', lat: 1, lon: 1, label: 'נחל', source: 'wd', url: '', addedAt: '' }]; localStorage.setItem('campil-v1', JSON.stringify(k)); }, [tid, iso(40), iso(42)]);
await p.reload(); await p.waitForTimeout(1200); await p.getByRole('tab', { name: 'מזג אוויר ואזהרות' }).click(); await p.waitForTimeout(500);
console.log('scenario 2 — trip beyond the forecast: "עדיין אין תחזית אמינה לתאריך זה.":', (await p.getByText('עדיין אין תחזית אמינה לתאריך זה.').count()) === 1);

// add to trip, with the trip unchanged otherwise
await p.goto(BASE + '#/place/' + encodeURIComponent('wd:Q1011544')); await p.waitForTimeout(1200);
const before = await p.evaluate(id => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(x => x.id === id), tid);
await p.getByRole('button', { name: 'הוספה לטיול' }).click(); await p.waitForTimeout(300);
await p.getByRole('dialog').getByRole('button').filter({ hasText: before.name || 'טיול' }).first().click(); await p.waitForTimeout(500);
const after = await p.evaluate(id => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(x => x.id === id), tid);
console.log('added to the trip (catalogue place → its site), nothing else changed:', after.siteIds.includes('ein-gedi') && after.packing.length === before.packing.length && after.meals.length === before.meals.length);
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await b.close();
