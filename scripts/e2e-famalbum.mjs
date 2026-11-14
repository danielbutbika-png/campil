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
const IMG = new URL('../tests/fixtures', import.meta.url).pathname;
const photos = p => p.locator('button[aria-label^="תמונה של"]');
// A: organiser, family 1 · B and B2: family "כהן"
const A = await device('אבי');
await A.goto(BASE); await A.waitForTimeout(1200);
await A.evaluate(() => { const k = 'campil-v1'; const d = JSON.parse(localStorage.getItem(k)); d.state.settings.cloud = { config: { apiKey: 'demo', projectId: 'local-demo', appId: '1:1:web:1' }, myName: 'אבי' }; localStorage.setItem(k, JSON.stringify(d)); });
await A.goto(BASE + '#/new'); await A.reload(); await A.waitForTimeout(900);
await A.getByRole('button', { name: 'המשך' }).click(); await A.waitForTimeout(400);
await A.getByRole('button', { name: 'בחרו בשבילי' }).click(); await A.waitForTimeout(400);
await A.getByRole('button', { name: 'יוצאים עם עוד משפחות' }).click(); await A.waitForTimeout(200);
await A.locator('section[aria-label="משפחה 2"] input[placeholder="שם המשפחה"]').fill('משפחת כהן');
const famB = A.locator('section[aria-label="משפחת כהן"]');
await famB.getByRole('button', { name: 'מבוגר/ת', exact: true }).click(); await famB.getByRole('button', { name: 'מבוגר/ת', exact: true }).click();
const g = famB.getByRole('radio', { name: 'זכר' }); await g.nth(0).click(); await g.nth(1).click();
await famB.locator('input[aria-label^="שם משתתף"]').nth(0).fill('יוסי'); await famB.locator('input[aria-label^="שם משתתף"]').nth(1).fill('רונית');
await A.getByRole('button', { name: 'המשך' }).click(); await A.waitForTimeout(400);
await A.getByRole('button', { name: 'המשך' }).click(); await A.waitForTimeout(400);
await S(A, 'fa0-wizard'); await A.getByRole('button', { name: 'בנו לי תוכנית' }).click(); await A.waitForTimeout(1500);
const tid = A.url().split('/trip/')[1].split('/')[0];
await A.goto(BASE + `#/trip/${tid}`); await A.waitForTimeout(800);
await A.getByRole('button', { name: 'שיתוף הטיול' }).click(); await A.waitForTimeout(300);
await A.getByRole('button', { name: 'הפעלת עריכה משותפת' }).click(); await A.waitForTimeout(1500);
const wa = await A.getByRole('link', { name: 'שליחה בוואטסאפ למשפחת כהן' }).getAttribute('href');
const link = decodeURIComponent(wa.split('text=')[1]).match(/https?:\/\/\S+/)[0];
await A.keyboard.press('Escape');
async function join(name) {
  const p = await device(name);
  await p.goto(link.replace(/^https?:\/\/[^/]+\/[^#]*/, BASE)); await p.waitForTimeout(700);
  await p.fill('#jn', name); await p.getByRole('button', { name: 'הצטרפות לטיול' }).click(); await p.waitForTimeout(1800);
  const id = p.url().split('/trip/')[1].split('/')[0]; await p.goto(BASE + `#/trip/${id}/album`); await p.waitForTimeout(900); return p;
}
const B = await join('יוסי'); const B2 = await join('רונית');
await A.goto(BASE + `#/trip/${tid}/album`); await A.waitForTimeout(900);

// B adds 2 photos to the family album
await B.getByRole('button', { name: 'הוספת תמונות' }).click(); await B.waitForTimeout(300);
await S(B, 'fa1-choose');
console.log('asked where to upload (group / family):', (await B.getByRole('heading', { name: 'לאיזה אלבום להעלות?' }).count()) > 0 && (await B.getByText('אלבום משפחתי — משפחת כהן').count()) > 0);
const [fc] = await Promise.all([B.waitForEvent('filechooser'), B.getByText('אלבום משפחתי — משפחת כהן').click()]);
await fc.setFiles([1, 2].map(i => `${IMG}/p${i}.jpg`)); await B.waitForTimeout(5000);
// A adds 1 photo to the group album
await A.getByRole('button', { name: 'הוספת תמונות' }).click(); await A.waitForTimeout(300);
const [fa] = await Promise.all([A.waitForEvent('filechooser'), A.getByText('אלבום קבוצתי', { exact: true }).click()]);
await fa.setFiles([`${IMG}/p3.jpg`]); await A.waitForTimeout(5000);
const n = async p => photos(p).count();
console.log(`photos — B: ${await n(B)}, B2 (same family): ${await n(B2)}, A (other family): ${await n(A)}`);
console.log('B and B2 see the family photos + the group photo:', (await n(B)) === 3 && (await n(B2)) === 3);
console.log('A (organiser, other family) sees only the group photo:', (await n(A)) === 1);
const journal = [...store].filter(([k]) => k.endsWith('/journal')).flatMap(([, v]) => Object.values(JSON.parse(v)));
const famKeys = [...store.keys()].filter(k => /\/families\/[^/]+\/photos$/.test(k));
console.log('family photos are stored only under the family:', journal.length === 1 && famKeys.length === 1 && Object.keys(JSON.parse(store.get(famKeys[0]))).length === 2);
await B.getByRole('radio', { name: /משפחת כהן/ }).click(); await B.waitForTimeout(300);
console.log('family filter shows 2:', (await n(B)) === 2);
await S(B, 'fa2-family-view');
// B moves one photo to the group album → A sees it
await photos(B).first().click(); await B.waitForTimeout(300);
await B.getByRole('button', { name: 'העברה לאלבום הקבוצתי' }).click(); await B.waitForTimeout(4000); await B.keyboard.press('Escape');
console.log('after moving one: A sees 2, B2 sees 3:', (await n(A)) === 2 && (await n(B2)) === 3);
const journal2 = [...store].filter(([k]) => k.endsWith('/journal')).flatMap(([, v]) => Object.values(JSON.parse(v)));
console.log('moved photo left the family album:', journal2.length === 2 && Object.keys(JSON.parse(store.get(famKeys[0]))).length === 1);
await S(A, 'fa3-A-group');
console.log('errors:', errors.length ? errors.join('\n') : 'none');
await b.close();
