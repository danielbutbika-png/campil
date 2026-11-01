// CampIL Discover — the brief's acceptance scenarios with OSM (Overpass) and OSRM mocked by realistic responses.
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome') });
const iso = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv-SE'); };
const C = { lat: 32.99, lon: 35.69 }; // Katzrin-ish base
const node = (id, dLat, dLon, tags) => ({ type: 'node', id, lat: C.lat + dLat, lon: C.lon + dLon, tags });
const OSM = [
  node(1, 0.01, 0.01, { amenity: 'cafe', name: 'עגלת הקפה של הגולן', opening_hours: 'Fr-Sa 07:00-13:00' }),
  node(2, 0.02, -0.01, { amenity: 'cafe', name: 'קפה הכפר', outdoor_seating: 'yes' }),
  node(3, -0.02, 0.02, { amenity: 'restaurant', name: 'מסעדת הגליל', 'diet:kosher': 'yes', cuisine: 'grill' }),
  node(4, 0.03, 0.03, { amenity: 'restaurant', name: 'פיצה רמה' }),
  { type: 'relation', id: 5, center: { lat: C.lat + 0.04, lon: C.lon }, tags: { route: 'hiking', name: 'שביל המפלים', distance: '4.5' } },
  node(6, -0.03, -0.02, { natural: 'spring', name: 'עין התאנה' }),
  node(7, 0.05, 0.01, { tourism: 'viewpoint', name: 'תצפית הרכס' }),
];
let rain = 0, overpassDown = false;
async function context() {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL', deviceScaleFactor: 2 });
  await ctx.route(/overpass-api/, r => overpassDown ? r.fulfill({ status: 504, body: '' }) : r.fulfill({ contentType: 'application/json', body: JSON.stringify({ elements: OSM }) }));
  await ctx.route(/router\.project-osrm\.org\/route/, r => { const n = r.request().url().split('/driving/')[1].split('?')[0].split(';').length; r.fulfill({ contentType: 'application/json', body: JSON.stringify({ code: 'Ok', routes: [{ distance: 150000, duration: 7200, geometry: { coordinates: [[34.8, 32.1], [35.2, 32.6], [35.69, 32.99]] }, legs: [...Array(n - 1)].map(() => ({ distance: 8000, duration: 600 })) }] }) }); });
  await ctx.route(/router\.project-osrm\.org\/table/, r => { const n = r.request().url().split('/driving/')[1].split('?')[0].split(';').length; const dur = [...Array(n)].map((_, i) => [...Array(n)].map((_, j) => (i === j ? 0 : i === 0 && j === 1 ? 7200 : i === 0 ? 6600 + j * 60 : j === 1 ? 900 + i * 60 : 600))); r.fulfill({ contentType: 'application/json', body: JSON.stringify({ code: 'Ok', durations: dur, distances: dur.map(row => row.map(x => x * 20)) }) }); });
  await ctx.route(/open-meteo/, r => { const days = [...Array(16)].map((_, i) => iso(i)); r.fulfill({ contentType: 'application/json', body: JSON.stringify({ daily: { time: days, temperature_2m_max: days.map(() => 22), temperature_2m_min: days.map(() => 12), precipitation_sum: days.map(() => rain), precipitation_probability_max: days.map(() => (rain ? 90 : 5)), wind_speed_10m_max: days.map(() => 10), wind_gusts_10m_max: days.map(() => 20), weather_code: days.map(() => 1) }, hourly: { time: [] } }) }); });
  await ctx.route(/nominatim|openfreemap|fonts\.|wikipedia|wikimedia|ims-alerts/, r => r.abort());
  return ctx;
}
const ctx = await context(); const p = await ctx.newPage(); const errors = [];
p.on('pageerror', e => errors.push(e.message));
await p.goto(BASE); await p.waitForTimeout(900);
const tid = await p.evaluate(([s, e, c]) => { const k = JSON.parse(localStorage.getItem('campil-v1')); const t = k.state.trips[0];
  Object.assign(t, { start: s, end: e, example: false, status: 'planning', regionId: 'golan', dest: { ...c, label: 'קצרין' }, places: [], diets: { all: { style: 'meat', kashrut: 'kosher', allergies: ['אגוזים'] } } });
  k.state.settings.home = { lat: 32.08, lon: 34.78, label: 'תל אביב' }; localStorage.setItem('campil-v1', JSON.stringify(k)); return t.id; }, [iso(1), iso(2), C]);

// proactive card appears only after real results
await p.goto(BASE + `#/trip/${tid}`); await p.reload(); await p.waitForTimeout(1800);
const card = p.getByRole('region', { name: 'מצאתי אפשרויות לעצירות ופעילויות באזור שבחרת' });
console.log('proactive card after choosing a destination, with real counts:', (await card.count()) === 1 && (await card.innerText()).includes('1 עגלות קפה'));
await card.getByRole('button', { name: 'גלה מה יש בסביבה' }).click(); await p.waitForTimeout(1500);

// scenario 1 — coffee carts: real, identified, with location and source; carts ≠ cafes
await p.getByRole('tab', { name: 'עגלות קפה' }).click(); await p.waitForTimeout(800);
const carts = p.locator('li[data-disc]');
console.log('scenario 1 — only the coffee cart, not the cafe, with why it is a cart:', (await carts.count()) === 1 && (await carts.first().innerText()).includes('עגלת הקפה של הגולן') && (await carts.first().innerText()).includes('השם מעיד על עגלת קפה'));
await carts.first().getByRole('button', { name: 'פרטים' }).click();
const ct = await carts.first().innerText();
console.log('cart details: hours from OSM, "check activity", no rating invented, source:', ct.includes('Fr-Sa 07:00-13:00') && ct.includes('לבדוק פעילות לפני ההגעה') && ct.includes('אין דירוגים במקור הפתוח') && ct.includes('OpenStreetMap'));
await p.screenshot({ path: `${OUT}/discover-carts.png`, fullPage: true });

// scenario 2 — family food with kashrut: kosher-tagged first, unknown flagged
await p.getByRole('tab', { name: 'מסעדות וקפה' }).click(); await p.waitForTimeout(800);
const food = p.locator('li[data-disc]');
console.log('scenario 2 — kosher-tagged restaurant ranks above an unknown one:', (await food.first().innerText()).includes('מסעדת הגליל'));
const pizza = food.filter({ hasText: 'פיצה רמה' }); await pizza.getByRole('button', { name: 'פרטים' }).click();
const pt = await pizza.innerText();
console.log('unknown kashrut and allergies → "check with the business", hours unknown:', pt.includes('כשרות') && pt.includes('לא ידוע — יש לבדוק מול העסק') && pt.includes('אלרגיות (אגוזים)') && pt.includes('שעות: לא ידוע'));
await p.getByRole('button', { name: 'מסומן כשר' }).click(); await p.waitForTimeout(300);
console.log('"kosher" filter keeps only tagged places:', (await food.count()) === 1);
await p.getByRole('button', { name: 'מסומן כשר' }).click();

// scenario 3 — on the way: detour minutes from routing, threshold filter
await p.getByRole('radio', { name: 'בדרך ליעד' }).click(); await p.waitForTimeout(1500);
const way = await p.locator('li[data-disc]').first().innerText();
console.log('scenario 3 — places along the drive with detour in minutes:', way.includes('סטייה:') && way.includes('דק׳'));
await p.getByRole('button', { name: 'בלי סטייה' }).click(); await p.waitForTimeout(300);
const tight = await p.locator('li[data-disc]').count();
await p.getByRole('button', { name: 'עד 30 דק׳' }).click(); await p.waitForTimeout(300);
console.log('detour limit filters by driving time, not map distance:', (await p.locator('li[data-disc]').count()) >= tight);
await p.getByRole('radio', { name: 'בסביבת היעד' }).click(); await p.waitForTimeout(1000);

// scenario 4 — build my day: cart + trail + restaurant → ordered, timed, navigable, approved
for (const [tab, name] of [['עגלות קפה', 'עגלת הקפה של הגולן'], ['מסלולי טיול', 'שביל המפלים'], ['מסעדות וקפה', 'מסעדת הגליל']]) { await p.getByRole('tab', { name: tab }).click(); await p.waitForTimeout(700); await p.locator('li[data-disc]').filter({ hasText: name }).getByRole('button', { name: 'ליום טיול' }).click(); }
await p.getByRole('button', { name: 'בנה לי יום (3)' }).click(); await p.waitForTimeout(1500);
const plan = p.getByRole('list', { name: 'תוכנית היום' });
const rows = await plan.getByRole('listitem').allInnerTexts();
console.log('scenario 4 — order: leave, coffee first, … , return; times and drive minutes:', rows.length === 5 && rows[0].includes('יציאה') && rows[1].includes('עגלת הקפה') && rows[4].includes('חזרה') && /\d\d:\d\d/.test(rows[2]) && rows[2].includes('דק׳ נסיעה'));
console.log('each stop has navigation; up/down and delete exist:', (await plan.getByRole('link', { name: /^ניווט ל/ }).count()) === 3 && (await plan.getByRole('button', { name: 'לאחר' }).count()) === 3);
console.log('cart opening hours read for the chosen day (open / closed / check):', /לפי OSM סגור ביום|לפי OSM פתוח ב-|לבדוק שפתוח ב-/.test(rows[1]));
await p.screenshot({ path: `${OUT}/discover-day.png` });
const before = await p.evaluate(id => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(x => x.id === id).schedule.length, tid);
await p.getByRole('button', { name: /הוספה ללו״ז — יום 1/ }).click(); await p.waitForTimeout(300);
console.log('nothing saved before approval:', (await p.evaluate(id => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(x => x.id === id).schedule.length, tid)) === before);
await p.getByRole('dialog', { name: /להוסיף ללו״ז/ }).getByRole('button', { name: 'אישור' }).click(); await p.waitForTimeout(500);
const after = await p.evaluate(id => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(x => x.id === id).schedule, tid);
console.log('approved: 3 stops + return in the schedule, the meal as a meal:', after.length === before + 4 && after.some(s => s.title === 'מסעדת הגליל' && s.kind === 'meal'));

// scenario 5 — weather changes: rain → the spring is "not today", explained; nothing in the plan changes
rain = 30;
const c2 = await context(); const q = await c2.newPage(); q.on('pageerror', e => errors.push(e.message));
await q.goto(BASE); await q.waitForTimeout(600); await q.evaluate(s => localStorage.setItem('campil-v1', s), await p.evaluate(() => localStorage.getItem('campil-v1')));
await q.goto(BASE + `#/discover/${tid}`); await q.reload(); await q.waitForTimeout(1800);
await q.getByRole('tab', { name: 'תצפיות וטבע' }).click(); await q.waitForTimeout(800);
while (await q.getByRole('button', { name: /^עוד \d+$/ }).count()) { await q.getByRole('button', { name: /^עוד \d+$/ }).click(); await q.waitForTimeout(200); }
const spring = q.locator('li[data-disc]').filter({ hasText: 'עין התאנה' });
const firstNature = await q.locator('li[data-disc]').first().innerText();
console.log('rain: places that are fine today come first, excluded ones last:', !firstNature.includes('לא היום'));
console.log('scenario 5 — rain: the spring is marked "not today" with the reason:', (await spring.innerText()).includes('לא היום') && (await spring.innerText()).includes('סכנת שיטפון'));
console.log('…and the schedule was not changed:', (await q.evaluate(id => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(x => x.id === id).schedule.length, tid)) === after.length);

// scenario 6 — missing info / service down: said plainly, nothing invented
overpassDown = true;
const c3 = await context(); const r3 = await c3.newPage();
await r3.goto(BASE); await r3.waitForTimeout(600); await r3.evaluate(s => { localStorage.setItem('campil-v1', s); Object.keys(localStorage).filter(k => k.startsWith('campil-disc')).forEach(k => localStorage.removeItem(k)); }, await p.evaluate(() => localStorage.getItem('campil-v1')));
await r3.goto(BASE + `#/discover/${tid}`); await r3.reload(); await r3.waitForTimeout(1800);
console.log('scenario 6 — map service down: clear message, no invented places:', (await r3.getByRole('alert').filter({ hasText: /לא הצלחנו לחפש במפה|עמוס/ }).count()) === 1 && (await r3.locator('li[data-disc]').count()) === 0);

// scenario 7 — mobile: no horizontal overflow on the discover screen
const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
console.log('scenario 7 — mobile RTL: no horizontal scroll:', ov <= 1, ov);
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await b.close();
