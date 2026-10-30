// Keeps shared trips in the local store and the cloud document in step, in both directions.
import { create } from 'zustand';
import { useStore } from '../store';
import type { Trip, JournalEntry, AlbumPhoto } from '../types';
import { connect, type Transport, type PhotoDoc, type Account, type FamilyDoc } from './transport';
import { diffTrip, fromDoc, toDoc, randomId, PALETTE, encodeInvite, DELETE, clean, type Member, type Pending, type Access, type TripDoc, type Patch } from './model';
import { compressImage, getPhoto, putPhoto, blobToDataURL, dataURLToBlob } from '../photos';
import { toast } from '../../components/ui';
import { describeChanges, summarize, showSystem, type Change } from './notify';
import { concernsMe, isGroup, itemFamily } from '../families';
import { readiness } from '../../engine/packing';

export interface TripMeta { owner: string; access: Access; pending: Record<string, Pending>; invite: NonNullable<TripDoc['invite']>; progress: NonNullable<TripDoc['progress']>; familyMode: FamMode }
/** 'on': private family lists live in families/{id}; 'legacy': the project still has the old rules, keep everything in the trip document. */
export type FamMode = 'pending' | 'on' | 'legacy';
interface CloudState { status: 'off' | 'connecting' | 'on' | 'error'; error?: string; pending: number; lastSync?: number; uid?: string; account?: Account; members: Record<string, Record<string, Member>>; meta: Record<string, TripMeta>;
  /** invite keys this device may read (organiser: all; a member: their own family's) — never stored in the shared document */
  keys: Record<string, { all?: string; fam: Record<string, string> }> }
export const useCloud = create<CloudState>(() => ({ status: 'off', pending: 0, members: {}, meta: {}, keys: {} }));
/** Count a write until the server confirms it (Firestore keeps it on the device while offline). */
function track<T>(p: Promise<T>): Promise<T> {
  useCloud.setState(s => ({ pending: s.pending + 1 }));
  const done = (ok: boolean) => useCloud.setState(s => ({ pending: Math.max(0, s.pending - 1), ...(ok ? { lastSync: Date.now() } : {}) }));
  p.then(() => done(true), () => done(false));
  return p;
}

let tp: Transport | null = null; let tpKey = '';
const watchers = new Map<string, () => void>();
const last = new Map<string, Trip>();
const lastJ = new Map<string, string>();
const lastP = new Map<string, string>(); // album photo id → synced metadata
let started = false;
// per shared trip: the latest trip document, my family's private document, and whether family documents work
const mainDocs = new Map<string, TripDoc>();
const famDocs = new Map<string, { fid: string; doc: FamilyDoc | null; loaded: boolean; off: () => void }>();
const famMode = new Map<string, FamMode>();
const migrating = new Set<string>();
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
  // one connection attempt at a time: screens that load later (e.g. the join screen) share the attempt in flight
  if (connecting && connecting.key === key) return connecting.p;
  useCloud.setState({ status: 'connecting', error: undefined });
  const p = (async () => {
    try {
      const t = await connect(cfg); tp = t; tpKey = key; useCloud.setState({ status: 'on', uid: t.uid, account: t.account() });
      const c = useStore.getState().settings.cloud; const g = t.account().provider === 'google' ? t.uid : undefined;
      if (c && c.googleUid !== g) useStore.getState().setSettings({ cloud: { ...c, googleUid: g } });
      adoptGoogleName(t.account());
      return t;
    }
    catch (e: any) { useCloud.setState({ status: 'error', error: e?.message ?? String(e) }); throw new Error('החיבור ל-Firebase נכשל. בדקו את פרטי ההגדרה ושהופעלו Anonymous Auth ו-Firestore.'); }
    finally { if (connecting?.key === key) connecting = null; }
  })();
  connecting = { key, p };
  return p;
}
let connecting: { key: string; p: Promise<Transport> } | null = null;

const myName = () => useStore.getState().settings.cloud?.myName || tp?.account().name || 'משתתף';
/** My member record: Google identity (verified) when signed in, otherwise the typed name. */
function selfMember(role: Member['role'], color: string, prev?: Member): Member {
  const a = tp!.account();
  return { ...(prev ?? {}), name: myName(), color: prev?.color ?? color, role: prev?.role ?? role, joinedAt: prev?.joinedAt ?? Date.now(), lastSeen: Date.now(),
    ...(a.provider === 'google' ? { verified: true, email: a.email, photo: a.photo } : { verified: false }) } as Member;
}
let switching = false; // while this device changes its id (Google sign-in): no watchers, no "access removed"
function lostAccess(cid: string, msg: string) {
  if (switching) return;
  const local = tripByCloud(cid); if (!local) return;
  useStore.getState().updateTrip(local.id, { shared: undefined }); stop(cid); toast(msg.replace('%', local.name));
}
const tripByCloud = (cid: string) => useStore.getState().trips.find(t => t.shared?.cloudId === cid);

function watch(cid: string) {
  if (watchers.has(cid) || !tp || switching) return;
  const t = tp;
  const offTrip = t.watchTrip(cid, doc => {
    const local = tripByCloud(cid); if (!local) return;
    if (!doc) { lostAccess(cid, 'השיתוף של "%" הסתיים'); return; }
    if (!doc.members?.[t.uid] && doc.owner !== t.uid) { lostAccess(cid, 'הגישה שלך ל"%" הוסרה על ידי המארגן'); return; }
    mainDocs.set(cid, doc);
    const fam = isGroup({ families: (doc.core as any).families }) ? doc.members[t.uid]?.familyId ?? null : null;
    follow(cid, fam);
    if (doc.owner === t.uid) ensureInvites(cid, doc); else if (!keysLoaded.has(cid)) { keysLoaded.add(cid); loadKeys(cid, doc).catch(() => keysLoaded.delete(cid)); }
    apply(cid);
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
      const e: JournalEntry = { id: r.id, tripId: local.id, createdAt: r.createdAt, date: r.date, title: r.title, text: r.text, loc: r.loc, author: r.author, photoIds: Object.keys(r.photos ?? {}) , byUid: r.byUid };
      lastJ.set(e.id, JSON.stringify(e));
      const cur = st.journal.find(j => j.id === e.id);
      if (!cur || JSON.stringify(cur) !== JSON.stringify(e)) st.upsertEntry(e);
    }
    const ids = new Set(list.filter(r => r.kind !== 'photo').map(r => r.id));
    for (const j of useStore.getState().journal) if (j.tripId === local.id && lastJ.has(j.id) && !ids.has(j.id)) { lastJ.delete(j.id); st.removeEntry(j.id); }
  });
  watchers.set(cid, () => { offTrip(); offJ(); famDocs.get(cid)?.off(); famDocs.delete(cid); });
}
function stop(cid: string) { watchers.get(cid)?.(); watchers.delete(cid); last.delete(cid); mainDocs.delete(cid); famMode.delete(cid); primed.delete(cid); primed.delete('j:' + cid); }

/** Subscribe to my family's private document (or stop, when I have no family in this trip). */
function follow(cid: string, fid: string | null) {
  const cur = famDocs.get(cid);
  if (cur?.fid === fid) return;
  cur?.off(); famDocs.delete(cid);
  if (!fid || !tp) { if (!fid) famMode.set(cid, famMode.get(cid) === 'legacy' ? 'legacy' : 'on'); return; }
  const entry = { fid, doc: null as FamilyDoc | null, loaded: false, off: () => {} };
  famDocs.set(cid, entry);
  if (famMode.get(cid) !== 'legacy') famMode.set(cid, 'pending');
  entry.off = tp.watchFamily(cid, fid, d => { entry.doc = d; entry.loaded = true; if (famMode.get(cid) === 'pending') famMode.set(cid, 'on'); apply(cid); },
    (e: any) => { if (e?.code === 'permission-denied') { famMode.set(cid, 'legacy'); entry.loaded = true; apply(cid); } });
}

/** Rebuild the local trip from the trip document + my family's document, announce partners' changes, migrate. */
function apply(cid: string) {
  const local = tripByCloud(cid); const doc = mainDocs.get(cid); if (!local || !doc || !tp) return;
  const fd = famDocs.get(cid);
  if (fd && !fd.loaded) return; // wait for my family's list, so its items don't flicker away
  const mine = doc.members?.[tp.uid];
  const mode = famMode.get(cid) ?? 'on';
  useCloud.setState(s => ({ members: { ...s.members, [cid]: doc.members ?? {} }, meta: { ...s.meta, [cid]: { owner: doc.owner, access: doc.access ?? 'link', pending: doc.pending ?? {}, invite: doc.invite ?? {}, progress: doc.progress ?? {}, familyMode: mode } } }));
  const merged: TripDoc = fd?.doc && mode === 'on' ? { ...doc, packing: { ...doc.packing, ...fd.doc.packing } } : doc;
  let next = fromDoc(merged, local);
  if (mine?.familyId !== (next.shared?.familyId ?? undefined) && next.shared) next = { ...next, shared: { ...next.shared, familyId: mine?.familyId } };
  if (primed.has(cid)) {
    const ed = doc.editedBy;
    const editor = ed && ed.uid !== tp.uid ? ed.name : null;
    announce(cid, describeChanges(local, next, editor, p => concernsMe(next, p)).filter(c => !(ed?.uid === tp!.uid && c.by === null)));
  } else primed.add(cid);
  last.set(cid, next);
  if (JSON.stringify(local) !== JSON.stringify(next)) useStore.setState(s => ({ trips: s.trips.map(x => (x.id === local.id ? next : x)) }));
  if (mode === 'on' && isGroup(next)) migrate(cid, next).catch(() => {});
}

const keysLoaded = new Set<string>(); const invitesChecked = new Map<string, string>(); // cid → families checked
const sidOf = (fam: string | null | undefined) => (fam ? `fam-${fam}` : 'all');
/** Read the invite keys this device is allowed to see (the organiser: every family; a member: their own family). */
async function loadKeys(cid: string, doc: TripDoc) {
  const t = tp!; const fams: { id: string }[] = (doc.core as any).families ?? [];
  const mine = doc.owner === t.uid ? [null, ...fams.map(f => f.id)] : [doc.members?.[t.uid]?.familyId ?? null];
  const k: { all?: string; fam: Record<string, string> } = { fam: {} };
  for (const f of mine) { const v = await t.getSecret(cid, sidOf(f)).catch(() => null); if (v) { if (f) k.fam[f] = v; else k.all = v; } }
  useCloud.setState(s => ({ keys: { ...s.keys, [cid]: k } }));
}
/**
 * Organiser: every family (and the whole trip) has an invite key in secrets/, readable only by the organiser and
 * that family. Older trips kept the keys in the shared document (any member could read every family's key):
 * they are copied as they are — so links already sent keep working — and only then removed from the document.
 * If the project's rules don't allow secrets yet, the keys stay in the document as before.
 */
async function ensureInvites(cid: string, doc: TripDoc) {
  const t = tp!; const fams: { id: string }[] = (doc.core as any).families ?? [];
  // checked again whenever the families change — a family added later needs its own key too
  const sig = fams.map(f => f.id).join(','); if (invitesChecked.get(cid) === sig) return; invitesChecked.set(cid, sig);
  const inv = doc.invite ?? {};
  const want: [string | null, string | undefined][] = [[null, inv.all], ...fams.map(f => [f.id, inv.fam?.[f.id]] as [string, string | undefined])];
  let ok = true;
  for (const [f, legacy] of want) {
    try { if (!(await t.getSecret(cid, sidOf(f)))) await t.setSecret(cid, sidOf(f), legacy || randomId(16)); if (!(await t.getSecret(cid, sidOf(f)))) ok = false; }
    catch { ok = false; }
  }
  if (ok) {
    const patches: Patch[] = [];
    if (inv.all) patches.push({ path: ['invite', 'all'], value: DELETE });
    if (inv.fam) patches.push({ path: ['invite', 'fam'], value: DELETE });
    for (const [u, m] of Object.entries(doc.members ?? {})) if ((m as Member).k) patches.push({ path: ['members', u, 'k'], value: DELETE });
    if (patches.length) await t.patch(cid, patches).catch(() => {});
    await loadKeys(cid, doc).catch(() => {});
  } else {
    // rules without secrets: keep the older way so links still work
    const patches: Patch[] = [];
    if (!inv.all) patches.push({ path: ['invite', 'all'], value: randomId(16) });
    for (const f of fams) if (!inv.fam?.[f.id]) patches.push({ path: ['invite', 'fam', f.id], value: randomId(16) });
    if (patches.length) t.patch(cid, patches).catch(() => {});
    invitesChecked.delete(cid);
  }
}

/**
 * Move private family items out of the shared trip document (older trips kept everything there):
 * my family's items go to my family document; the organiser seeds a starting list for families that have none.
 * An item is removed from the trip document only after its family copy was written.
 */
async function migrate(cid: string, t: Trip) {
  if (migrating.has(cid) || !tp) return;
  const doc = mainDocs.get(cid)!; const fd = famDocs.get(cid); const mineFam = fd?.fid ?? null;
  const isOwner = doc.owner === tp.uid; const seeded = doc.progress ?? {};
  const inMain = Object.values(doc.packing ?? {}) as any[];
  const byFam = new Map<string, any[]>();
  for (const it of inMain) { const f = itemFamily(t, it); if (f) byFam.set(f, [...(byFam.get(f) ?? []), it]); }
  // items generated locally for families that have no list yet (organiser only)
  if (isOwner) for (const it of t.packing) { const f = itemFamily(t, it); if (f && f !== mineFam && !(f in seeded) && !doc.packing?.[it.id]) byFam.set(f, [...(byFam.get(f) ?? []), it]); }
  if (!byFam.size) return;
  migrating.add(cid);
  try {
    for (const [f, items] of byFam) {
      const asMap = Object.fromEntries(items.map(i => [i.id, clean({ ...i, familyId: f })]));
      let ok = false;
      if (f === mineFam && fd?.loaded) {
        if (fd.doc) { await tp.patchFamily(cid, f, items.map(i => ({ path: ['packing', i.id], value: asMap[i.id] }))); ok = true; }
        else { await tp.createFamily(cid, f, { packing: asMap }); ok = true; }
      } else if (isOwner && !(f in seeded)) {
        await tp.createFamily(cid, f, { packing: asMap }).then(() => (ok = true), () => {});
      }
      if (!ok) continue;
      const r = readiness(items as any);
      const patches: Patch[] = items.filter(i => doc.packing?.[i.id]).map(i => ({ path: ['packing', i.id], value: DELETE }));
      patches.push({ path: ['progress', f], value: { packed: r.done, total: r.total, at: Date.now() } });
      await tp.patch(cid, patches);
      // the organiser keeps no copy of another family's private list
      if (f !== mineFam) { const local = tripByCloud(cid); if (local) { const ids = new Set(items.map(i => i.id)); const nt = { ...local, packing: local.packing.filter(p => !ids.has(p.id)) }; last.set(cid, nt); useStore.setState(s => ({ trips: s.trips.map(x => (x.id === local.id ? nt : x)) })); } }
    }
  } finally { migrating.delete(cid); }
}

/** Send local changes: shared items to the trip document, my family's items to my family document. */
function push(cid: string, base: Trip, t: Trip) {
  if (!tp) return;
  const mode = famMode.get(cid) ?? 'on'; const fd = famDocs.get(cid);
  const split = mode === 'on' && isGroup(t) && !!fd;
  const mineFam = split ? fd!.fid : null;
  const famOf = (tr: Trip, id: string) => { const it = tr.packing.find(p => p.id === id); return it ? itemFamily(tr, it) : undefined; };
  const main: Patch[] = [], fam: Patch[] = [];
  const moved = new Set<string>();
  for (const p of diffTrip(base, t)) {
    if (!split || p.path[0] !== 'packing') { main.push(p); continue; }
    const id = p.path[1]; const fb = famOf(base, id), fa = famOf(t, id);
    const target = (f: string | null | undefined) => (f === mineFam ? fam : f == null ? main : null);
    if (fb !== undefined && fa !== undefined && fb !== fa) {
      if (moved.has(id)) continue; moved.add(id);
      const item = clean(t.packing.find(x => x.id === id)!);
      target(fb)?.push({ path: ['packing', id], value: DELETE });
      target(fa)?.push({ path: ['packing', id], value: item });
      continue;
    }
    target(fa !== undefined ? fa : fb)?.push(p); // another family's item: not ours to write
  }
  if (main.length || fam.length) main.push({ path: ['editedBy'], value: { uid: tp.uid, name: myName(), at: Date.now() } });
  if (fam.length && mineFam) {
    const r = readiness(t.packing.filter(p => itemFamily(t, p) === mineFam));
    const prev = mainDocs.get(cid)?.progress?.[mineFam];
    if (!prev || prev.packed !== r.done || prev.total !== r.total) main.push({ path: ['progress', mineFam], value: { packed: r.done, total: r.total, at: Date.now() } });
    const send = track(fd!.doc ? tp.patchFamily(cid, mineFam, fam) : tp.createFamily(cid, mineFam, { packing: Object.fromEntries(t.packing.filter(p => itemFamily(t, p) === mineFam).map(p => [p.id, clean(p)])) }));
    send.catch(err => { useCloud.setState({ status: 'error', error: err.message }); toast('השינוי נשמר במכשיר ויסונכרן כשהחיבור יחזור'); });
  }
  if (split && t.shared?.role === 'owner' && t.packing.some(p => { const f = itemFamily(t, p); return f && f !== mineFam; })) migrate(cid, t).catch(() => {});
  if (main.length) track(tp.patch(cid, main)).catch(err => { useCloud.setState({ status: 'error', error: err.message }); toast('השינוי נשמר במכשיר ויסונכרן כשהחיבור יחזור'); });
}

const metaKey = (p: AlbumPhoto) => JSON.stringify([p.by, p.takenAt, p.caption ?? '', p.collage ?? false]);
async function pushPhoto(p: AlbumPhoto, cid: string) {
  const b = await getPhoto(p.id); if (!b) return;
  await tp!.putEntry(cid, JSON.parse(JSON.stringify({ id: p.id, kind: 'photo', by: p.by, byUid: p.byUid ?? tp!.uid, takenAt: p.takenAt, addedAt: p.addedAt, caption: p.caption, w: p.w, h: p.h, collage: p.collage, data: await blobToDataURL(b) })));
}

async function pushJournal(e: JournalEntry, cid: string) {
  const photos: Record<string, string> = {};
  for (const id of e.photoIds.slice(0, 4)) { const b = await getPhoto(id).catch(() => undefined); if (b) photos[id] = await blobToDataURL(await compressImage(b as File, 900, 0.7)); }
  await tp!.putEntry(cid, { id: e.id, author: e.author ?? myName(), byUid: e.byUid ?? tp!.uid, createdAt: e.createdAt, date: e.date, title: e.title, text: e.text, loc: e.loc ?? null, photos });
}

let restored = false;
/** Start syncing every shared trip. Safe to call repeatedly. */
export async function startSync() {
  const shared = useStore.getState().trips.filter(t => t.shared);
  const cloud = useStore.getState().settings.cloud;
  if (!cloud || (!shared.length && !cloud.googleUid)) return;
  let t0: Transport; try { t0 = await transport(); } catch { return; }
  const google = t0.account().provider === 'google';
  if (!restored && google) { restored = true; indexMine().catch(() => {}); restoreFromAccount().catch(() => {}); saveAllToAccount().catch(() => {}); }
  if (!google && !useStore.getState().trips.some(t => t.shared)) return;
  for (const t of shared) watch(t.shared!.cloudId);
  if (started) return; started = true;
  useStore.subscribe((s, prev) => {
    if (!tp) return;
    // signed in with Google: a new trip is saved to the account right away (private until shared with others)
    if (s.trips !== prev.trips && tp.account().provider === 'google') for (const t of s.trips) if (!t.shared && !t.example && !prev.trips.some(p => p.id === t.id)) saveToAccount(t.id);
    for (const t of s.trips) {
      if (!t.shared) continue;
      const cid = t.shared.cloudId;
      if (!watchers.has(cid)) watch(cid);
      const base = last.get(cid); if (!base || base === t) continue;
      last.set(cid, t);
      push(cid, base, t);
    }
    for (const cid of [...watchers.keys()]) if (!s.trips.some(t => t.shared?.cloudId === cid)) stop(cid);
    if (s.journal !== prev.journal) {
      for (const e of s.journal) {
        const t = s.trips.find(x => x.id === e.tripId); if (!t?.shared) continue;
        const j = JSON.stringify(e); if (lastJ.get(e.id) === j) continue;
        lastJ.set(e.id, j); track(pushJournal(e, t.shared.cloudId)).catch(() => toast('הרשומה לא סונכרנה'));
      }
      for (const e of prev.journal) if (!s.journal.some(x => x.id === e.id)) { const t = s.trips.find(x => x.id === e.tripId); if (t?.shared && lastJ.has(e.id)) { lastJ.delete(e.id); tp.deleteEntry(t.shared.cloudId, e.id).catch(() => {}); } }
    }
    if (s.album !== prev.album) {
      for (const p of s.album) {
        const t = s.trips.find(x => x.id === p.tripId); if (!t?.shared) continue;
        const k = metaKey(p); if (lastP.get(p.id) === k) continue;
        lastP.set(p.id, k); track(pushPhoto(p, t.shared.cloudId)).catch(() => { lastP.delete(p.id); toast('תמונה לא סונכרנה — ננסה שוב'); });
      }
      for (const p of prev.album) if (!s.album.some(x => x.id === p.id)) { const t = s.trips.find(x => x.id === p.tripId); if (t?.shared && lastP.has(p.id)) { lastP.delete(p.id); tp.deleteEntry(t.shared.cloudId, p.id).catch(() => {}); } }
    }
  });
  const beat = () => { if (document.visibilityState !== 'visible' || !tp) return; for (const cid of watchers.keys()) tp.patch(cid, [{ path: ['members', tp.uid, 'lastSeen'], value: Date.now() }]).catch(() => {}); };
  setInterval(beat, 60_000); document.addEventListener('visibilitychange', beat); beat();
}

/** Turn a local trip into a shared one; returns the invite link. */
export async function shareTrip(tripId: string): Promise<string | null> {
  const t = await transport();
  const st = useStore.getState(); const trip = st.trips.find(x => x.id === tripId)!;
  if (trip.shared) return inviteLink(trip.shared.cloudId);
  const cid = randomId();
  const fam = isGroup(trip) ? trip.families![0].id : undefined;
  const me = { ...selfMember('owner', PALETTE[0]), ...(fam ? { familyId: fam } : {}) };
  // created with the whole list; family items then move to their family documents (see migrate)
  await t.createTrip(cid, { ...toDoc({ ...trip, example: false }, t.uid, me), progress: {} });
  await ensureInvites(cid, (await t.getTrip(cid))!);
  last.set(cid, trip);
  st.updateTrip(tripId, { shared: { cloudId: cid, role: 'owner', joinedAt: new Date().toISOString(), ...(fam ? { familyId: fam } : {}) }, example: false });
  for (const e of st.journal.filter(j => j.tripId === tripId)) { lastJ.set(e.id, JSON.stringify(e)); await pushJournal(e, cid); }
  for (const p of st.album.filter(x => x.tripId === tripId)) { lastP.set(p.id, metaKey(p)); await pushPhoto(p, cid).catch(() => lastP.delete(p.id)); }
  indexOne(cid, trip);
  await startSync(); watch(cid);
  return inviteLink(cid);
}

/** Invite link; with a family, whoever opens it joins that family. */
/** Share sheet opened: make sure every invite key exists and is loaded (organiser), or load mine (member). */
export async function prepareInvites(cid: string) {
  const t = await transport(); const doc = await t.getTrip(cid).catch(() => null); if (!doc) return;
  if (doc.owner === t.uid) { invitesChecked.delete(cid); await ensureInvites(cid, doc); } else await loadKeys(cid, doc);
}
/** The invite link — or null while its key isn't ready, so a link without a key can never be sent. */
export function inviteLink(cid: string, family?: { id: string; name: string }): string | null {
  // a member of a family invites into their own family (the only key they can read)
  if (!family) { const st = useCloud.getState(); const myFam = st.uid ? st.members[cid]?.[st.uid]?.familyId : undefined;
    if (myFam && st.meta[cid]?.owner !== st.uid) { const f = ((tripByCloud(cid)?.families) ?? []).find(x => x.id === myFam); if (f) family = { id: f.id, name: f.name }; } }
  const cfg = useStore.getState().settings.cloud!.config;
  const meta = useCloud.getState().meta[cid];
  const approved = meta?.access === 'approved';
  const keys = useCloud.getState().keys[cid];
  const key = family ? keys?.fam[family.id] ?? meta?.invite?.fam?.[family.id] : keys?.all ?? meta?.invite?.all;
  const f = family ? `&f=${encodeURIComponent(family.id)}&fn=${encodeURIComponent(family.name)}` : '';
  if (!approved && !key) return null;
  const exp = meta?.invite?.until && !approved ? `&e=${meta.invite.until}` : '';
  return `${location.origin}${location.pathname}#/join?t=${cid}${approved ? '&a=1' : ''}${f}${key && !approved ? `&k=${key}` : ''}${exp}&c=${encodeInvite(cfg)}`;
}
/** Organiser: move a partner to another family. */
export async function setMemberFamily(cid: string, uid: string, familyId: string) { const t = await transport(); await t.patch(cid, [{ path: ['members', uid, 'familyId'], value: familyId }]); }

function addLocal(cid: string, doc: TripDoc, me: Member) {
  const st = useStore.getState();
  const id = 'trip-' + cid.slice(0, 10);
  const trip = fromDoc({ ...doc, members: { ...doc.members, [tp!.uid]: me } }, { id, shared: { cloudId: cid, role: me.role, joinedAt: new Date().toISOString(), ...(me.familyId ? { familyId: me.familyId } : {}) } } as Trip);
  st.addTrip({ ...trip, id });
  last.set(cid, useStore.getState().trips.find(x => x.id === id)!);
  indexOne(cid, trip);
  return id;
}

/** Join through an invite. Open trips: immediate. Approved-only trips: leaves a request and returns null. */
/** A network step that must not spin forever: rejects after `ms` with a message that names the step. */
export const JOIN_STEP_MS = 20_000;
function step<T>(label: string, p: Promise<T>, ms = (globalThis as any).__campilStepMs ?? JOIN_STEP_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const late = new Promise<never>((_, rej) => { timer = setTimeout(() => rej(Object.assign(new Error(`אין תשובה מהשרת (שלב: ${label}). בדקו שיש קליטה ונסו שוב — אם זה חוזר, צלמו את ההודעה ושלחו למארגן.`), { code: 'timeout' })), ms); });
  return Promise.race([p, late]).finally(() => clearTimeout(timer)) as Promise<T>;
}
/** Which step the join is at — shown on the button so a stuck join is never a silent spinner. */
export const useJoinStep = create<{ step: string | null }>(() => ({ step: null }));
const at = (label: string | null) => useJoinStep.setState({ step: label });

export async function joinTrip(cid: string, config: Record<string, string>, name: string, approvedOnly = false, familyId?: string, key?: string): Promise<string | null> {
  const st = useStore.getState();
  // keep the rest of the cloud settings (the Google sign-in mark) — only the config and display name change
  st.setSettings({ cloud: { ...(st.settings.cloud ?? {}), config, myName: name } as any });
  try {
    const existing = tripByCloud(cid); if (existing) { await startSync(); return existing.id; }
    at('התחברות'); const t = await step('התחברות', transport());
    if (approvedOnly) {
      if (t.account().provider !== 'google') throw new Error('הטיול הזה פתוח רק למשתתפים מאושרים — התחברו עם Google כדי לבקש הצטרפות');
      const a = t.account();
      at('שליחת בקשה'); await step('שליחת בקשה', t.patch(cid, [{ path: ['pending', t.uid], value: JSON.parse(JSON.stringify({ name, email: a.email, photo: a.photo, at: Date.now(), familyId })) }]));
      return await step('בדיקת אישור', checkApproval(cid));
    }
    at('בדיקת הטיול');
    let doc: TripDoc | null = await step('בדיקת הטיול', t.getTrip(cid)).catch(() => null); // readable only if I'm already a member
    if (!doc?.members?.[t.uid]) {
      if (!key) throw new Error('הקישור הזה ישן או חסר בו מפתח הזמנה. בקשו מהמארגן קישור חדש.');
      // the key goes to a record only this account can read; older trips (rules) still take it in the member entry
      let viaSecret = false;
      at('אימות ההזמנה');
      try { await step('אימות ההזמנה', t.putJoin(cid, t.uid, { k: key, familyId: familyId ?? null })); viaSecret = true; }
      catch (e: any) { if (e?.code === 'timeout') throw e; /* older rules or trip */ }
      const me: Member = { ...selfMember('editor', PALETTE[Math.floor(Math.random() * PALETTE.length)]), ...(familyId ? { familyId } : {}), ...(viaSecret ? {} : { k: key }) };
      at('הצטרפות');
      try { await step('הצטרפות', t.patch(cid, [{ path: ['members', t.uid], value: clean(me) }])); }
      catch (e: any) { if (e?.code === 'timeout') throw e; throw new Error('הקישור כבר לא בתוקף — פג תוקפו, או שהמארגן החליף אותו. בקשו קישור חדש.'); }
      at('טעינת הטיול');
      doc = await step('טעינת הטיול', t.getTrip(cid)).catch(e => { if (e?.code === 'timeout') throw e; return null; });
      if (!doc) throw new Error('הטיול לא נמצא. ייתכן שהקישור שגוי או שהשיתוף בוטל.');
    }
    const id = addLocal(cid, doc, doc.members[t.uid]);
    startSync().catch(() => {}); watch(cid); // syncing continues in the background — the trip opens now
    return id;
  } finally { at(null); }
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
/** Remove someone and replace the invite key they joined with, so their old link (or a new anonymous id) can't get back in. */
export async function removeMember(cid: string, uid: string): Promise<string | null> {
  const t = await transport();
  const fam = useCloud.getState().members[cid]?.[uid]?.familyId ?? null;
  const legacy = useCloud.getState().meta[cid]?.invite; const hasLegacy = fam ? !!legacy?.fam?.[fam] : !!legacy?.all;
  await t.patch(cid, [{ path: ['members', uid], value: DELETE }, ...(hasLegacy ? [fam ? { path: ['invite', 'fam', fam], value: randomId(16) } : { path: ['invite', 'all'], value: randomId(16) }] : [])]);
  const k = randomId(16);
  await t.setSecret(cid, sidOf(fam), k).catch(() => {});
  useCloud.setState(s => { const cur = s.keys[cid] ?? { fam: {} }; return { keys: { ...s.keys, [cid]: fam ? { ...cur, fam: { ...cur.fam, [fam]: k } } : { ...cur, all: k } } }; });
  return fam;
}
/** Organiser: links stop admitting new people after `until` (ms); null = no expiry. Enforced by the security rules. */
export async function setInviteExpiry(cid: string, until: number | null) { const t = await transport(); await t.patch(cid, [{ path: ['invite', 'until'], value: until ?? DELETE }]); }
export async function setAccess(cid: string, access: Access) { const t = await transport(); await t.patch(cid, [{ path: ['access'], value: access }]); }

// ── identity ──
/** The household's first adult still has the placeholder name ("מבוגר/ת 1") → use the Google first name. */
function adoptGoogleName(a: Account) {
  if (a.provider !== 'google' || !a.name?.trim()) return;
  const st = useStore.getState(); const first = a.name.trim().split(/\s+/)[0];
  const me = st.members.find(m => m.role === 'adult');
  if (me && /^מבוגר(\/ת)?\s*\d*$/.test(me.name.trim())) st.upsertMember({ ...me, name: first });
  const c = st.settings.cloud; if (c && (!c.myName || /^מבוגר(\/ת)?\s*\d*$|^משתתף$/.test(c.myName.trim()))) st.setSettings({ cloud: { ...c, myName: a.name.trim() } });
}
/** Sign in with Google. If this Google account already exists (another device), this device switches to the
 *  account's id: trips it organises are handed over first, trips it joined are re-joined with the same invite key. */
export async function signInGoogle() {
  const t = await transport(); const oldUid = t.uid;
  const cids = useStore.getState().trips.filter(x => x.shared).map(x => x.shared!.cloudId);
  const saved = new Map<string, { m: Member; owner: boolean }>();
  const beforeSwitch = async (newUid: string) => {
    for (const cid of cids) {
      const d = await t.getTrip(cid).catch(() => null); const m = d?.members?.[oldUid]; if (!d || !m) continue;
      const owner = d.owner === oldUid;
      const key = owner ? undefined : (await t.getSecret(cid, sidOf(m.familyId ?? null)).catch(() => null)) ?? m.k;
      saved.set(cid, { m: { ...m, k: key ?? undefined }, owner });
      if (owner) await t.patch(cid, [{ path: ['members', newUid], value: clean({ ...m, lastSeen: Date.now() }) }, { path: ['owner'], value: newUid }]).catch(() => {});
    }
    switching = true; for (const cid of cids) stop(cid); // the old id is about to lose access; don't report that as removal
  };
  let a: Account;
  try { a = await t.signInGoogle(beforeSwitch); } catch (e) { if (switching) { switching = false; for (const cid of cids) watch(cid); } throw e; }
  const st = useStore.getState();
  if (a.name && (!st.settings.cloud?.myName || st.settings.cloud.myName === 'משתתף')) st.setSettings({ cloud: { ...st.settings.cloud!, myName: a.name } });
  st.setSettings({ cloud: { ...useStore.getState().settings.cloud!, googleUid: a.uid } });
  useCloud.setState({ account: a, uid: a.uid });
  adoptGoogleName(a);
  if (a.uid !== oldUid) {
    switching = false; for (const cid of cids) stop(cid); switching = true;
    for (const [cid, { m, owner }] of saved) {
      const d = await t.getTrip(cid).catch(() => null);
      if (!d?.members?.[a.uid] && !owner && m.k) {
        let viaSecret = false;
        try { await t.putJoin(cid, a.uid, { k: m.k, familyId: m.familyId ?? null }); viaSecret = true; } catch { /* older rules */ }
        const { k, ...rest } = m;
        await t.patch(cid, [{ path: ['members', a.uid], value: clean({ ...rest, ...(viaSecret ? {} : { k }), role: 'editor', lastSeen: Date.now() }) }]).catch(() => {});
      }
      if (owner) await t.patch(cid, [{ path: ['members', oldUid], value: DELETE }]).catch(() => {});
      const ok = await t.getTrip(cid).catch(() => null);
      const local = tripByCloud(cid);
      if (!ok?.members?.[a.uid]) { if (local) { useStore.getState().updateTrip(local.id, { shared: undefined }); toast(`לא הצלחנו להעביר את "${local.name}" לחשבון — בקשו מהמארגן קישור הזמנה חדש`); } continue; }
      if (local) useStore.getState().updateTrip(local.id, { shared: { ...local.shared!, role: ok.owner === a.uid ? 'owner' : 'editor' } });
    }
    switching = false;
    for (const cid of saved.keys()) if (tripByCloud(cid)) watch(cid);
  }
  switching = false;
  for (const cid of watchers.keys()) { const prev = useCloud.getState().members[cid]?.[a.uid]; t.patch(cid, [{ path: ['members', a.uid], value: selfMember(prev?.role ?? 'editor', prev?.color ?? PALETTE[1], prev) }]).catch(() => {}); }
  await saveAllToAccount().catch(() => {});
  await indexMine().catch(() => {});
  await restoreFromAccount().catch(() => {});
  await startSync();
  return a;
}

/** Record this account's shared trips in its private list, so its other devices can find them. */
async function indexMine() {
  const t = tp; if (!t || t.account().provider !== 'google') return;
  const have = await t.indexGet(t.uid).catch(() => ({} as Record<string, unknown>));
  for (const x of useStore.getState().trips) if (x.shared && !have[x.shared.cloudId]) await t.indexPut(t.uid, x.shared.cloudId, { name: x.name, start: x.start, at: Date.now() });
}
const indexOne = (cid: string, x: { name: string; start: string }) => { const t = tp; if (t?.account().provider === 'google') t.indexPut(t.uid, cid, { name: x.name, start: x.start, at: Date.now() }).catch(() => {}); };

const saving = new Set<string>();
/** Save a trip that isn't in the cloud yet to the signed-in account: only this account can open it until it is shared. */
function saveToAccount(tripId: string) {
  if (saving.has(tripId)) return; saving.add(tripId);
  shareTrip(tripId).catch(() => {}).finally(() => saving.delete(tripId));
}
/** Signed in with Google: every trip on this device follows the account to its other devices. */
export async function saveAllToAccount() {
  const t = await transport(); if (t.account().provider !== 'google') return;
  for (const x of useStore.getState().trips) if (!x.shared && !x.example) { saving.add(x.id); await shareTrip(x.id).catch(() => {}); saving.delete(x.id); }
}

/** Bring the account's shared trips onto this device (e.g. the installed app after signing in). Returns how many were added. */
export async function restoreFromAccount(): Promise<number> {
  const t = await transport(); if (t.account().provider !== 'google') return 0;
  const idx = await t.indexGet(t.uid).catch((e: any) => { throw new Error(e?.code === 'permission-denied' ? 'רשימת הטיולים בחשבון עוד לא זמינה (צריך לעדכן את כללי האבטחה ב-Firebase)' : 'לא הצלחנו לטעון את הטיולים מהחשבון — בדקו את החיבור'); });
  let n = 0;
  for (const cid of Object.keys(idx)) {
    if (tripByCloud(cid)) continue;
    const d = await t.getTrip(cid).catch(() => null);
    if (!d || !d.members?.[t.uid]) { await t.indexPut(t.uid, cid, null).catch(() => {}); continue; }
    addLocal(cid, d, d.members[t.uid]); n++;
  }
  if (n) { await startSync(); toast(n === 1 ? 'טיול אחד נטען מהחשבון שלך' : `${n} טיולים נטענו מהחשבון שלך`); }
  return n;
}
export async function signOutGoogle() { const t = await transport(); const a = await t.signOut(); const st = useStore.getState(); if (st.settings.cloud) st.setSettings({ cloud: { ...st.settings.cloud, googleUid: undefined } }); useCloud.setState({ account: a, uid: a.uid }); return a; }

export async function leaveTrip(tripId: string, deleteForAll: boolean) {
  const st = useStore.getState(); const trip = st.trips.find(x => x.id === tripId); if (!trip?.shared) return;
  const cid = trip.shared.cloudId; stop(cid);
  try { const t = await transport(); if (t.account().provider === 'google') await t.indexPut(t.uid, cid, null).catch(() => {}); if (deleteForAll) await t.deleteTrip(cid); else await t.patch(cid, [{ path: ['members', t.uid], value: DELETE }]); } catch { /* offline: local removal still happens */ }
}

export const isOnline = (m?: Member) => !!m?.lastSeen && Date.now() - m.lastSeen < 150_000;
export { myName };
