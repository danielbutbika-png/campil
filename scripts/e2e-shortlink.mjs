// Short invite links (#/j/<trip>_<key>_f<family>): open the join screen with this build's own connection,
// expired links are refused clearly, garbage is "invalid". Firebase itself is not reached in this test.
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome') });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL', deviceScaleFactor: 2 });
await ctx.route(/googleapis|firebase|gstatic|open-meteo|overpass|fonts\./, r => r.abort());
const p = await ctx.newPage(); const errors = [];
p.on('pageerror', e => errors.push(e.message));
await p.goto(BASE + '#/j/74FwWMGJKLH9kFn3ePAY_xVBkmBkvcv2B7KzP_fwit700n'); await p.waitForTimeout(1500);
console.log('short link opens the join screen (no config in the link):', (await p.getByRole('heading', { name: /הוזמנתם לתכנן טיול יחד/ }).count()) === 1 && (await p.getByText('קישור ההזמנה לא תקין').count()) === 0);
console.log('sign-in gate does not hide the invite:', (await p.getByRole('button', { name: /הצטרפות לטיול/ }).count()) === 1);
await p.screenshot({ path: `${OUT}/shortlink-join.png` });
await p.goto(BASE + '#/j/74FwWMGJKLH9kFn3ePAY_xVBkmBkvcv2B7KzP_e' + (Date.now() - 864e5).toString(36)); await p.waitForTimeout(800);
console.log('expired short link is refused clearly:', (await p.getByText('פג תוקף קישור ההזמנה').count()) === 1);
await p.goto(BASE + '#/j/..%2Fx'); await p.waitForTimeout(800);
console.log('garbage short link → "invalid link":', (await p.getByText('קישור ההזמנה לא תקין').count()) === 1);
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await b.close();
