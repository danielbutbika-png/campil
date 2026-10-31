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
const IMG = process.argv[3] || new URL('../tests/fixtures', import.meta.url).pathname;
const S = (p, n) => p.screenshot({ path: `${OUT}/${n}.png` });
const A = await device('אבי');
await A.goto(BASE); await A.waitForTimeout(1200);
await A.evaluate(() => { const k = 'campil-v1'; const d = JSON.parse(localStorage.getItem(k)); d.state.settings.cloud = { config: { apiKey: 'demo', projectId: 'local-demo', appId: '1:1:web:1' }, myName: 'אבי' }; localStorage.setItem(k, JSON.stringify(d)); });
await A.reload(); await A.waitForTimeout(800);
const tid = await A.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips[0].id);
await A.goto(BASE + `#/trip/${tid}`); await A.waitForTimeout(800);
await A.getByRole('button', { name: 'שיתוף הטיול' }).click(); await A.waitForTimeout(200);
await A.getByRole('button', { name: 'הפעלת עריכה משותפת' }).click(); await A.waitForTimeout(1200);
const link = await A.locator('input[aria-label="קישור הזמנה"]').inputValue();
await A.keyboard.press('Escape');
const B = await device('מיכל');
await B.addInitScript(() => {
  window.__notes = []; window.__hidden = false;
  Object.defineProperty(document, 'visibilityState', { get: () => (window.__hidden ? 'hidden' : 'visible') });
  window.Notification = Object.assign(function () {}, { permission: 'granted', requestPermission: async () => 'granted' });
  Object.defineProperty(navigator, 'serviceWorker', { value: { getRegistration: async () => ({ showNotification: async (t, o) => window.__notes.push({ t, body: o.body }) }), register: async () => ({}) } });
});
await B.goto(link.replace(/^https?:\/\/[^/]+\/[^#]*/, BASE)); await B.waitForTimeout(600);
await B.fill('#jn', 'מיכל'); await B.getByRole('button', { name: 'הצטרפות לטיול' }).click(); await B.waitForTimeout(1500);
const btid = B.url().split('/trip/')[1].split('/')[0];
await B.goto(BASE + `#/trip/${btid}/album`); await B.waitForTimeout(800);
await B.evaluate(() => { window.__hidden = true; });

// A uploads 4 photos, B adds 2
await A.goto(BASE + `#/trip/${tid}/album`); await A.waitForTimeout(800);
await S(A, 'a0-empty');
await A.setInputFiles('#album-add', [1, 2, 3, 4].map(i => `${IMG}/p${i}.jpg`)); await A.waitForTimeout(9000);
console.log('A photos:', await A.locator('button[aria-label^="תמונה של"]').count());
console.log('B notified:', JSON.stringify(await B.evaluate(() => window.__notes)));
await B.evaluate(() => { window.__hidden = false; });
console.log('B sees photos:', await B.locator('button[aria-label^="תמונה של"]').count());
await B.setInputFiles('#album-add', [5, 6].map(i => `${IMG}/p${i}.jpg`)); await B.waitForTimeout(4000);
console.log('A sees all photos:', await A.locator('button[aria-label^="תמונה של"]').count());
const daysA = await A.locator('main h3').allInnerTexts(); console.log('grouped by day:', JSON.stringify(daysA.filter(x => x.includes('יום') || x.includes('לפני'))));
await S(A, 'a1-album');
// caption by B appears for A
await B.locator('button[aria-label^="תמונה של מיכל"]').first().click(); await B.waitForTimeout(300);
await B.fill('#pcap', 'שקיעה במכתש'); await B.getByRole('button', { name: 'שמירה', exact: true }).click(); await B.waitForTimeout(1500); await B.keyboard.press('Escape');
console.log('A sees caption:', (await A.locator('button[aria-label$="שקיעה במכתש"]').count()) > 0);
// trip ends → each device can make its own collage/video; nothing is uploaded
await B.evaluate(() => { window.__hidden = true; window.__notes = []; });
for (const [k, v] of store) if (!k.includes('/')) { const d = JSON.parse(v); d.core.start = '2026-10-20'; d.core.end = '2026-10-22'; store.set(k, JSON.stringify(d)); for (const pg of pages) await pg.evaluate(key => window.dispatchEvent(new CustomEvent('campil-relay', { detail: key })), k); }
await A.waitForTimeout(6000);
await A.waitForTimeout(500);
console.log('A sees end-of-trip card:', (await A.getByText('הטיול הסתיים — זמן לסיכום').count()) > 0);
await A.getByRole('button', { name: 'יצירת קולאז׳' }).click(); await A.waitForTimeout(2500); await S(A, 'a2-collage');
const [dl1] = await Promise.all([A.waitForEvent('download'), A.getByRole('button', { name: 'הורדה למכשיר' }).click()]);
console.log('collage downloaded:', dl1.suggestedFilename(), (await dl1.path()) ? 'ok' : 'missing');
await A.keyboard.press('Escape'); await A.waitForTimeout(1500);
const cloudPhotos = [...store].filter(([k]) => k.endsWith('/journal')).flatMap(([, v]) => Object.values(JSON.parse(v)));
console.log('nothing but photos in the cloud (no collage):', cloudPhotos.length === 6 && cloudPhotos.every(d => !d.collage));
console.log('B has no collage:', (await B.getByRole('heading', { name: 'קולאז׳ הטיול' }).count()) === 0);
// video (short)
await A.getByRole('button', { name: 'יצירת סרטון הטיול' }).click(); await A.waitForTimeout(400);
await A.getByRole('button', { name: 'מהיר' }).click(); await A.getByRole('button', { name: 'עד 20' }).click();
await S(A, 'a3-video-opts');
console.log('music: original (composed on device) is the default, with 4 moods and a preview:', (await A.getByRole('radio', { name: 'מוזיקה מקורית' }).getAttribute('aria-checked')) === 'true' && (await A.getByRole('radiogroup', { name: 'סגנון המוזיקה' }).getByRole('radio').count()) === 4 && (await A.getByRole('button', { name: /השמעה/ }).count()) === 1);
await A.getByRole('radio', { name: /שמח/ }).click();
await A.getByRole('button', { name: /יצירת הסרטון/ }).click(); await A.waitForTimeout(6000); await S(A, 'a4-video-progress');
await A.waitForSelector('video', { timeout: 40000 });
const v = await A.evaluate(async () => { const el = document.querySelector('video'); await new Promise(r => { if (el.readyState >= 1) r(); else el.onloadedmetadata = r; }); return { w: el.videoWidth, h: el.videoHeight, size: (await (await fetch(el.src)).blob()).size }; });
console.log('video:', JSON.stringify(v));
const snd = await A.evaluate(async () => { try { const el = document.querySelector('video'); const buf = await new AudioContext().decodeAudioData(await (await fetch(el.src)).arrayBuffer()); const d = buf.getChannelData(0); let sum = 0, peak = 0; for (let i = 0; i < d.length; i += 4) { sum += d[i] * d[i]; peak = Math.max(peak, Math.abs(d[i])); } return { rms: Math.sqrt(sum / (d.length / 4)), peak, sec: buf.duration }; } catch (e) { return { err: String(e) }; } });
console.log('video has the music track — audible, not clipping:', !snd.err && snd.rms > 0.02 && snd.peak <= 1, JSON.stringify(snd));
const [dl2] = await Promise.all([A.waitForEvent('download'), A.getByRole('button', { name: 'הורדה למכשיר' }).click()]);
console.log('video downloaded:', dl2.suggestedFilename());
const cloudAfter = [...store].filter(([k]) => k.endsWith('/journal')).flatMap(([, v]) => Object.values(JSON.parse(v)));
console.log('cloud still has only the 6 photos:', cloudAfter.length === 6);
await A.waitForTimeout(500); await S(A, 'a5-video-done');
const frame = await A.evaluate(async () => { const el = document.querySelector('video'); el.currentTime = 6; await new Promise(r => (el.onseeked = r)); return true; }); await A.waitForTimeout(500);
await A.locator('video').screenshot({ path: `${OUT}/a6-video-frame.png` });
console.log('errors:', errors.length ? errors.join('\n') : 'none');
await b.close();
