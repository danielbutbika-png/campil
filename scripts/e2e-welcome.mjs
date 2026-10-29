// First launch: sign in with Google (or skip); the Google name replaces "מבוגר/ת 1"; the account photo shows
// the connection state as a ring — green synced, yellow waiting to sync, red no network.
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome') });
const store = new Map(); let slow = 0; const errors = [];
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL', deviceScaleFactor: 2 });
await ctx.route(/open-meteo|fonts\.|overpass|osrm|nominatim|openfreemap|googleusercontent/, r => r.abort());
await ctx.exposeBinding('__relayRead', (_s, k) => store.get(k) ?? null);
await ctx.exposeBinding('__relayWrite', async (_s, k, v) => { if (slow) await new Promise(r => setTimeout(r, slow)); if (v == null) store.delete(k); else store.set(k, v); });
await ctx.exposeBinding('__relayPatch', async (_s, k, ps) => {
  if (slow) await new Promise(r => setTimeout(r, slow));
  const d = JSON.parse(store.get(k) ?? 'null'); if (!d) return;
  for (const p of JSON.parse(ps)) { let o = d; for (const x of p.path.slice(0, -1)) o = o[x] ??= {}; const l = p.path.at(-1); if (p.value && p.value.__del) delete o[l]; else o[l] = p.value; }
  store.set(k, JSON.stringify(d));
});
await ctx.addInitScript(() => {
  window.__campilRelay = { read: k => window.__relayRead(k), write: (k, v) => window.__relayWrite(k, v), patch: (k, p) => window.__relayPatch(k, p) };
  window.__campilWelcome = true; window.__campilFakeGoogle = { name: 'דניאל בוטביקה', email: 'daniel@example.com', photo: 'https://lh3.googleusercontent.com/a/x' };
});
const p = await ctx.newPage(); p.on('pageerror', e => errors.push(e.message));
await p.goto(BASE); await p.waitForTimeout(1000);
console.log('first launch asks to sign in with Google:', (await p.getByRole('dialog', { name: 'ברוכים הבאים ל-CampIL' }).count()) === 1);
await p.screenshot({ path: `${OUT}/welcome.png` });
await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('campil-v1')); d.state.settings.cloud = { config: { apiKey: 'demo', projectId: 'local-demo', appId: '1:1:web:1' }, myName: '' }; localStorage.setItem('campil-v1', JSON.stringify(d)); });
await p.reload(); await p.waitForTimeout(800);
await p.getByRole('button', { name: 'התחברות עם Google' }).click(); await p.waitForTimeout(1500);
console.log('signed in → screen closes:', (await p.getByRole('dialog', { name: 'ברוכים הבאים ל-CampIL' }).count()) === 0);
const hello = await p.locator('header p').first().innerText();
console.log('greeting uses the Google name instead of "מבוגר/ת 1":', hello.includes('דניאל') && !hello.includes('מבוגר'), hello);
const badge = p.locator('header a[data-sync]').first();
console.log('account picture top-left with a green ring (initial when the photo can not load):', (await badge.getAttribute('data-sync')) === 'ok' && ((await badge.locator('img').count()) === 1 || (await badge.innerText()).trim() === 'ד'));
const box = await badge.boundingBox(); console.log('it is on the left side at the top:', box.x < 120 && box.y < 120);
// a shared trip with slow sync → yellow
const tid = await p.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips[0].id);
await p.goto(BASE + `#/trip/${tid}`); await p.waitForTimeout(700);
await p.getByRole('button', { name: 'שיתוף הטיול' }).click(); await p.waitForTimeout(200);
await p.getByRole('button', { name: 'הפעלת עריכה משותפת' }).click(); await p.waitForTimeout(1500); await p.keyboard.press('Escape');
await p.goto(BASE + `#/trip/${tid}/gear`); await p.waitForTimeout(800);
slow = 2500;
await p.locator('input[type=checkbox][aria-label$="ארוז"]').first().check();
await p.goto(BASE + '#/'); await p.waitForTimeout(400);
console.log('changes waiting to sync → yellow ring:', (await p.locator('header a[data-sync]').first().getAttribute('data-sync')) === 'pending');
await p.screenshot({ path: `${OUT}/badge-pending.png`, clip: { x: 0, y: 0, width: 390, height: 120 } });
slow = 0; await p.waitForTimeout(3500);
console.log('synced again → green:', (await p.locator('header a[data-sync]').first().getAttribute('data-sync')) === 'ok');
await ctx.setOffline(true); await p.waitForTimeout(400);
console.log('no network → red ring:', (await p.locator('header a[data-sync]').first().getAttribute('data-sync')) === 'error');
await ctx.setOffline(false);
// with no network the app still opens (the account is remembered on the device)
await ctx.setOffline(true); await p.reload().catch(() => {}); await p.waitForTimeout(1200);
console.log('offline after signing in: the app opens, no sign-in screen:', (await p.getByRole('dialog', { name: 'ברוכים הבאים ל-CampIL' }).count()) === 0);
await ctx.setOffline(false); await p.reload(); await p.waitForTimeout(1000);
// signing out brings the sign-in screen back
await p.goto(BASE + '#/settings'); await p.waitForTimeout(600);
await p.getByRole('button', { name: 'התנתקות' }).click(); await p.waitForTimeout(800);
console.log('after signing out the sign-in screen is back:', (await p.getByRole('dialog', { name: 'ברוכים הבאים ל-CampIL' }).count()) === 1);
// a fresh device: sign-in is required — no way around it; offline it explains that the first sign-in needs a network
const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL' });
await ctx2.addInitScript(() => { window.__campilWelcome = true; });
await ctx2.route(/open-meteo|fonts\.|overpass|osrm|nominatim|openfreemap/, r => r.abort());
const q = await ctx2.newPage(); await q.goto(BASE); await q.waitForTimeout(900);
console.log('required: no "continue without an account":', (await q.getByText('להמשיך בלי חשבון').count()) === 0 && (await q.getByRole('dialog', { name: 'ברוכים הבאים ל-CampIL' }).count()) === 1);
await ctx2.setOffline(true); await q.waitForTimeout(300);
console.log('offline first launch explains it needs a network:', (await q.getByText('ההתחברות הראשונה צריכה רשת').count()) === 1 && await q.getByRole('button', { name: 'התחברות עם Google' }).isDisabled());
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await b.close();
