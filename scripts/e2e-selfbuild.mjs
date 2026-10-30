// Self-built menu (foods per meal with quantities recommended for the people on the trip) and a self-built gear list
// (start empty, add with suggestions from the store, edit, remove) — nothing gets replaced automatically.
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome') });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL', deviceScaleFactor: 2 });
await ctx.route(/open-meteo|overpass|osrm|nominatim|openfreemap|fonts\./, r => r.abort());
const p = await ctx.newPage(); const errors = [];
p.on('pageerror', e => errors.push(e.message)); p.on('dialog', d => d.accept());
await p.goto(BASE); await p.waitForTimeout(1000);
const T = () => p.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips[0]);
const tid = (await T()).id;
// ── menu ──
await p.goto(BASE + `#/trip/${tid}/meals`); await p.waitForTimeout(800);
await p.getByRole('radio', { name: 'בונים בעצמנו' }).click(); await p.waitForTimeout(400);
let t = await T();
console.log('self-built menu starts empty (after confirming):', t.menuMode === 'manual' && t.meals.every(m => !m.recipeId));
const n = t.participants.length;
await p.getByRole('button', { name: 'מזון', exact: true }).first().click(); await p.waitForTimeout(300);
const sheet = p.getByRole('dialog');
const head = await sheet.innerText();
const eq = +head.match(/= ([\d.]+) מנות מבוגר/)[1];
console.log('picker shows the people and adult portions:', head.includes(`${n} משתתפים`) && eq > 0, eq);
await sheet.getByLabel('חיפוש מזון').fill('פסטה');
await sheet.getByRole('list', { name: 'מזון לבחירה' }).getByRole('button').first().click(); await p.waitForTimeout(300);
await p.keyboard.press('Escape'); await p.waitForTimeout(300);
const want = Math.max(50, Math.ceil((100 * eq) / 50) * 50);
const qty = await p.getByLabel('כמות פסטה (יבשה)').first().inputValue();
console.log('recommended amount follows the people:', +qty === want, qty, want);
const shop = await p.locator('section', { hasText: 'רשימת קניות מאוחדת' }).last().innerText();
console.log('it goes into the shopping list:', shop.includes('פסטה (יבשה)'));
await p.getByLabel('כמות פסטה (יבשה)').first().fill('1000'); await p.waitForTimeout(300);
console.log('own amount kept, reset to the recommendation offered:', (await p.getByRole('button', { name: 'חזרה לכמות המומלצת לפסטה (יבשה)' }).count()) === 1);
await p.screenshot({ path: `${OUT}/selfmenu.png`, fullPage: true });
// rebuild from trip edits must not touch it
await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('campil-v1')); d.state.trips[0].packingSig = 'x'; localStorage.setItem('campil-v1', JSON.stringify(d)); });
await p.reload(); await p.waitForTimeout(1200);
console.log('menu unchanged after reload:', (await T()).meals.some(m => m.items?.some(i => i.qty === 1000)));
// ── gear ──
await p.goto(BASE + `#/trip/${tid}/gear`); await p.waitForTimeout(800);
await p.getByRole('radio', { name: 'בונים בעצמנו' }).click(); await p.waitForTimeout(500);
t = await T();
console.log('self-built list starts empty (items removed, recoverable):', t.packingMode === 'manual' && t.packing.every(x => x.removed || x.source === 'manual') && (await p.getByText('אין פריטים להצגה בסינון הזה.').count()) === 1);
const inv = await p.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.inventory.find(g => g.category === 'kitchen'));
await p.getByRole('button', { name: 'פריט', exact: true }).click(); await p.waitForTimeout(300);
await p.getByLabel('שם הפריט').fill(inv.name); await p.waitForTimeout(100);
console.log('suggestion from the store sets the category:', (await p.getByLabel('קטגוריה').inputValue()) === 'kitchen');
await p.getByRole('button', { name: 'הוספה', exact: true }).click(); await p.waitForTimeout(400);
await p.getByRole('button', { name: 'פריט', exact: true }).click(); await p.waitForTimeout(300);
await p.getByLabel('שם הפריט').fill('ערסל'); await p.getByRole('button', { name: 'הוספה', exact: true }).click(); await p.waitForTimeout(400);
console.log('two items on my list:', (await p.locator('input[type=checkbox][aria-label$="ארוז"]').count()) === 2);
await p.getByRole('button', { name: 'למה ערסל ברשימה' }).click(); await p.waitForTimeout(300);
await p.getByRole('dialog').getByLabel('שם הפריט').fill('ערסל זוגי'); await p.getByRole('dialog').getByRole('spinbutton', { name: 'כמות' }).fill('2');
await p.getByRole('button', { name: 'שמירת השינויים' }).click(); await p.waitForTimeout(400);
const it = (await T()).packing.find(x => x.name === 'ערסל זוגי');
console.log('item renamed and quantity changed:', it?.qty === 2);
await p.getByRole('button', { name: 'למה ערסל זוגי ברשימה' }).click(); await p.waitForTimeout(300);
await p.getByRole('button', { name: 'הסרה מהרשימה' }).click(); await p.waitForTimeout(300);
console.log('item removed:', (await p.locator('input[type=checkbox][aria-label$="ארוז"]').count()) === 1);
await p.screenshot({ path: `${OUT}/selfgear.png`, fullPage: true });
// recalculation does not touch a self-built list
await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('campil-v1')); d.state.trips[0].packingSig = 'stale'; localStorage.setItem('campil-v1', JSON.stringify(d)); });
await p.reload(); await p.waitForTimeout(1500);
console.log('self-built list not recalculated:', (await T()).packing.filter(x => !x.removed).length === 1);
// back to automatic: list returns, my item stays
await p.getByRole('radio', { name: 'רשימה אוטומטית' }).click(); await p.waitForTimeout(1500);
const live = (await T()).packing.filter(x => !x.removed);
console.log('back to automatic keeps what I added and removed:', live.some(x => x.name === inv.name && x.source === 'manual') && !live.some(x => x.name === 'ערסל זוגי'));
// editing a generated item: renamed copy stays after recalculation
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await b.close();
