// Recommendation actions with preview + approval, the full field mode, and the home screen with no trip.
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome') });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL', deviceScaleFactor: 2 });
await ctx.route(/open-meteo|overpass|osrm|nominatim|openfreemap|fonts\./, r => r.abort());
const p = await ctx.newPage(); const errors = [];
p.on('pageerror', e => errors.push(e.message));
const iso = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv-SE'); };
const store = fn => p.evaluate(f => { const k = JSON.parse(localStorage.getItem('campil-v1')); const r = new Function('s', f)(k.state); localStorage.setItem('campil-v1', JSON.stringify(k)); return r; }, fn);

await p.goto(BASE); await p.waitForTimeout(1000);
const tid = await store(`const t = s.trips[0]; Object.assign(t, { start: '${iso(1)}', end: '${iso(1)}', example: false, status: 'planning' });
  t.packing.push({ id: 'pw1', name: 'פנס ראש', category: 'power', qty: 2, reason: 'x', source: 'manual', packed: false });
  t.packing.push({ id: 'pw2', name: 'מטען נייד', category: 'power', qty: 1, reason: 'x', source: 'manual', packed: false });
  t.tasks = t.tasks.filter(k => !k.text.startsWith('לטעון')); return t.id;`);
await p.goto(BASE + `#/trip/${tid}`); await p.reload(); await p.waitForTimeout(1500);

// 1. action from a card: preview, untick, approve
const charge = p.locator('li[data-rec="charge"]');
const propose = charge.getByRole('button', { name: /להוסיף משימות טעינה/ });
console.log('card offers a concrete action:', (await propose.count()) === 1);
const before = await store(`return s.trips.find(t => t.id === '${tid}').tasks.length;`);
await propose.click(); await p.waitForTimeout(300);
const dlg = p.getByRole('dialog');
const boxes = dlg.getByRole('checkbox'); const n = await boxes.count();
console.log('preview lists each change, all ticked:', n >= 2 && (await boxes.evaluateAll(e => e.every(x => x.checked))));
console.log('preview says nothing is saved yet:', (await dlg.getByText(/שום דבר לא נשמר עד שתאשרו/).count()) === 1);
const unchanged = await store(`return s.trips.find(t => t.id === '${tid}').tasks.length;`);
console.log('opening the preview changed nothing:', unchanged === before);
await p.screenshot({ path: `${OUT}/action-preview.png` });
await boxes.nth(0).uncheck();
await dlg.getByRole('button', { name: `אישור (${n - 1})` }).click(); await p.waitForTimeout(500);
const tasks = await store(`return s.trips.find(t => t.id === '${tid}').tasks.filter(k => k.text.startsWith('לטעון')).map(k => k.text);`);
console.log('only approved lines were added:', tasks.length === n - 1, tasks.join(', '));
console.log('handled card leaves the list:', (await p.locator('li[data-rec="charge"]').count()) === 0);
await p.getByRole('button', { name: /ביטול/ }).count(); // no-op

// cancel path: nothing changes
await store(`const t = s.trips.find(t => t.id === '${tid}'); t.meals = [{ id: 'm1', day: 0, type: 'lunch', recipeId: 'shakshuka', servings: 1 }];`);
await p.reload(); await p.waitForTimeout(1200);
await p.getByRole('button', { name: /^עוד \d+ המלצות/ }).click().catch(() => {}); await p.waitForTimeout(200);
const food = p.locator('li[data-rec="food-count"]');
await food.getByRole('button', { name: /לעדכן את מספר הסועדים/ }).click(); await p.waitForTimeout(300);
await p.getByRole('dialog').getByRole('button', { name: 'ביטול' }).click(); await p.waitForTimeout(300);
const sv = await store(`return s.trips.find(t => t.id === '${tid}').meals[0].servings;`);
console.log('cancel leaves the data untouched:', sv === 1);
await food.getByRole('button', { name: /לעדכן את מספר הסועדים/ }).click(); await p.waitForTimeout(300);
await p.getByRole('dialog').getByRole('button', { name: /^אישור/ }).click(); await p.waitForTimeout(400);
const people = await store(`const t = s.trips.find(t => t.id === '${tid}'); return [t.meals[0].servings, t.participants.length];`);
console.log('approved: servings updated to the people coming:', people[0] === people[1], people.join('/'));

// 2. field mode
await store(`Object.assign(s.trips.find(t => t.id === '${tid}'), { start: '${iso(-1)}', end: '${iso(1)}' });`);
await p.goto(BASE); await p.reload(); await p.waitForTimeout(1500);
const nav = p.getByRole('navigation', { name: 'פעולות שטח' });
console.log('field: big actions (next, gear, map, safety, guides, journal, emergency):', (await nav.getByRole('link').count()) === 7);
const sizes = await nav.getByRole('link').evaluateAll(e => e.map(x => x.getBoundingClientRect().height));
console.log('field: every action ≥ 56px tall:', sizes.every(h => h >= 56), sizes.map(Math.round).join(','));
const status = p.getByRole('status', { name: 'מצב חיבור ושמירה במכשיר' });
console.log('field: connection + what is on the device are visible:', (await status.innerText()).includes('יש חיבור') && (await status.innerText()).includes('שמור במכשיר'));
const em = await nav.getByRole('link', { name: /חירום/ }).evaluate(e => [getComputedStyle(e).backgroundColor, getComputedStyle(e).color]);
console.log('field: emergency button is red with white text:', em[0] !== em[1] && /rgb\(255, 255, 255\)/.test(em[1]) && !/rgb\(25[0-5], 2[45]\d, 2[34]\d\)/.test(em[0]), em.join(' / '));
await ctx.setOffline(true); await p.waitForTimeout(400);
console.log('offline: says so, and marks the map as needing signal:', (await status.innerText()).includes('אין קליטה') && (await nav.getByText('צריך קליטה').count()) === 1);
await p.screenshot({ path: `${OUT}/field-offline.png`, fullPage: true });
await ctx.setOffline(false); await p.waitForTimeout(300);

// 3. home with no trip
await store(`const t = s.trips.find(t => t.id === '${tid}'); Object.assign(t, { name: 'גולן בסתיו', start: '${iso(-40)}', end: '${iso(-38)}', status: 'done', lessons: 'להביא עוד שמיכה' });
  s.inventory.push({ id: 'g-buy', name: 'גזייה', category: 'kitchen', qty: 1, status: 'buy' });
  s.inventory.push({ id: 'g-chk', name: 'אוהל משפחתי', category: 'tents', qty: 1, status: 'ok', checkEveryMonths: 6 });`);
await p.reload(); await p.waitForTimeout(1500);
const past = p.getByRole('region', { name: 'הטיולים הקודמים שלכם' });
console.log('no trip: past trips with "plan again":', (await past.getByText('גולן בסתיו').count()) === 1 && (await past.getByRole('button', { name: /לתכנן שוב/ }).count()) === 1);
const hi = p.getByRole('region', { name: 'לפני הטיול הבא' });
const hiText = await hi.innerText().catch(() => '');
console.log('no trip: suggestions from own data (gear check, to buy, lessons):', hiText.includes('פריטי ציוד שהגיע זמן לבדוק') && hiText.includes('גזייה') && hiText.includes('להביא עוד שמיכה'));
console.log('no trip: suggestions are labelled rules-based:', hiText.includes('מבוסס כללים — בלי AI'));
await p.screenshot({ path: `${OUT}/home-notrip.png`, fullPage: true });
await past.getByRole('button', { name: /לתכנן שוב/ }).click(); await p.waitForTimeout(800);
const count = await store(`return s.trips.filter(t => t.name.startsWith('גולן בסתיו')).length;`);
console.log('plan again creates a copy and opens it:', count === 2 && p.url().includes('#/trip/'));
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await b.close();
