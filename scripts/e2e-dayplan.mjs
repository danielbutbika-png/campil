// Day plan from the place database, official IMS warnings (live file mocked), what-changed notice, approval flow,
// and the wizard's destination search over the database.
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome') });
const iso = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv-SE'); };
let alerts = 'flood', rain = 0;
async function context() {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL', deviceScaleFactor: 2 });
  await ctx.route(/open-meteo/, r => { const days = [...Array(16)].map((_, i) => iso(i)); r.fulfill({ contentType: 'application/json', body: JSON.stringify({ daily: { time: days, temperature_2m_max: days.map(() => 24), temperature_2m_min: days.map(() => 14), precipitation_sum: days.map(() => rain), precipitation_probability_max: days.map(() => (rain ? 90 : 5)), wind_speed_10m_max: days.map(() => 10), wind_gusts_10m_max: days.map(() => 20), weather_code: days.map(() => 1) }, hourly: { time: [] } }) }); });
  await ctx.route(/live\/ims-alerts\.json/, r => alerts === 'missing' ? r.fulfill({ status: 404, body: '' }) : r.fulfill({ contentType: 'application/json', body: JSON.stringify({ source: 'IMS', sourceUrl: 'https://ims.gov.il', terms: '', ok: true, checkedAt: new Date(Date.now() - (alerts === 'stale' ? 12 : 0.5) * 36e5).toISOString(), feeds: [
    { area: 'north', type: 'flood', url: 'x', ok: true, items: alerts === 'flood' ? [{ title: 'אזהרה כתומה - חשש לשיטפונות בנחלי צפון הארץ', text: 'בתוקף מ-31/10 עד 01/11', pubDate: new Date().toUTCString(), link: 'https://ims.gov.il/he/warnings' }] : [] },
    { area: 'country', type: 'sea', url: 'x', ok: true, items: [] }] }) }));
  await ctx.route(/overpass|osrm|nominatim|openfreemap|fonts\.|wikipedia|wikimedia/, r => r.abort());
  return ctx;
}
const ctx = await context(); const p = await ctx.newPage(); const errors = [];
p.on('pageerror', e => errors.push(e.message));
await p.goto(BASE); await p.waitForTimeout(1200);
const tid = await p.evaluate(([s, e]) => { const k = JSON.parse(localStorage.getItem('campil-v1')); const t = k.state.trips[0];
  Object.assign(t, { start: s, end: e, example: false, status: 'planning', regionId: 'golan', dest: { lat: 32.94, lon: 35.73, label: 'קצרין' }, interests: ['water', 'family', 'views'], places: [], siteIds: [] });
  localStorage.setItem('campil-v1', JSON.stringify(k)); return t.id; }, [iso(1), iso(3)]);

// official warnings in the trip's safety / overview
await p.goto(BASE + `#/trip/${tid}/safety`); await p.reload(); await p.waitForTimeout(1500);
console.log('official IMS warning shown with credit and link:', (await p.getByText('אזהרה כתומה - חשש לשיטפונות בנחלי צפון הארץ').count()) >= 1 && (await p.getByRole('link', { name: 'מקור: השירות המטאורולוגי הישראלי' }).count()) >= 1);

// day plan
await p.goto(BASE + `#/trip/${tid}/schedule`); await p.waitForTimeout(2000);
const ideas = p.getByRole('region', { name: 'הצעה לכל יום' });
console.log('day plan: a proposal per day, labelled rules-based:', (await ideas.getByRole('listitem', { name: /^יום \d$/ }).count()) === 3 && (await ideas.getByText('מבוסס כללים — בלי AI').count()) === 1);
const txt = await ideas.innerText();
console.log('each pick has time, score, air distance and why:', /\d\d:\d\d/.test(txt) && /\d+\/100/.test(txt) && txt.includes('בקו אווירי'));
await ideas.getByText(/מקומות לא מומלצים ביום הזה/).first().click().catch(() => {}); await p.waitForTimeout(200);
console.log('streams ruled out by the official flood warning, with the reason:', (await ideas.innerText()).includes('אזהרה רשמית בתוקף'));
await p.screenshot({ path: `${OUT}/dayplan.png`, fullPage: true });
const before = await p.evaluate(id => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(x => x.id === id).schedule.length, tid);
await ideas.getByRole('button', { name: /להוסיף ללו״ז/ }).click(); await p.waitForTimeout(300);
const dlg = p.getByRole('dialog'); const n = await dlg.getByRole('checkbox').count();
console.log('nothing saved before approval:', (await p.evaluate(id => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(x => x.id === id).schedule.length, tid)) === before);
await dlg.getByRole('checkbox').first().uncheck();
await dlg.getByRole('button', { name: `אישור (${n - 1})` }).click(); await p.waitForTimeout(400);
const after = await p.evaluate(id => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(x => x.id === id), tid);
console.log('approved items only were added to the schedule and the trip places:', after.schedule.length === before + n - 1 && after.places.length === n - 1);

// what changed: dates move → plan recomputed, the notice says why
await p.evaluate(([id, s, e]) => { const k = JSON.parse(localStorage.getItem('campil-v1')); Object.assign(k.state.trips.find(x => x.id === id), { start: s, end: e, places: [] }); localStorage.setItem('campil-v1', JSON.stringify(k)); }, [tid, iso(2), iso(3)]);
await p.reload(); await p.waitForTimeout(2000);
const st = p.getByRole('region', { name: 'הצעה לכל יום' }).getByRole('status');
console.log('what changed is shown, with the reason (dates):', (await st.count()) === 1 && (await st.innerText()).includes('תאריכי הטיול השתנו'));

// alerts missing / stale → "could not check", never "no warnings"
alerts = 'missing';
const c2 = await context(); const q = await c2.newPage(); q.on('pageerror', e => errors.push(e.message));
await q.goto(BASE); await q.waitForTimeout(800); await q.evaluate(s => localStorage.setItem('campil-v1', s), await p.evaluate(() => localStorage.getItem('campil-v1')));
await q.goto(BASE + `#/trip/${tid}/safety`); await q.reload(); await q.waitForTimeout(1500);
console.log('alerts unavailable → "could not check", no "no warnings":', (await q.getByText('לא הצלחנו לבדוק אזהרות רשמיות כרגע').count()) === 1 && (await q.getByText(/אין כרגע אזהרות/).count()) === 0);
alerts = 'stale';
const c3 = await context(); const r3 = await c3.newPage();
await r3.goto(BASE); await r3.waitForTimeout(800); await r3.evaluate(s => localStorage.setItem('campil-v1', s), await p.evaluate(() => localStorage.getItem('campil-v1')));
await r3.goto(BASE + `#/trip/${tid}/safety`); await r3.reload(); await r3.waitForTimeout(1500);
console.log('alerts older than 8h → "not updated since…":', (await r3.getByText(/האזהרות לא עודכנו מאז/).count()) === 1);
alerts = 'none';
const c4 = await context(); const r4 = await c4.newPage();
await r4.goto(BASE); await r4.waitForTimeout(800); await r4.evaluate(s => localStorage.setItem('campil-v1', s), await p.evaluate(() => localStorage.getItem('campil-v1')));
await r4.goto(BASE + `#/trip/${tid}/safety`); await r4.reload(); await r4.waitForTimeout(1500);
console.log('fresh and empty → "no warnings in the feed" + "not a safety confirmation":', (await r4.getByText(/אין כרגע אזהרות בפיד/).count()) === 1 && (await r4.getByText('זה לא אישור שהמקום בטוח').count()) === 1);

// wizard: destination search over the database, with same-name disambiguation
await p.goto(BASE + '#/new'); await p.waitForTimeout(800);
await p.getByRole('radio', { name: 'טיול יום' }).click(); await p.waitForTimeout(300);
const box = p.locator('#dest-q');
if (await box.count()) {
  await box.fill('עין גדי'); await p.waitForTimeout(500);
  const list = p.getByRole('list', { name: 'ממאגר המקומות' });
  console.log('wizard search finds database places with region and type:', (await list.getByRole('button').count()) >= 1 && (await list.innerText()).includes('מדבר יהודה'));
} else console.log('wizard search box present:', false);
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await b.close();
