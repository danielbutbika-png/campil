// Release 4.3: "what can we cook from what we have" — mark ingredients and gear, see ready / almost recipes.
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome') });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL', deviceScaleFactor: 2 });
await ctx.route(/open-meteo|overpass|osrm|nominatim|openfreemap|fonts\./, r => r.abort());
const p = await ctx.newPage(); const errors = [];
p.on('pageerror', e => errors.push(e.message));
await p.goto(BASE); await p.waitForTimeout(1000);
await p.goto(BASE + '#/more'); await p.waitForTimeout(600);
await p.getByRole('link', { name: /מה אפשר להכין ממה שיש/ }).click(); await p.waitForTimeout(700);
console.log('opens from More:', p.url().endsWith('#/cook'));
const gear = p.getByRole('group', { name: 'כלים שיש' });
console.log('gear prefilled from inventory:', (await gear.locator('[aria-pressed="true"]').count()) > 0);
const recipes = p.getByRole('list', { name: 'מתכונים מתאימים' });
console.log('empty prompt before marking:', (await p.getByText('סמנו מצרכים כדי לראות מתכונים.').count()) === 1);
const ing = p.getByRole('group', { name: 'מצרכים שיש' });
for (const n of ['ביצים', 'עגבניות', 'פיתות', 'בצל']) await ing.getByRole('button', { name: n, exact: true }).click();
// make sure the gas stove and a pan are marked
for (const n of ['גזייה', 'מחבת גדולה']) { const c = gear.getByRole('button', { name: n, exact: true }); if ((await c.getAttribute('aria-pressed')) !== 'true') await c.click(); }
await p.waitForTimeout(300);
const shak = recipes.locator(':scope > li', { hasText: 'שקשוקה' });
const t = await shak.innerText();
console.log('shakshuka almost — only red pepper missing:', t.includes('חסרים 1–2') && t.includes('פלפל אדום') && !t.includes('בצל,'));
await ing.getByRole('button', { name: 'פלפל אדום', exact: true }).click(); await p.waitForTimeout(300);
console.log('shakshuka ready after adding pepper:', (await shak.innerText()).includes('אפשר להכין'));
await gear.getByRole('button', { name: 'גזייה', exact: true }).click(); await p.waitForTimeout(300);
console.log('missing stove shown as needed gear:', (await shak.innerText()).includes('צריך כלים: גזייה'));
await gear.getByRole('button', { name: 'גזייה', exact: true }).click();
await shak.getByRole('button', { name: 'מתכון' }).click(); await p.waitForTimeout(400);
console.log('recipe sheet with steps and food-safety note:', (await p.getByRole('dialog').getByText('הכנה').count()) > 0 && (await p.getByRole('dialog').getByText(/בטיחות מזון/).count()) === 1);
await p.screenshot({ path: `${OUT}/cook-sheet.png` });
await p.keyboard.press('Escape'); await p.waitForTimeout(300);
await p.reload(); await p.waitForTimeout(800);
console.log('choices persisted:', (await p.getByRole('group', { name: 'מצרכים שיש' }).getByRole('button', { name: 'פלפל אדום', exact: true }).getAttribute('aria-pressed')) === 'true');
await p.screenshot({ path: `${OUT}/cook.png`, fullPage: true });
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await b.close();
