// Keeps shared trips in the local store and the cloud document in step, in both directions.
import { create } from 'zustand';
import { useStore } from '../store';
import type { Trip, JournalEntry, AlbumPhoto } from '../types';
import { connect, type Transport, type JournalDoc, type PhotoDoc, type Account } from './transport';
import { diffTrip, fromDoc, toDoc, randomId, PALETTE, encodeInvite, DELETE, type Member, type Pending, type Access, type TripDoc } from './model';
import { compressImage, getPhoto, putPhoto, blobToDataURL, dataURLToBlob } from '../photos';
import { toast } from '../../components/ui';
import { describeChanges, summarize, showSystem, type Change } from './notify';
import { concernsMe, isGroup } from '../families';

export interface TripMeta { owner: string; access: Access; pending: Record<string, Pending> }
interface CloudState { status: 'off' | 'connecting' | 'on' | 'error'; error?: string; uid?: string; account?: Account; members: Record<string, Record<string, Member>>; meta: Record<string, TripMeta> }
export const useCloud = create<CloudState>(() => ({ status: 'off', members: {}, meta: {} }));

let tp: Transport | null = null; let tpKey = '';
const watchers = new Map<string, () => void>();
const last = new Map<string, Trip>();
const lastJ = new Map<string, string>();
const lastP = new Map<string, string>(); // album photo id → synced metadata
let started = false;
const primed = new Set<string>();          // first snapshot of a trip/journal is a load, not a change
const queue = new Map<string, Change[]>(); let qTimer: ReturnType<typeof setTimeout> | undefined;

/** Collect partners' changes for a moment, then announce them once per trip. */
function announce(cid: string, changes: Change[]) {
  const me = myName();
  const mine = changes.filter(c => c.by !== me);
  if (!mine.length || useStore.getState().settings.notify === false) return;
  queue.set(cid, [...(queue.get(cid) ?? []), ...mine]);
  clearTimeout(qTimer); qTimer = setTimeout(flush, 2500);
}
/** "דנה הוסיף/ה תמונה" ×3 → "דנה הוסיף/ה 3 תמונות לאלבום" */
function mergePhotoAdds(ch: Change[]): Change[] {
  const n = new Map<string, number>(), out: Change[] = [];
  for (const c of ch) { const m = c.text.match(/^הוסיף\/ה (?:(\d+) תמונות|תמונה) לאלבום$/); if (m) n.set(c.by ?? '', (n.get(c.by ?? '') ?? 0) + (m[1] ? +m[1] : 1)); else out.push(c); }
  for (const [by, k] of n) out.push({ by: by || null, text: k === 1 ? 'הוסיף/ה תמונה לאלבום' : `הוסיף/ה ${k} תמונות לאלבום` });
  return out;
}
function flush() {
  for (const [cid, raw] of queue) {
    const ch = mergePhotoAdds(raw);
    const t = tripByCloud(cid); const s = summarize(ch); if (!t || !s) continue;
    if (document.visibilityState === 'visible') toast(`${s.title} ${s.body.split('\n')[0]}${ch.length > 1 ? ` (+${ch.length - 1})` : ''}`);
    else if ('Notification' in window && Notification.permission === 'granted') showSystem(`${t.name} · ${s.title}`, s.body, { tag: cid, url: `./#/trip/${t.id}/${ch.every(c => /אלבום|קולאז/.test(c.text)) ? 'album' : 'overview'}` }).catch(() => {});
  }
  queue.clear();
}

export async function transport(): Promise<Transport> {
  const cfg = useStore.getState().settings.cloud?.config;
  if (!cfg) throw new Error('שיתוף בזמן אמת עוד לא הוגדר');
  const key = JSON.stringify(cfg);
  if (tp && tpKey === key) return tp;
  useCloud.setState({ status: 'connecting', error: undefined });
  try { tp = await connect(cfg); tpKey = key; useCloud.setState({ status: 'on', uid: tp.uid, account: tp.account() }); return tp; }
  catch (e: any) { useCloud.setState({ status: 'error', error: e?.message ?? String(e) }); throw new Error('החיבור ל-Firebase נכשל. בדקו את פרטי ההגדרה ושהופעלו Anonymous Auth ו-Firestore.'); }
}

const myName = () => useStore.getState().settings.cloud?.myName || tp?.account().name || 'משתתף';
/** My member record: Google identity (verified) when signed in, otherwise the typed name. */
function selfMember(role: Member['role'], color: string, prev?: Member): Member {
  const a = tp!.account();
  return { ...(prev ?? {}), name: myName(), color: prev?.color ?? color, role: prev?.role ?? role, joinedAt: prev?.joinedAt ?? Date.now(), lastSeen: Date.now(),
    ...(a.provider === 'google' ? { verified: true, email: a.email, photo: a.photo } : { verified: false }) } as Member;
}
function lostAccess(cid: string, msg: string) {
  const local = tripByCloud(cid); if (!local) return;
  useStore.getState().updateTrip(local.id, { shared: undefined }); stop(cid); toast(msg.replace('%', local.name));
}
const tripByCloud = (cid: string) => useStore.getState().trips.find(t => t.shared?.cloudId === cid);

function watch(cid: string) {
  if (watchers.has(cid) || !tp) return;
  const t = tp;
  const offTrip = t.watchTrip(cid, doc => {
    const local = tripByCloud(cid); if (!local) return;
    if (!doc) { lostAccess(cid, 'השיתוף של "%" הסתיים'); return; }
    const mine = doc.members?.[t.uid];
    if (!mine) {
      if ((doc.access ?? 'link') === 'approved' && doc.owner !== t.uid) { lostAccess(cid, 'הגישה שלך ל"%" הוסרה על ידי המארגן'); return; }
      t.patch(cid, [{ path: ['members', t.uid], value: selfMember('editor', PALETTE[Object.keys(doc.members ?? {}).length % PALETTE.length]) }]).catch(() => {});
    }
    useCloud.setState(s => ({ members: { ...s.members, [cid]: doc.members ?? {} }, meta: { ...s.meta, [cid]: { owner: doc.owner, access: doc.access ?? 'link', pending: doc.pending ?? {} } } }));
    let next = fromDoc(doc, local);
    // the organiser may move me to another family
    if (mine?.familyId && next.shared && next.shared.familyId !== mine.familyId) next = { ...next, shared: { ...next.shared, familyId: mine.familyId } };
    if (primed.has(cid)) {
      const ed = doc.editedBy;
      const editor = ed && ed.uid !== t.uid ? ed.name : null;
      announce(cid, describeChanges(local, next, editor, p => concernsMe(next, p)).filter(c => !(ed?.uid === t.uid && c.by === null)));
    } else primed.add(cid);
    last.set(cid, next);
    if (JSON.stringify(local) !== JSON.stringify(next)) useStore.setState(s => ({ trips: s.trips.map(x => (x.id === local.id ? next : x)) }));
  }, (e: any) => { if (e?.code === 'permission-denied') lostAccess(cid, 'הגישה שלך ל"%" הוסרה'); else useCloud.setState({ status: 'error', error: e.message }); });
  const offJ = t.watchJournal(cid, async list => {
    const local = tripByCloud(cid); if (!local) return;
    const st = useStore.getState();
    const jk = 'j:' + cid, first = !primed.has(jk); primed.add(jk);
    // album photos
    const photos = list.filter((r): r is PhotoDoc => r.kind === 'photo');
    const fresh = photos.filter(r => !lastP.has(r.id) && !st.album.some(p => p.id === r.id));
    const incoming: AlbumPhoto[] = [];
    for (const r of photos) {
      const meta: AlbumPhoto = { id: r.id, tripId: local.id, by: r.by, byUid: r.byUid, takenAt: r.takenAt, addedAt: r.addedAt, caption: r.caption, w: r.w, h: r.h, collage: r.collage };
      if (!(await getPhoto(r.id).catch(() => null))) await putPhoto(r.id, await dataURLToBlob(r.data));
      lastP.set(r.id, metaKey(meta));
      const cur = st.album.find(p => p.id === r.id);
      if (!cur || metaKey(cur) !== metaKey(meta)) incoming.push(meta);
    }
    if (incoming.length) st.upsertPhotos(incoming);
    if (!first && fresh.length) {
      const coll = fresh.find(r => r.collage);
      const byWho = new Map<string, number>(); for (const r of fresh.filter(r => !r.collage)) byWho.set(r.by, (byWho.get(r.by) ?? 0) + 1);
      announce(cid, [...(coll ? [{ by: coll.by, text: 'הכין/ה את קולאז׳ הטיול — הוא באלבום' }] : []), ...[...byWho].map(([by, n]) => ({ by, text: n === 1 ? 'הוסיף/ה תמונה לאלבום' : `הוסיף/ה ${n} תמונות לאלבום` }))]);
    }
    const photoIds = new Set(photos.map(r => r.id));
    for (const p of useStore.getState().album) if (p.tripId === local.id && lastP.has(p.id) && !photoIds.has(p.id)) { lastP.delete(p.id); st.removePhoto(p.id); }
    for (const r of list) {
      if (r.kind === 'photo') continue;
      if (!first && !lastJ.has(r.id) && !st.journal.some(j => j.id === r.id)) announce(cid, [{ by: r.author ?? null, text: `הוסיף/ה ליומן: ${r.title || 'רשומה חדשה'}` }]);
      for (const [pid, url] of Object.entries(r.photos ?? {})) if (!(await getPhoto(pid).catch(() => null))) await putPhoto(pid, await dataURLToBlob(url));
      const e: JournalEntry = { id: r.id, tripId: local.id, createdAt: r.createdAt, date: r.date, title: r.title, text: r.text, loc: r.loc, author: r.author, photoIds: Object.keys(r.photos ?? {}) };
      lastJ.set(e.id, JSON.stringify(e));
      const cur = st.journal.find(j => j.id === e.id);
      if (!cur || JSON.stringify(cur) !== JSON.stringify(e)) st.upsertEntry(e);
    }
    const ids = new Set(list.filter(r => r.kind !== 'photo').map(r => r.id));
    for (const j of useStore.getState().journal) if (j.tripId === local.id && lastJ.has(j.id) && !ids.has(j.id)) { lastJ.delete(j.id); st.removeEntry(j.id); }
  });
  watchers.set(cid, () => { offTrip(); offJ(); });
}
function stop(cid: string) { watchers.get(cid)?.(); watchers.delete(cid); last.delete(cid); primed.delete(cid); primed.delete('j:' + cid); }

const metaKey = (p: AlbumPhoto) => JSON.stringify([p.by, p.takenAt, p.caption ?? '', p.collage ?? false]);
async function pushPhoto(p: AlbumPhoto, cid: string) {
  const b = await getPhoto(p.id); if (!b) return;
  await tp!.putEntry(cid, JSON.parse(JSON.stringify({ id: p.id, kind: 'photo', by: p.by, byUid: p.byUid, takenAt: p.takenAt, addedAt: p.addedAt, caption: p.caption, w: p.w, h: p.h, collage: p.collage, data: await blobToDataURL(b) })));
}

async function pushJournal(e: JournalEntry, cid: string) {
  const photos: Record<string, string> = {};
  for (const id of e.photoIds.slice(0, 4)) { const b = await getPhoto(id).catch(() => undefined); if (b) photos[id] = await blobToDataURL(await compressImage(b as File, 900, 0.7)); }
  await tp!.putEntry(cid, { id: e.id, author: e.author ?? myName(), createdAt: e.createdAt, date: e.date, title: e.title, text: e.text, loc: e.loc ?? null, photos });
}

/** Start syncing every shared trip. Safe to call repeatedly. */
export async function startSync() {
  const shared = useStore.getState().trips.filter(t => t.shared);
  if (!useStore.getState().settings.cloud || !shared.length) return;
  try { await transport(); } catch { return; }
  for (const t of shared) watch(t.shared!.cloudId);
  if (started) return; started = true;
  useStore.subscribe((s, prev) => {
    if (!tp) return;
    for (const t of s.trips) {
      if (!t.shared) continue;
      const cid = t.shared.cloudId;
      if (!watchers.has(cid)) watch(cid);
      const base = last.get(cid); if (!base || base === t) continue;
      const patches = diffTrip(base, t);
      last.set(cid, t);
      if (patches.length) patches.push({ path: ['editedBy'], value: { uid: tp.uid, name: myName(), at: Date.now() } });
      if (patches.length) tp.patch(cid, patches).catch(err => { useCloud.setState({ status: 'error', error: err.message }); toast('השינוי נשמר במכשיר ויסונכרן כשהחיבור יחזור'); });
    }
    for (const cid of [...watchers.keys()]) if (!s.trips.some(t => t.shared?.cloudId === cid)) stop(cid);
    if (s.journal !== prev.journal) {
      for (const e of s.journal) {
        const t = s.trips.find(x => x.id === e.tripId); if (!t?.shared) continue;
        const j = JSON.stringify(e); if (lastJ.get(e.id) === j) continue;
        lastJ.set(e.id, j); pushJournal(e, t.shared.cloudId).catch(() => toast('הרשומה לא סונכרנה'));
      }
      for (const e of prev.journal) if (!s.journal.some(x => x.id === e.id)) { const t = s.trips.find(x => x.id === e.tripId); if (t?.shared && lastJ.has(e.id)) { lastJ.delete(e.id); tp.deleteEntry(t.shared.cloudId, e.id).catch(() => {}); } }
    }
    if (s.album !== prev.album) {
      for (const p of s.album) {
        const t = s.trips.find(x => x.id === p.tripId); if (!t?.shared) continue;
        const k = metaKey(p); if (lastP.get(p.id) === k) continue;
        lastP.set(p.id, k); pushPhoto(p, t.shared.cloudId).catch(() => { lastP.delete(p.id); toast('תמונה לא סונכרנה — ננסה שוב'); });
      }
      for (const p of prev.album) if (!s.album.some(x => x.id === p.id)) { const t = s.trips.find(x => x.id === p.tripId); if (t?.shared && lastP.has(p.id)) { lastP.delete(p.id); tp.deleteEntry(t.shared.cloudId, p.id).catch(() => {}); } }
    }
  });
  const beat = () => { if (document.visibilityState !== 'visible' || !tp) return; for (const cid of watchers.keys()) tp.patch(cid, [{ path: ['members', tp.uid, 'lastSeen'], value: Date.now() }]).catch(() => {}); };
  setInterval(beat, 60_000); document.addEventListener('visibilitychange', beat); beat();
}

/** Turn a local trip into a shared one; returns the invite link. */
export async function shareTrip(tripId: string): Promise<string> {
  const t = await transport();
  const st = useStore.getState(); const trip = st.trips.find(x => x.id === tripId)!;
  if (trip.shared) return inviteLink(trip.shared.cloudId);
  const cid = randomId();
  const fam = isGroup(trip) ? trip.families![0].id : undefined;
  const me = { ...selfMember('owner', PALETTE[0]), ...(fam ? { familyId: fam } : {}) };
  await t.createTrip(cid, toDoc({ ...trip, example: false }, t.uid, me));
  last.set(cid, trip);
  st.updateTrip(tripId, { shared: { cloudId: cid, role: 'owner', joinedAt: new Date().toISOString(), ...(fam ? { familyId: fam } : {}) }, example: false });
  for (const e of st.journal.filter(j => j.tripId === tripId)) { lastJ.set(e.id, JSON.stringify(e)); await pushJournal(e, cid); }
  for (const p of st.album.filter(x => x.tripId === tripId)) { lastP.set(p.id, metaKey(p)); await pushPhoto(p, cid).catch(() => lastP.delete(p.id)); }
  await startSync(); watch(cid);
  return inviteLink(cid);
}

/** Invite link; with a family, whoever opens it joins that family. */
export function inviteLink(cid: string, family?: { id: string; name: string }) {
  const cfg = useStore.getState().settings.cloud!.config;
  const approved = useCloud.getState().meta[cid]?.access === 'approved';
  const f = family ? `&f=${encodeURIComponent(family.id)}&fn=${encodeURIComponent(family.name)}` : '';
  return `${location.origin}${location.pathname}#/join?t=${cid}${approved ? '&a=1' : ''}${f}&c=${encodeInvite(cfg)}`;
}
/** Organiser: move a partner to another family. */
export async function setMemberFamily(cid: string, uid: string, familyId: string) { const t = await transport(); await t.patch(cid, [{ path: ['members', uid, 'familyId'], value: familyId }]); }

function addLocal(cid: string, doc: TripDoc, me: Member) {
  const st = useStore.getState();
  const id = 'trip-' + cid.slice(0, 10);
  const trip = fromDoc({ ...doc, members: { ...doc.members, [tp!.uid]: me } }, { id, shared: { cloudId: cid, role: me.role, joinedAt: new Date().toISOString(), ...(me.familyId ? { familyId: me.familyId } : {}) } } as Trip);
  st.addTrip({ ...trip, id });
  last.set(cid, useStore.getState().trips.find(x => x.id === id)!);
  return id;
}

/** Join through an invite. Open trips: immediate. Approved-only trips: leaves a request and returns null. */
export async function joinTrip(cid: string, config: Record<string, string>, name: string, approvedOnly = false, familyId?: string): Promise<string | null> {
  const st = useStore.getState();
  st.setSettings({ cloud: { config, myName: name } });
  const existing = tripByCloud(cid); if (existing) { await startSync(); return existing.id; }
  const t = await transport();
  if (approvedOnly) {
    if (t.account().provider !== 'google') throw new Error('הטיול הזה פתוח רק למשתתפים מאושרים — התחברו עם Google כדי לבקש הצטרפות');
    const a = t.account();
    await t.patch(cid, [{ path: ['pending', t.uid], value: JSON.parse(JSON.stringify({ name, email: a.email, photo: a.photo, at: Date.now(), familyId })) }]);
    return checkApproval(cid);
  }
  const doc = await t.getTrip(cid);
  if (!doc) throw new Error('הטיול לא נמצא. ייתכן שהקישור שגוי או שהשיתוף בוטל.');
  if ((doc.access ?? 'link') === 'approved' && !doc.members?.[t.uid]) return joinTrip(cid, config, name, true, familyId);
  const fams: { id: string }[] = (doc.core as any).families ?? [];
  const fam = familyId && fams.some(f => f.id === familyId) ? familyId : doc.members?.[t.uid]?.familyId;
  const me = { ...selfMember('editor', PALETTE[Object.keys(doc.members ?? {}).length % PALETTE.length], doc.members?.[t.uid]), ...(fam ? { familyId: fam } : {}) };
  await t.patch(cid, [{ path: ['members', t.uid], value: me }]);
  const id = addLocal(cid, doc, me);
  await startSync(); watch(cid);
  return id;
}

/** For a pending request: returns the local trip id once the organiser approved, otherwise null. */
export async function checkApproval(cid: string): Promise<string | null> {
  const t = await transport();
  const existing = tripByCloud(cid); if (existing) return existing.id;
  let doc: TripDoc | null = null;
  try { doc = await t.getTrip(cid); } catch { return null; } // not readable until approved
  if (!doc || !doc.members?.[t.uid]) return null;
  const me = selfMember('editor', doc.members[t.uid].color, doc.members[t.uid]);
  await t.patch(cid, [{ path: ['members', t.uid], value: me }]).catch(() => {});
  const id = addLocal(cid, doc, me);
  await startSync(); watch(cid);
  return id;
}

// ── organiser actions ──
export async function approve(cid: string, uid: string) {
  const t = await transport(); const m = useCloud.getState(); const p = m.meta[cid]?.pending?.[uid]; if (!p) return;
  const n = Object.keys(m.members[cid] ?? {}).length;
  await t.patch(cid, [{ path: ['members', uid], value: JSON.parse(JSON.stringify({ name: p.name, email: p.email, photo: p.photo, familyId: p.familyId, verified: true, color: PALETTE[n % PALETTE.length], role: 'editor', joinedAt: Date.now() })) }, { path: ['pending', uid], value: DELETE }]);
}
export async function deny(cid: string, uid: string) { const t = await transport(); await t.patch(cid, [{ path: ['pending', uid], value: DELETE }]); }
export async function removeMember(cid: string, uid: string) { const t = await transport(); await t.patch(cid, [{ path: ['members', uid], value: DELETE }]); }
export async function setAccess(cid: string, access: Access) { const t = await transport(); await t.patch(cid, [{ path: ['access'], value: access }]); }

// ── identity ──
export async function signInGoogle() {
  const t = await transport();
  const a = await t.signInGoogle();
  const st = useStore.getState();
  if (a.name && (!st.settings.cloud?.myName || st.settings.cloud.myName === 'משתתף')) st.setSettings({ cloud: { ...st.settings.cloud!, myName: a.name } });
  useCloud.setState({ account: a, uid: a.uid });
  for (const cid of watchers.keys()) { const prev = useCloud.getState().members[cid]?.[a.uid]; t.patch(cid, [{ path: ['members', a.uid], value: selfMember(prev?.role ?? 'editor', prev?.color ?? PALETTE[1], prev) }]).catch(() => {}); }
  return a;
}
export async function signOutGoogle() { const t = await transport(); const a = await t.signOut(); useCloud.setState({ account: a, uid: a.uid }); return a; }

export async function leaveTrip(tripId: string, deleteForAll: boolean) {
  const st = useStore.getState(); const trip = st.trips.find(x => x.id === tripId); if (!trip?.shared) return;
  const cid = trip.shared.cloudId; stop(cid);
  try { const t = await transport(); if (deleteForAll) await t.deleteTrip(cid); else await t.patch(cid, [{ path: ['members', t.uid], value: DELETE }]); } catch { /* offline: local removal still happens */ }
}

export const isOnline = (m?: Member) => !!m?.lastSeen && Date.now() - m.lastSeen < 150_000;
export { myName };
