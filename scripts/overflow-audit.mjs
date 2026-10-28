// Finds any element wider than the viewport on every screen (phone sizes).
import { chromium } from 'playwright-core';
const BASE = 'http://localhost:4173/';
const z = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
function forecast() {
  const days = [...Array(16)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return iso(d); });
  const hours = days.flatMap(d => [...Array(24)].map((_, h) => `${d}T${z(h)}:00`));
  const a = v => days.map(() => v);
  return { daily: { time: days, weather_code: a(3), temperature_2m_max: a(26), temperature_2m_min: a(19), apparent_temperature_max: a(29), precipitation_sum: a(0), precipitation_probability_max: a(5), wind_speed_10m_max: a(15), wind_gusts_10m_max: a(30), uv_index_max: a(5), sunrise: days.map(d => d + 'T06:52'), sunset: days.map(d => d + 'T17:54'), relative_humidity_2m_mean: a(79) },
    hourly: { time: hours, temperature_2m: hours.map((_, i) => 20 + 6 * Math.max(0, Math.sin(((i % 24) - 6) / 24 * 2 * Math.PI))), relative_humidity_2m: hours.map(() => 70), precipitation_probability: hours.map(() => 0), wind_speed_10m: hours.map(() => 10), wind_gusts_10m: hours.map(() => 20), weather_code: hours.map(() => 3) }, current: { temperature_2m: 24, relative_humidity_2m: 60, weather_code: 3, wind_speed_10m: 10 } };
}
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
let bad = 0;
for (const vp of [{ width: 375, height: 812 }, { width: 430, height: 932 }]) {
  const ctx = await b.newContext({ viewport: vp, locale: 'he-IL', isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ctx.route(/api\.open-meteo\.com/, r => r.fulfill({ json: forecast() }));
  await ctx.route(/fonts\.|overpass|osrm|nominatim|firebase|googleapis|gstatic/, r => r.abort());
  const p = await ctx.newPage();
  await p.goto(BASE); await p.waitForTimeout(1500);
  const tid = await p.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips[0].id);
  const routes = ['/', '/trips', `/trip/${tid}`, `/trip/${tid}/gear`, `/trip/${tid}/meals`, `/trip/${tid}/schedule`, `/trip/${tid}/tasks`, `/trip/${tid}/journal`, '/map', '/map/upper_galilee', '/gear', '/gear/boxes', '/gear/car', '/camps', '/more', '/settings', '/guides', '/guide/firebase', '/albums', '/about', '/new'];
  for (const r of routes) {
    await p.goto(BASE + '#' + r); await p.waitForTimeout(r.startsWith('/map') ? 2500 : 900);
    const res = await p.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const over = document.documentElement.scrollWidth > W;
      const culprits = [];
      for (const el of document.querySelectorAll('body *')) {
        const rc = el.getBoundingClientRect(); if (!rc.width) continue;
        if (rc.left < -1 || rc.right > W + 1) {
          // ignore things inside intentional horizontal scrollers
          let n = el.parentElement, inScroller = false;
          while (n && n !== document.body) { const s = getComputedStyle(n); if (s.overflowX === 'auto' || s.overflowX === 'scroll' || s.overflowX === 'hidden' || s.overflowX === 'clip') { inScroller = true; break; } n = n.parentElement; }
          if (!inScroller) culprits.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} [${Math.round(rc.left)}→${Math.round(rc.right)}]`);
        }
      }
      return { over, sw: document.documentElement.scrollWidth, W, culprits: culprits.slice(0, 4) };
    });
    if (res.over || res.culprits.length) { bad++; console.log(vp.width, r, JSON.stringify(res)); }
  }
  await ctx.close();
}
console.log(bad ? `${bad} problems` : 'no horizontal overflow on any screen');
await b.close();
