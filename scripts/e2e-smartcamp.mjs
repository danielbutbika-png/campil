// Release 4: power calculator (Wh vs mAh, range) and QR boxes (open a box by its link, update contents, labels).
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome') });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL', deviceScaleFactor: 2 });
await ctx.route(/open-meteo|overpass|osrm|nominatim|openfreemap|fonts\./, r => r.abort());
const p = await ctx.newPage(); const errors = [];
p.on('pageerror', e => errors.push(e.message));
await p.goto(BASE); await p.waitForTimeout(1000);
// power
await p.goto(BASE + '#/gear/power'); await p.waitForTimeout(700);
await p.getByRole('button', { name: 'סוללה', exact: true }).click();
await p.getByLabel('או mAh').fill('20000');
console.log('asks for volts when only mAh is given:', (await p.getByText('חסר: Wh, או mAh יחד עם המתח').count()) === 1);
await p.getByLabel('במתח (V)').fill('3.7');
await p.getByRole('button', { name: 'מכשיר', exact: true }).click();
await p.getByLabel('מכשיר', { exact: true }).fill('מאוורר'); await p.getByLabel('הספק (W)').fill('5'); await p.getByLabel('שעות ביום').fill('8');
await p.waitForTimeout(200);
const res = await p.getByRole('region', { name: 'התוצאה' }).innerText();
console.log('result: 74 Wh, a range of days, marked as estimate:', res.includes('74 Wh') && /1\.1–1\.6 ימים/.test(res) && res.includes('הערכה'));
await p.reload(); await p.waitForTimeout(600);
console.log('inputs persisted:', (await p.getByLabel('או mAh').inputValue()) === '20000');
// boxes
await p.goto(BASE + '#/gear/boxes'); await p.waitForTimeout(600);
await p.getByRole('link', { name: /פתיחת הארגז/ }).first().click(); await p.waitForTimeout(800);
const url = p.url(); const boxId = decodeURIComponent(url.split('#/box/')[1]);
console.log('box opens from its link:', url.includes('#/box/') && (await p.getByRole('list', { name: 'תכולת הארגז' }).locator(':scope > li').count()) > 0);
console.log('QR rendered:', (await p.locator('[role="img"][aria-label^="קוד QR"] svg').count()) === 1);
const first = p.getByRole('list', { name: 'תכולת הארגז' }).locator(':scope > li').first();
const name = (await first.locator('span.font-semibold').innerText()).trim();
await first.getByRole('button', { name: 'חסר' }).click(); await p.waitForTimeout(200);
await first.getByRole('button', { name: 'הוצאה' }).click(); await p.waitForTimeout(300);
const inv = await p.evaluate(n => JSON.parse(localStorage.getItem('campil-v1')).state.inventory.find(g => g.name === n), name);
console.log('marked missing and taken out of the box:', inv.status === 'buy' && inv.boxId == null);
await p.getByLabel('הכנסת פריט לארגז').selectOption({ label: name }); await p.getByRole('button', { name: 'הכנסה' }).click(); await p.waitForTimeout(300);
console.log('put back in:', (await p.evaluate(n => JSON.parse(localStorage.getItem('campil-v1')).state.inventory.find(g => g.name === n).boxId, name)) === boxId);
// unknown box on this device
await p.goto(BASE + '#/box/nope'); await p.waitForTimeout(500);
console.log('unknown box explained:', (await p.getByText('הארגז לא נמצא במכשיר הזה').count()) === 1);
await p.goto(BASE + '#/gear/labels'); await p.waitForTimeout(800);
const n = await p.locator('[role="img"][aria-label^="קוד QR"] svg').count();
console.log('labels page: a QR for every box:', n >= 5, n);
await p.screenshot({ path: `${OUT}/labels.png`, fullPage: true });
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await b.close();
