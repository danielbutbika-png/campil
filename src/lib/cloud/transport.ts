// Cloud transports. `firebase` talks to the user's Firebase project (Anonymous Auth + Firestore with
// offline persistence). `local` is an in-browser stand-in (localStorage + BroadcastChannel) used by the
// automated tests and for trying sharing between two tabs; it is selected with projectId "local-demo".
import { DELETE, applyPatches, type Patch, type TripDoc, type Member } from './model';

export interface JournalDoc { id: string; author: string; createdAt: string; date: string; title: string; text: string; loc?: any; photos: Record<string, string>; kind?: undefined }
/** An album photo, stored next to the journal entries (same access rules) with the JPEG as a data URL. */
export interface PhotoDoc { id: string; kind: 'photo'; by: string; byUid?: string; takenAt: number; addedAt: number; caption?: string; w: number; h: number; collage?: boolean; data: string }
export type SubDoc = JournalDoc | PhotoDoc;
export interface Account { uid: string; provider: 'anonymous' | 'google'; name?: string; email?: string; photo?: string }
export interface Transport {
  readonly uid: string;
  account(): Account;
  signInGoogle(): Promise<Account>;
  signOut(): Promise<Account>;
  createTrip(id: string, doc: TripDoc): Promise<void>;
  getTrip(id: string): Promise<TripDoc | null>;
  watchTrip(id: string, cb: (d: TripDoc | null) => void, onErr?: (e: Error) => void): () => void;
  patch(id: string, patches: Patch[]): Promise<void>;
  deleteTrip(id: string): Promise<void>;
  putEntry(tripId: string, e: SubDoc): Promise<void>;
  deleteEntry(tripId: string, entryId: string): Promise<void>;
  watchJournal(tripId: string, cb: (list: SubDoc[]) => void): () => void;
  /** One family's private gear (trips/{id}/families/{famId}). `create` fails if it already exists or isn't allowed. */
  createFamily(tripId: string, famId: string, d: FamilyDoc): Promise<void>;
  patchFamily(tripId: string, famId: string, patches: Patch[]): Promise<void>;
  watchFamily(tripId: string, famId: string, cb: (d: FamilyDoc | null) => void, onErr?: (e: any) => void): () => void;
}
export interface FamilyDoc { packing: Record<string, any>; updatedAt?: unknown }

export async function connect(config: Record<string, string>): Promise<Transport> {
  return config.projectId === 'local-demo' ? localTransport() : firebaseTransport(config);
}

async function firebaseTransport(config: Record<string, string>): Promise<Transport> {
  const [{ initializeApp, getApps }, auth, fs] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')]);
  const app = getApps()[0] ?? initializeApp(config);
  const a = auth.getAuth(app);
  const first = a.currentUser ?? (await new Promise<any>(res => { const u = auth.onAuthStateChanged(a, x => { u(); res(x); }); }));
  if (!first) await auth.signInAnonymously(a);
  const acct = (): Account => {
    const u = a.currentUser!; const g = u.providerData.find(p => p.providerId === 'google.com');
    return g ? { uid: u.uid, provider: 'google', name: g.displayName ?? u.displayName ?? undefined, email: g.email ?? undefined, photo: g.photoURL ?? undefined } : { uid: u.uid, provider: 'anonymous' };
  };
  let db: import('firebase/firestore').Firestore;
  try { db = fs.initializeFirestore(app, { localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) }); }
  catch { db = fs.getFirestore(app); }
  const ref = (id: string) => fs.doc(db, 'trips', id);
  return {
    get uid() { return a.currentUser!.uid; },
    account: acct,
    signInGoogle: async () => {
      const provider = new auth.GoogleAuthProvider(); provider.setCustomParameters({ prompt: 'select_account' });
      try {
        // Linking keeps this device's id, so trips already joined stay joined.
        if (a.currentUser?.isAnonymous) await auth.linkWithPopup(a.currentUser, provider); else await auth.signInWithPopup(a, provider);
        await a.currentUser?.getIdToken(true); // fresh token carries the e-mail claim the security rules check
      } catch (e: any) {
        if (e?.code === 'auth/credential-already-in-use' || e?.code === 'auth/email-already-in-use') {
          const cred = auth.GoogleAuthProvider.credentialFromError(e); if (cred) await auth.signInWithCredential(a, cred); else throw e;
        } else if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/operation-not-supported-in-this-environment') {
          throw new Error('החלון של Google נחסם. באייפון, כשהאפליקציה מותקנת למסך הבית, נסו להתחבר מתוך Safari.');
        } else if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') {
          throw new Error('ההתחברות בוטלה');
        } else if (e?.code === 'auth/unauthorized-domain') {
          throw new Error('הדומיין של האפליקציה לא מאושר ב-Firebase (Authentication ← Settings ← Authorized domains)');
        } else throw new Error(e?.message ?? 'ההתחברות נכשלה');
      }
      return acct();
    },
    signOut: async () => { await auth.signOut(a); await auth.signInAnonymously(a); return acct(); },
    createTrip: (id, d) => fs.setDoc(ref(id), { ...d, updatedAt: fs.serverTimestamp() }),
    getTrip: async id => { const s = await fs.getDoc(ref(id)); return s.exists() ? (s.data() as TripDoc) : null; },
    watchTrip: (id, cb, onErr) => fs.onSnapshot(ref(id), s => cb(s.exists() ? (s.data() as TripDoc) : null), e => onErr?.(e)),
    patch: async (id, patches) => {
      if (!patches.length) return;
      const args: unknown[] = [];
      for (const p of patches) args.push(new fs.FieldPath(...p.path), p.value === DELETE ? fs.deleteField() : p.value);
      args.push('updatedAt', fs.serverTimestamp());
      await (fs.updateDoc as any)(ref(id), ...args);
    },
    deleteTrip: id => fs.deleteDoc(ref(id)),
    putEntry: (tid, e) => fs.setDoc(fs.doc(db, 'trips', tid, 'journal', e.id), JSON.parse(JSON.stringify(e))),
    deleteEntry: (tid, eid) => fs.deleteDoc(fs.doc(db, 'trips', tid, 'journal', eid)),
    watchJournal: (tid, cb) => fs.onSnapshot(fs.collection(db, 'trips', tid, 'journal'), s => cb(s.docs.map(d => d.data() as SubDoc))),
    createFamily: async (tid, fid, d) => {
      // Called only when the family has no list yet. For another family's existing list this is an
      // update, which the rules refuse — so the organiser can seed a list but never overwrite one.
      await fs.setDoc(fs.doc(db, 'trips', tid, 'families', fid), { ...JSON.parse(JSON.stringify(d)), updatedAt: fs.serverTimestamp() });
    },
    patchFamily: async (tid, fid, patches) => {
      if (!patches.length) return;
      const args: unknown[] = [];
      for (const p of patches) args.push(new fs.FieldPath(...p.path), p.value === DELETE ? fs.deleteField() : p.value);
      args.push('updatedAt', fs.serverTimestamp());
      await (fs.updateDoc as any)(fs.doc(db, 'trips', tid, 'families', fid), ...args);
    },
    watchFamily: (tid, fid, cb, onErr) => fs.onSnapshot(fs.doc(db, 'trips', tid, 'families', fid), s => cb(s.exists() ? (s.data() as FamilyDoc) : null), e => onErr?.(e)),
  };
}

function localTransport(): Transport {
  // Storage backend: a test relay injected by the e2e harness (two separate browser profiles),
  // otherwise this browser's localStorage + BroadcastChannel (two tabs).
  const relay = (window as any).__campilRelay as undefined | { read(k: string): Promise<string | null>; write(k: string, v: string | null): Promise<void>; patch?(k: string, p: string): Promise<void> };
  const K = (id: string) => `campil-fakecloud-${id}`;
  const ch = relay ? null : new BroadcastChannel('campil-fakecloud');
  const bus = new EventTarget();
  let uid = sessionStorage.getItem('campil-fake-uid'); if (!uid) { uid = 'u' + Math.random().toString(36).slice(2, 9); sessionStorage.setItem('campil-fake-uid', uid); }
  const read = async (id: string) => { const s = relay ? await relay.read(id) : localStorage.getItem(K(id)); return s ? JSON.parse(s) : null; };
  const write = async (id: string, d: any) => {
    const v = d ? JSON.stringify(d) : null;
    if (relay) await relay.write(id, v); else { if (v) localStorage.setItem(K(id), v); else localStorage.removeItem(K(id)); ch!.postMessage(id); }
    bus.dispatchEvent(new CustomEvent('c', { detail: id }));
  };
  const watch = (key: string, fn: () => void) => {
    const h = (e: any) => { if ((e.data ?? e.detail) === key) fn(); };
    ch?.addEventListener('message', h); bus.addEventListener('c', h); window.addEventListener('campil-relay', h);
    fn();
    return () => { ch?.removeEventListener('message', h); bus.removeEventListener('c', h); window.removeEventListener('campil-relay', h); };
  };
  let queue = Promise.resolve();
  const serial = (f: () => Promise<void>) => (queue = queue.then(f, f));
  let google: Account | null = JSON.parse(sessionStorage.getItem('campil-fake-google') ?? 'null');
  const acct = (): Account => google ?? { uid: uid!, provider: 'anonymous' };
  return {
    get uid() { return uid!; },
    account: acct,
    signInGoogle: async () => { const n = (window as any).__campilFakeGoogle ?? { name: 'משתמש Google', email: 'test@example.com' }; google = { uid: uid!, provider: 'google', ...n }; sessionStorage.setItem('campil-fake-google', JSON.stringify(google)); return google!; },
    signOut: async () => { google = null; sessionStorage.removeItem('campil-fake-google'); return acct(); },
    createTrip: (id, d) => serial(() => write(id, d)),
    getTrip: id => read(id),
    watchTrip: (id, cb) => watch(id, () => { read(id).then(cb); }),
    // with a relay the patch is applied atomically on the relay side, like Firestore does server-side
    patch: (id, patches) => serial(async () => {
      if (relay?.patch) { await relay.patch(id, JSON.stringify(patches.map(p => ({ path: p.path, value: p.value === DELETE ? { __del: 1 } : p.value })))); bus.dispatchEvent(new CustomEvent('c', { detail: id })); return; }
      const d = await read(id); if (d) await write(id, { ...applyPatches(d, patches), updatedAt: Date.now() });
    }),
    deleteTrip: id => serial(() => write(id, null)),
    putEntry: (tid, e) => serial(async () => { const k = `${tid}/journal`; const d = (await read(k)) ?? {}; d[e.id] = e; await write(k, d); }),
    deleteEntry: (tid, eid) => serial(async () => { const k = `${tid}/journal`; const d = (await read(k)) ?? {}; delete d[eid]; await write(k, d); }),
    watchJournal: (tid, cb) => watch(`${tid}/journal`, () => { read(`${tid}/journal`).then(d => cb(Object.values(d ?? {}))); }),
    // The local stand-in has no security rules; `__campilNoFamilies` simulates a project still on the old rules.
    createFamily: (tid, fid, d) => serial(async () => {
      if ((window as any).__campilNoFamilies) throw Object.assign(new Error('denied'), { code: 'permission-denied' });
      const k = `${tid}/families/${fid}`; if (await read(k)) throw Object.assign(new Error('exists'), { code: 'already-exists' });
      await write(k, JSON.parse(JSON.stringify(d)));
    }),
    patchFamily: (tid, fid, patches) => serial(async () => {
      const k = `${tid}/families/${fid}`;
      if (relay?.patch) { await relay.patch(k, JSON.stringify(patches.map(p => ({ path: p.path, value: p.value === DELETE ? { __del: 1 } : p.value })))); bus.dispatchEvent(new CustomEvent('c', { detail: k })); return; }
      const d = await read(k); if (!d) throw Object.assign(new Error('not found'), { code: 'not-found' }); await write(k, applyPatches(d, patches));
    }),
    watchFamily: (tid, fid, cb, onErr) => {
      if ((window as any).__campilNoFamilies) { setTimeout(() => onErr?.(Object.assign(new Error('denied'), { code: 'permission-denied' }))); return () => {}; }
      return watch(`${tid}/families/${fid}`, () => { read(`${tid}/families/${fid}`).then(cb); });
    },
  };
}
export type { Member };
