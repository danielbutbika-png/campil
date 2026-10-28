import { key } from './env';
// Photos live in IndexedDB (localStorage is too small). Images are downscaled before saving.
const DB = key('campil-media'), STORE = 'photos';
function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((res, rej) => { const t = db.transaction(STORE, mode); const q = fn(t.objectStore(STORE)); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
}
export const putPhoto = (id: string, blob: Blob) => tx('readwrite', s => s.put(blob, id));
export const getPhoto = (id: string) => tx<Blob | undefined>('readonly', s => s.get(id));
export const deletePhoto = (id: string) => tx('readwrite', s => s.delete(id));

export async function compressImage(file: File, max = 1600, quality = 0.82): Promise<Blob> {
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return file;
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise(res => c.toBlob(b => res(b || file), 'image/jpeg', quality));
}

const cache = new Map<string, string>();
export async function photoURL(id: string) {
  if (cache.has(id)) return cache.get(id)!;
  const b = await getPhoto(id).catch(() => undefined);
  if (!b) return null;
  const u = URL.createObjectURL(b); cache.set(id, u); return u;
}
export async function blobToDataURL(b: Blob): Promise<string> {
  return new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(b); });
}
export async function dataURLToBlob(u: string) { return (await fetch(u)).blob(); }
