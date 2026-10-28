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
  await ctx.addInitScript(() => { window.__campilRelay = { read: k => window.__relayRead(k), write: (k, v) => window.__relayWrite(k, v), patch: (k, p) => window.__relayPatch(k, p) }; });
  const p = await ctx.newPage(); pages.push(p);
  p.on('pageerror', e => errors.push(`${label}: ${e.message}`));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|ERR_/.test(m.text())) errors.push(`${label}: ${m.text()}`); });
  return p;
}
// ── Partner-change notifications ──
const A = await device('אבי');
await A.goto(BASE); await A.waitForTimeout(1200);
await A.evaluate(() => { const k = 'campil-v1'; const d = JSON.parse(localStorage.getItem(k)); d.state.settings.cloud = { config: { apiKey: 'demo', projectId: 'local-demo', appId: '1:1:web:1' }, myName: 'אבי' }; localStorage.setItem(k, JSON.stringify(d)); });
await A.reload(); await A.waitForTimeout(800);
const tid = await A.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips[0].id);
await A.goto(BASE + `#/trip/${tid}`); await A.waitForTimeout(800);
await A.getByRole('button', { name: 'שיתוף הטיול' }).click(); await A.waitForTimeout(200);
await A.getByRole('button', { name: 'הפעלת עריכה משותפת' }).click(); await A.waitForTimeout(1200);
const link = await A.locator('input[aria-label="קישור הזמנה"]').inputValue();
await A.screenshot({ path: `${OUT}/70-share-notify.png` });
await A.keyboard.press('Escape');

const B = await device('מיכל');
// B's phone: notifications allowed, app can be "in the background"; capture what would be shown.
await B.addInitScript(() => {
  window.__notes = []; window.__hidden = false;
  Object.defineProperty(document, 'visibilityState', { get: () => (window.__hidden ? 'hidden' : 'visible') });
  window.Notification = Object.assign(function () {}, { permission: 'granted', requestPermission: async () => 'granted' });
  Object.defineProperty(navigator, 'serviceWorker', { value: { getRegistration: async () => ({ showNotification: async (t, o) => window.__notes.push({ t, body: o.body, url: o.data.url }) }), register: async () => ({}) } });
});
await B.goto(link.replace(/^https?:\/\/[^/]+\/[^#]*/, BASE)); await B.waitForTimeout(600);
await B.fill('#jn', 'מיכל'); await B.getByRole('button', { name: 'הצטרפות לטיול' }).click(); await B.waitForTimeout(1500);
await B.evaluate(() => { window.__hidden = true; });

// A packs two items and adds a task while B's app is in the background
await A.goto(BASE + `#/trip/${tid}/gear`); await A.waitForTimeout(1000);
await A.locator('input[type=checkbox][aria-label$="ארוז"]').nth(0).check();
await A.locator('input[type=checkbox][aria-label$="ארוז"]').nth(1).check();
await A.waitForTimeout(4000);
const notes = await B.evaluate(() => window.__notes);
console.log('B got system notifications:', JSON.stringify(notes));
// B's own tick must not notify B; while B is open (visible) a toast appears instead.
await B.evaluate(() => { window.__hidden = false; window.__notes = []; });
await B.locator('input[type=checkbox][aria-label$="ארוז"]').nth(2).check(); await B.waitForTimeout(3500);
console.log('B not notified about own tick:', (await B.evaluate(() => window.__notes.length)) === 0);
const toastA = await A.locator('#toast').textContent().catch(() => '');
console.log('A toast while open:', toastA);
await A.screenshot({ path: `${OUT}/71-toast.png` });
await B.goto(B.url().replace(/#.*/, '#/settings')); await B.waitForTimeout(800);
await B.getByText('התראות על שינויים של שותפים').scrollIntoViewIfNeeded(); await B.screenshot({ path: `${OUT}/72-settings-notify.png` });
console.log('errors:', errors.length ? errors.join('\n') : 'none');
await b.close();
