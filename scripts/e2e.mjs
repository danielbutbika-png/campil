// Smoke test + screenshots. External APIs are mocked with synthetic fixtures (the build container has no internet).
import { chromium } from 'playwright-core';
const OUT = process.argv[2] || 'shots';
const BASE = 'http://localhost:4173/';
const z = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
function forecast() {
  const days = [...Array(16)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return iso(d); });
  const hours = days.flatMap(d => [...Array(24)].map((_, h) => `${d}T${z(h)}:00`));
  const tmax = days.map((_, i) => 27 + Math.round(Math.sin(i) * 3)), tmin = days.map((_, i) => 15 + Math.round(Math.cos(i) * 2));
  return { daily: { time: days, weather_code: days.map((_, i) => (i === 6 ? 63 : i % 3 ? 1 : 2)), temperature_2m_max: tmax, temperature_2m_min: tmin, apparent_temperature_max: tmax.map(t => t + 1),
      precipitation_sum: days.map((_, i) => (i === 6 ? 7.4 : 0)), precipitation_probability_max: days.map((_, i) => (i === 6 ? 75 : 5)), wind_speed_10m_max: days.map(() => 18), wind_gusts_10m_max: days.map((_, i) => (i === 6 ? 46 : 28)),
      uv_index_max: days.map(() => 6.5), sunrise: days.map(d => `${d}T06:12`), sunset: days.map(d => `${d}T17:05`), relative_humidity_2m_mean: days.map(() => 58) },
    hourly: { time: hours, temperature_2m: hours.map((_, i) => 16 + 10 * Math.max(0, Math.sin(((i % 24) - 6) / 24 * 2 * Math.PI))), relative_humidity_2m: hours.map(() => 60), precipitation_probability: hours.map((_, i) => (Math.floor(i / 24) === 6 ? 70 : 0)), wind_speed_10m: hours.map(() => 12), wind_gusts_10m: hours.map(() => 25), weather_code: hours.map(() => 1) },
    current: { temperature_2m: 24.6, relative_humidity_2m: 55, weather_code: 1, wind_speed_10m: 11 } };
}
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errors = [];
async function page(vp, dark) {
  const ctx = await b.newContext({ viewport: vp, locale: 'he-IL', colorScheme: dark ? 'dark' : 'light', deviceScaleFactor: 2, timezoneId: 'Asia/Jerusalem' });
  await ctx.route(/api\.open-meteo\.com/, r => r.fulfill({ json: forecast() }));
  await ctx.route(/archive-api\.open-meteo\.com/, r => r.fulfill({ status: 500 }));
  await ctx.route(/overpass-api/, r => r.fulfill({ json: { elements: [{ type: 'node', id: 1, lat: 32.55, lon: 35.35, tags: { tourism: 'camp_site', name: 'חניון לדוגמה (fixture)', toilets: 'yes' } }] } }));
  await ctx.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|openfreemap|ERR_/.test(m.text())) errors.push('console: ' + m.text()); });
  return p;
}
const shot = (p, n) => p.screenshot({ path: `${OUT}/${n}.png`, fullPage: false });
const full = (p, n) => p.screenshot({ path: `${OUT}/${n}.png`, fullPage: true });

const m = await page({ width: 390, height: 844 });
await m.goto(BASE); await m.waitForTimeout(1500);
await full(m, '01-home-mobile');
const tripId = await m.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips[0].id);
await m.goto(BASE + `#/trip/${tripId}`); await m.waitForTimeout(1200); await full(m, '02-trip-overview-mobile');
await m.goto(BASE + `#/trip/${tripId}/gear`); await m.waitForTimeout(600);
await m.locator('input[type=checkbox]').nth(0).check(); await m.locator('input[type=checkbox]').nth(1).check();
await full(m, '03-trip-gear-mobile');
await m.goto(BASE + `#/trip/${tripId}/meals`); await m.waitForTimeout(500); await full(m, '04-meals-mobile');
await m.goto(BASE + `#/trip/${tripId}/schedule`); await m.waitForTimeout(500); await shot(m, '05-schedule-mobile');
await m.goto(BASE + `#/trip/${tripId}/tasks`); await m.waitForTimeout(400); await shot(m, '06-tasks-mobile');
await m.goto(BASE + '#/gear'); await m.waitForTimeout(400); await shot(m, '07-gear-mobile');
await m.goto(BASE + '#/gear/boxes'); await m.waitForTimeout(400); await full(m, '08-boxes-mobile');
await m.goto(BASE + '#/gear/car'); await m.waitForTimeout(400); await full(m, '09-car-mobile');

// Wizard
await m.goto(BASE + '#/new'); await m.waitForTimeout(500);
await m.getByRole('button', { name: 'ילד/ה', exact: true }).click();
await m.getByRole('button', { name: 'המשך' }).click(); await m.waitForTimeout(300);
console.log('blocked without age/gender:', await m.getByText('2. בחירת אזור').count() === 1 && await m.locator('[aria-current=step]').innerText());
await full(m, '10-wizard-1-error');
const last = m.locator('ul li').filter({ has: m.locator('input[type=number]') }).last();
await last.locator('input[type=number]').fill('4'); await last.getByRole('radio', { name: 'זכר' }).click();
await full(m, '10-wizard-1');
await m.getByRole('button', { name: 'המשך' }).click(); await m.waitForTimeout(2500); await shot(m, '11-wizard-2');
await m.selectOption('#region-list', 'central_negev'); await m.waitForTimeout(800);
await m.getByRole('button', { name: 'המשך' }).click(); await m.waitForTimeout(600);
await m.getByRole('button', { name: 'הוספה לתוכנית' }).first().click();
await shot(m, '12-wizard-3');
await m.getByRole('button', { name: 'המשך' }).click(); await m.waitForTimeout(300); await shot(m, '13-wizard-4');
await m.getByRole('button', { name: 'בנו לי תוכנית' }).click(); await m.waitForTimeout(1500); await shot(m, '14-new-trip');
const n = await m.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips.length);
console.log('trips after wizard:', n);
console.log('new trip participants:', await m.evaluate(() => { const t = JSON.parse(localStorage.getItem('campil-v1')).state.trips.at(-1); return JSON.stringify({ n: t.participants.length, adults: t.adults, children: t.children, ages: t.childAges, servings: t.meals[0].servings }); }));
await m.goto(BASE + '#/map/golan'); await m.waitForTimeout(3500); await shot(m, '15-map-mobile');

const d = await page({ width: 1366, height: 900 });
await d.goto(BASE); await d.waitForTimeout(1500); await shot(d, '20-home-desktop');
const tid2 = await d.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips[0].id);
await d.goto(BASE + `#/trip/${tid2}`); await d.waitForTimeout(1500); await full(d, '21-trip-desktop');
await d.goto(BASE + '#/map/lower_galilee'); await d.waitForTimeout(3500);
await d.getByRole('button', { name: /חניונים מ-OpenStreetMap/ }).click(); await d.waitForTimeout(800); await shot(d, '22-map-desktop');
const k = await page({ width: 390, height: 844 }, true);
await k.goto(BASE); await k.waitForTimeout(1200); await shot(k, '30-home-dark');
await k.goto(BASE + '#/settings'); await k.waitForTimeout(400); await shot(k, '31-settings-dark');
const overflow = await m.evaluate(() => document.documentElement.scrollWidth > innerWidth);
console.log('horizontal overflow (mobile):', overflow);
console.log('errors:', errors.length ? errors.join('\n') : 'none');
await b.close();
