// Two separate browser profiles (two "phones") editing one trip through a relay that stands in for Firestore.
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
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
const ages = famB.locator('input[type=number]'); await ages.nth(0).fill('41'); await ages.nth(1).fill('2');
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
console.log('family link has f=:', link.includes('&f=fam-'));
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
await A.getByRole('button', { name: 'כל המשפחות' }).click(); await A.waitForTimeout(400);
console.log('A(all) sees B bag packed by יוסי:', (await A.locator('li', { hasText: 'שק שינה / שמיכה' }).filter({ hasText: '✓ יוסי' }).count()) > 0);
await S(A, '87-A-all-view');
console.log('errors:', errors.length ? errors.join('\n') : 'none');
await b.close();
