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
const A = await device('אבי');
await A.goto(BASE); await A.waitForTimeout(1200);
// The build ships the real Firebase config; point this test device at the local stand-in instead.
await A.evaluate(() => { const k = 'campil-v1'; const d = JSON.parse(localStorage.getItem(k)); d.state.settings.cloud = { config: { apiKey: 'demo', projectId: 'local-demo', appId: '1:1:web:1' }, myName: 'אבי' }; localStorage.setItem(k, JSON.stringify(d)); });
await A.goto(BASE + '#/settings'); await A.reload(); await A.waitForTimeout(800);
await A.screenshot({ path: `${OUT}/60-cloud-settings.png` });
const tid = await A.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips[0].id);
await A.goto(BASE + `#/trip/${tid}`); await A.waitForTimeout(800);
await A.getByRole('button', { name: 'שיתוף הטיול' }).click(); await A.waitForTimeout(200);
await A.getByRole('button', { name: 'הפעלת עריכה משותפת' }).click(); await A.waitForTimeout(1200);
const link = await A.locator('input[aria-label="קישור הזמנה"]').inputValue();
console.log('invite link ok:', link.includes('#/join?t='));
await A.screenshot({ path: `${OUT}/61-share-sheet.png` });
await A.keyboard.press('Escape');

const B = await device('מיכל');
await B.goto(link.replace(/^https?:\/\/[^/]+\/[^#]*/, BASE)); await B.waitForTimeout(600);
await B.screenshot({ path: `${OUT}/62-join.png` });
await B.fill('#jn', 'מיכל'); await B.getByRole('button', { name: 'הצטרפות לטיול' }).click(); await B.waitForTimeout(1500);
console.log('B on trip:', B.url().includes('/trip/'), '| items on B:', await B.locator('input[type=checkbox][aria-label$="ארוז"]').count());
// B packs first item → A sees it
const first = B.locator('input[type=checkbox][aria-label$="ארוז"]').first();
const itemName = (await first.getAttribute('aria-label')).replace(/ ארוז$/, '');
await first.check(); await B.waitForTimeout(1500);
await A.goto(BASE + `#/trip/${tid}/gear`); await A.waitForTimeout(1200);
const seenOnA = await A.locator('li', { hasText: '✓ מיכל' }).count();
console.log(`A sees "${itemName}" packed by מיכל:`, seenOnA > 0);
await A.screenshot({ path: `${OUT}/63-A-sees-rachel.png` });
// A completes a task → B sees it live (no reload)
await B.goto(B.url().replace(/\/gear$/, '/tasks')); await B.waitForTimeout(800);
await A.goto(BASE + `#/trip/${tid}/tasks`); await A.waitForTimeout(800);
await A.locator('input[type=checkbox]').first().check(); await A.waitForTimeout(1500);
console.log('B sees task done by אבי (live):', (await B.getByText('✓ אבי').count()) > 0);
// concurrent ticks on different items
await A.goto(BASE + `#/trip/${tid}/gear`); await B.goto(B.url().replace(/\/tasks$/, '/gear')); await A.waitForTimeout(1000); await B.waitForTimeout(1000);
await Promise.all([A.locator('input[type=checkbox][aria-label$="ארוז"]').nth(3).check(), B.locator('input[type=checkbox][aria-label$="ארוז"]').nth(4).check()]);
await A.waitForTimeout(2000);
const packedA = await A.evaluate(id => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(t => t.id === id).packing.filter(p => p.packed).map(p => p.packedBy), tid);
console.log('A packed-by list after concurrent ticks:', JSON.stringify(packedA));
await A.goto(BASE + `#/trip/${tid}`); await A.waitForTimeout(1200);
await A.getByRole('heading', { name: 'מה קורה בטיול' }).scrollIntoViewIfNeeded(); await A.waitForTimeout(300);
await A.screenshot({ path: `${OUT}/64-activity.png` });
// ── closed trip: approvals with Google identity ──
await A.getByRole('button', { name: 'שיתוף הטיול' }).click(); await A.waitForTimeout(300);
await A.getByRole('radio', { name: /רק מי שאישרתי/ }).click(); await A.waitForTimeout(800);
const link2 = await A.locator('input[aria-label="קישור הזמנה"]').inputValue();
console.log('closed link has a=1:', link2.includes('&a=1'));
const C = await device('יוסי');
await C.addInitScript(() => { window.__campilFakeGoogle = { name: 'יוסי כהן', email: 'yossi@example.com' }; });
await C.goto(link2.replace(/^https?:\/\/[^/]+\/[^#]*/, BASE)); await C.waitForTimeout(800);
console.log('C request disabled before Google:', await C.getByRole('button', { name: 'שליחת בקשת הצטרפות' }).isDisabled());
await C.getByRole('button', { name: /התחברות עם Google/ }).click(); await C.waitForTimeout(400);
await C.getByRole('button', { name: 'שליחת בקשת הצטרפות' }).click(); await C.waitForTimeout(800);
console.log('C waiting:', (await C.getByText('הבקשה נשלחה').count()) > 0);
await C.screenshot({ path: `${OUT}/66-waiting.png` });
await A.waitForTimeout(800);
await A.screenshot({ path: `${OUT}/65-pending.png` });
await A.getByRole('button', { name: 'אישור' }).click(); await A.waitForTimeout(600);
await C.waitForTimeout(6500);
console.log('C admitted:', C.url().includes('/trip/'));
// remove Rachel → she loses access
const removeR = A.getByRole('button', { name: 'הסרת מיכל' });
await removeR.click(); await A.waitForTimeout(1500);
const bShared = await B.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips.some(t => t.shared));
console.log('B lost access after removal:', !bShared);
await A.screenshot({ path: `${OUT}/67-members.png` });
console.log('errors:', errors.length ? errors.join('\n') : 'none');
await b.close();
