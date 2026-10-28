// Home screen modes: planning / preparing / in the field, chosen from the nearest real trip's dates,
// with a manual switch. Weather is mocked so the panels render the same way every run.
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome') });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL', deviceScaleFactor: 2 });
await ctx.route(/overpass|osrm|nominatim|openfreemap|fonts\./, r => r.abort());
await ctx.route(/open-meteo/, r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ daily: { time: [], temperature_2m_max: [], temperature_2m_min: [] }, hourly: { time: [] } }) }));
const p = await ctx.newPage(); const errors = [];
p.on('pageerror', e => errors.push(e.message));
const iso = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv-SE'); };
const setTrip = (start, end, example = false) => p.evaluate(([s, e, ex]) => {
  const k = JSON.parse(localStorage.getItem('campil-v1'));
  Object.assign(k.state.trips[0], { start: s, end: e, example: ex, status: 'planning' });
  localStorage.setItem('campil-v1', JSON.stringify(k));
}, [start, end, example]);
const heading = name => p.getByRole('heading', { name }).count().then(n => n > 0);

await p.goto(BASE); await p.waitForTimeout(1500);
console.log('example trip keeps planning mode:', (await heading('לאן יוצאים הפעם?')) && (await p.getByRole('radiogroup', { name: 'מצב מסך הבית' }).count()) === 0);

await setTrip(iso(3), iso(5)); await p.reload(); await p.waitForTimeout(1500);
console.log('3 days before → preparing:', await heading('עוד רגע יוצאים'), '| panel:', await heading(/^ההכנות ל/));
console.log('prep shows packing, tasks, shopping and offline prep:', (await p.getByText(/פריטים לארוז|הכול ארוז/).count()) > 0 && (await p.getByText(/משימות פתוחות/).count()) > 0 && (await p.getByText('תפריט ורשימת קניות').count()) > 0 && (await heading('מוכנים לשטח בלי קליטה?')));
const asst = p.getByRole('region', { name: 'מה כדאי לעשות עכשיו' });
const items = asst.locator('li'); const nItems = await items.count();
console.log('assistant shows next steps in prep mode:', nItems > 0, nItems);
const allSourced = (await items.evaluateAll(els => els.map(e => e.innerText))).every(x => /המלצה אוטומטית|לא אומת|המלצה רשמית|מאומת|הערכה/.test(x));
console.log('every suggestion names its source:', allSourced);
await asst.getByRole('button', { name: /^עוד \d+ המלצות/ }).click().catch(() => {}); await p.waitForTimeout(200);
console.log('suggests packing and offline prep 3 days out:', (await asst.innerText()).includes('לא ארוזים') && (await asst.innerText()).includes('בלי קליטה'));
await p.screenshot({ path: `${OUT}/home-prep.png`, fullPage: true });

await setTrip(iso(-1), iso(1)); await p.reload(); await p.waitForTimeout(1500);
console.log('during the trip → in the field:', await heading('טיול נעים!'), '| day 2:', (await p.getByText('יום 2 מתוך 3').count()) > 0);
console.log('field has navigation, emergency and official sources:', (await p.getByRole('link', { name: 'Waze' }).count()) > 0 && (await p.getByRole('link', { name: /חירום — מד״א 101/ }).count()) > 0 && (await heading('התרעות רשמיות — לבדוק לפני היציאה')));
console.log('field hides discovery sections:', (await heading('מסלולים פופולריים')) === false);
await p.screenshot({ path: `${OUT}/home-field.png`, fullPage: true });

await p.getByRole('radio', { name: /^תכנון/ }).click(); await p.waitForTimeout(300);
console.log('manual switch to planning:', await heading('לאן יוצאים הפעם?'), '| discovery back:', await heading('מסלולים פופולריים'));
await p.getByRole('radio', { name: /^בשטח/ }).click(); await p.waitForTimeout(300);
console.log('switch back to field:', await heading('טיול נעים!'));

await setTrip(iso(20), iso(22)); await p.reload(); await p.waitForTimeout(1500);
console.log('3 weeks before → planning:', await heading('לאן יוצאים הפעם?'));
await p.getByRole('radio', { name: /^בשטח/ }).click(); await p.waitForTimeout(300);
console.log('field preview before the trip is labelled:', (await p.getByText(/תצוגה מקדימה/).count()) > 0);

console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await b.close();
