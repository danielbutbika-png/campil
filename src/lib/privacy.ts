// Full removal of CampIL data from this device: app state, photos, saved maps, caches and the sign-in.
// Shared trips also live with the other participants (and in Firestore) — removing them there is a separate action
// (leave the trip / the organiser deletes it); the confirmation text says so.
import { key } from './env';

export async function wipeDevice(): Promise<void> {
  const prefix = key('campil-');
  try { for (const k of Object.keys(localStorage)) if (k.startsWith(prefix)) localStorage.removeItem(k); } catch { /* blocked */ }
  try { for (const k of Object.keys(sessionStorage)) if (k.startsWith('campil')) sessionStorage.removeItem(k); } catch { /* blocked */ }
  try {
    const names = (await (indexedDB as any).databases?.())?.map((d: { name?: string }) => d.name).filter(Boolean) as string[] | undefined;
    const ours = (names ?? [key('campil-media')]).filter(n => n.startsWith(prefix) || /^firebase|^firestore\//.test(n));
    await Promise.all(ours.map(n => new Promise<void>(res => { const r = indexedDB.deleteDatabase(n); r.onsuccess = r.onerror = r.onblocked = () => res(); })));
  } catch { /* unsupported */ }
  try { for (const c of await caches.keys()) if (c.startsWith(prefix) && !c.includes('-app-')) await caches.delete(c); } catch { /* unsupported */ }
}
