// Google account across devices: a trip joined on one device appears on another device of the same Google account
// (e.g. the installed app vs. the browser); an organiser who switches to an existing Google id keeps the trip.
import { chromium } from 'playwright-core';
const OUT = process.argv[2]; const BASE = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome') });
const store = new Map(); const pages = []; const errors = [];
const CFG = { apiKey: 'demo', projectId: 'local-demo', appId: '1:1:web:1' };
async function device(label, email) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'he-IL', deviceScaleFactor: 2 });
  await ctx.route(/open-meteo|fonts\.|overpass|osrm|nominatim|openfreemap/, r => r.abort());
  await ctx.exposeBinding('__relayRead', (_s, k) => store.get(k) ?? null);
  await ctx.exposeBinding('__relayWrite', async (_s, k, v) => { if (v == null) store.delete(k); else store.set(k, v); for (const p of pages) p.evaluate(key => window.dispatchEvent(new CustomEvent('campil-relay', { detail: key })), k).catch(() => {}); });
  await ctx.exposeBinding('__relayPatch', async (_s, k, ps) => {
    const d = JSON.parse(store.get(k) ?? 'null'); if (!d) return;
    for (const p of JSON.parse(ps)) { let o = d; for (const x of p.path.slice(0, -1)) o = o[x] ??= {}; const l = p.path.at(-1); if (p.value && p.value.__del) delete o[l]; else o[l] = p.value; }
    store.set(k, JSON.stringify(d)); for (const pg of pages) pg.evaluate(key => window.dispatchEvent(new CustomEvent('campil-relay', { detail: key })), k).catch(() => {});
  });
  await ctx.addInitScript(([e, n]) => { window.__campilRelay = { read: k => window.__relayRead(k), write: (k, v) => window.__relayWrite(k, v), patch: (k, p) => window.__relayPatch(k, p) }; if (e) window.__campilFakeGoogle = { name: n, email: e }; }, [email, label]);
  const p = await ctx.newPage(); pages.push(p);
  p.on('pageerror', e => errors.push(`${label}: ${e.message}`));
  return p;
}
const setCloud = (p, name) => p.evaluate(([c, n]) => { const d = JSON.parse(localStorage.getItem('campil-v1')); d.state.settings.cloud = { config: c, myName: n }; d.state.trips = d.state.trips.filter(t => !t.example); localStorage.setItem('campil-v1', JSON.stringify(d)); }, [CFG, name]);
const googleIn = async p => {
  await p.goto(BASE + '#/settings'); await p.reload(); await p.waitForTimeout(700);
  await p.getByRole('button', { name: 'בדיקת חיבור' }).click(); await p.waitForTimeout(600);
  await p.getByRole('button', { name: 'התחברות עם Google' }).click(); await p.waitForTimeout(1800);
};
const trips = p => p.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips.filter(t => t.shared).map(t => ({ name: t.name, cid: t.shared.cloudId, role: t.shared.role })));

// organiser shares a trip (anonymous)
const A = await device('מארגן', 'org@example.com');
await A.goto(BASE); await A.waitForTimeout(1000);
await A.evaluate(c => { const d = JSON.parse(localStorage.getItem('campil-v1')); d.state.settings.cloud = { config: c, myName: 'מארגן' }; localStorage.setItem('campil-v1', JSON.stringify(d)); }, CFG);
const tid = await A.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips[0].id);
await A.goto(BASE + `#/trip/${tid}`); await A.reload(); await A.waitForTimeout(900);
await A.getByRole('button', { name: 'שיתוף הטיול' }).click(); await A.waitForTimeout(200);
await A.getByRole('button', { name: 'הפעלת עריכה משותפת' }).click(); await A.waitForTimeout(1200);
const link = await A.locator('input[aria-label="קישור הזמנה"]').inputValue();
await A.keyboard.press('Escape');
const cid = (await trips(A))[0].cid;

// Daniel joins in the browser, then signs in with Google there
const S = await device('דניאל-דפדפן', 'daniel@example.com');
await S.goto(link.replace(/^https?:\/\/[^/]+\/[^#]*/, BASE)); await S.waitForTimeout(700);
await S.fill('#jn', 'דניאל'); await S.getByRole('button', { name: 'הצטרפות לטיול' }).click(); await S.waitForTimeout(1500);
await googleIn(S);
console.log('browser: still on the trip after Google sign-in:', (await trips(S)).some(t => t.cid === cid));

// the installed app: fresh storage, same Google account → the trip comes over by itself
const P = await device('דניאל-אפליקציה', 'daniel@example.com');
await P.goto(BASE); await P.waitForTimeout(900); await setCloud(P, 'דניאל');
await googleIn(P);
const pt = await trips(P);
console.log('app: the trip appears after signing in with the same account:', pt.some(t => t.cid === cid), pt.length);
console.log('app: it is a live shared trip (member in the cloud):', JSON.parse(store.get(cid)).members[await P.evaluate(() => sessionStorage.getItem('campil-fake-uid'))] != null);
// an edit on the app reaches the organiser
const ptid = await P.evaluate(c => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(t => t.shared?.cloudId === c).id, cid);
await P.goto(BASE + `#/trip/${ptid}/gear`); await P.waitForTimeout(1200);
const box = P.locator('input[type=checkbox][aria-label$="ארוז"]').first();
const item = (await box.getAttribute('aria-label')).replace(/ ארוז$/, ''); await box.check(); await P.waitForTimeout(1500);
const onA = await A.evaluate(([id, n]) => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(t => t.id === id).packing.find(x => x.name === n)?.packed, [tid, item]);
console.log('app edit reaches the organiser:', onA === true);
// restarting the app keeps it connected to the account (no need to sign in again)
const before = (await trips(P)).length;
await P.evaluate(() => { const d = JSON.parse(localStorage.getItem('campil-v1')); d.state.trips = d.state.trips.filter(t => !t.shared); localStorage.setItem('campil-v1', JSON.stringify(d)); });
await P.goto(BASE); await P.reload(); await P.waitForTimeout(2000);
console.log('app restart: restored from the account automatically:', (await trips(P)).length === before);

// organiser: Google account already used on another device → switching keeps ownership
const O2 = await device('מארגן-טלפון2', 'org@example.com');
await O2.goto(BASE); await O2.waitForTimeout(900); await setCloud(O2, 'מארגן'); await googleIn(O2);
await googleIn(A);
const doc = JSON.parse(store.get(cid)); const aUid = await A.evaluate(() => sessionStorage.getItem('campil-fake-uid'));
console.log('organiser switched id and still owns the trip:', doc.owner === aUid && (await trips(A)).find(t => t.cid === cid)?.role === 'owner');
await O2.goto(BASE + '#/settings'); await O2.waitForTimeout(500);
await O2.getByRole('button', { name: 'טעינת הטיולים שלי' }).click(); await O2.waitForTimeout(1500);
console.log('organiser second phone: "load my trips" brings it:', (await trips(O2)).some(t => t.cid === cid));
// member: signed in to Google in the app first, then joined in the browser as a guest and signs in there
const Q = await device('רחל-אפליקציה', 'rachel@example.com');
await Q.goto(BASE); await Q.waitForTimeout(900); await setCloud(Q, 'רחל'); await googleIn(Q);
const R = await device('רחל-דפדפן', 'rachel@example.com');
await R.goto(link.replace(/^https?:\/\/[^/]+\/[^#]*/, BASE)); await R.waitForTimeout(700);
await R.fill('#jn', 'רחל'); await R.getByRole('button', { name: 'הצטרפות לטיול' }).click(); await R.waitForTimeout(1500);
await googleIn(R);
const rUid = await R.evaluate(() => sessionStorage.getItem('campil-fake-uid'));
console.log('member switched to the existing Google id and kept the trip:', (await trips(R)).some(t => t.cid === cid) && JSON.parse(store.get(cid)).members[rUid] != null);
await Q.goto(BASE + '#/settings'); await Q.waitForTimeout(500);
await Q.getByRole('button', { name: 'טעינת הטיולים שלי' }).click(); await Q.waitForTimeout(1500);
console.log('member: the app gets it with "load my trips":', (await trips(Q)).some(t => t.cid === cid));
await Q.screenshot({ path: `${OUT}/account-restore.png` });
// every trip follows the account — not only shared ones
const Z = await device('דניאל-טאבלט', 'daniel@example.com');
await Z.goto(BASE); await Z.waitForTimeout(900); await setCloud(Z, 'דניאל');
const tpl = await A.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips[0]);
await Z.evaluate(t => { const d = JSON.parse(localStorage.getItem('campil-v1')); d.state.trips = [{ ...t, id: 'private-1', name: 'טיול פרטי שלי', example: false, shared: undefined }]; localStorage.setItem('campil-v1', JSON.stringify(d)); }, tpl);
await googleIn(Z);
const zt = await Z.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(t => t.name === 'טיול פרטי שלי'));
console.log('a private trip is saved to the account on sign-in:', !!zt?.shared && zt.shared.role === 'owner');
await P.goto(BASE + '#/settings'); await P.waitForTimeout(500);
await P.getByRole('button', { name: 'טעינת הטיולים שלי' }).click(); await P.waitForTimeout(1500);
console.log('…and appears on the other device of the same account:', await P.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips.some(t => t.name === 'טיול פרטי שלי')));
const zdoc = JSON.parse(store.get(zt.shared.cloudId));
console.log('it stays private: one member, no key in the shared document:', Object.keys(zdoc.members).length === 1 && !zdoc.invite?.all && !zdoc.invite?.fam);
// a trip created after signing in is saved right away
await Z.goto(BASE + '#/new'); await Z.waitForTimeout(700);
await Z.getByRole('radio', { name: 'טיול יום' }).click();
await Z.getByLabel('שם הטיול (לא חובה)').fill('טיול חדש מהטאבלט');
await Z.getByRole('button', { name: 'המשך' }).click(); await Z.waitForTimeout(500);
await Z.getByRole('button', { name: /^המשך|בחרו בשבילי/ }).click(); await Z.waitForTimeout(500);
for (const g of await Z.getByRole('radiogroup', { name: /^מגדר של/ }).all()) if (!(await g.locator('[aria-checked=true]').count())) await g.getByRole('radio', { name: 'נקבה' }).click();
await Z.getByRole('button', { name: 'המשך' }).click(); await Z.waitForTimeout(500);
await Z.getByRole('button', { name: 'המשך' }).click(); await Z.waitForTimeout(400);
await Z.getByRole('button', { name: 'בנו לי תוכנית' }).click(); await Z.waitForTimeout(2500);
const nt = await Z.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(t => t.name === 'טיול חדש מהטאבלט'));
console.log('a new trip is saved to the account right away:', !!nt?.shared);
await P.goto(BASE + '#/settings'); await P.waitForTimeout(500);
await P.getByRole('button', { name: 'טעינת הטיולים שלי' }).click(); await P.waitForTimeout(1500);
console.log('…and reaches the other device:', await P.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips.some(t => t.name === 'טיול חדש מהטאבלט')));
// deleting a trip only I have removes it from the account too
const zpid = await Z.evaluate(() => JSON.parse(localStorage.getItem('campil-v1')).state.trips.find(t => t.name === 'טיול פרטי שלי').id);
await Z.goto(BASE + `#/trip/${zpid}`); await Z.waitForTimeout(800);
await Z.getByRole('button', { name: /מחיקת הטיול|מחיקה/ }).first().click(); await Z.waitForTimeout(300);
await Z.getByRole('dialog').getByRole('button', { name: 'מחיקה', exact: true }).click(); await Z.waitForTimeout(1200);
console.log('deleting my own saved trip removes it from the account:', !store.has(zt.shared.cloudId));
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await b.close();
