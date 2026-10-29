// Two separate browser profiles (two "phones") editing one trip through a relay that stands in for Firestore.
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome') });
const store = new Map(); const pages = []; const errors = [];
async function device(label) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL', deviceScaleFactor: 2 });
  await ctx.route(/open-meteo|fonts\.|overpass|osrm|nominatim/, r => r.abort());
  await ctx.exposeBinding('__relayRead', (_s, k) => store.get(k) ?? null);
  await ctx.exposeBinding('__relayWrite', async (_s, k, v) => { if (v == null) store.delete(k); else store.set(k, v); for (const p of pages) p.evaluate(key => window.dispatchEvent(new CustomEvent('campil-relay', { detail: key })), k).catch(() => {}); });
  await ctx.exposeBinding('__relayPatch', async (_s, k, ps) => {
    const d = JSON.parse(store.get(k) ?? 'null'); if (!d) return;
    for (const p of JSON.parse(ps)) { let o = d; for (const x of p.path.slice(0, -1)) o = o[x] ??= {}; const l = p.path.at(-1); if (p.value && p.value.__del) delete o[l]; else o[l] = p.value; }
    store.set(k, JSON.stringify(d)); for (const pg of pages) pg.evaluate(key => window.dispatchEvent(new CustomEvent('campil-relay', { detail: key })), k).catch(() => {});
  });
  if (process.env.LEGACY) await ctx.addInitScript(() => { window.__campilNoFamilies = true; });
  await ctx.addInitScript(() => { window.__campilRelay = { read: k => window.__relayRead(k), write: (k, v) => window.__relayWrite(k, v), patch: (k, p) => window.__relayPatch(k, p) }; });
  const p = await ctx.newPage(); pages.push(p);
  p.on('pageerror', e => errors.push(`${label}: ${e.message}`));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|ERR_/.test(m.text())) errors.push(`${label}: ${m.text()}`); });
  return p;
}
const S = (p, n) => p.screenshot({ path: `${OUT}/${n}.png` });
const A = await device('אבי');
await A.goto(BASE); await A.waitForTimeout(1200);
await A.evaluate(() => { const k = 'campil-v1'; const d = JSON.parse(localStorage.getItem(k)); d.state.settings.cloud = { config: { apiKey: 'demo', projectId: 'local-demo', appId: '1:1:web:1' }, myName: 'אבי' }; localStorage.setItem(k, JSON.stringify(d)); });
await A.goto(BASE + '#/new'); await A.reload(); await A.waitForTimeout(900);
await S(A, '80-wizard-type');
await A.getByRole('button', { name: 'המשך' }).click(); await A.waitForTimeout(500);
await A.getByRole('button', { name: 'בחרו בשבילי' }).click(); await A.waitForTimeout(500);
// step 3: participants & families
await A.getByRole('button', { name: 'יוצאים עם עוד משפחות' }).click(); await A.waitForTimeout(200);
const fam2 = A.locator('section[aria-label="משפחה 2"]');
await fam2.locator('input[placeholder="שם המשפחה"]').fill('משפחת כהן');
const famB = A.locator('section[aria-label="משפחת כהן"]');
await famB.getByRole('button', { name: 'מבוגר/ת' }).click(); await famB.getByRole('button', { name: 'ילד/ה' }).click();
const radios = famB.getByRole('radio', { name: 'זכר' }); await radios.nth(0).click(); await radios.nth(1).click();
await famB.locator('input[aria-label^="שם משתתף"]').nth(0).fill('יוסי');
await A.waitForTimeout(300); await S(A, '81-wizard-families');
await A.getByRole('button', { name: 'המשך' }).click(); await A.waitForTimeout(500);
await A.getByRole('button', { name: 'המשך' }).click(); await A.waitForTimeout(500);
await S(A, '82-wizard-summary');
await A.getByRole('button', { name: 'בנו לי תוכנית' }).click(); await A.waitForTimeout(1500);
const tid = A.url().split('/trip/')[1].split('/')[0];
await A.goto(BASE + `#/trip/${tid}/gear`); await A.waitForTimeout(1000);
await S(A, '83-A-gear');
const countA = await A.locator('input[type=checkbox][aria-label$="ארוז"]').count();
await A.getByRole('button', { name: 'שיתוף הטיול' }).click().catch(async () => { await A.goto(BASE + `#/trip/${tid}`); await A.waitForTimeout(800); await A.getByRole('button', { name: 'שיתוף הטיול' }).click(); });
await A.waitForTimeout(300);
await A.getByRole('button', { name: 'הפעלת עריכה משותפת' }).click(); await A.waitForTimeout(1500);
await S(A, '84-family-links');
const wa = await A.getByRole('link', { name: 'שליחה בוואטסאפ למשפחת כהן' }).getAttribute('href');
const link = decodeURIComponent(wa.split('text=')[1]).match(/https?:\/\/\S+/)[0];
console.log('family link has f= and k=:', link.includes('&f=fam-') && /&k=\w{16}/.test(link));
await A.keyboard.press('Escape');

const B = await device('יוסי');
await B.addInitScript(() => {
  window.__notes = []; window.__hidden = false;
  Object.defineProperty(document, 'visibilityState', { get: () => (window.__hidden ? 'hidden' : 'visible') });
  window.Notification = Object.assign(function () {}, { permission: 'granted', requestPermission: async () => 'granted' });
  Object.defineProperty(navigator, 'serviceWorker', { value: { getRegistration: async () => ({ showNotification: async (t, o) => window.__notes.push({ t, body: o.body }) }), register: async () => ({}) } });
});
await B.goto(link.replace(/^https?:\/\/[^/]+\/[^#]*/, BASE)); await B.waitForTimeout(700);
await S(B, '85-B-join');
await B.fill('#jn', 'יוסי'); await B.getByRole('button', { name: 'הצטרפות לטיול' }).click(); await B.waitForTimeout(1800);
await S(B, '86-B-gear');
const countB = await B.locator('input[type=checkbox][aria-label$="ארוז"]').count();
const bText = await B.locator('main').innerText();
console.log(`items: A(all)=${countA} B=${countB}`);
console.log('B sees own sleeping bags:', bText.includes('שק שינה / שמיכה'));
console.log('B sees shared water:', bText.includes('מים לשתייה'));
console.log('B does NOT see Daniel\'s personal items:', !/אבי ·/.test(bText));
const docs = Object.fromEntries([...store].map(([k, v]) => [k, JSON.parse(v)]));
const mainKey = Object.keys(docs).find(k => !k.includes('/')); const main = docs[mainKey];
const fidB = main.core.families[1].id, fidA = main.core.families[0].id;
const fb = docs[`${mainKey}/families/${fidB}`], fa = docs[`${mainKey}/families/${fidA}`];
const mainItems = Object.values(main.packing);
console.log(process.env.LEGACY ? 'LEGACY mode (old rules):' : 'family documents:', JSON.stringify({ mainItems: mainItems.length, famA: fa ? Object.keys(fa.packing).length : null, famB: fb ? Object.keys(fb.packing).length : null, progress: Object.keys(main.progress ?? {}).length }));
if (!process.env.LEGACY) {
  console.log('trip document holds no family-private item:', mainItems.every(i => !i.familyId && !(main.core.participants.find(p => p.id === i.assignee)?.familyId) && i.source !== 'inventory'));
  const aLocal = await A.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(t => t.shared));
  console.log('organiser device keeps no copy of family B list:', !aLocal.packing.some(p => p.familyId === aLocal.families[1].id || aLocal.participants.find(x => x.id === p.assignee)?.familyId === aLocal.families[1].id));
}
// an old link without a key is refused
const C = await device('ישן');
await C.goto(link.replace(/^https?:\/\/[^/]+\/[^#]*/, BASE).replace(/&k=\w+/, '')); await C.waitForTimeout(600);
await C.fill('#jn', 'ישן'); await C.getByRole('button', { name: 'הצטרפות לטיול' }).click(); await C.waitForTimeout(1200);
console.log('link without key refused:', (await C.getByText('קישור חדש').count()) > 0);
console.log('B has no family switcher:', (await B.getByRole('group', { name: 'איזו משפחה להציג' }).count()) === 0);

// A (organiser, own-family view) ticks one shared + one private item while B is in background
await B.evaluate(() => { window.__hidden = true; });
await A.reload(); await A.waitForTimeout(1200);
await A.getByRole('checkbox', { name: 'מים לשתייה ארוז' }).check();
const privA = A.locator('li', { hasText: 'אבי ·' }).locator('input[type=checkbox]').first();
await privA.check(); await A.waitForTimeout(4000);
console.log('B notifications:', JSON.stringify(await B.evaluate(() => window.__notes)));
// B ticks its own private item → A (organiser of family A) gets no toast for it
await B.evaluate(() => { window.__hidden = false; });
await A.evaluate(() => { const el = document.getElementById('toast'); if (el) el.textContent = ''; });
await B.getByRole('checkbox', { name: 'שק שינה / שמיכה ארוז' }).check(); await B.waitForTimeout(3500);
console.log('A toast about B private item (should be empty):', JSON.stringify(await A.locator('#toast').textContent().catch(() => '')));
// A switches to "all families" view and sees B's tick
const progB = await A.locator('li', { hasText: 'משפחת כהן' }).filter({ has: A.locator('.num') }).innerText().catch(() => '');
console.log('organiser sees family B progress:', /\d+\/\d+/.test(progB), progB.replace(/\s+/g, ' '));
console.log('organiser does not see family B items:', (await A.locator('li', { hasText: 'שק שינה / שמיכה' }).filter({ hasText: '✓ יוסי' }).count()) === 0);
await S(A, '87-A-all-view');

// partial quantities: each family brings part of a shared item; partly packed items
if (!process.env.LEGACY) {
  const openWater = async P => { await P.getByRole('button', { name: 'למה מים לשתייה ברשימה' }).click(); await P.waitForTimeout(400); };
  await openWater(A);
  const qtyW = +(await A.getByRole('dialog').getByText(/מתוך \d+/).first().innerText()).match(/מתוך (\d+)/)[1];
  const mineA = A.getByRole('dialog').getByRole('spinbutton', { name: /^כמה .* מביאים$/ });
  console.log('organiser can edit only own family share:', (await mineA.count()) === 1);
  await mineA.fill('5'); await A.waitForTimeout(300);
  await A.getByRole('dialog').getByRole('spinbutton', { name: 'יחידות ארוזות' }).fill('3'); await A.waitForTimeout(300);
  await A.keyboard.press('Escape'); await A.waitForTimeout(1500);
  await openWater(B);
  await B.getByRole('dialog').getByRole('button', { name: 'את כל השאר' }).click(); await B.waitForTimeout(300);
  await B.keyboard.press('Escape'); await B.waitForTimeout(2000);
  const d2 = JSON.parse(store.get(mainKey)); const w = Object.values(d2.packing).find(i => i.name === 'מים לשתייה');
  const sum = Object.values(w.brings ?? {}).reduce((n, x) => n + x, 0);
  console.log('both family shares stored separately:', JSON.stringify(w.brings), Object.keys(w.brings ?? {}).length === 2 && w.brings[fidA] === 5 && sum === qtyW);
  const rowA = await A.locator('li', { hasText: 'מים לשתייה' }).first().innerText();
  console.log('organiser row shows covered + partial packing:', rowA.includes('מכוסה') && rowA.includes(`ארוזים 3/${qtyW}`));
  console.log('family B sees the shares:', (await B.locator('li', { hasText: 'מים לשתייה' }).first().innerText()).includes('מכוסה'));
  await S(A, '88-A-partial');
}

// responsibility between families: quick split, each family sees its share, "bought" syncs to everyone
if (!process.env.LEGACY) {
  await A.goto(BASE + `#/trip/${tid}/meals`); await A.waitForTimeout(1200);
  const board = A.getByRole('region', { name: 'מי אחראי על מה' });
  console.log('duty board shown with both families:', (await board.locator('tbody tr').count()) === 2);
  await board.getByRole('button', { name: /חלוקה מהירה/ }).click(); await A.waitForTimeout(1500);
  const after = await board.innerText();
  console.log('quick split assigned everything:', after.includes('חולקו בין המשפחות'));
  const bUrl = B.url().replace(/#\/trip\/([^/]+).*/, '#/trip/$1/meals');
  await B.goto(bUrl); await B.waitForTimeout(1500);
  await B.getByRole('button', { name: 'מה שאנחנו קונים' }).click(); await B.waitForTimeout(300);
  const mine = B.getByRole('checkbox', { name: 'נקנה' });
  const n = await mine.count();
  console.log('family B has its own shopping share:', n > 0, n);
  await mine.first().check(); await B.waitForTimeout(2500);
  const rowB = await A.getByRole('region', { name: 'מי אחראי על מה' }).locator('tbody tr', { hasText: 'משפחת כהן' }).innerText();
  console.log('organiser sees family B bought 1:', /\b1\/\d+/.test(rowB), rowB.replace(/\s+/g, ' '));
  const d3 = JSON.parse(store.get(mainKey));
  console.log('duties stored per key:', Object.keys(d3.duties ?? {}).length > 3 && Object.values(d3.duties).some(x => x.done && x.familyId === fidB));
  await S(A, '89-A-duties'); await S(B, '90-B-mine');
}
console.log('errors:', errors.length ? errors.join('\n') : 'none');
await b.close();
